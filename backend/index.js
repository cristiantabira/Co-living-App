const express = require("express");
const cors = require("cors");
const sequelize = require("./models/index"); // Conexiunea
const setupAssociations = require("./models/associations"); // Relațiile
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
// Inițializăm relațiile
setupAssociations();

// Sincronizăm baza de date
// { alter: true } verifică dacă ai modificat coloane și face update fără să șteargă datele
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("🚀 Baza de date SQLite este sincronizată.");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.error("Eroare la sincronizarea DB:", err));
