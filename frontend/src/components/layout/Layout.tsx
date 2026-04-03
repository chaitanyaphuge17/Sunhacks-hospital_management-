import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <Sidebar />
      <main className="pl-72">
        <Outlet />
      </main>
    </div>
  )
}
