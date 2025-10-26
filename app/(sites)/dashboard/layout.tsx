"use client"

import type React from "react"
import Sidebar from "@/components/sidebar"
import { UserProvider, useUser } from "@/app/hooks/UserContext"
import { useState } from "react"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading user...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No user found. Redirecting...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-surface">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  )
}
