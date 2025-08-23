import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import CategoryAndTasks from './components/CategoryAndTasks'
import Lists from './components/Lists'
import ConfirmationModal from './components/ConfirmationModal'
// Fix: Change 'categoriesAPI' to 'categoryAPI' (singular)
import { categoryAPI, taskAPI } from './services/api'

function App() {
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [categoriesData, tasksData] = await Promise.all([
          categoryAPI.getAll(), // Use categoryAPI (singular)
          taskAPI.getAll()
        ])
        setCategories(categoriesData.map(cat => cat.name))
        setTasks(tasksData)
      } catch (error) {
        console.error('Error loading data:', error)
        showToast('Failed to load data. Check if backend is running.', 'error')
        setCategories([])
        setTasks([])
      } finally {
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
      } catch (error) {
        console.error('Error loading tasks:', error)
        showToast('Failed to load tasks', 'error')
      }
    }

    if (!isLoading) {
      loadTasks()
    }
  }, [selectedCategory, isLoading])

  // Category functions
  const handleAddCategory = async (name) => {
    try {
      await categoryAPI.create(name) // Use categoryAPI (singular)
      setCategories(prev => [...prev, name])
      showToast('Category added successfully!')
    } catch (error) {
      showToast('Failed to add category', 'error')
      console.error('Error adding category:', error)
    }
  }

  const handleDeleteCategory = (categoryName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${categoryName}"? This will also delete all tasks in this category.`,
      onConfirm: () => confirmDeleteCategory(categoryName),
      type: 'danger'
    })
  }

  const confirmDeleteCategory = async (categoryName) => {
    try {
      await categoryAPI.delete(categoryName) // Use categoryAPI (singular)
      setCategories(prev => prev.filter(cat => cat !== categoryName))
      setTasks(prev => prev.filter(task => task.category !== categoryName))
      if (selectedCategory === categoryName) {
        setSelectedCategory(null)
      }
      showToast('Category deleted successfully!')
    } catch (error) {
      showToast('Failed to delete category', 'error')
      console.error('Error deleting category:', error)
    }
    setConfirmModal({ ...confirmModal, isOpen: false })
  }

  // Task functions
  const handleAddTask = async ({ task, category }) => {
    try {
      const newTask = await taskAPI.create({
        text: task,
        category: category,
        completed: false
      })
      setTasks(prev => [newTask, ...prev])
      showToast('Task added successfully!')
    } catch (error) {
      showToast('Failed to add task', 'error')
      console.error('Error adding task:', error)
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
      showToast('Failed to update task', 'error')
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = (task) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.text}"?`,
      onConfirm: () => confirmDeleteTask(task._id),
      type: 'danger'
    })
  }

  const confirmDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId)
      setTasks(prev => prev.filter(task => task._id !== taskId))
      showToast('Task deleted successfully!')
    } catch (error) {
      showToast('Failed to delete task', 'error')
      console.error('Error deleting task:', error)
    }
    setConfirmModal({ ...confirmModal, isOpen: false })
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskAPI.toggleComplete(taskId)
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ))
      showToast(updatedTask.completed ? 'Task completed!' : 'Task uncompleted!')
    } catch (error) {
      showToast('Failed to update task', 'error')
      console.error('Error toggling task:', error)
    }
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const totalCategories = categories.length

  if (isLoading) {
    return (
      <div className="todo-app">
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '1.2rem',
          color: '#64748b'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="todo-app">
      <Header />
      
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
            <h2>🎯 Your Progress</h2>
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
            <h2>📝 Your Tasks</h2>
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
  )
}

export default App