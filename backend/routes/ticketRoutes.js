const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    createTicket,
    getComplexTickets,
    assignTicket,
    resolveTicket,
    confirmResolution,
    cancelTicket,
    getMyTickets,
} = require("../controllers/ticketController");

// Create a new ticket (any authenticated user)
router.post("/", protect, createTicket);

router.get("/my-tickets", protect, getMyTickets);
// Get tickets for a complex (only admins of that complex or GOD)
router.get(
    "/:complexId",
    protect,
    authorize("ADMIN", "GOD"),
    getComplexTickets,
);

// Assign ticket to an admin
router.patch(
    "/:ticketId/assign",
    protect,
    authorize("ADMIN", "GOD"),
    assignTicket,
);

// Resolve ticket (mark as resolved)
router.patch(
    "/:ticketId/resolve",
    protect,
    authorize("ADMIN", "GOD"),
    resolveTicket,
);

// Confirm resolution or reopen (only user who raised ticket)
router.patch("/:ticketId/confirm-resolution", protect, confirmResolution);

// Cancel ticket
router.patch("/:ticketId/cancel", protect, cancelTicket);

module.exports = router;
