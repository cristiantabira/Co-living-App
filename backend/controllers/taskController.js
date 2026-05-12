const Task = require("../models/Task");
const User = require("../models/User");
const Apartment = require("../models/Apartment");

// Creare task
const createTask = async (req, res) => {
    try {
        const { title, description, type, dueDate, priority } = req.body;
        const userId = req.user.id;

        // Găsesc apartamentul utilizatorului
        const user = await User.findByPk(userId);
        if (!user || !user.apartmentId) {
            return res.status(400).json({ message: "Nu aparții niciunui apartament!" });
        }

        const task = await Task.create({
            title,
            description,
            type: type || "TASK",
            priority: priority || "MEDIUM",
            dueDate: dueDate || null,
            status: "PENDING",
            apartmentId: user.apartmentId,
        });

        res.status(201).json({
            message: "Task creat și partajat cu colegii!",
            task,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obține tasks-urile apartamentului utilizatorului
const getApartmentTasks = async (req, res) => {
    try {
        const userId = req.user.id;

        // Găsesc apartamentul utilizatorului
        const user = await User.findByPk(userId);
        if (!user || !user.apartmentId) {
            return res.json([]);
        }

        const tasks = await Task.findAll({
            where: { apartmentId: user.apartmentId },
            order: [["dueDate", "ASC"], ["priority", "DESC"], ["createdAt", "DESC"]],
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marcheaza task ca completat
const completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        // Verific că task-ul aparține apartamentului utilizatorului
        const user = await User.findByPk(userId);
        const task = await Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task nu a fost găsit" });
        }

        if (task.apartmentId !== user.apartmentId) {
            return res.status(403).json({ message: "Nu ai acces la acest task" });
        }

        task.status = task.status === "PENDING" ? "COMPLETED" : "PENDING";
        await task.save();

        res.json({
            message: `Task marcat ca ${task.status}!`,
            task,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Șterge task
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        // Verific că task-ul aparține apartamentului utilizatorului
        const user = await User.findByPk(userId);
        const task = await Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task nu a fost găsit" });
        }

        if (task.apartmentId !== user.apartmentId) {
            return res.status(403).json({ message: "Nu ai acces la acest task" });
        }

        await task.destroy();

        res.json({ message: "Task șters cu succes!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Editează task
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, type, dueDate, priority, status } = req.body;
        const userId = req.user.id;

        // Verific că task-ul aparține apartamentului utilizatorului
        const user = await User.findByPk(userId);
        const task = await Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task nu a fost găsit" });
        }

        if (task.apartmentId !== user.apartmentId) {
            return res.status(403).json({ message: "Nu ai acces la acest task" });
        }

        // Actualizez câmpurile
        if (title) task.title = title;
        if (description) task.description = description;
        if (type) task.type = type;
        if (dueDate) task.dueDate = dueDate;
        if (priority) task.priority = priority;
        if (status) task.status = status;

        await task.save();

        res.json({
            message: "Task actualizat!",
            task,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTask,
    getApartmentTasks,
    completeTask,
    deleteTask,
    updateTask,
};
