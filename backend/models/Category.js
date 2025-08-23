const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        minlength: [1, 'Category name must be at least 1 character'],
        maxlength: [50, 'Category name must be less than 50 characters']
    }
}, {
    timestamps: true
})

// Add index for better performance
categorySchema.index({ name: 1 })

module.exports = mongoose.model('Category', categorySchema)