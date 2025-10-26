"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/") // Redirect to landing/login page
  }

  const menuItems = [
    // { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Rooms", href: "/dashboard/rooms" },
    { icon: Settings, label: "Settings", href: "/dashboard/profile" },
  ]

  return (
    <>
      <div
        className={`fixed md:relative w-64 h-screen bg-white border-r border-border flex flex-col z-30 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary" />
            <span className="text-lg font-bold text-text-primary">SyncHub</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface font-medium transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-20" onClick={() => setOpen(false)} />}
    </>
  )
}
