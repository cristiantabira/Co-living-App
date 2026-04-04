const Apartment = require("../models/Apartment");
const User = require("../models/User");
const Complex = require("../models/Complex");
const { Expense } = require("../models/Expense"); //
// Creare Apartament - DOAR ADMIN sau GOD
const createApartment = async (req, res) => {
    try {
        const { number, block, complexId } = req.body;

        const newApt = await Apartment.create({ number, block, complexId });
        res.status(201).json({
            message: "Apartament creat!",
            apartment: newApt,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Alocare locatar în apartament
const addUserToApartment = async (req, res) => {
    try {
        const { userId, apartmentId } = req.body;

        const user = await User.findByPk(userId);
        if (!user)
            return res.status(404).json({ message: "Utilizator inexistent!" });

        // Actualizăm cheia externă apartmentId în tabelul Users
        user.apartmentId = apartmentId;
        await user.save();

        res.json({
            message: `Utilizatorul ${user.name} a fost adăugat în apartament.`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Vezi toți colegii din apartamentul tău
const getMyRoommates = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser.apartmentId) {
            return res
                .status(400)
                .json({ message: "Nu aparții niciunui apartament!" });
        }

        const roommates = await User.findAll({
            where: { apartmentId: currentUser.apartmentId },
            attributes: ["id", "name", "email", "role"], // Nu trimitem parolele!
        });

        res.json(roommates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const createComplex = async (req, res) => {
    try {
        const { name, address } = req.body;
        const newComplex = await Complex.create({ name, address });
        res.status(201).json({
            message: "Complex rezidențial creat!",
            complex: newComplex,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Obținerea tuturor complexelor (pentru a le selecta în dropdown-ul de apartament)
const getAllComplexes = async (req, res) => {
    try {
        const complexes = await Complex.findAll();
        res.json(complexes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Obținerea tuturor apartamentelor (pentru a le selecta în dropdown-ul de alocare user)
const getAllApartments = async (req, res) => {
    try {
        const apartments = await Apartment.findAll({
            include: [{ model: Complex, attributes: ["name"] }],
        });
        res.json(apartments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const assignAdminToComplex = async (req, res) => {
    try {
        const { userId, complexId } = req.body;

        const user = await User.findByPk(userId);
        const complex = await Complex.findByPk(complexId);

        if (!user || user.role !== "ADMIN") {
            return res.status(400).json({
                message: "Utilizatorul nu există sau nu are rol de ADMIN!",
            });
        }

        // Metodă generată automat de Sequelize datorită belongsToMany
        await complex.addAdmin(user);

        res.json({
            message: `Adminul ${user.name} a fost alocat complexului ${complex.name}.`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdminOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let complexes;

        if (userRole === "GOD") {
            // Dacă e GOD, ignorăm tabela pivot și luăm TOATE complexele din sistem
            complexes = await Complex.findAll({
                include: [
                    {
                        model: Apartment,
                        include: [
                            { model: User, attributes: ["id", "name"] },
                            { model: Expense, as: "PaidExpenses" },
                        ],
                    },
                ],
            });
        } else {
            // Dacă e ADMIN, luăm doar ce e alocat în ComplexAdmin
            const adminWithComplexes = await User.findByPk(userId, {
                include: [
                    {
                        model: Complex,
                        as: "ManagedComplexes",
                        include: [
                            {
                                model: Apartment,
                                include: [
                                    { model: User, attributes: ["id", "name"] },
                                    { model: Expense, as: "Expenses" },
                                ],
                            },
                        ],
                    },
                ],
            });
            complexes = adminWithComplexes
                ? adminWithComplexes.ManagedComplexes
                : [];
        }

        res.json(complexes);
    } catch (error) {
        console.error("Eroare Admin Overview:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createApartment,
    addUserToApartment,
    getMyRoommates,
    createComplex,
    getAllComplexes,
    getAllApartments,
    assignAdminToComplex,
    getAdminOverview,
};
