const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        minlength: [1, 'Category name must be at least 1 character'],
        maxlength: [50, 'Category name must be less than 50 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

// Ensure unique category names per user
categorySchema.index({ name: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('Category', categorySchema)