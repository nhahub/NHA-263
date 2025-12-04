"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [username, setUsername] = useState("")
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCompanies: 0,
    totalDepartments: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const userName = localStorage.getItem("username")
      setRole(userRole || "")
      setUsername(userName || "")

      if (!userRole) {
        router.push("/login")
      } else {
        // Fetch stats (mock data for now - replace with actual API calls)
        fetchDashboardStats()
      }
    }
  }, [router])

  const fetchDashboardStats = async () => {
    // TODO: Replace with actual API calls
    setStats({
      totalEmployees: 1544,
      totalCompanies: 2487,
      totalDepartments: 1544,
      attendanceRate: 87,
    })
  }

  const isAdmin = role === "admin"
  const isHR = role === "HR"
  const canView = isAdmin || isHR

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <p className="text-destructive font-medium">
              You don't have permission to access the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Chart data
  const lineChartData = [
    { name: "Jan", data01: 45, data02: 35, data03: 50 },
    { name: "Feb", data01: 52, data02: 40, data03: 55 },
    { name: "Mar", data01: 48, data02: 45, data03: 60 },
    { name: "Apr", data01: 55, data02: 50, data03: 65 },
    { name: "May", data01: 60, data02: 55, data03: 70 },
    { name: "Jun", data01: 65, data02: 60, data03: 68 },
  ]

  const barChartData = Array.from({ length: 30 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 100),
  }))

  const progressData = [
    { label: "Employee Growth", value: 64, color: "from-blue-500 to-cyan-500" },
    { label: "Department Efficiency", value: 75, color: "from-orange-500 to-blue-500" },
    { label: "Company Performance", value: 80, color: "from-blue-500 to-green-500" },
  ]

  const pieData = [
    { name: "Active", value: 40, color: "#ec4899" },
    { name: "Pending", value: 75, color: "#eab308" },
    { name: "On Leave", value: 20, color: "#3b82f6" },
    { name: "Training", value: 80, color: "#ef4444" },
    { name: "Remote", value: 60, color: "#a855f7" },
  ]

  const COLORS = ["#ec4899", "#eab308", "#3b82f6", "#ef4444", "#a855f7"]

  // Calendar data
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString("default", { month: "long" })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const highlightedDays = [6, 13, 20, 27]

  const CircularProgress = ({ value, size = 120, strokeWidth = 8, color = "blue" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    const colorClasses = {
      blue: "stroke-blue-500",
      green: "stroke-green-500",
      orange: "stroke-orange-500",
      purple: "stroke-purple-500",
      pink: "stroke-pink-500",
    }

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClasses[color]} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </div>
    )
  }

  const DataSummaryCard = ({ value, label, progress, colors }) => {
    const segments = 20
    const segmentAngle = 360 / segments
    const filledSegments = Math.floor((progress / 100) * segments)

    return (
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Circular progress with segments */}
                <svg width="128" height="128" className="transform -rotate-90">
                  {Array.from({ length: segments }).map((_, i) => {
                    const angle = i * segmentAngle
                    const isFilled = i < filledSegments
                    const colorIndex = Math.floor((i / segments) * colors.length)
                    const color = colors[colorIndex % colors.length]
                    const x1 = 64 + 50 * Math.cos((angle * Math.PI) / 180)
                    const y1 = 64 + 50 * Math.sin((angle * Math.PI) / 180)
                    const x2 = 64 + 50 * Math.cos(((angle + segmentAngle) * Math.PI) / 180)
                    const y2 = 64 + 50 * Math.sin(((angle + segmentAngle) * Math.PI) / 180)

                    return (
                      <line
                        key={i}
                        x1={64}
                        y1={64}
                        x2={isFilled ? x2 : x1}
                        y2={isFilled ? y2 : y1}
                        stroke={isFilled ? color : "#374151"}
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{value}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-300 uppercase mb-2">{label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Dashboard</h1>
            <p className="text-gray-300">
              Welcome back{username ? `, ${username}` : ""}! You're logged in as{" "}
              <span className="font-semibold text-purple-400">{role}</span>
            </p>
          </div>
        </div>

        {/* Top Row - Data Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DataSummaryCard
            value={stats.totalEmployees}
            label="Total Employees"
            progress={75}
            colors={["#3b82f6", "#10b981", "#eab308", "#f59e0b"]}
          />
          <DataSummaryCard
            value={stats.totalCompanies}
            label="Total Companies"
            progress={85}
            colors={["#f59e0b", "#eab308", "#10b981", "#3b82f6"]}
          />
          <DataSummaryCard
            value={stats.totalDepartments}
            label="Total Departments"
            progress={65}
            colors={["#10b981", "#3b82f6", "#8b5cf6", "#ec4899"]}
          />
        </div>

        {/* Second Row - Progress Cards and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Employee Performance</CardTitle>
              <CardDescription className="text-gray-400">Onsectetuer aldipiscing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  64%
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>
            </CardContent>
          </Card>

          {/* Progress Bars Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Department Metrics</CardTitle>
              <CardDescription className="text-gray-400">Onsectetuer adipiscing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {progressData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value}%</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Monthly Trends</CardTitle>
              <CardDescription className="text-gray-400">Performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={lineChartData}>
                  <defs>
                    <linearGradient id="colorData01" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorData03" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[10, 70]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="data01"
                    stroke="#ec4899"
                    fillOpacity={1}
                    fill="url(#colorData01)"
                  />
                  <Area
                    type="monotone"
                    dataKey="data02"
                    stroke="#a855f7"
                    fillOpacity={0}
                  />
                  <Area
                    type="monotone"
                    dataKey="data03"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorData03)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart Grid */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Daily Activity</CardTitle>
              <CardDescription className="text-gray-400">30-day overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" hide />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#ec4899",
                            "#f59e0b",
                            "#eab308",
                            "#10b981",
                            "#3b82f6",
                            "#8b5cf6",
                          ][index % 6]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Activities, Calendar, and Circular Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Activities</CardTitle>
              <CardDescription className="text-gray-400">Onsectetuer aldipiscing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-cyan-400 mb-2 uppercase">Recent</p>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-400 mb-2 uppercase">Updates</p>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{currentMonth}</CardTitle>
              <CardDescription className="text-gray-400">Calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <button className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="text-white font-semibold">{currentMonth}</span>
                  <button className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <div key={`day-${index}`} className="text-center text-xs text-gray-400 font-semibold">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {calendarDays.map((day) => (
                    <div
                      key={day}
                      className={`text-center text-sm py-1 rounded ${
                        highlightedDays.includes(day)
                          ? "bg-orange-500 text-white font-semibold"
                          : "text-gray-300 hover:bg-gray-700 cursor-pointer"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Circular Progress Indicators */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Status Overview</CardTitle>
              <CardDescription className="text-gray-400">Employee status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around items-center flex-wrap gap-4">
                {pieData.map((item, index) => (
                  <div key={index} className="text-center">
                    <CircularProgress
                      value={item.value}
                      size={80}
                      strokeWidth={6}
                      color={["pink", "orange", "blue", "red", "purple"][index]}
                    />
                    <p className="text-xs text-gray-300 mt-2">{item.name}</p>
                    <p className="text-xs font-semibold text-white">{item.value}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
