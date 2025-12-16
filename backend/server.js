const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/taskmanager"

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Task = mongoose.model("Task", taskSchema)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description || "",
    })
    const savedTask = await task.save()
    res.status(201).json(savedTask)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed,
      },
      { new: true, runValidators: true },
    )
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }
    res.json(task)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }
    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
