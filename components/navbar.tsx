"use client"

import { Menu, Bell, Settings } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-surface text-text-primary">
        <Menu size={24} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary">
          <Settings size={20} />
        </button>
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <span className="text-sm font-bold text-white">JD</span>
        </div>
      </div>
    </nav>
  )
}
