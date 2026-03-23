import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  userName: string | null
  userEmail: string | null
  isAuthenticated: boolean
  login: (token: string, userName: string, userEmail: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem('user_name')
  )
  const [userEmail, setUserEmail] = useState<string | null>(
    localStorage.getItem('user_email')
  )

  const login = (token: string, userName: string, userEmail: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user_name', userName)
    localStorage.setItem('user_email', userEmail)
    setToken(token)
    setUserName(userName)
    setUserEmail(userEmail)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_email')
    setToken(null)
    setUserName(null)
    setUserEmail(null)
  }

  return (
    <AuthContext.Provider value={{
      token,
      userName,
      userEmail,
      isAuthenticated: !!token,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}