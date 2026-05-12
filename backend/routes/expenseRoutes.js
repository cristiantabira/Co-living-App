const express = require("express");
const router = express.Router();
const {
    createExpense,
    createAdminBill,
    getMyExpenses,
    getBalance,
    getExpenseHistory,
} = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Toate rutele de aici folosesc 'protect'
router.use(protect);

router.post("/", createExpense);
router.get("/my", getMyExpenses);
router.get("/balance", getBalance);
router.get("/history", getExpenseHistory);

// Admin billing - doar ADMIN si GOD
router.post("/admin/bill", authorize("ADMIN", "GOD"), createAdminBill);

module.exports = router;
