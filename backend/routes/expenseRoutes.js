const express = require("express");
const router = express.Router();
const {
    createExpense,
    getMyExpenses,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

// Toate rutele de aici folosesc 'protect'
router.use(protect);

router.post("/", createExpense);
router.get("/my", getMyExpenses);

module.exports = router;
