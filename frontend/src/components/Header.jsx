import { useAuth } from '../contexts/AuthContext'
import '../styles/Header.css'

function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="header">
            <div className="header-content">
                <h1 className="header-title">To-Do Lists</h1>
                {user && (
                    <div className="header-user">
                        <span className="user-greeting">Hello, {user.username}!</span>
                        <button onClick={logout} className="logout-button">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header