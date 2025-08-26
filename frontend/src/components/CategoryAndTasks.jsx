import { useState } from 'react'
import '../styles/CategoryAndTasks.css'

function CategoryAndTasks({ 
    categories, 
    onAddCategory, 
    onDeleteCategory, 
    selectedCategory, 
    onSelectCategory,
    onAddTask,
    availableCategories
}) {
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newTask, setNewTask] = useState('')
    const [selectedTaskCategory, setSelectedTaskCategory] = useState('')

    const handleAddCategory = (e) => {
        e.preventDefault()
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName.trim())
            setNewCategoryName('')
            setShowAddCategory(false)
        }
    }

    const handleAddTask = (e) => {
        e.preventDefault()
        if (newTask.trim() && selectedTaskCategory) {
            onAddTask({
                task: newTask.trim(),
                category: selectedTaskCategory
            })
            setNewTask('')
        }
    }

    return (
        <div className="category-and-tasks">
            {/* Category Management Section */}
            <div className="category-section">
                <div className="category-header">
                    <h3>Categories</h3>
                    <button 
                        className="add-category-btn"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                    >
                        {showAddCategory ? 'Cancel' : '+ Add Category'}
                    </button>
                </div>

                {showAddCategory && (
                    <form onSubmit={handleAddCategory} className="add-category-form">
                        <input
                            type="text"
                            placeholder="Enter category name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="category-input"
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            className={`save-category-btn ${!newCategoryName.trim() ? 'disabled' : ''}`}
                            disabled={!newCategoryName.trim()}
                        >
                            Save
                        </button>
                    </form>
                )}

                <div className="categories-list">
                    <button
                        className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => onSelectCategory(null)}
                    >
                        All Categories ({categories.length})
                    </button>
                    
                    {categories.map(category => (
                        <div key={category} className="category-item">
                            <button
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => onSelectCategory(category)}
                            >
                                {category}
                            </button>
                            <button
                                className="delete-category-btn"
                                onClick={() => onDeleteCategory(category)}
                                title={`Delete ${category}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="section-divider"></div>

            {/* Task Creation Section */}
            <div className="task-section">
                <h3>Add New Task</h3>
                
                {categories.length > 0 ? (
                    <form onSubmit={handleAddTask} className="add-task-form">
                        <div className="task-input-group">
                            <input
                                type="text"
                                placeholder="Enter your task..."
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                className="task-input"
                            />
                            <select
                                value={selectedTaskCategory}
                                onChange={(e) => setSelectedTaskCategory(e.target.value)}
                                className="category-select"
                                required
                            >
                                <option value="" disabled hidden >Select Category</option>
                                {availableCategories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            className="add-task-btn"
                            disabled={!newTask.trim() || !selectedTaskCategory}
                        >
                            Add Task
                        </button>
                    </form>
                ) : (
                    <div className="no-categories-message">
                        <p>Create a category first to start adding tasks!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoryAndTasks