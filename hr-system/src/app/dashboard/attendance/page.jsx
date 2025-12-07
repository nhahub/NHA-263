"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiClock, FiCheckCircle, FiXCircle, FiEye } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getAttendanceById,
  getAllEmployees,
} from "@/lib/api"

export default function AttendancePage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Call fetchData with role directly to avoid state timing issues
      fetchDataWithRole(userRole)
    }
  }, [router])
  
  const fetchDataWithRole = async (userRole) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const isAdmin = userRole === "admin"
      const isHR = userRole === "HR"
      const canViewAll = isAdmin || isHR

      // Fetch attendance records (only for Admin/HR)
      if (canViewAll) {
        try {
          const attendanceRes = await getAllAttendance()
          console.log("Attendance API Response:", attendanceRes)

          // Handle different response structures
          let attendanceData = []
          if (Array.isArray(attendanceRes.data)) {
            attendanceData = attendanceRes.data
          } else if (Array.isArray(attendanceRes)) {
            attendanceData = attendanceRes
          } else if (attendanceRes?.data && Array.isArray(attendanceRes.data)) {
            attendanceData = attendanceRes.data
          } else if (attendanceRes?.result && Array.isArray(attendanceRes.result)) {
            attendanceData = attendanceRes.result
          }

          console.log("Extracted Attendance Data:", attendanceData)
          // Log first record to see structure
          if (attendanceData.length > 0) {
            console.log("Sample attendance record:", attendanceData[0])
            console.log("Sample record keys:", Object.keys(attendanceData[0]))
            console.log("Check-in value:", attendanceData[0].checkIn, attendanceData[0].checkInTime, attendanceData[0].checkInDate)
            console.log("Check-out value:", attendanceData[0].checkOut, attendanceData[0].checkOutTime, attendanceData[0].checkOutDate)
          }
          setAttendance(attendanceData)
        } catch (err) {
          console.error("Failed to fetch attendance:", err)
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
          } else if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.")
            router.push("/login")
          } else if (err.response?.status === 403) {
            setError("You don't have permission to view attendance records.")
          } else {
            const errorMsg = err.response?.data?.message ||
                            err.response?.data?.detail ||
                            err.message ||
                            "Failed to load attendance records. Please try again."
            setError(errorMsg)
          }
          setAttendance([])
        }
      } else {
        // Employees can't view all attendance, only check in/out
        setAttendance([])
      }

      // Fetch employees for Admin/HR to display names
      if (canViewAll) {
        try {
          const { data } = await getAllEmployees()
          setEmployees(Array.isArray(data) ? data : [])
        } catch (err) {
          console.warn("Failed to fetch employees:", err)
          setEmployees([])
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    // Get role from localStorage to avoid state timing issues
    const currentRole = typeof window !== "undefined" ? localStorage.getItem("role") : role
    if (currentRole) {
      await fetchDataWithRole(currentRole)
    } else {
      // Fallback to fetchDataWithRole with empty role if localStorage is not available
      await fetchDataWithRole(role)
    }
  }

  const handleCheckIn = async () => {
    try {
      setError("")
      setSuccess("")
      
      console.log("Attempting to check in...")
      const response = await checkIn()
      console.log("Check-in response:", response)
      
      setSuccess("Check-in recorded successfully!")
      // Refresh data if user is Admin/HR
      const currentRole = typeof window !== "undefined" ? localStorage.getItem("role") : role
      if (currentRole === "admin" || currentRole === "HR") {
        await fetchDataWithRole(currentRole)
      }
    } catch (err) {
      console.error("Failed to check in:", err)
      console.error("Error details:", {
        code: err.code,
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.")
        router.push("/login")
      } else if (err.response?.status === 403) {
        setError("You don't have permission to check in.")
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message ||
                        err.response?.data?.detail ||
                        "Invalid check-in request. You may have already checked in today."
        setError(errorMsg)
      } else {
        const errorMsg = err.response?.data?.message ||
                        err.response?.data?.detail ||
                        err.message ||
                        "Failed to record check-in. Please try again."
        setError(errorMsg)
      }
    }
  }

  const handleCheckOut = async () => {
    try {
      setError("")
      setSuccess("")
      
      console.log("Attempting to check out...")
      const response = await checkOut()
      console.log("Check-out response:", response)
      
      setSuccess("Check-out recorded successfully!")
      // Refresh data if user is Admin/HR
      const currentRole = typeof window !== "undefined" ? localStorage.getItem("role") : role
      if (currentRole === "admin" || currentRole === "HR") {
        await fetchDataWithRole(currentRole)
      }
    } catch (err) {
      console.error("Failed to check out:", err)
      console.error("Error details:", {
        code: err.code,
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.")
        router.push("/login")
      } else if (err.response?.status === 403) {
        setError("You don't have permission to check out.")
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message ||
                        err.response?.data?.detail ||
                        "Invalid check-out request. You may not have checked in today."
        setError(errorMsg)
      } else {
        const errorMsg = err.response?.data?.message ||
                        err.response?.data?.detail ||
                        err.message ||
                        "Failed to record check-out. Please try again."
        setError(errorMsg)
      }
    }
  }

  const handleViewDetails = async (recordId) => {
    try {
      setError("")
      const { data } = await getAttendanceById(recordId)
      setSelectedRecord(data)
      setIsDetailOpen(true)
    } catch (err) {
      console.error("Failed to fetch attendance details:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load attendance details."
      )
    }
  }

  const getEmployeeName = (employeeID) => {
    const employee = employees.find(
      (emp) => emp.id === employeeID || emp.employeeId === employeeID
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
             employee.name ||
             employee.email ||
             `Employee #${employeeID}`
    }
    return `Employee #${employeeID}`
  }

  const formatTime = (dateString) => {
    if (!dateString) return "-"
    try {
      // Handle different date formats
      let date
      if (typeof dateString === 'string') {
        // Try parsing as ISO string or other formats
        date = new Date(dateString)
      } else if (dateString instanceof Date) {
        date = dateString
      } else {
        return "-"
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString)
        return "-"
      }
      
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    } catch (err) {
      console.warn("Error formatting time:", dateString, err)
      return "-"
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
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

  const isAdmin = role === "admin"
  const isHR = role === "HR"
  const canViewAll = isAdmin || isHR

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-1 flex items-center gap-2">
              <FiClock className="w-6 h-6" />
              Attendance
            </h1>
            <p className="text-sm text-gray-400">
              {canViewAll
                ? "Manage and view employee attendance records. All users can check in and check out."
                : "Record your check-in and check-out times."}
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

        {success && (
          <Card className="border-green-700 bg-green-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-green-400">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Check-in/Check-out Buttons - Available to all authenticated users */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Record Attendance</CardTitle>
            <CardDescription className="text-gray-400">
              Click to record your check-in or check-out time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleCheckIn}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                size="lg"
              >
                <FiCheckCircle className="w-5 h-5 mr-2" />
                Check In
              </Button>
              <Button
                type="button"
                onClick={handleCheckOut}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                size="lg"
              >
                <FiXCircle className="w-5 h-5 mr-2" />
                Check Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records List - Only visible to Admin/HR */}
        {canViewAll && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Attendance Records</CardTitle>
              <CardDescription className="text-gray-400">
                View all employee attendance records. Click the eye icon to view details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-400">Loading attendance records...</p>
                </div>
              ) : attendance.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-400">No attendance records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50">
                        {attendance.length > 0 && Object.keys(attendance[0]).map((key) => {
                          const keyLower = key.toLowerCase()
                          const isEmployeeIdField = keyLower === "employeeid" || 
                                                   keyLower === "employee_id" ||
                                                   (keyLower.includes("employee") && keyLower.includes("id") && !keyLower.includes("name"))
                          const isEmployeeNameField = keyLower === "employeename" || 
                                                     keyLower === "employee_name" ||
                                                     (keyLower.includes("employee") && keyLower.includes("name"))
                          
                          let headerText = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
                          
                          // Set proper headers for employee fields
                          if (isEmployeeIdField) {
                            headerText = "Employee ID"
                          } else if (isEmployeeNameField) {
                            headerText = "Employee Name"
                          }
                          
                          return (
                            <th key={key} className="py-3 px-4 text-left text-sm font-semibold text-gray-300">
                              {headerText}
                            </th>
                          )
                        })}
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {attendance.map((record, index) => {
                        const recordId = record.id ||
                                        record.attendanceId ||
                                        record.attendanceID ||
                                        null

                        return (
                          <tr
                            key={recordId || `record-${index}`}
                            className="hover:bg-gray-800/50 transition-colors duration-150"
                          >
                            {Object.entries(record).map(([key, value]) => {
                              // Format the value based on its type
                              let displayValue = value
                              
                              const keyLower = key.toLowerCase()
                              const isEmployeeIdField = keyLower === "employeeid" || 
                                                       keyLower === "employee_id" ||
                                                       (keyLower.includes("employee") && keyLower.includes("id") && !keyLower.includes("name"))
                              const isEmployeeNameField = keyLower === "employeename" || 
                                                         keyLower === "employee_name" ||
                                                         (keyLower.includes("employee") && keyLower.includes("name"))
                              
                              // Handle employee ID field: show the actual numeric ID
                              if (isEmployeeIdField && value) {
                                // If the value is a name (string that's not a number), find the ID from employees list
                                if (typeof value === "string" && isNaN(value)) {
                                  // Value is a name, find the employee ID from employees list
                                  const employee = employees.find(emp => {
                                    const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || emp.email
                                    return empName === value || empName.toLowerCase() === value.toLowerCase()
                                  })
                                  displayValue = employee ? (employee.id || employee.employeeId || "-") : "-"
                                } else {
                                  // Value is already an ID (number), show it as-is
                                  displayValue = String(value)
                                }
                              } 
                              // Handle employee name field: show the name (use value from employeeId field if name field is empty)
                              else if (isEmployeeNameField) {
                                if (value && value !== "-" && String(value).trim() !== "") {
                                  displayValue = String(value)
                                } else {
                                  // If name field is empty, get name from employeeId field
                                  const employeeIdValue = record.employeeId || record.employeeID || record.employee_id
                                  if (employeeIdValue) {
                                    if (typeof employeeIdValue === "string" && isNaN(employeeIdValue)) {
                                      // employeeId contains the name directly
                                      displayValue = employeeIdValue
                                    } else {
                                      // employeeId is a number, resolve the name from employees list
                                      const employeeId = typeof employeeIdValue === "string" && !isNaN(employeeIdValue) ? parseInt(employeeIdValue) : employeeIdValue
                                      displayValue = getEmployeeName(employeeId)
                                    }
                                  } else {
                                    displayValue = "-"
                                  }
                                }
                              } 
                              else if (value === null || value === undefined) {
                                displayValue = "-"
                              } else if (typeof value === "object" && value !== null) {
                                displayValue = JSON.stringify(value)
                              } else if (typeof value === "boolean") {
                                displayValue = value ? "Yes" : "No"
                              } else if (typeof value === "string" && (keyLower.includes("date") || keyLower.includes("time"))) {
                                // Try to format as date/time
                                try {
                                  const date = new Date(value)
                                  if (!isNaN(date.getTime())) {
                                    if (keyLower.includes("time") && !keyLower.includes("date")) {
                                      displayValue = formatTime(value)
                                    } else if (keyLower.includes("date") && !keyLower.includes("time")) {
                                      displayValue = formatDate(value)
                                    } else {
                                      displayValue = formatDateTime(value)
                                    }
                                  } else {
                                    displayValue = String(value)
                                  }
                                } catch {
                                  displayValue = String(value)
                                }
                              } else {
                                displayValue = String(value)
                              }

                              return (
                                <td key={key} className="py-3 px-4 text-gray-300">
                                  {displayValue}
                                </td>
                              )
                            })}
                            <td className="py-3 px-4">
                              <div className="flex justify-end gap-2">
                                {recordId && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={() => handleViewDetails(recordId)}
                                    title="View attendance details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Button>
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
        )}

        {/* Detail Modal */}
        {isDetailOpen && selectedRecord && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Attendance Details</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDetailOpen(false)
                    setSelectedRecord(null)
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Attendance ID</p>
                    <p className="text-base text-white font-medium">
                      {selectedRecord.id || selectedRecord.attendanceId || selectedRecord.attendanceID || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Employee</p>
                    <p className="text-base text-white">
                      {selectedRecord.employeeId || selectedRecord.employeeID
                        ? getEmployeeName(selectedRecord.employeeId || selectedRecord.employeeID)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Date</p>
                    <p className="text-base text-white">
                      {formatDate(selectedRecord.date || selectedRecord.checkInDate || selectedRecord.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Check-In Time</p>
                    <p className="text-base text-white">
                      {formatTime(selectedRecord.checkIn || selectedRecord.checkInTime || selectedRecord.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Check-Out Time</p>
                    <p className="text-base text-white">
                      {selectedRecord.checkOut || selectedRecord.checkOutTime || selectedRecord.checkOutDate
                        ? formatTime(selectedRecord.checkOut || selectedRecord.checkOutTime || selectedRecord.checkOutDate)
                        : "Not checked out"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(selectedRecord).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-700 pb-3 last:border-0">
                        <p className="text-xs text-gray-400 uppercase mb-1">{key}</p>
                        <p className="text-base text-white break-words">
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value, null, 2)
                            : String(value ?? "-")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

