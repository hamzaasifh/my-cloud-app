const API_URL = "http://localhost:4000/api/tasks"

let tasks = []

// DOM Elements
const taskForm = document.getElementById("taskForm")
const taskTitleInput = document.getElementById("taskTitle")
const taskDescriptionInput = document.getElementById("taskDescription")
const tasksList = document.getElementById("tasksList")
const totalTasksEl = document.getElementById("totalTasks")
const completedTasksEl = document.getElementById("completedTasks")
const pendingTasksEl = document.getElementById("pendingTasks")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadTasks()
  taskForm.addEventListener("submit", handleAddTask)
})

// Load all tasks from API
async function loadTasks() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error("Failed to fetch tasks")

    tasks = await response.json()
    renderTasks()
    updateStats()
  } catch (error) {
    console.error("Error loading tasks:", error)
    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">Failed to load tasks</div>
        <p>Please make sure the backend server is running.</p>
      </div>
    `
  }
}

// Render tasks to DOM
function renderTasks() {
  if (tasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No tasks yet</div>
        <p>Add your first task to get started!</p>
      </div>
    `
    return
  }

  tasksList.innerHTML = tasks
    .map(
      (task) => `
    <div class="task-item ${task.completed ? "completed" : ""}" data-id="${task._id}">
      <div class="task-header">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? "checked" : ""}
          onchange="toggleTask('${task._id}', ${!task.completed})"
        >
        <div class="task-content">
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
          <p class="task-date">Created: ${formatDate(task.createdAt)}</p>
        </div>
        <div class="task-actions">
          <button class="btn btn-danger" onclick="deleteTask('${task._id}')">
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("")
}

// Update statistics
function updateStats() {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed

  totalTasksEl.textContent = total
  completedTasksEl.textContent = completed
  pendingTasksEl.textContent = pending
}

// Handle add task form submission
async function handleAddTask(e) {
  e.preventDefault()

  const title = taskTitleInput.value.trim()
  const description = taskDescriptionInput.value.trim()

  if (!title) return

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    })

    if (!response.ok) throw new Error("Failed to create task")

    taskTitleInput.value = ""
    taskDescriptionInput.value = ""

    await loadTasks()
  } catch (error) {
    console.error("Error adding task:", error)
    alert("Failed to add task. Please try again.")
  }
}

// Toggle task completion
async function toggleTask(id, completed) {
  try {
    const task = tasks.find((t) => t._id === id)
    if (!task) return

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...task,
        completed,
      }),
    })

    if (!response.ok) throw new Error("Failed to update task")

    await loadTasks()
  } catch (error) {
    console.error("Error updating task:", error)
    alert("Failed to update task. Please try again.")
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete task")

    await loadTasks()
  } catch (error) {
    console.error("Error deleting task:", error)
    alert("Failed to delete task. Please try again.")
  }
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
