"use client"

import { BarChart3, Users, Zap, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Here's your activity overview.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Users, label: "Active Users", value: "2,543", change: "+12%" },
          { icon: Zap, label: "Rooms Created", value: "156", change: "+8%" },
          { icon: TrendingUp, label: "Avg Duration", value: "24m", change: "+5%" },
          { icon: BarChart3, label: "Total Sessions", value: "8,234", change: "+23%" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl hover-lift">
            <div className="flex items-center justify-between mb-4">
              <stat.icon size={24} className="text-accent-secondary" />
              <span className="text-sm font-medium text-accent-secondary">{stat.change}</span>
            </div>
            <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-surface-light/50 rounded-lg hover:bg-surface-light/80"
            >
              <div>
                <p className="text-text-primary font-medium">Room Session #{i}</p>
                <p className="text-text-secondary text-sm">2 hours ago</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent-secondary/20 text-accent-secondary text-sm font-medium">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
