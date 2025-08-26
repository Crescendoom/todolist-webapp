const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const auth = require('../middleware/auth')

// Apply auth middleware to all routes
router.use(auth)

// Logger utility
const logger = {
  error: (message, error) => console.error(`❌ ${message}`, error),
  info: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`ℹ️  ${message}`)
    }
  }
}

// Get all tasks for logged-in user
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const filter = { user: req.user._id }
    
    if (category && category !== 'All Categories') {
      filter.category = category
    }
    
    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    logger.error('Error fetching tasks:', error.message)
    res.status(500).json({ message: 'Failed to fetch tasks' })
  }
})

// Create new task
router.post('/', async (req, res) => {
  try {
    const { text, category } = req.body
    
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' })
    }
    
    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' })
    }

    const task = new Task({
      text: text.trim(),
      category: category.trim(),
      completed: false,
      user: req.user._id
    })
    
    await task.save()
    logger.info(`Task created: ${task.text} for user: ${req.user.username}`)
    res.status(201).json(task)
  } catch (error) {
    logger.error('Error creating task:', error.message)
    res.status(500).json({ message: 'Failed to create task' })
  }
})

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true }
    )
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    logger.info(`Task updated: ${task.text} for user: ${req.user.username}`)
    res.json(task)
  } catch (error) {
    logger.error('Error updating task:', error.message)
    res.status(500).json({ message: 'Failed to update task' })
  }
})

// Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findOne({ _id: id, user: req.user._id })
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    task.completed = !task.completed
    await task.save()
    
    logger.info(`Task ${task.completed ? 'completed' : 'uncompleted'}: ${task.text} for user: ${req.user.username}`)
    res.json(task)
  } catch (error) {
    logger.error('Error toggling task:', error.message)
    res.status(500).json({ message: 'Failed to toggle task' })
  }
})

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id })
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    logger.info(`Task deleted: ${task.text}`)
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    logger.error('Error deleting task:', error.message)
    res.status(500).json({ message: 'Failed to delete task' })
  }
})

module.exports = router