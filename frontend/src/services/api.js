const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'

// Simple logger for development
const logger = {
  error: (message, error) => {
    if (import.meta.env.DEV) {
      console.error(`❌ ${message}`, error)
    }
  },
  info: (message, data) => {
    if (import.meta.env.DEV) {
      console.log(`ℹ️  ${message}`, data)
    }
  }
}

// Generic API call function with auth
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    logger.error(`API Error for ${endpoint}:`, error.message)
    throw error
  }
}

// Category API functions
export const categoryAPI = {
  getAll: () => apiCall('/categories'),
  
  create: (name) => apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  
  delete: (name) => apiCall(`/categories/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  }),
}

// Task API functions  
export const taskAPI = {
  getAll: (category) => {
    const params = category ? `?category=${encodeURIComponent(category)}` : ''
    return apiCall(`/tasks${params}`)
  },
  
  create: (taskData) => apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  
  update: (id, taskData) => apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),
  
  toggleComplete: (id) => apiCall(`/tasks/${id}/toggle`, {
    method: 'PATCH',
  }),
  
  delete: (id) => apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  }),
}