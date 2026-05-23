const express = require("express");
const router = express.Router();
const {
    createExpense,
    createAdminBill,
    getMyExpenses,
    getBalance,
    getExpenseHistory,
    getDebtsDetails,
    getPaymentHistory,
    getExpensesByType,
    sendPaymentReminderEndpoint,
    sendPaymentReminderForCredit,
    settleDebt,
    createPaymentIntentEndpoint,
    confirmPaymentEndpoint,
} = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Toate rutele de aici folosesc 'protect'
router.use(protect);

router.post("/", createExpense);
router.get("/my", getMyExpenses);
router.get("/balance", getBalance);
router.get("/history", getExpenseHistory);
router.get("/debts-details", getDebtsDetails);
router.get("/payment-history", getPaymentHistory);
router.get("/by-type", getExpensesByType);
router.post("/send-reminder", sendPaymentReminderEndpoint);
router.post("/send-reminder-credit", sendPaymentReminderForCredit);
router.post("/settle-debt", settleDebt);
router.post("/create-payment-intent", createPaymentIntentEndpoint);
router.post("/confirm-payment", confirmPaymentEndpoint);

// Admin billing - doar ADMIN si GOD
router.post("/admin/bill", authorize("ADMIN", "GOD"), createAdminBill);

module.exports = router;
