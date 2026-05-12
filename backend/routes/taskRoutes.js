const express = require("express");
const router = express.Router();
const {
    createTask,
    getApartmentTasks,
    completeTask,
    deleteTask,
    updateTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// Toate rutele necesită autentificare
router.use(protect);

router.post("/", createTask);
router.get("/", getApartmentTasks);
router.put("/:taskId", updateTask);
router.patch("/:taskId/toggle", completeTask);
router.delete("/:taskId", deleteTask);

module.exports = router;
