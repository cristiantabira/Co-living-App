const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Apartment = sequelize.define("Apartment", {
    number: { type: DataTypes.STRING, allowNull: false },
    block: { type: DataTypes.STRING }, // Ex: "Bloc A1"
    complexName: { type: DataTypes.STRING }, // Ex: "Baba Novac Residence"
});

module.exports = Apartment;
