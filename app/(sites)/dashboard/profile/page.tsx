"use client"

import { Mail, Edit2 } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Profile</h1>

      <div className="max-w-2xl">
        {/* Avatar Section */}
        <div className="glass p-8 rounded-2xl mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">JD</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">John Doe</h2>
              <p className="text-text-secondary">Premium Member</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-lg font-bold text-text-primary mb-6">Account Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
              <p className="text-text-primary">John Doe</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <p className="text-text-primary">john@example.com</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Member Since</label>
              <p className="text-text-primary">January 15, 2025</p>
            </div>
          </div>
          <button className="mt-8 px-6 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 flex items-center gap-2">
            <Edit2 size={18} /> Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}
