import { useState, useEffect } from 'react'
import { categoryAPI, taskAPI } from '../services/api'
import CategoryAndTasks from './CategoryAndTasks'
import Lists from './Lists'
import ConfirmationModal from './ConfirmationModal'
import ErrorBoundary from './ErrorBoundary'

function TodoApp() {
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  })

  // Show toast notification
  const showToast = (message, type = 'success') => {
    try {
      setToast({ show: true, message, type })
      
      // Clear any existing timeout to prevent conflicts
      if (window.toastTimeout) {
        clearTimeout(window.toastTimeout)
      }
      
      window.toastTimeout = setTimeout(() => {
        setToast({ show: false, message: '', type: '' })
      }, 3000)
    } catch (error) {
      console.error('Error showing toast:', error)
    }
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [categoriesData, tasksData] = await Promise.all([
          categoryAPI.getAll(),
          taskAPI.getAll()
        ])
        setCategories(categoriesData.map(cat => cat.name))
        setTasks(tasksData)
      } 
      catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load data. Please check your connection and try again.')
        showToast('Failed to load data. Check if backend is running.', 'error')
        setCategories([])
        setTasks([])
      } 
      finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Load tasks when category changes
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasksData = await taskAPI.getAll(selectedCategory)
        setTasks(tasksData)
      } 
      catch (error) {
        console.error('Error loading tasks:', error)
        showToast('Failed to load tasks. Please try again.', 'error')
      }
    }

    if (!isLoading) {
      loadTasks()
    }
  }, [selectedCategory, isLoading])

  // Category functions
  const handleAddCategory = async (name) => {
    try {
      await categoryAPI.create(name)
      setCategories(prev => [...prev, name])
      showToast(`Category "${name}" created successfully!`)
    } catch (error) {
      console.error('Error adding category:', error)
      showToast(error.message || 'Failed to create category', 'error')
    }
  }

  const handleDeleteCategory = (categoryName) => {
    try {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Category',
        message: `Are you sure you want to delete "${categoryName}"? This will also delete all tasks in this category.`,
        onConfirm: () => confirmDeleteCategory(categoryName),
        type: 'danger'
      })
    } catch (error) {
      console.error('Error opening delete modal:', error)
      showToast('Failed to open delete confirmation', 'error')
    }
  }

  const confirmDeleteCategory = async (categoryName) => {
    try {
      await categoryAPI.delete(categoryName)
      setCategories(prev => prev.filter(cat => cat !== categoryName))
      
      // Also remove tasks of this category from state
      setTasks(prev => prev.filter(task => task.category !== categoryName))
      
      // If the deleted category was selected, clear selection
      if (selectedCategory === categoryName) {
        setSelectedCategory(null)
      }
      
      setConfirmModal(prev => ({ ...prev, isOpen: false }))
      showToast(`Category "${categoryName}" deleted successfully!`)
    } catch (error) {
      console.error('Error deleting category:', error)
      showToast(error.message || 'Failed to delete category', 'error')
    }
  }

  // Task functions
  const handleAddTask = async ({ task, category }) => {
    try {
      const newTask = await taskAPI.create({ text: task, category })
      setTasks(prev => [newTask, ...prev])
      showToast('Task created successfully!')
    } catch (error) {
      console.error('Error adding task:', error)
      showToast(error.message || 'Failed to create task', 'error')
    }
  }

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const updatedTask = await taskAPI.update(taskId, updates)
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ))
      showToast('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      showToast(error.message || 'Failed to update task', 'error')
    }
  }

  const handleDeleteTask = (task) => {
    try {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.text}"?`,
        onConfirm: () => confirmDeleteTask(task._id),
        type: 'danger'
      })
    } catch (error) {
      console.error('Error opening delete modal:', error)
      showToast('Failed to open delete confirmation', 'error')
    }
  }

  const confirmDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId)
      setTasks(prev => prev.filter(task => task._id !== taskId))
      setConfirmModal(prev => ({ ...prev, isOpen: false }))
      showToast('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      showToast(error.message || 'Failed to delete task', 'error')
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId)
      if (!task) return

      const updatedTask = await taskAPI.update(taskId, { 
        completed: !task.completed 
      })
      
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ))
      
      showToast(
        updatedTask.completed ? 'Task completed!' : 'Task marked as incomplete',
        updatedTask.completed ? 'success' : 'info'
      )
    } catch (error) {
      console.error('Error toggling task:', error)
      showToast(error.message || 'Failed to update task', 'error')
    }
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const totalCategories = categories.length

  // Error state
  if (error && !isLoading) {
    return (
      <div className="loading-container">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <p className="loading-text" style={{ color: '#ef4444' }}>Oops! Something went wrong</p>
        <p className="loading-subtext">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your tasks...</p>
        <p className="loading-subtext">Getting everything ready for you</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="todo-app">
        <div className="main-layout">
          {/* Left Column - Category Management & Task Creation */}
          <div className="left-column">
            <div className="step-section">
              <h2>📁 Manage Categories & Add Tasks</h2>
              <CategoryAndTasks
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddTask={handleAddTask}
                availableCategories={categories}
              />
            </div>
          </div>

        {/* Right Column - Stats & Task List */}
        <div className="right-column">
          {/* Progress Stats */}
          <div className="step-section">
            <h2>Your Progress</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{completedTasks}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{totalCategories}</div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="step-section">
            <h2>Your Tasks</h2>
            <Lists
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              availableCategories={categories}
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        type={confirmModal.type}
      />
      </div>
    </ErrorBoundary>
  )
}

export default TodoApp