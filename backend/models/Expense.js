const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Expense = sequelize.define("Expense", {
    description: { type: DataTypes.STRING, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING }, // Ex: "Utilități", "Mâncare"
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Para facturas administrativas
    scopeType: { type: DataTypes.ENUM("PERSONAL", "APARTMENT", "COMPLEX"), defaultValue: "PERSONAL" },
    // ID de complex sau apartament (pentru facturas admin)
    scopeId: { type: DataTypes.INTEGER, allowNull: true },
    // Marcheaza daca factura e creata de admin (true) sau de user normal (false)
    isAdminBilled: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Tabel Pivot pentru datorii individuale (cine cât datorează din această cheltuială)
const ExpenseDebt = sequelize.define("ExpenseDebt", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    amountOwed: { type: DataTypes.FLOAT, allowNull: false },
    isSettled: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = { Expense, ExpenseDebt };
