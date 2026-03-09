const sequelize = require("./index");
const User = require("./User");
const Apartment = require("./Apartment");
const { Expense, ExpenseDebt } = require("./Expense");
const Complex = require("./Complex");

const ComplexAdmin = sequelize.define("ComplexAdmin", {});

const setupAssociations = () => {
    // 1. Apartament <-> Locatari
    Apartment.hasMany(User, { foreignKey: "apartmentId" });
    User.belongsTo(Apartment, { foreignKey: "apartmentId" });

    // 2. Complex <-> Apartamente
    Complex.hasMany(Apartment, {
        foreignKey: "complexId",
        onDelete: "CASCADE",
    });
    Apartment.belongsTo(Complex, { foreignKey: "complexId" });

    // 3. User <-> Expense (Plătitor)
    User.hasMany(Expense, { foreignKey: "payerId", as: "PaidExpenses" });
    Expense.belongsTo(User, { foreignKey: "payerId", as: "Payer" });

    // 4. Logica de Split (Many-to-Many)
    Expense.belongsToMany(User, {
        through: ExpenseDebt,
        as: "Debtors",
        foreignKey: "expenseId",
    });
    User.belongsToMany(Expense, {
        through: ExpenseDebt,
        foreignKey: "userId",
    });

    // ==========================================
    // MODIFICAREA CRUCIALĂ PENTRU EROAREA 500:
    // Permitem accesul direct de la ExpenseDebt la Expense
    // ==========================================
    ExpenseDebt.belongsTo(Expense, { foreignKey: "expenseId" });
    Expense.hasMany(ExpenseDebt, { foreignKey: "expenseId" });
    // ==========================================

    // 5. Complex <-> Admini (Many-to-Many)
    Complex.belongsToMany(User, {
        through: ComplexAdmin,
        as: "Admins",
        foreignKey: "complexId",
    });
    User.belongsToMany(Complex, {
        through: ComplexAdmin,
        as: "ManagedComplexes",
        foreignKey: "userId",
    });

    console.log("Toate relațiile au fost configurate.");
};

module.exports = setupAssociations;
