import { useAuth } from './contexts/AuthContext'
import AuthWrapper from './components/AuthWrapper'
import TodoApp from './components/TodoApp'
import './App.css'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="todo-app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <TodoApp /> : <AuthWrapper />
}

export default App