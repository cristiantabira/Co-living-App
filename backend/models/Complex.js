const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Complex = sequelize.define(
    "Complex",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Nu poți avea două complexe cu același nume
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            defaultValue: "București",
        },
    },
    {
        timestamps: true, // Adaugă automat coloanele createdAt și updatedAt
    },
);

module.exports = Complex;
