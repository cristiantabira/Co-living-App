const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Ticket = sequelize.define("Ticket", {
    title: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { notEmpty: true }
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: false,
        validate: { notEmpty: true }
    },
    category: {
        type: DataTypes.ENUM(
            "PLUMBING",
            "ELECTRICAL",
            "HVAC",
            "CLEANING",
            "STRUCTURAL",
            "FURNITURE",
            "OTHER"
        ),
        defaultValue: "OTHER",
    },
    priority: {
        type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
        defaultValue: "MEDIUM",
    },
    status: {
        type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED", "CANCELED", "CLOSED"),
        defaultValue: "OPEN",
    },
    complexId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Complexes", key: "id" },
    },
    raisedById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
    },
    assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    userConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

module.exports = Ticket;
