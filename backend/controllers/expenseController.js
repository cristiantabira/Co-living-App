const { Expense, ExpenseDebt } = require("../models/Expense");
const User = require("../models/User");
const Apartment = require("../models/Apartment");
const Complex = require("../models/Complex");
const { Op } = require("sequelize");

const createExpense = async (req, res) => {
    try {
        const { description, totalAmount, category, debtors } = req.body;
        // debtors ar trebui să fie un array de obiecte: [{ userId: 1, amountOwed: 50 }, { userId: 2, amountOwed: 50 }]

        // 1. Creăm cheltuiala (payerId vine din middleware-ul protect)
        const expense = await Expense.create({
            description,
            totalAmount,
            category,
            payerId: req.user.id,
            scopeType: "PERSONAL",
            isAdminBilled: false,
        });

        // 2. Distribuim datoriile către ceilalți colegi
        if (debtors && debtors.length > 0) {
            const debtEntries = debtors.map((debt) => ({
                expenseId: expense.id,
                userId: debt.userId,
                amountOwed: debt.amountOwed,
                isSettled: false,
            }));

            await ExpenseDebt.bulkCreate(debtEntries);
        }

        res.status(201).json({
            message: "Cheltuială adăugată și împărțită cu succes!",
            expense,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Noua funcție pentru facturile admin per complex sau apartament
const createAdminBill = async (req, res) => {
    try {
        const { scopeType, scopeId, description, totalAmount, amountPerPerson } = req.body;
        const adminId = req.user.id;

        // Validare
        if (!["COMPLEX", "APARTMENT"].includes(scopeType)) {
            return res.status(400).json({ message: "scopeType trebuie să fie COMPLEX sau APARTMENT" });
        }

        let debtors = [];

        if (scopeType === "COMPLEX") {
            // Găsim toți locatarii din complex
            const apartments = await Apartment.findAll({ where: { complexId: scopeId } });
            const apartmentIds = apartments.map(a => a.id);

            debtors = await User.findAll({
                where: { apartmentId: { [Op.in]: apartmentIds } },
                attributes: ["id"]
            });
        } else if (scopeType === "APARTMENT") {
            // Găsim locatarii din apartament
            debtors = await User.findAll({
                where: { apartmentId: scopeId },
                attributes: ["id"]
            });
        }

        if (debtors.length === 0) {
            return res.status(400).json({ message: "Nu au fost găsiți locatari pentru această factură" });
        }

        // Creăm cheltuiala
        const expense = await Expense.create({
            description,
            totalAmount,
            category: scopeType === "COMPLEX" ? "Utilități Complex" : "Utilități Apartament",
            payerId: adminId,
            scopeType,
            scopeId,
            isAdminBilled: true,
        });

        // Distribuim datoriile
        const debtEntries = debtors.map((debtor) => ({
            expenseId: expense.id,
            userId: debtor.id,
            amountOwed: parseFloat(amountPerPerson).toFixed(2),
            isSettled: false,
        }));

        await ExpenseDebt.bulkCreate(debtEntries);

        res.status(201).json({
            message: `Factură administrativă creată și distribuită la ${debtors.length} locatari!`,
            expense,
            debtorsCount: debtors.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyExpenses = async (req, res) => {
    try {
        // Luăm cheltuielile unde user-ul este fie cel care a plătit, fie cel care datorează
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: Expense, as: "PaidExpenses" },
                { model: Expense, through: ExpenseDebt, as: "Expenses" }, // Cheltuielile unde e debitor
            ],
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Cât am plătit eu pentru alții
        // Adăugăm model: Expense pentru ca Sequelize să știe asocierile
        const toReceiveResult = await ExpenseDebt.sum("amountOwed", {
            where: { isSettled: false },
            include: [
                {
                    model: Expense,
                    where: { payerId: userId },
                },
            ],
        });

        // 2. Cât datorez eu altora
        const toPayResult = await ExpenseDebt.sum("amountOwed", {
            where: { userId: userId, isSettled: false },
        });

        // Convertim null în 0 pentru a nu crăpa frontend-ul
        const toReceive = toReceiveResult || 0;
        const toPay = toPayResult || 0;

        res.json({
            toReceive,
            toPay,
            balance: toReceive - toPay,
        });
    } catch (error) {
        console.error("Eroare la getBalance:", error);
        res.status(500).json({ error: error.message });
    }
};

const getExpenseHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            include: [
                {
                    model: User,
                    as: "Payer",
                    attributes: ["id", "name"],
                },
                {
                    model: User,
                    as: "Debtors",
                    attributes: ["id", "name"],
                    through: { attributes: ["amountOwed", "isSettled"] },
                },
                {
                    model: Complex,
                    attributes: ["id", "name"],
                    required: false,
                },
            ],
            order: [["createdAt", "DESC"]], // Cele mai noi primele
        });

        // Filtrăm ca utilizatorul să vadă doar cheltuielile care îl privesc
        const myHistory = expenses.filter((exp) => {
            const isPayer = exp.payerId === userId;
            const isDebtor = exp.Debtors.some((d) => d.id === userId);
            return isPayer || isDebtor;
        });

        res.json(myHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const settleDebt = async (req, res) => {
    try {
        const { debtId } = req.params;
        const debt = await ExpenseDebt.findByPk(debtId);

        if (!debt)
            return res
                .status(404)
                .json({ message: "Datoria nu a fost găsită" });

        debt.isSettled = true;
        await debt.save();

        res.json({ message: "Datorie achitată cu succes!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createExpense,
    createAdminBill,
    getMyExpenses,
    getBalance,
    getExpenseHistory,
    settleDebt,
};
