const User = require("./User");
const Apartment = require("./Apartment");
const { Expense, ExpenseDebt } = require("./Expense");

const setupAssociations = () => {
    // 1. Un apartament are mai mulți locatari (USER/ADMIN)
    Apartment.hasMany(User, { foreignKey: "apartmentId" });
    User.belongsTo(Apartment, { foreignKey: "apartmentId" });

    // 2. O cheltuială este plătită de un singur utilizator
    User.hasMany(Expense, { foreignKey: "payerId", as: "PaidExpenses" });
    Expense.belongsTo(User, { foreignKey: "payerId", as: "Payer" });

    // 3. O cheltuială se împarte la mai mulți utilizatori (Logica de Split)
    // Aceasta creează tabela pivot 'ExpenseDebts' automat
    Expense.belongsToMany(User, {
        through: ExpenseDebt,
        as: "Debtors",
        foreignKey: "expenseId",
    });
    User.belongsToMany(Expense, {
        through: ExpenseDebt,
        foreignKey: "userId",
    });

    console.log("Relațiile între modele au fost configurate.");
};

module.exports = setupAssociations;
