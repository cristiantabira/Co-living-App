const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Complex = require("../models/Complex");
const { notifyComplexAdminsNewTicket } = require("../services/emailService");

// Create a new ticket (raised by a regular user/resident)
const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority, complexId } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!title || !description || !complexId) {
            return res.status(400).json({ 
                message: "Titlu, descriere și complex sunt obligatorii!" 
            });
        }

        // Verify user belongs to this complex (via apartment)
        const user = await User.findByPk(userId, {
            include: { association: "Apartment", include: { association: "Complex" } }
        });

        if (!user.Apartment || user.Apartment.complexId !== parseInt(complexId)) {
            return res.status(403).json({ 
                message: "Nu ai acces la acest complex!" 
            });
        }

        // Create ticket
        const ticket = await Ticket.create({
            title,
            description,
            category: category || "OTHER",
            priority: priority || "MEDIUM",
            status: "OPEN",
            complexId,
            raisedById: userId,
        });

        // Fetch complex admins to notify them
        const complex = await Complex.findByPk(complexId, {
            include: { association: "Admins" }
        });

        if (complex && complex.Admins.length > 0) {
            // Send emails to all admins
            await notifyComplexAdminsNewTicket(complex, ticket, user);
        }

        res.status(201).json({
            message: "Tichet creat cu succes!",
            ticket
        });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Eroare la crearea tichetu", error: error.message });
    }
};

// Get tickets for a complex (only admins can view)
const getComplexTickets = async (req, res) => {
    try {
        const { complexId } = req.params;
        const userId = req.user.id;

        // Check if user is admin of this complex
        const user = await User.findByPk(userId);
        if (user.role !== "GOD") {
            const isAdmin = await user.hasManagingComplex(complexId);
            if (!isAdmin) {
                return res.status(403).json({ 
                    message: "Nu ai acces la tichețele acestui complex!" 
                });
            }
        }

        const tickets = await Ticket.findAll({
            where: { complexId },
            include: [
                { association: "RaisedBy", attributes: ["id", "name", "email"] },
                { association: "AssignedTo", attributes: ["id", "name", "email"] },
                { association: "Complex", attributes: ["id", "name"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            message: "Tichete găsite",
            tickets
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Eroare la preluarea tichelor", error: error.message });
    }
};

// Assign ticket to an admin
const assignTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { assignedToId } = req.body;
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Tichet nu găsit!" });
        }

        // Verify requester is admin of this complex
        const user = await User.findByPk(userId);
        if (user.role !== "GOD") {
            const isAdmin = await user.hasManagingComplex(ticket.complexId);
            if (!isAdmin) {
                return res.status(403).json({ 
                    message: "Nu ai permisiuni să asignezi tichete!" 
                });
            }
        }

        // Verify assignee is an admin of this complex
        const assignee = await User.findByPk(assignedToId);
        if (!assignee || assignee.role === "USER") {
            return res.status(400).json({ 
                message: "Doar administratorii pot fi asignați tichelor!" 
            });
        }

        if (assignee.role !== "GOD") {
            const isAdminOfComplex = await assignee.hasManagingComplex(ticket.complexId);
            if (!isAdminOfComplex) {
                return res.status(400).json({ 
                    message: "Administratorul nu manage-ază acest complex!" 
                });
            }
        }

        // Update ticket
        ticket.assignedToId = assignedToId;
        ticket.status = "IN_PROGRESS";
        await ticket.save();

        const updatedTicket = await Ticket.findByPk(ticketId, {
            include: [
                { association: "RaisedBy", attributes: ["id", "name", "email"] },
                { association: "AssignedTo", attributes: ["id", "name", "email"] }
            ]
        });

        res.status(200).json({
            message: "Tichet asignat cu succes!",
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error assigning ticket:", error);
        res.status(500).json({ message: "Eroare la asignarea tichetu", error: error.message });
    }
};

// Resolve a ticket (mark as resolved and wait for user confirmation)
const resolveTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Tichet nu găsit!" });
        }

        // Verify only assignee can resolve
        if (ticket.assignedToId !== userId) {
            const user = await User.findByPk(userId);
            if (user.role !== "GOD") {
                return res.status(403).json({ 
                    message: "Doar administratorul asignat poate rezolva tichetu!" 
                });
            }
        }

        ticket.status = "RESOLVED";
        ticket.resolvedAt = new Date();
        await ticket.save();

        const updatedTicket = await Ticket.findByPk(ticketId, {
            include: [
                { association: "RaisedBy", attributes: ["id", "name", "email"] },
                { association: "AssignedTo", attributes: ["id", "name", "email"] }
            ]
        });

        res.status(200).json({
            message: "Tichet rezolvat! În așteptarea confirmării locatarului...",
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error resolving ticket:", error);
        res.status(500).json({ message: "Eroare la rezolvarea tichetu", error: error.message });
    }
};

// Confirm resolution (user confirms ticket is resolved or reopens it)
const confirmResolution = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { confirmed } = req.body; // true = closed, false = reopen
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Tichet nu găsit!" });
        }

        // Verify only user who raised ticket can confirm
        if (ticket.raisedById !== userId) {
            return res.status(403).json({ 
                message: "Doar utilizatorul care a ridicat tichetu poate confirma!" 
            });
        }

        if (ticket.status !== "RESOLVED") {
            return res.status(400).json({ 
                message: "Tichetu trebuie să fie în stare Rezolvat pentru a confirma!" 
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
                { association: "RaisedBy", attributes: ["id", "name", "email"] },
                { association: "AssignedTo", attributes: ["id", "name", "email"] }
            ]
        });

        res.status(200).json({
            message: confirmed ? "Tichet închis cu succes!" : "Tichet redeschis!",
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error confirming resolution:", error);
        res.status(500).json({ message: "Eroare la confirmarea rezolvării", error: error.message });
    }
};

// Cancel a ticket
const cancelTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Tichet nu găsit!" });
        }

        // Only user who raised or admin can cancel
        if (ticket.raisedById !== userId) {
            const user = await User.findByPk(userId);
            if (user.role !== "GOD") {
                const isAdmin = await user.hasManagingComplex(ticket.complexId);
                if (!isAdmin) {
                    return res.status(403).json({ 
                        message: "Nu ai permisiuni să anulezi tichetu!" 
                    });
                }
            }
        }

        ticket.status = "CANCELED";
        await ticket.save();

        const updatedTicket = await Ticket.findByPk(ticketId, {
            include: [
                { association: "RaisedBy", attributes: ["id", "name", "email"] },
                { association: "AssignedTo", attributes: ["id", "name", "email"] }
            ]
        });

        res.status(200).json({
            message: "Tichet anulat cu succes!",
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error canceling ticket:", error);
        res.status(500).json({ message: "Eroare la anularea tichetu", error: error.message });
    }
};

module.exports = {
    createTicket,
    getComplexTickets,
    assignTicket,
    resolveTicket,
    confirmResolution,
    cancelTicket
};
