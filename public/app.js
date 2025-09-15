// API Base URL
const API_BASE_URL = "/api/tasks";

// DOM elements
const taskForm = document.getElementById("taskForm");
const tasksList = document.getElementById("tasksList");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const statusInput = document.getElementById("status");
const createBtn = document.getElementById("createBtn");
const formMessages = document.getElementById("formMessages");
const taskCount = document.getElementById("taskCount");
const connectionDot = document.getElementById("connectionDot");
const connectionText = document.getElementById("connectionText");
const taskStats = document.getElementById("taskStats");

let tasks = [];

// API Helper Functions
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || `HTTP error! status: ${response.status}`,
            );
        }

        updateConnectionStatus(true);
        return data;
    } catch (error) {
        updateConnectionStatus(false);
        throw error;
    }
}

// Connection Status
function updateConnectionStatus(connected) {
    if (connected) {
        connectionDot.classList.remove("disconnected");
        connectionText.textContent = "Connected to MongoDB";
    } else {
        connectionDot.classList.add("disconnected");
        connectionText.textContent = "Connection Error";
    }
}

// Show Messages
function showMessage(message, type = "error") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    formMessages.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add("fade-out");
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 500);
    }, 5000);
}

// Update Task Statistics
function updateTaskStats() {
    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const inProgress = tasks.filter(
        (task) => task.status === "in-progress",
    ).length;
    const completed = tasks.filter(
        (task) => task.status === "completed",
    ).length;

    taskCount.textContent = `${total} task${total !== 1 ? "s" : ""}`;
    taskStats.textContent = `${pending} pending, ${inProgress} in progress, ${completed} completed`;
}

// CREATE - Add new task
taskForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newTask = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusInput.value,
    };

    if (!newTask.title) {
        showMessage("Title is required!", "error");
        return;
    }

    createBtn.disabled = true;
    createBtn.classList.add("loading");
    createBtn.textContent = "";

    try {
        const response = await apiCall(API_BASE_URL, {
            method: "POST",
            body: JSON.stringify(newTask),
        });

        tasks.unshift(response.task);
        renderTasks();
        taskForm.reset();
        showMessage("Task created successfully!", "success");
    } catch (error) {
        showMessage(`Failed to create task: ${error.message}`, "error");
    } finally {
        createBtn.disabled = false;
        createBtn.classList.remove("loading");
        createBtn.textContent = "Create Task";
    }
});

// READ - Fetch all tasks
async function fetchTasks() {
    try {
        const response = await apiCall(API_BASE_URL);
        tasks = response.tasks || [];
        renderTasks();
    } catch (error) {
        tasksList.innerHTML = `<div class="error-message">Failed to load tasks: ${error.message}</div>`;
    }
}

// Render tasks
function renderTasks() {
    if (tasks.length === 0) {
        tasksList.innerHTML =
            '<div class="no-tasks">No tasks yet. Create your first task above!</div>';
        updateTaskStats();
        return;
    }

    tasksList.innerHTML = tasks
        .map(
            (task) => `
                <div class="task-item" data-id="${task._id}">
                    <div class="task-header">
                        <div class="task-title">${escapeHtml(task.title)}</div>
                        <span class="task-status status-${task.status}">${formatStatus(task.status)}</span>
                    </div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ""}
                    <div class="task-meta">
                        Created: ${formatDate(task.createdAt)}
                        ${task.updatedAt !== task.createdAt ? `• Updated: ${formatDate(task.updatedAt)}` : ""}
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-edit" onclick="editTask('${task._id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteTask('${task._id}')">Delete</button>
                    </div>
                    
                    <div class="edit-form" id="edit-${task._id}">
                        <div class="form-group">
                            <label>Task Title</label>
                            <input type="text" id="edit-title-${task._id}" value="${escapeHtml(task.title)}" maxlength="200">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="edit-description-${task._id}" maxlength="1000">${escapeHtml(task.description || "")}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="edit-status-${task._id}">
                                <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
                                <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
                                <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn" onclick="updateTask('${task._id}')">Save Changes</button>
                            <button class="btn btn-danger" onclick="cancelEdit('${task._id}')">Cancel</button>
                        </div>
                    </div>
                </div>
            `,
        )
        .join("");

    updateTaskStats();
}

// UPDATE - Edit existing task
function editTask(id) {
    document.querySelectorAll(".edit-form").forEach((form) => {
        form.classList.remove("active");
    });

    const editForm = document.getElementById(`edit-${id}`);
    if (editForm) {
        editForm.classList.add("active");
    }
}

async function updateTask(id) {
    const titleInput = document.getElementById(`edit-title-${id}`);
    const descriptionInput = document.getElementById(`edit-description-${id}`);
    const statusInput = document.getElementById(`edit-status-${id}`);

    if (!titleInput.value.trim()) {
        showMessage("Title is required!", "error");
        return;
    }

    const updateData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusInput.value,
    };

    try {
        const response = await apiCall(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
        });

        const taskIndex = tasks.findIndex((task) => task._id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex] = response.task;
        }

        renderTasks();
        showMessage("Task updated successfully!", "success");
    } catch (error) {
        showMessage(`Failed to update task: ${error.message}`, "error");
    }
}

function cancelEdit(id) {
    const editForm = document.getElementById(`edit-${id}`);
    if (editForm) {
        editForm.classList.remove("active");
    }
}

// DELETE - Remove task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add("removing");
    }

    try {
        await apiCall(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
        });

        tasks = tasks.filter((task) => task._id !== id);

        setTimeout(() => {
            renderTasks();
            showMessage("Task deleted successfully!", "success");
        }, 300);
    } catch (error) {
        if (taskElement) {
            taskElement.classList.remove("removing");
        }
        showMessage(`Failed to delete task: ${error.message}`, "error");
    }
}

// Utility functions
function formatStatus(status) {
    return status
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Check server health
async function checkHealth() {
    try {
        await apiCall("/api/health");
    } catch (error) {
        console.error("Health check failed:", error);
    }
}

// Initialize app
async function initApp() {
    await checkHealth();
    await fetchTasks();

    // Add entrance animation
    const container = document.querySelector(".container");
    container.style.opacity = "0";
    container.style.transform = "translateY(50px)";

    setTimeout(() => {
        container.style.transition = "all 0.8s ease";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
    }, 100);
}

// Start the application
document.addEventListener("DOMContentLoaded", initApp);

// Periodic health check
setInterval(checkHealth, 30000); // Check every 30 seconds
