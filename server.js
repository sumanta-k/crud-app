const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
    .connect("mongodb://localhost:27017/crud_app", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });

// Task Schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field before saving
taskSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Task = mongoose.model("Task", taskSchema);

// Routes

// GET / - Serve the main HTML page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CREATE - Add a new task
app.post("/api/tasks", async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        const newTask = new Task({
            title: title.trim(),
            description: description ? description.trim() : "",
            status: status || "pending",
        });

        const savedTask = await newTask.save();

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: savedTask,
        });
    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message,
        });
    }
});

// READ - Get all tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 }); // Sort by newest first

        res.json({
            success: true,
            count: tasks.length,
            tasks: tasks,
        });
    } catch (error) {
        console.error("Get tasks error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
            error: error.message,
        });
    }
});

// READ - Get a single task by ID
app.get("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        res.json({
            success: true,
            task: task,
        });
    } catch (error) {
        console.error("Get task error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve task",
            error: error.message,
        });
    }
});

// UPDATE - Update a task by ID
app.put("/api/tasks/:id", async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                description: description ? description.trim() : "",
                status: status || "pending",
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true },
        );

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        res.json({
            success: true,
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Update task error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message,
        });
    }
});

// DELETE - Delete a task by ID
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        res.json({
            success: true,
            message: "Task deleted successfully",
            task: deletedTask,
        });
    } catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message,
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running!",
        timestamp: new Date().toISOString(),
        database:
            mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    });
});

// Handle undefined routes
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Internal server error",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(
        `API endpoints available at http://localhost:${PORT}/api/tasks`,
    );
    console.log("Press Ctrl+C to stop the server");
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
});
