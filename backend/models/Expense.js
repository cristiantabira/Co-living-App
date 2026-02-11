const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Expense = sequelize.define("Expense", {
    description: { type: DataTypes.STRING, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING }, // Ex: "Utilități", "Mâncare"
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Tabel Pivot pentru datorii individuale (cine cât datorează din această cheltuială)
const ExpenseDebt = sequelize.define("ExpenseDebt", {
    amountOwed: { type: DataTypes.FLOAT, allowNull: false },
    isSettled: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = { Expense, ExpenseDebt };
