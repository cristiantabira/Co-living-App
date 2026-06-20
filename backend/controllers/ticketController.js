const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Complex = require("../models/Complex");
const { notifyComplexAdminsNewTicket } = require("../services/emailService");

const createTicket = async (req, res) => {
    try {
        // Nu mai cerem complexId din frontend
        const { title, description, category, priority } = req.body;
        const userId = req.user.id;

        if (!title || !description) {
            return res.status(400).json({
                message: "Titlul și descrierea sunt obligatorii!",
            });
        }

        // Backend-ul caută automat apartamentul și complexul utilizatorului
        const user = await User.findByPk(userId, {
            include: {
                association: "Apartment",
                include: { association: "Complex" },
            },
        });

        if (!user || !user.Apartment || !user.Apartment.complexId) {
            return res.status(403).json({
                message:
                    "Nu ești alocat unui complex! Contactează administratorul.",
            });
        }

        const autoComplexId = user.Apartment.complexId;

        // Create ticket cu complexId-ul găsit
        const ticket = await Ticket.create({
            title,
            description,
            category: category || "OTHER",
            priority: priority || "MEDIUM",
            status: "OPEN",
            complexId: autoComplexId,
            raisedById: userId,
        });

        // Notify admins
        const complex = await Complex.findByPk(autoComplexId, {
            include: { association: "Admins" },
        });

        if (complex && complex.Admins.length > 0) {
            await notifyComplexAdminsNewTicket(complex, ticket, user);
        }

        res.status(201).json({
            message: "Tichet creat cu succes!",
            ticket,
        });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({
            message: "Eroare la crearea tichetului",
            error: error.message,
        });
    }
};

// 2. Get tickets for a complex (only admins can view)
const getComplexTickets = async (req, res) => {
    try {
        const { complexId } = req.params;
        const userId = req.user.id;

        // 1. Găsim user-ul cu asocierile lui de admin
        const user = await User.findByPk(userId, {
            include: [{ model: Complex, as: "ManagedComplexes" }],
        });

        // 2. Verificăm dacă userul gestionează complexul cerut
        const managesComplex = user.ManagedComplexes.some(
            (c) => c.id == complexId,
        );

        if (req.user.role !== "GOD" && !managesComplex) {
            return res.status(403).json({
                message: "Nu ai dreptul să vezi tichetele acestui complex!",
            });
        }

        // 3. Dacă totul e ok, aducem tichetele
        const tickets = await Ticket.findAll({
            where: { complexId: complexId },
            include: [
                {
                    model: User,
                    as: "RaisedBy",
                    attributes: ["id", "name", "apartmentId"],
                },
                { model: User, as: "AssignedTo", attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({ tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: error.message });
    }
};

// 3. Get my tickets (for a regular user to see tickets they raised)
const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.id;

        const tickets = await Ticket.findAll({
            where: { raisedById: userId },
            include: [
                {
                    association: "RaisedBy",
                    attributes: ["id", "name", "email"],
                },
                {
                    association: "AssignedTo",
                    attributes: ["id", "name", "email"],
                },
                { association: "Complex", attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            message: "Tichete găsite",
            tickets,
        });
    } catch (error) {
        console.error("Error fetching my tickets:", error);
        res.status(500).json({
            message: "Eroare la preluarea tichetelor tale",
            error: error.message,
        });
    }
};

// 4. Assign ticket to an admin
const assignTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { assignedToId } = req.body;
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket)
            return res
                .status(404)
                .json({ message: "Tichetul nu a fost găsit!" });

        // Verificăm permisiunile folosind array-ul ManagedComplexes
        const user = await User.findByPk(userId, {
            include: [{ model: Complex, as: "ManagedComplexes" }],
        });

        const isAuthorized =
            user.role === "GOD" ||
            user.ManagedComplexes.some((c) => c.id === ticket.complexId);

        if (!isAuthorized) {
            return res
                .status(403)
                .json({ message: "Nu ai permisiunea să asignezi tichete!" });
        }

        // Verificăm dacă cel asignat este admin pe complexul respectiv
        const assignee = await User.findByPk(assignedToId, {
            include: [{ model: Complex, as: "ManagedComplexes" }],
        });

        const isAssigneeAdmin =
            assignee.role === "GOD" ||
            assignee.ManagedComplexes.some((c) => c.id === ticket.complexId);

        if (!isAssigneeAdmin) {
            return res.status(400).json({
                message: "Administratorul nu administrează acest complex!",
            });
        }

        ticket.assignedToId = assignedToId;
        ticket.status = "IN_PROGRESS";
        await ticket.save();

        res.status(200).json({ message: "Tichet asignat cu succes!" });
    } catch (error) {
        console.error("Error assigning ticket:", error);
        res.status(500).json({
            message: "Eroare server",
            error: error.message,
        });
    }
};

// 5. Resolve a ticket (mark as resolved and wait for user confirmation)
const resolveTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Tichetul nu a fost găsit!" });
        }

        // Verify only assignee can resolve
        if (ticket.assignedToId !== userId) {
            const user = await User.findByPk(userId);
            if (user.role !== "GOD") {
                return res.status(403).json({
                    message:
                        "Doar administratorul asignat poate rezolva tichetul!",
                });
            }
        }

        ticket.status = "RESOLVED";
        ticket.resolvedAt = new Date();
        await ticket.save();

        const updatedTicket = await Ticket.findByPk(ticketId, {
            include: [
                {
                    association: "RaisedBy",
                    attributes: ["id", "name", "email"],
                },
                {
                    association: "AssignedTo",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        res.status(200).json({
            message:
                "Tichet rezolvat! În așteptarea confirmării locatarului...",
            ticket: updatedTicket,
        });
    } catch (error) {
        console.error("Error resolving ticket:", error);
        res.status(500).json({
            message: "Eroare la rezolvarea tichetului",
            error: error.message,
        });
    }
};

// 6. Confirm resolution (user confirms ticket is resolved or reopens it)
const confirmResolution = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { confirmed } = req.body; // true = closed, false = reopen
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res
                .status(404)
                .json({ message: "Tichetul nu a fost găsit!" });
        }

        // Verify only user who raised ticket can confirm
        if (ticket.raisedById !== userId) {
            return res.status(403).json({
                message:
                    "Doar utilizatorul care a deschis tichetul poate confirma!",
            });
        }

        if (ticket.status !== "RESOLVED") {
            return res.status(400).json({
                message:
                    "Tichetul trebuie să fie în stare Rezolvat pentru a fi confirmat!",
            });
        }

        if (confirmed) {
            ticket.status = "CLOSED";
            ticket.closedAt = new Date();
            ticket.userConfirmed = true;
        } else {
            ticket.status = "OPEN";
            ticket.assignedToId = null;
        }

        await ticket.save();

        const updatedTicket = await Ticket.findByPk(ticketId, {
            include: [
                {
                    association: "RaisedBy",
                    attributes: ["id", "name", "email"],
                },
                {
                    association: "AssignedTo",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        res.status(200).json({
            message: confirmed
                ? "Tichet închis cu succes!"
                : "Tichet redeschis!",
            ticket: updatedTicket,
        });
    } catch (error) {
        console.error("Error confirming resolution:", error);
        res.status(500).json({
            message: "Eroare la confirmarea rezolvării",
            error: error.message,
        });
    }
};

// 7. Cancel a ticket
const cancelTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket)
            return res
                .status(404)
                .json({ message: "Tichetul nu a fost găsit!" });

        // Verificăm permisiunile (Owner sau Admin)
        const user = await User.findByPk(userId, {
            include: [{ model: Complex, as: "ManagedComplexes" }],
        });
        const isOwner = ticket.raisedById === userId;
        const isAdmin =
            user.role === "GOD" ||
            user.ManagedComplexes.some((c) => c.id === ticket.complexId);

        if (!isOwner && !isAdmin) {
            return res
                .status(403)
                .json({ message: "Nu ai permisiunea să anulezi!" });
        }

        // Flux UML: Poți anula din OPEN, IN_PROGRESS sau RESOLVED
        ticket.status = "CANCELED";
        ticket.assignedToId = null; // Resetăm asignarea la anulare
        await ticket.save();

        res.status(200).json({ message: "Tichet anulat cu succes!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reopenTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await Ticket.findByPk(ticketId);

        if (!ticket || ticket.status !== "RESOLVED") {
            return res
                .status(400)
                .json({ message: "Tichetul nu poate fi redeschis!" });
        }

        ticket.status = "OPEN";
        ticket.assignedToId = null;
        await ticket.save();

        res.json({ message: "Tichet redeschis.", ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTicket,
    getComplexTickets,
    getMyTickets,
    assignTicket,
    resolveTicket,
    confirmResolution,
    cancelTicket,
    reopenTicket,
};
