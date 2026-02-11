const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Verificăm dacă user-ul există deja
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser)
            return res.status(400).json({ message: "Email deja utilizat!" });

        // 2. Criptăm parola
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Creăm user-ul
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "USER",
        });

        res.status(201).json({
            message: "Utilizator creat cu succes!",
            userId: newUser.id,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Găsim user-ul
        const user = await User.findOne({ where: { email } });
        if (!user)
            return res
                .status(404)
                .json({ message: "Utilizatorul nu a fost găsit!" });

        // 2. Verificăm parola
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ message: "Parolă incorectă!" });

        // 3. Generăm Token-ul JWT (valabil 24h)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            "SECRET_KEY_FOARTE_SIGURA", // Într-un proiect real, asta stă în .env
            { expiresIn: "24h" },
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };
