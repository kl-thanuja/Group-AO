"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get("token")
    const tokenFromStorage = localStorage.getItem("token")
    const token = tokenFromUrl || tokenFromStorage

    if (!token) {
      console.warn("No token found — redirecting to login.")
      window.location.href = "http://localhost:3000"
      return
    }

    if (tokenFromUrl) localStorage.setItem("token", tokenFromUrl)

    fetch("http://localhost:8000/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        } else {
          console.error("User fetch failed:", data)
          localStorage.removeItem("token")
          window.location.href = "http://localhost:3000"
        }
      })
      .catch((err) => {
        console.error("Error fetching user:", err)
        localStorage.removeItem("token")
        window.location.href = "http://localhost:3000"
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
