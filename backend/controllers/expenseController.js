const { Expense, ExpenseDebt } = require("../models/Expense");
const User = require("../models/User");

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
    getMyExpenses,
    getBalance,
    getExpenseHistory,
    settleDebt,
};
