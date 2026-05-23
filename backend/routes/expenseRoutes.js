const express = require("express");
const router = express.Router();
const {
    createExpense,
    createAdminBill,
    getMyExpenses,
    getBalance,
    getExpenseHistory,
    getDebtsDetails,
    getExpensesByType,
} = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Toate rutele de aici folosesc 'protect'
router.use(protect);

router.post("/", createExpense);
router.get("/my", getMyExpenses);
router.get("/balance", getBalance);
router.get("/history", getExpenseHistory);
router.get("/debts-details", getDebtsDetails);
router.get("/by-type", getExpensesByType);

// Admin billing - doar ADMIN si GOD
router.post("/admin/bill", authorize("ADMIN", "GOD"), createAdminBill);

module.exports = router;
