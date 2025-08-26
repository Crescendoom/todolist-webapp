/* filepath: d:\PROJECTS\ESCAPING TUTORIAL HELL\todolist\frontend\src\App.jsx */
import { useAuth } from './contexts/AuthContext'
import AuthWrapper from './components/AuthWrapper'
import TodoApp from './components/TodoApp'
import Header from './components/Header'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    )
  }

  return (
    <div className={`app ${user ? 'with-main-header' : 'with-auth-header'}`}>
      {user ? (
        <>
          <Header variant="main" />
          <div className="main-content">
            <TodoApp />
          </div>
        </>
      ) : (
        <>
          <Header variant="auth" />
          <AuthWrapper />
        </>
      )}
    </div>
  )
}

export default App