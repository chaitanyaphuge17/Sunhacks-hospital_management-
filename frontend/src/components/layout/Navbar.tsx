import { useState, useEffect } from "react"
import { Circle, Bell, Settings, User, Shield, X, LogOut, Moon, Sun, Volume2, Database, RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NavbarProps {
  title: string
}

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
}

export function Navbar({ title }: NavbarProps) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const adminEmail = localStorage.getItem('adminEmail') || 'Admin'
  const adminName = adminEmail.split('@')[0].toUpperCase()
  const [showAlerts, setShowAlerts] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showClearData, setShowClearData] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [savedMessage, setSavedMessage] = useState('')

  // Mock alerts data
  const [alerts] = useState<SystemAlert[]>([
    { id: '1', type: 'critical', title: 'ICU Bed Shortage', message: 'Only 2 beds remaining', timestamp: '2 min ago' },
    { id: '2', type: 'warning', title: 'High Risk Patient', message: 'Patient Veer requires urgent attention', timestamp: '5 min ago' },
    { id: '3', type: 'info', title: 'System Update', message: 'AI agents ran successfully', timestamp: '10 min ago' },
  ])

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [notifications, darkMode])

  const dismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id])
  }

  const handleSaveSettings = () => {
    setSavedMessage('Settings saved successfully!')
    setTimeout(() => {
      setSavedMessage('')
      setShowSettings(false)
    }, 1500)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("loginTime")
    localStorage.removeItem("notifications")
    localStorage.removeItem("darkMode")
    localStorage.removeItem("dismissedAlerts")
    window.location.href = '/login'
    setShowLogoutConfirm(false)
  }

  const handleClearData = () => {
    localStorage.removeItem('patients')
    localStorage.removeItem('reports')
    setSavedMessage('Database cleared! System reset.')
    setTimeout(() => {
      setSavedMessage('')
      setShowClearData(false)
    }, 1500)
  }

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id))
  const criticalCount = visibleAlerts.filter(a => a.type === 'critical').length

  const getAlertColor = (type: string) => {
    switch(type) {
      case 'critical': return 'bg-red-500/10 border-red-500/50 text-red-400'
      case 'warning': return 'bg-amber-500/10 border-amber-500/50 text-amber-400'
      default: return 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-cyan-600/30 bg-gradient-to-r from-slate-900 via-cyan-900/20 to-slate-900 px-8 backdrop-blur supports-[backdrop-filter]:bg-slate-900/95">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/medigraph-logo.svg" 
              alt="MediGraph AI" 
              className="h-12 w-12"
            />
            <div className="border-l border-cyan-500/30 pl-4">
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">MediGraph AI</h1>
              <p className="text-xs text-slate-400">Hospital Intelligence System</p>
            </div>
          </div>
          <div className="h-6 w-0.5 bg-cyan-600/30 hidden md:block" />
          <div className="flex items-center gap-2 hidden md:flex">
            <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
            <span className="text-sm text-slate-300">All Systems Online</span>
          </div>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-slate-300 font-medium hidden sm:inline">{currentTime}</span>
          <div className="flex items-center gap-3">
            {/* Alerts Button */}
            <Button 
              onClick={() => setShowAlerts(true)}
              size="sm" 
              className={`transition-all relative ${
                criticalCount > 0
                  ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/50"
                  : "text-slate-300 hover:bg-cyan-900/30"
              }`}
              variant="ghost"
            >
              <Bell className={`h-5 w-5 ${criticalCount > 0 ? 'fill-current animate-pulse' : ''}`} />
              {criticalCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                  {criticalCount}
                </span>
              )}
            </Button>

            {/* Settings Button */}
            <Button 
              onClick={() => setShowSettings(true)}
              size="sm" 
              className="text-slate-300 hover:bg-cyan-900/30 transition-all"
              variant="ghost"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Admin Button */}
            <Button 
              onClick={() => setShowAdmin(true)}
              size="sm" 
              className="text-slate-300 hover:bg-cyan-900/30 transition-all"
              variant="ghost"
            >
              <Shield className="h-5 w-5" />
            </Button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-900/30 transition cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{adminName.charAt(0)}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white">{adminName}</p>
                <p className="text-xs text-slate-400">{adminEmail}</p>
              </div>
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute top-16 right-8 bg-slate-800 border border-cyan-600/30 rounded-lg p-2 text-xs text-slate-300 whitespace-nowrap">
                Logged in as {adminEmail}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts Modal */}
      <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
        <DialogContent className="bg-cyan-950/40 border-cyan-600/30 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-400" />
              System Alerts & Notifications
            </DialogTitle>
            <DialogDescription className="text-cyan-200/60">
              {visibleAlerts.length} active alert{visibleAlerts.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {visibleAlerts.length === 0 ? (
              <p className="text-cyan-200/60 text-sm py-4">No active alerts. System is healthy.</p>
            ) : (
              visibleAlerts.map(alert => (
                <div key={alert.id} className={`rounded-lg border p-3 space-y-1 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs opacity-80">{alert.message}</p>
                      <p className="text-xs opacity-60 mt-1">{alert.timestamp}</p>
                    </div>
                    <button 
                      onClick={() => dismissAlert(alert.id)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-cyan-950/40 border-cyan-600/30 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-cyan-400" />
              System Settings
            </DialogTitle>
            <DialogDescription className="text-cyan-200/60">
              Manage your preferences and system settings
            </DialogDescription>
          </DialogHeader>
          {savedMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm">
              ✓ {savedMessage}
            </div>
          )}
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-900/30 border border-cyan-600/30">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5 text-cyan-300" /> : <Sun className="h-5 w-5 text-yellow-400" />}
                <div>
                  <p className="text-white font-medium text-sm">Dark Mode</p>
                  <p className="text-cyan-200/60 text-xs">Currently {darkMode ? 'enabled' : 'disabled'}</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-900/30 border border-cyan-600/30">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-white font-medium text-sm">Alert Notifications</p>
                  <p className="text-cyan-200/60 text-xs">Sound and browser {notifications ? 'enabled' : 'disabled'}</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-cyan-600/30 flex gap-2">
              <Button onClick={() => setShowSettings(false)} className="flex-1 bg-cyan-900/40 hover:bg-cyan-900/60 text-white border border-cyan-600/30">Cancel</Button>
              <Button onClick={handleSaveSettings} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Modal */}
      <Dialog open={showAdmin} onOpenChange={setShowAdmin}>
        <DialogContent className="bg-cyan-950/40 border-cyan-600/30 max-w-2xl backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Admin Panel
            </DialogTitle>
            <DialogDescription className="text-cyan-200/60">
              System administration and monitoring
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Admin Profile Info */}
            <div className="p-4 rounded-lg bg-cyan-900/30 border border-cyan-600/30">
              <p className="text-white font-semibold text-sm mb-2">Profile Information</p>
              <div className="text-xs text-cyan-200/60 space-y-1">
                <p>Admin Email: <span className="text-cyan-400">{adminEmail}</span></p>
                <p>Role: <span className="text-emerald-400">System Administrator</span></p>
                <p>Login Time: <span className="text-cyan-200/80">{new Date(localStorage.getItem('loginTime') || '').toLocaleString()}</span></p>
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-600/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-sm">System Status</p>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                  <Circle className="h-2 w-2 fill-current" /> Operational
                </span>
              </div>
              <div className="text-cyan-200/60 text-xs space-y-1">
                <p>• Backend: <span className="text-emerald-400">Running on port 8001</span></p>
                <p>• Database: <span className="text-emerald-400">Connected (MongoDB)</span></p>
                <p>• AI Agents: <span className="text-emerald-400">6/6 Active</span></p>
              </div>
            </div>

            {/* Database Stats */}
            <div className="p-4 rounded-lg bg-cyan-900/30 border border-cyan-600/30">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-cyan-400" />
                <p className="text-white font-semibold text-sm">Database Statistics</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-cyan-200/80">
                <div className="p-2 rounded bg-cyan-900/40 border border-cyan-600/20">
                  <p className="text-cyan-200/60">Collections:</p>
                  <p className="font-semibold text-cyan-400">7 active</p>
                </div>
                <div className="p-2 rounded bg-cyan-900/40 border border-cyan-600/20">
                  <p className="text-cyan-200/60">Patients:</p>
                  <p className="font-semibold text-cyan-400">5 records</p>
                </div>
                <div className="p-2 rounded bg-cyan-900/40 border border-cyan-600/20">
                  <p className="text-cyan-200/60">Alerts:</p>
                  <p className="font-semibold text-amber-400">3 pending</p>
                </div>
                <div className="p-2 rounded bg-cyan-900/40 border border-cyan-600/20">
                  <p className="text-cyan-200/60">Escalations:</p>
                  <p className="font-semibold text-emerald-400">0 pending</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-4 border-t border-cyan-600/30 space-y-2">
              <Button className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 text-white text-sm justify-start border border-cyan-600/30">
                <Settings className="h-4 w-4 mr-2" />
                System Configuration
              </Button>
              <Button className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 text-white text-sm justify-start border border-cyan-600/30">
                <Database className="h-4 w-4 mr-2" />
                Database Management
              </Button>
              <Button 
                onClick={() => setShowClearData(true)}
                className="w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-sm justify-start border border-amber-500/50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Database
              </Button>
              <Button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm justify-start border border-red-500/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="bg-cyan-950/40 border-cyan-600/30 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <p className="text-cyan-200/60">Are you sure you want to logout? You'll need to login again to access the system.</p>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-cyan-900/40 hover:bg-cyan-900/60 text-white border border-cyan-600/30">Cancel</Button>
            <Button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Logout</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearData} onOpenChange={setShowClearData}>
        <DialogContent className="bg-cyan-950/40 border-cyan-600/30 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Reset Database
            </DialogTitle>
          </DialogHeader>
          <p className="text-cyan-200/60">This action will clear all local data including patient records. This cannot be undone.</p>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setShowClearData(false)} className="flex-1 bg-cyan-900/40 hover:bg-cyan-900/60 text-white border border-cyan-600/30">Cancel</Button>
            <Button onClick={handleClearData} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Reset</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
