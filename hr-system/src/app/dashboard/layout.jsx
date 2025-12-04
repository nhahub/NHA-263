"use client"

import Sidebar from "@/components/sidebar/Sidebar"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

