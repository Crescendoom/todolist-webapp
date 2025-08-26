const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// Simple logger utility
const logger = {
  info: (message, data = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`ℹ️  ${message}`, data)
    }
  },
  error: (message, error = '') => {
    console.error(`❌ ${message}`, error)
  },
  warn: (message, data = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️  ${message}`, data)
    }
  },
  success: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ ${message}`)
    }
  }
}

// CORS configuration - UPDATED to include port 5174
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174' 
      ],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/tasks', require('./routes/tasks'))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  })
})

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Global error:', error.message)
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' })
  } else {
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
    })
  }
})

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    logger.success('MongoDB connected successfully')
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

// Handle MongoDB events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  logger.success('MongoDB reconnected')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...')
  await mongoose.connection.close()
  process.exit(0)
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
})