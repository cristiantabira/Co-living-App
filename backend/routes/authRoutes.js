const express = require("express");
const router = express.Router();
const {
    register,
    login,
    getAllUsers,
    updateUserRole,
    getMe,
    seedTenUsers,
} = require("../controllers/authController");
router.post("/seed-users", seedTenUsers);
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/users", protect, authorize("GOD"), getAllUsers);
router.put("/update-role", protect, authorize("GOD"), updateUserRole);
router.get("/me", protect, getMe);
module.exports = router;
