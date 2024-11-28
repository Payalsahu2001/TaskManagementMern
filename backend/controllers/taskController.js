const Task = require("../models/Task");

// Create a new task
exports.createTask = async (req, res) => {
    const { title, description, dueDate, priority } = req.body;

    try {
        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            assignedTo: req.user._id,
        });

        res.status(201).json(task);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to create task" });
    }
};

// Get all tasks with pagination
exports.getTasks = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .sort({ dueDate: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalTasks = await Task.countDocuments({ assignedTo: req.user._id });

        res.json({ tasks, totalPages: Math.ceil(totalTasks / limit), currentPage: page });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to fetch tasks" });
    }
};

// Get task details
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to fetch task" });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    const { title, description, dueDate, status, priority } = req.body;

    try {
        let task = await Task.findById(req.params.id);
        if (!task || task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.status = status || task.status;
        task.priority = priority || task.priority;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to update task" });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Task not found" });
        }

        await Task.findByIdAndDelete(task);
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to delete task" });
    }
};
