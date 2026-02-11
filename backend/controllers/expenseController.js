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

module.exports = { createExpense, getMyExpenses };
