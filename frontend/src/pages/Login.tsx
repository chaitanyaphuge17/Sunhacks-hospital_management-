import { useState } from "react"
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginCredentials {
  email: string
  password: string
}

// Mock admin credentials
const MOCK_ADMINS: { [key: string]: string } = {
  "admin@hospital.com": "Admin@123",
  "admin": "Admin@123",
  "dr.sharma@hospital.com": "SecurePass@456",
  "support@hospital.com": "Support@789",
}

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Validate credentials
    if (!email.trim() || !password.trim()) {
      setError("Email/ID and password are required")
      setLoading(false)
      return
    }

    // Check against mock admin credentials
    if (MOCK_ADMINS[email] === password) {
      // Store auth in localStorage
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("adminEmail", email)
      localStorage.setItem("loginTime", new Date().toISOString())

      // Redirect immediately
      window.location.href = "/"
      return
    } else {
      setError("Invalid email/ID or password")
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    alert("Password reset is disabled for demo. Use mock credentials below to login.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-cyan-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src="/medigraph-logo.svg" alt="MediGraph AI" className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">MediGraph AI</h1>
          <p className="text-cyan-200/60">Hospital Intelligence System</p>
        </div>

        {/* Login Card */}
        <div className="bg-cyan-950/40 backdrop-blur border border-cyan-600/30 rounded-lg p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email/ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-cyan-200">Email / Admin ID</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.com or admin"
                className="w-full px-4 py-2 rounded-lg bg-cyan-900/30 border border-cyan-600/30 text-white placeholder-cyan-300/40 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-cyan-200">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 rounded-lg bg-cyan-900/30 border border-cyan-600/30 text-white placeholder-cyan-300/40 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-200/60 hover:text-cyan-200 transition"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-cyan-950/40 text-cyan-200/60">Test Credentials</span>
            </div>
          </div>

          {/* Mock Credentials Display */}
          <div className="space-y-2 p-4 rounded-lg bg-cyan-900/20 border border-cyan-600/30">
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-cyan-300 font-semibold mb-1">Admin Account</p>
                <p className="text-cyan-200/60">Email: <span className="text-cyan-400 font-mono">admin@hospital.com</span> | Password: <span className="text-cyan-400 font-mono">Admin@123</span></p>
              </div>
              <div className="border-t border-cyan-600/20 pt-2">
                <p className="text-cyan-300 font-semibold mb-1">Quick Login</p>
                <p className="text-cyan-200/60">ID: <span className="text-cyan-400 font-mono">admin</span> | Password: <span className="text-cyan-400 font-mono">Admin@123</span></p>
              </div>
              <div className="border-t border-cyan-600/20 pt-2">
                <p className="text-cyan-300 font-semibold mb-1">Doctor Account</p>
                <p className="text-cyan-200/60">Email: <span className="text-cyan-400 font-mono">dr.sharma@hospital.com</span> | Password: <span className="text-cyan-400 font-mono">SecurePass@456</span></p>
              </div>
              <div className="border-t border-cyan-600/20 pt-2">
                <p className="text-cyan-300 font-semibold mb-1">Support Account</p>
                <p className="text-cyan-200/60">Email: <span className="text-cyan-400 font-mono">support@hospital.com</span> | Password: <span className="text-cyan-400 font-mono">Support@789</span></p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-cyan-600/30">
            <p className="text-xs text-cyan-200/60 text-center">
              This is a demo application. For security, never share your credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
