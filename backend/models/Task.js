const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Task = sequelize.define("Task", {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    type: { 
        type: DataTypes.ENUM("TASK", "SHOPPING", "REMINDER"), 
        defaultValue: "TASK" 
    },
    status: { 
        type: DataTypes.ENUM("PENDING", "COMPLETED"), 
        defaultValue: "PENDING" 
    },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    priority: {
        type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
        defaultValue: "MEDIUM"
    },
    // Fiecare task aparține unui apartament - toți locatarii pot vedea
    apartmentId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Task;
