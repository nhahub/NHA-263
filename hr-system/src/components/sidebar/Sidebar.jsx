"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FiHome,
  FiBriefcase,
  FiMap,
  FiUsers,
  FiUser,
  FiFolder,
  FiLayers,
  FiBook,
  FiCalendar,
  FiDollarSign,
  FiGift,
  FiPackage,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [role, setRole] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const userName = localStorage.getItem("username")
      setRole(userRole || "")
      setUsername(userName || "")
    }
  }, [])

  const isAdmin = role === "admin"
  const isHR = role === "HR"
  const isEmployee = role === "Employee"

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: FiHome,
      available: isAdmin || isHR,
    },
    {
      title: "Company Profiles",
      href: "/dashboard/company-profiles",
      icon: FiBriefcase,
      available: isAdmin || isHR,
    },
    {
      title: "Company Branches",
      href: "/dashboard/branches",
      icon: FiMap,
      available: isAdmin || isHR,
    },
    {
      title: "Employees",
      href: "/dashboard/employees",
      icon: FiUsers,
      available: isAdmin || isHR,
    },
    {
      title: "Departments",
      href: "/dashboard/departments",
      icon: FiFolder,
      available: isAdmin || isHR,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: FiLayers,
      available: isAdmin || isHR || isEmployee,
    },
    {
      title: "Training",
      href: "/dashboard/trainings",
      icon: FiBook,
      available: isAdmin || isHR,
    },
    {
      title: "Benefit Types",
      href: "/dashboard/benefit-types",
      icon: FiPackage,
      available: isAdmin || isHR,
    },
    {
      title: "Benefits & Compensation",
      href: "/dashboard/benefits-compensation",
      icon: FiGift,
      available: isAdmin || isHR,
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: FiUser,
      available: isAdmin || isHR,
    },
    {
      title: "Attendance",
      href: "/dashboard/attendance",
      icon: FiCalendar,
      available: isAdmin || isHR,
    },
    {
      title: "Payroll",
      href: "/dashboard/payroll",
      icon: FiDollarSign,
      available: isAdmin || isHR,
    },
  ]

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const filteredMenuItems = menuItems.filter((item) => item.available)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 via-purple-900 to-blue-900 text-white transform transition-transform duration-300 ease-in-out z-40 shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              HR System
            </h2>
            {username && (
              <p className="text-sm text-blue-200 mt-1">
                {username} ({role})
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

