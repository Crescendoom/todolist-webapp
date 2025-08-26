const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Task text is required'],
        trim: true,
        minlength: [1, 'Task text must be at least 1 character'],
        maxlength: [500, 'Task text must be less than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

// Add indexes for better performance
taskSchema.index({ category: 1, user: 1 })
taskSchema.index({ completed: 1, user: 1 })
taskSchema.index({ createdAt: -1, user: 1 })

module.exports = mongoose.model('Task', taskSchema)