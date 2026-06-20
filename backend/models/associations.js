const sequelize = require("./index");
const User = require("./User");
const Apartment = require("./Apartment");
const { Expense, ExpenseDebt } = require("./Expense");
const Complex = require("./Complex");
const Task = require("./Task");
const Ticket = require("./Ticket");

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

    // 3. Apartament <-> Cheltuieli
    // Aceasta permite Admin Dashboard-ului să vadă cheltuielile per apartament
    Apartment.hasMany(Expense, { foreignKey: "apartmentId", as: "Expenses" });
    Expense.belongsTo(Apartment, { foreignKey: "apartmentId" });

    // 3b. Complex <-> Cheltuieli (pentru facturile administrative pe complex)
    Complex.hasMany(Expense, { foreignKey: "scopeId", as: "Expenses", constraints: false });
    Expense.belongsTo(Complex, { foreignKey: "scopeId", as: "Complex", constraints: false });

    // 4. User <-> Expense (Plătitor)
    User.hasMany(Expense, { foreignKey: "payerId", as: "PaidExpenses" });
    Expense.belongsTo(User, { foreignKey: "payerId", as: "Payer" });

    // 5. Logica de Split (Many-to-Many)
    Expense.belongsToMany(User, {
        through: ExpenseDebt,
        as: "Debtors",
        foreignKey: "expenseId",
    });
    User.belongsToMany(Expense, {
        through: ExpenseDebt,
        foreignKey: "userId",
    });

    // Permitem accesul direct de la ExpenseDebt la Expense
    ExpenseDebt.belongsTo(Expense, { foreignKey: "expenseId" });
    Expense.hasMany(ExpenseDebt, { foreignKey: "expenseId" });

    // Permitem accesul direct de la ExpenseDebt la User (debtor)
    ExpenseDebt.belongsTo(User, { foreignKey: "userId" });
    User.hasMany(ExpenseDebt, { foreignKey: "userId" });

    // 6. Complex <-> Admini (Many-to-Many)
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

    // 7. Apartament <-> Tasks (Liste de cumpărături, remindere, tasks)
    Apartment.hasMany(Task, { foreignKey: "apartmentId", as: "Tasks" });
    Task.belongsTo(Apartment, { foreignKey: "apartmentId" });

    // 8. Ticket associations
    Complex.hasMany(Ticket, { foreignKey: "complexId", as: "Tickets" });
    Ticket.belongsTo(Complex, { foreignKey: "complexId" });

    User.hasMany(Ticket, { foreignKey: "raisedById", as: "RaisedTickets" });
    Ticket.belongsTo(User, { foreignKey: "raisedById", as: "RaisedBy" });

    User.hasMany(Ticket, { foreignKey: "assignedToId", as: "AssignedTickets" });
    Ticket.belongsTo(User, { foreignKey: "assignedToId", as: "AssignedTo" });

    console.log(
        "Toate relațiile au fost configurate, inclusiv Task per Apartament și Ticket per Complex.",
    );
};

module.exports = setupAssociations;
