const Ticket = require("../models/Ticket");
const { Op } = require("sequelize");

// Check and auto-close resolved tickets after 48 hours
const autoCloseResolvedTickets = async () => {
    try {
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        // Find tickets that are RESOLVED for more than 48 hours and haven't been user-confirmed yet
        const ticketsToClose = await Ticket.findAll({
            where: {
                status: "RESOLVED",
                resolvedAt: {
                    [Op.lte]: fortyEightHoursAgo
                },
                userConfirmed: false
            }
        });

        if (ticketsToClose.length === 0) {
            console.log("✓ No tickets to auto-close");
            return;
        }

        // Update all to CLOSED status
        const result = await Ticket.update(
            {
                status: "CLOSED",
                closedAt: now,
                userConfirmed: true
            },
            {
                where: {
                    status: "RESOLVED",
                    resolvedAt: {
                        [Op.lte]: fortyEightHoursAgo
                    },
                    userConfirmed: false
                }
            }
        );

        console.log(`✓ Auto-closed ${result[0]} tickets after 48 hours of resolution`);
    } catch (error) {
        console.error("✗ Error in autoCloseResolvedTickets:", error);
    }
};

// Start the scheduler (runs every 1 hour)
const startTicketScheduler = () => {
    console.log("🕐 Ticket Auto-Close Scheduler started (checks every 1 hour)");
    
    // Run immediately on startup
    autoCloseResolvedTickets();
    
    // Then run every hour
    setInterval(() => {
        autoCloseResolvedTickets();
    }, 60 * 60 * 1000);
};

module.exports = { startTicketScheduler, autoCloseResolvedTickets };
