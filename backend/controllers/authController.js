const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Apartment = require("../models/Apartment");
const Complex = require("../models/Complex");
const { ComplexAdmin } = require("../models/associations");
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

// Obține toți utilizatorii
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role"],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Schimbă rolul unui utilizator
const updateUserRole = async (req, res) => {
    try {
        const { userId, newRole, complexId } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: "User negăsit" });

        // 1. Actualizăm rolul
        user.role = newRole;
        await user.save();

        // 2. Dacă e ADMIN și am primit complexId, facem alocarea
        if (newRole === "ADMIN" && complexId) {
            const complex = await Complex.findByPk(complexId);
            if (!complex) {
                return res
                    .status(400)
                    .json({
                        message: "Rol actualizat, dar complexul nu există!",
                    });
            }

            // Adăugăm în tabela pivot ComplexAdmin
            // Sequelize creează automat metoda addManagedComplex datorită asocierii belongsToMany
            await user.addManagedComplex(complex);
        }

        res.json({
            message: `Utilizatorul ${user.name} este acum ${newRole}${complexId ? " și administrează complexul ales" : ""}.`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["name", "email", "role"],
            include: [
                {
                    model: Apartment,
                    // Verifică dacă modelul se numește Complex (cu C mare)
                    include: [{ model: Complex }],
                },
            ],
        });

        if (!user)
            return res.status(404).json({ message: "Utilizator negăsit" });

        res.json(user);
    } catch (error) {
        console.error("Eroare la /me:", error); // Verifică terminalul de backend pentru detalii!
        res.status(500).json({ error: error.message });
    }
};

const seedTenUsers = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);

        // Parola pentru GOD
        const godPassword = await bcrypt.hash("cacapaca", salt);
        // Parola pentru restul de 10 useri
        const userPassword = await bcrypt.hash("parola123", salt);

        const users = [
            {
                name: "Cristian Tabira",
                email: "cristian.tabira@yahoo.com",
                password: godPassword,
                role: "GOD",
            },
        ];

        for (let i = 1; i <= 10; i++) {
            users.push({
                name: `Locatar ${i}`,
                email: `user${i}@test.com`,
                password: userPassword,
                role: "USER",
            });
        }

        // ignoreDuplicates: true previne erorile dacă rulezi funcția de mai multe ori
        await User.bulkCreate(users, { ignoreDuplicates: true });

        res.json({
            message: "Seed complet!",
            god: "cristian.tabira@yahoo.com (cacapaca)",
            others: "user1-10@test.com (parola123)",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    updateUserRole,
    getMe,
    seedTenUsers,
};
