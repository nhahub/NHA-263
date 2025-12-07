"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiEye, FiCalendar } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  getAllLeaveLogs,
  getLeaveLogByEmployeeId,
  getAllEmployees,
} from "@/lib/api"

export default function LeaveLogsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [userId, setUserId] = useState("")
  const [logs, setLogs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("") // For Admin/HR to view logs by employee

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const currentUserId = localStorage.getItem("userId")
      setRole(userRole || "")
      setUserId(currentUserId || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      fetchData()
    }
  }, [router])

  useEffect(() => {
    if (selectedEmployeeId && (role === "admin" || role === "HR")) {
      fetchData()
    }
  }, [selectedEmployeeId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const isEmployee = role === "Employee"
      const employeeIdToFetch = isEmployee ? parseInt(userId) : (selectedEmployeeId ? parseInt(selectedEmployeeId) : null)
      
      const [logsRes, employeesRes] = await Promise.allSettled([
        isEmployee || employeeIdToFetch
          ? (employeeIdToFetch ? getLeaveLogByEmployeeId(employeeIdToFetch) : getLeaveLogByEmployeeId(parseInt(userId)))
          : getAllLeaveLogs(),
        getAllEmployees(),
      ])

      if (logsRes.status === "fulfilled") {
        setLogs(Array.isArray(logsRes.value.data) ? logsRes.value.data : [])
      } else {
        console.error("Failed to fetch leave logs:", logsRes.reason)
        setError("Failed to load leave logs. Please try again.")
      }

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        
        // Auto-select current employee if user is Employee role
        if (isEmployee && userId) {
          setSelectedEmployeeId(userId)
        }
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeName = (employeeID) => {
    const employee = employees.find(
      (emp) => emp.id === employeeID || emp.employeeId === employeeID
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || employee.email || `Employee #${employeeID}`
    }
    return `Employee #${employeeID}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const canView = role === "admin" || role === "HR" || role === "Employee"
  const canManage = role === "admin" || role === "HR"
  const isEmployee = role === "Employee"

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-red-400">You don't have permission to view this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-1 flex items-center gap-2">
              <FiCalendar className="w-6 h-6" />
              Leave Logs
            </h1>
            <p className="text-sm text-gray-400">
              {isEmployee
                ? "View your leave history."
                : "View leave history. Admin and HR can view all logs or filter by employee."}
            </p>
          </div>
        </div>

        {error && (
          <Card className="border-red-700 bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Employee Selector for Admin/HR */}
        {!isEmployee && canManage && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">View Logs by Employee</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Select an employee to view their leave history, or leave empty to view all logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => {
                    const empId = emp.id || emp.employeeId
                    const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || emp.email || `Employee #${empId}`
                    return (
                      <option key={empId} value={empId}>
                        {empName}
                      </option>
                    )
                  })}
                </select>
                <Button
                  type="button"
                  onClick={() => {
                    if (!selectedEmployeeId) {
                      fetchData() // Fetch all logs
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Leave History</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              View leave history and logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading leave logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">
                  {isEmployee
                    ? "No leave history found for your account."
                    : selectedEmployeeId
                    ? "No leave history found for this employee."
                    : "No leave logs found."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      {canManage && (
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                      )}
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {logs.map((log, index) => {
                      const logId = log.id || log.logID || log.leaveLogId
                      return (
                        <tr
                          key={logId || `log-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {logId || "-"}
                          </td>
                          {canManage && (
                            <td className="py-2 px-4 text-gray-300">
                              {log.employeeId || log.employeeID
                                ? getEmployeeName(log.employeeId || log.employeeID)
                                : "-"}
                            </td>
                          )}
                          <td className="py-2 px-4 text-gray-300">
                            {formatDate(log.date || log.logDate || log.createdDate)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {logId ? (
                                <Link
                                  href={`/dashboard/leave-logs/${logId}`}
                                  className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                  title="View all log details"
                                >
                                  <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                  View
                                </Link>
                              ) : (
                                <span className="text-gray-500 text-xs">No ID</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

