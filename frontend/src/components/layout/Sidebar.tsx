import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Activity, History, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Analysis", href: "/analysis", icon: Activity },
  { name: "AI Analytics", href: "/analytics", icon: Zap },
  { name: "History", href: "/history", icon: History },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-cyan-600/30 bg-gradient-to-b from-black to-cyan-950">
      <div className="flex h-16 items-center border-b border-cyan-600/30 px-6 bg-gradient-to-r from-black to-cyan-950">
        <div className="flex items-center gap-3">
          <img src="/medigraph-logo.svg" alt="MediGraph AI" className="h-10 w-10" />
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent block leading-tight">MediGraph</span>
            <span className="text-xs text-cyan-200/60">Hospital System</span>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-2 p-4 mt-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                  : "text-cyan-200/60 hover:bg-cyan-900/30 hover:text-cyan-200"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-6 left-4 right-4 rounded-lg bg-cyan-900/20 border border-cyan-600/30 p-4">
        <p className="text-xs text-cyan-200/60 text-center">
          <span className="font-semibold text-cyan-200">v1.0.0</span>
          <br />
          Autonomous Hospital<br />Decision Intelligence
        </p>
      </div>
    </aside>
  )
}
