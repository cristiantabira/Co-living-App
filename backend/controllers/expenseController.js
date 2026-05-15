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
        const { scopeType, scopeId, description, totalAmount, distributionData } = req.body;
        const adminId = req.user.id;

        // Validare
        if (!["COMPLEX", "APARTMENT"].includes(scopeType)) {
            return res.status(400).json({ message: "scopeType trebuie să fie COMPLEX sau APARTMENT" });
        }

        let debtors = [];

        if (scopeType === "COMPLEX") {
            // Găsim apartamentele cu > 0 locuitori
            const apartments = await Apartment.findAll({ 
                where: { complexId: scopeId },
                include: [
                    {
                        model: User,
                        attributes: ["id"],
                        required: false
                    }
                ]
            });

            // Filtrăm doar apartamentele cu locatari
            const apartmentsWithResidents = apartments.filter(a => a.Users && a.Users.length > 0);

            if (apartmentsWithResidents.length === 0) {
                return res.status(400).json({ message: "Nu au fost găsite apartamente cu locatari în acest complex" });
            }

            // Distribuim suma între apartamentele cu locatari, apoi între locatarii lor
            const amountPerApartment = parseFloat(totalAmount) / apartmentsWithResidents.length;

            apartmentsWithResidents.forEach(apt => {
                const amountPerResident = (amountPerApartment / apt.Users.length).toFixed(2);
                apt.Users.forEach(user => {
                    debtors.push({
                        userId: user.id,
                        amountOwed: amountPerResident
                    });
                });
            });
        } else if (scopeType === "APARTMENT") {
            // Găsim locatarii din apartament
            const residents = await User.findAll({
                where: { apartmentId: scopeId },
                attributes: ["id"]
            });

            if (residents.length === 0) {
                return res.status(400).json({ message: "Nu au fost găsiți locatari pentru acest apartament" });
            }

            const amountPerResident = (parseFloat(totalAmount) / residents.length).toFixed(2);
            residents.forEach(user => {
                debtors.push({
                    userId: user.id,
                    amountOwed: amountPerResident
                });
            });
        }

        if (debtors.length === 0) {
            return res.status(400).json({ message: "Nu au fost găsiți locatari pentru această factură" });
        }

        // Creăm cheltuiala
        const expenseData = {
            description,
            totalAmount,
            category: scopeType === "COMPLEX" ? "Utilități Complex" : "Utilități Apartament",
            payerId: adminId,
            scopeType,
            scopeId,
            isAdminBilled: true,
        };

        // Dacă e factură pe apartament, setez și apartmentId
        if (scopeType === "APARTMENT") {
            expenseData.apartmentId = scopeId;
        }

        const expense = await Expense.create(expenseData);

        // Distribuim datoriile
        const debtEntries = debtors.map((debtor) => ({
            expenseId: expense.id,
            userId: debtor.userId,
            amountOwed: parseFloat(debtor.amountOwed).toFixed(2),
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
                     as: "Complex",
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
