/* filepath: d:\PROJECTS\ESCAPING TUTORIAL HELL\todolist\frontend\src\components\Lists.jsx */
import { useState } from 'react'
import '../styles/Lists.css'

function Lists({ tasks, onUpdateTask, onDeleteTask, onToggleComplete, availableCategories }) {
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editText, setEditText] = useState('')
    const [editCategory, setEditCategory] = useState('')

    const startEdit = (task) => {
        setEditingTaskId(task._id)
        setEditText(task.text)
        setEditCategory(task.category)
    }

    const cancelEdit = () => {
        setEditingTaskId(null)
        setEditText('')
        setEditCategory('')
    }

    const saveEdit = () => {
        if (editText.trim() && editCategory) {
            onUpdateTask(editingTaskId, {
                text: editText.trim(),
                category: editCategory
            })
            cancelEdit()
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            saveEdit()
        } else if (e.key === 'Escape') {
            cancelEdit()
        }
    }

    if (tasks.length === 0) {
        return (
            <div className="lists-container">
                <div className="empty-tasks">
                    <h3>No Tasks Found</h3>
                    <p>Add some tasks to get started! 📝</p>
                </div>
            </div>
        )
    }

    return (
        <div className="lists-container">
            {/* Task Count Information */}
            <div className={`task-count-info ${tasks.length > 3 ? 'has-scroll' : ''}`}>
                <div>
                    Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </div>
                {tasks.length > 3 && (
                    <div className="scroll-indicator">
                        ↕ Scroll to see all tasks
                    </div>
                )}
            </div>

            {/* Scrollable Task List */}
            <div className="task-list">
                {tasks.map(task => (
                    <div 
                        key={task._id} 
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                    >
                        <input
                            type="checkbox"
                            className="task-checkbox"
                            checked={task.completed || false}
                            onChange={() => onToggleComplete(task._id)}
                        />

                        {editingTaskId === task._id ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="edit-input"
                                    placeholder="Task description..."
                                    autoFocus
                                />
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="edit-select"
                                >
                                    <option value="">Select Category</option>
                                    {availableCategories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <div className="edit-actions">
                                    <button 
                                        onClick={saveEdit}
                                        className="task-btn save-btn"
                                        disabled={!editText.trim() || !editCategory}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={cancelEdit}
                                        className="task-btn cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="task-content">
                                    <p className={`task-text ${task.completed ? 'completed' : ''}`}>
                                        {task.text}
                                    </p>
                                    <span className="task-category">
                                        {task.category}
                                    </span>
                                </div>
                                <div className="task-actions">
                                    <button 
                                        onClick={() => startEdit(task)}
                                        className="task-btn edit-btn"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => onDeleteTask(task)}
                                        className="task-btn delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Lists