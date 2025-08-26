import { useState } from 'react'
import Login from './Login'
import Register from './Register'

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <>
      {isLogin ? (
        <Login switchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register switchToLogin={() => setIsLogin(true)} />
      )}
    </>
  )
}

export default AuthWrapper
