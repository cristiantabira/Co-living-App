const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    // Token-ul vine de obicei în Header sub forma "Bearer <token>"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verificăm token-ul
            const decoded = jwt.verify(token, "SECRET_KEY_FOARTE_SIGURA");

            // Punem datele utilizatorului (id și role) în obiectul req pentru a fi folosite ulterior
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({
                message: "Nu ești autorizat, token invalid!",
            });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Lipsește token-ul, acces refuzat!" });
    }
};

// Middleware pentru restricționare pe bază de ROL
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Rolul ${req.user.role} nu are permisiunea de a accesa această resursă!`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
