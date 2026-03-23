import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser, getGoogleAuthUrl } from '../services/api'

type TabType = 'login' | 'register'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(loginData.email, loginData.password)

      if (data.access_token) {
        login(data.access_token, data.user_name, data.user_email)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const data = await registerUser(
        registerData.email,
        registerData.password,
        registerData.fullName
      )

      if (data.access_token) {
        login(data.access_token, data.user_name, data.user_email)
        navigate('/dashboard')
      } else {
        setError(data.detail || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const data = await getGoogleAuthUrl()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError('Failed to initiate Google login.')
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-[440px] flex flex-col items-center">

        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-high mb-6 border border-outline-variant shadow-xl relative">
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '2.5rem', color: '#ffb3ae' }}>
              description
            </span>
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1.2rem', color: '#43e1ba', position: 'absolute', top: '0', right: '0' }}>
              auto_awesome
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
            AI Resume Coach
          </h1>
          <p className="text-on-surface-variant font-medium text-sm">
            Your personal AI-powered career coach
          </p>
        </header>

        <div className="w-full bg-surface-container-low rounded-xl border border-outline-variant p-1 overflow-hidden">
          <nav className="flex p-1 gap-1 bg-surface-container-low">
            <button
              onClick={() => { setActiveTab('login'); setError('') }}
              className={`flex-1 py-3 text-sm font-bold tracking-tight rounded-lg transition-colors ${
                activeTab === 'login'
                  ? 'bg-surface-container-high text-primary border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-bright font-medium'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError('') }}
              className={`flex-1 py-3 text-sm font-bold tracking-tight rounded-lg transition-colors ${
                activeTab === 'register'
                  ? 'bg-surface-container-high text-primary border-b-2 border-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-bright font-medium'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </nav>

          <div className="p-8 space-y-6">
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant ml-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full bg-surface-container-highest rounded-lg py-3 px-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full bg-surface-container-highest rounded-lg py-3 px-4 pr-12 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1.2rem' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-[11px] font-bold text-primary">
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-bold py-3.5 rounded-lg transition-all"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant ml-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    className="w-full bg-surface-container-highest rounded-lg py-3 px-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border-none"
                    placeholder="Vaishali Bhardwaj"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant ml-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-surface-container-highest rounded-lg py-3 px-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full bg-surface-container-highest rounded-lg py-3 px-4 pr-12 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1.2rem' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant ml-1">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full bg-surface-container-highest rounded-lg py-3 px-4 pr-12 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1.2rem' }}>
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed font-bold py-3.5 rounded-lg transition-all"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-outline">
                Or continue with
              </span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-transparent border border-outline-variant hover:bg-surface-bright text-on-surface font-semibold py-3 rounded-lg flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{activeTab === 'login' ? 'Login' : 'Sign up'} with Google</span>
            </button>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-[11px] text-on-surface-variant font-medium">
            Powered by Claude AI and LangChain
          </p>
        </footer>
      </main>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  )
}