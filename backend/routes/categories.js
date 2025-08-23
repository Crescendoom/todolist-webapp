const express = require('express')
const router = express.Router()
const Category = require('../models/Category')
const Task = require('../models/Task')

// Logger utility
const logger = {
  error: (message, error) => console.error(`❌ ${message}`, error),
  info: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`ℹ️  ${message}`)
    }
  }
}

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })
    res.json(categories)
  } catch (error) {
    logger.error('Error fetching categories:', error.message)
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
})

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    const existingCategory = await Category.findOne({ 
      name: name.trim().toLowerCase() 
    })
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const category = new Category({ name: name.trim() })
    await category.save()
    
    logger.info(`Category created: ${category.name}`)
    res.status(201).json(category)
  } catch (error) {
    logger.error('Error creating category:', error.message)
    res.status(500).json({ message: 'Failed to create category' })
  }
})

// Delete category
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params
    
    // First, delete all tasks in this category
    const deletedTasks = await Task.deleteMany({ category: name })
    logger.info(`Deleted ${deletedTasks.deletedCount} tasks from category: ${name}`)
    
    // Then delete the category itself
    const category = await Category.findOneAndDelete({ name })
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }
    
    logger.info(`Category deleted: ${category.name}`)
    res.json({ 
      message: 'Category and associated tasks deleted successfully',
      deletedTasksCount: deletedTasks.deletedCount
    })
  } catch (error) {
    logger.error('Error deleting category:', error.message)
    res.status(500).json({ message: 'Failed to delete category' })
  }
})

module.exports = router