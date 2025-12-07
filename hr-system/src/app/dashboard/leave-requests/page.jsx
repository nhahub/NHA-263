"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiPlus, FiCheck, FiX, FiCalendar } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getAllEmployees,
  getAllLeaveTypes,
} from "@/lib/api"

export default function LeaveRequestsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [userId, setUserId] = useState("")
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const currentUserId = localStorage.getItem("userId")
      const employeeId = localStorage.getItem("employeeId") // Get employee ID
      setRole(userRole || "")
      setUserId(currentUserId || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Auto-fill employee ID for employees
      if (userRole === "Employee" && employeeId) {
        setFormData((prev) => ({
          ...prev,
          employeeId: employeeId,
        }))
      }

      // Call fetchData with the role directly to avoid state timing issues
      fetchDataWithRole(userRole)
    }
  }, [router])
  
  const fetchDataWithRole = async (userRole) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      
      const isEmployee = userRole === "Employee"
      const canViewAll = userRole === "admin" || userRole === "HR"
      
      // Fetch leave requests (only for Admin/HR)
      if (canViewAll) {
        try {
          const requestsRes = await getAllLeaveRequests()
          console.log("Leave Requests API Response:", requestsRes)
          console.log("Leave Requests API Response Data:", requestsRes.data)
          
          // Handle different response structures
          let requestsData = []
          if (Array.isArray(requestsRes.data)) {
            requestsData = requestsRes.data
          } else if (Array.isArray(requestsRes)) {
            requestsData = requestsRes
          } else if (requestsRes?.data && Array.isArray(requestsRes.data)) {
            requestsData = requestsRes.data
          } else if (requestsRes?.result && Array.isArray(requestsRes.result)) {
            requestsData = requestsRes.result
          }
          
          console.log("Extracted Leave Requests Data:", requestsData)
          console.log("Number of requests found:", requestsData.length)
          setRequests(requestsData)
        } catch (err) {
          console.error("Failed to fetch leave requests:", err)
          console.error("Error details:", {
            code: err.code,
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
          })
          
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
          } else if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.")
            router.push("/login")
          } else if (err.response?.status === 403) {
            setError("You don't have permission to view leave requests.")
          } else if (err.response?.status === 404) {
            // 404 might mean no requests exist yet, which is okay
            console.log("No leave requests found (404) - this is normal if no requests exist")
            setRequests([])
            return // Don't set error for 404
          } else {
            const errorMsg = err.response?.data?.message || 
                            err.response?.data?.detail ||
                            err.message || 
                            "Failed to load leave requests. Please try again."
            setError(errorMsg)
          }
          setRequests([])
        }
      } else {
        // Employees can't view all requests, only create them
        setRequests([])
      }
      
      // Fetch employees and leave types
      const [employeesRes, typesRes] = await Promise.allSettled([
        getAllEmployees(),
        getAllLeaveTypes(),
      ])
      
      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        
        // Auto-select current employee if user is Employee role
        const employeeId = typeof window !== "undefined" ? localStorage.getItem("employeeId") : null
        const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
        if (isEmployee) {
          // Prefer employeeId over userId for employees
          const idToUse = employeeId || currentUserId
          if (idToUse) {
            setFormData((prev) => ({
              ...prev,
              employeeId: idToUse,
            }))
          }
        }
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
      }

      if (typesRes.status === "fulfilled") {
        // Handle different response structures
        let typesData = []
        const response = typesRes.value
        
        if (Array.isArray(response.data)) {
          typesData = response.data
        } else if (Array.isArray(response)) {
          typesData = response
        } else if (response?.data && Array.isArray(response.data)) {
          typesData = response.data
        } else if (response?.result && Array.isArray(response.result)) {
          typesData = response.result
        }
        
        console.log("Leave Types API Response:", response)
        console.log("Extracted Leave Types Data:", typesData)
        console.log("Number of leave types found:", typesData.length)
        
        setLeaveTypes(typesData)
        
        // Show warning if no leave types found
        if (typesData.length === 0) {
          console.warn("No leave types found. The dropdown will be empty.")
        }
      } else {
        const error = typesRes.reason
        console.error("Failed to fetch leave types:", error)
        console.error("Error details:", {
          code: error?.code,
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data
        })
        
        // Check if it's a permission error
        if (error?.response?.status === 403) {
          console.error("Permission denied: Employees may not have access to view leave types.")
          setError("You don't have permission to view leave types. Please contact your administrator.")
        } else if (error?.response?.status === 401) {
          setError("Your session has expired. Please log in again.")
          router.push("/login")
        } else if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
          console.error("Network error when fetching leave types")
        }
        
        setLeaveTypes([])
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

  const resetForm = () => {
    // Get employee ID from localStorage for employees
    const employeeId = typeof window !== "undefined" && role === "Employee" 
      ? (localStorage.getItem("employeeId") || userId)
      : ""
    
    setFormData({
      employeeId: employeeId,
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate required fields
    // For employees, get employeeId from localStorage if not in formData
    const employeeIdToUse = formData.employeeId || (isEmployee ? localStorage.getItem("employeeId") : null)
    
    if (!employeeIdToUse || isNaN(parseInt(employeeIdToUse))) {
      setError("Employee ID is required. Please ensure you are logged in correctly.")
      return
    }

    if (!formData.leaveTypeId || isNaN(parseInt(formData.leaveTypeId))) {
      setError("Leave type must be selected.")
      return
    }

    if (!formData.startDate) {
      setError("Start date is required.")
      return
    }

    if (!formData.endDate) {
      setError("End date is required.")
      return
    }

    // Validate end date is after start date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date must be after start date.")
      return
    }

    try {
      // For employees, ensure we use the correct employee ID
      const employeeIdToUse = formData.employeeId || (isEmployee ? localStorage.getItem("employeeId") : null)
      
      if (!employeeIdToUse) {
        setError("Employee ID is required. Please ensure you are logged in correctly.")
        return
      }
      
      const requestData = {
        employeeId: parseInt(employeeIdToUse),
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        reason: formData.reason?.trim() || "",
      }

      await createLeaveRequest(requestData)
      setSuccess("Leave request created successfully.")
      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to create leave request:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to create leave request. Please check the data and try again."
      
      if (err.response?.data) {
        const errorData = err.response.data
        
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.title) {
          errorMessage = errorData.title
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          errorMessage = validationErrors || errorMessage
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    }
  }

  const handleApprove = async (requestId) => {
    if (!confirm("Are you sure you want to approve this leave request?")) return

    try {
      setError("")
      setSuccess("")
      await approveLeaveRequest(requestId)
      setSuccess("Leave request approved successfully.")
      await fetchData()
    } catch (err) {
      console.error("Failed to approve request:", err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to approve leave request. Please try again."
      )
    }
  }

  const handleReject = async (requestId) => {
    if (!confirm("Are you sure you want to reject this leave request?")) return

    try {
      setError("")
      setSuccess("")
      await rejectLeaveRequest(requestId)
      setSuccess("Leave request rejected successfully.")
      await fetchData()
    } catch (err) {
      console.error("Failed to reject request:", err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to reject leave request. Please try again."
      )
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

  const getLeaveTypeName = (leaveTypeID) => {
    const type = leaveTypes.find(
      (t) => t.leaveTypeId === leaveTypeID || t.id === leaveTypeID || t.leaveTypeID === leaveTypeID
    )
    if (type) {
      return type.name || `Leave Type #${leaveTypeID}`
    }
    return `Leave Type #${leaveTypeID}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("approved") || statusLower.includes("accept")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("rejected") || statusLower.includes("declined")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("pending") || statusLower.includes("waiting")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
          {status}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
          {status}
        </span>
      )
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

  const canView = role === "admin" || role === "HR" || role === "Employee"
  const canManage = role === "admin" || role === "HR"
  const isAdmin = role === "admin"
  const isHR = role === "HR"
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
              Leave Requests
            </h1>
            <p className="text-sm text-gray-400">
              {isEmployee
                ? "Create and view your leave requests."
                : "Manage employee leave requests. Admin and HR can approve or reject requests."}
            </p>
          </div>
          {/* New Request button - Available to all roles (Admin, HR, Employee) */}
          <Button
            type="button"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
          >
            <FiPlus className="w-4 h-4" />
            New Request
          </Button>
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

        {/* Requests List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Requests List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all request details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">
                  {isEmployee
                    ? "No leave requests found. Create a new request to get started."
                    : "No leave requests found. Create a new request or wait for employees to submit requests."}
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
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Leave Type</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Start Date</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {requests.map((request, index) => {
                      // Try multiple possible property names for the request ID
                      // Don't use index as fallback - we need the actual ID
                      const requestId = request.id || 
                                       request.requestID || 
                                       request.leaveRequestId || 
                                       request.leaveRequestID ||
                                       request.requestId ||
                                       request.request_id ||
                                       request.leaveRequest_id ||
                                       null // Don't use index - we need real ID
                      
                      const status = request.status || ""
                      const statusLower = status.toLowerCase()
                      const isPending = statusLower.includes("pending") || 
                                       statusLower.includes("waiting") || 
                                       statusLower === "" || 
                                       !status
                      
                      // Debug: Log the full request object to see what properties it has
                      if (index === 0) {
                        console.log("Sample request object:", request)
                        console.log("Available properties:", Object.keys(request))
                        console.log("Request ID found:", requestId)
                      }
                      
                      return (
                        <tr
                          key={requestId || `request-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {requestId || "-"}
                          </td>
                          {canManage && (
                            <td className="py-2 px-4 text-gray-300">
                              {request.employeeId || request.employeeID
                                ? getEmployeeName(request.employeeId || request.employeeID)
                                : "-"}
                            </td>
                          )}
                          <td className="py-2 px-4 text-gray-300">
                            {request.leaveTypeId || request.leaveTypeID
                              ? getLeaveTypeName(request.leaveTypeId || request.leaveTypeID)
                              : "-"}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {formatDate(request.startDate)}
                          </td>
                          <td className="py-2 px-4">
                            {getStatusBadge(status)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {/* Action buttons: Admin and HR can approve/reject pending requests */}
                              {(isAdmin || isHR) && isPending && requestId && (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApprove(requestId)}
                                    title="Approve this leave request"
                                  >
                                    <FiCheck className="w-3.5 h-3.5 mr-1.5" />
                                    Approve
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => handleReject(requestId)}
                                    title="Reject this leave request"
                                  >
                                    <FiX className="w-3.5 h-3.5 mr-1.5" />
                                    Reject
                                  </Button>
                                </>
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

        {/* Create Form */}
        {isFormOpen && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">New Leave Request</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Create a new leave request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="employeeId" className="text-gray-300">
                      Employee <span className="text-red-400">*</span>
                    </Label>
                    {isEmployee ? (
                      // Employees: Show their own name as read-only
                      <div>
                        <Input
                          id="employeeIdDisplay"
                          type="text"
                          value={(() => {
                            const empId = formData.employeeId || localStorage.getItem("employeeId")
                            if (empId && employees.length > 0) {
                              const employee = employees.find(emp => 
                                String(emp.id || emp.employeeId) === String(empId)
                              )
                              if (employee) {
                                return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || employee.email || `Employee #${empId}`
                              }
                            }
                            return empId ? `Employee #${empId}` : ""
                          })()}
                          readOnly
                          className="bg-gray-700/50 border-gray-600 text-white cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">You can only create requests for yourself</p>
                      </div>
                    ) : (
                      // Admin/HR: Can select any employee
                      <>
                        <select
                          id="employeeId"
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        >
                          <option value="">Select an employee</option>
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
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="leaveTypeId" className="text-gray-300">
                      Leave Type <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="leaveTypeId"
                      name="leaveTypeId"
                      value={formData.leaveTypeId}
                      onChange={handleChange}
                      required
                      disabled={loading || leaveTypes.length === 0}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loading 
                          ? "Loading leave types..." 
                          : leaveTypes.length === 0 
                            ? "No leave types available" 
                            : "Select a leave type"}
                      </option>
                      {leaveTypes.length > 0 && leaveTypes.map((type) => {
                        const typeId = type.leaveTypeId || type.id || type.leaveTypeID
                        const typeName = type.name || `Leave Type #${typeId}`
                        return (
                          <option key={typeId} value={typeId}>
                            {typeName}
                          </option>
                        )
                      })}
                    </select>
                    {leaveTypes.length === 0 && !loading && (
                      <p className="text-xs text-yellow-400 mt-1">
                        No leave types available. Please contact your administrator to add leave types.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-gray-300">
                      Start Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-gray-300">
                      End Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="reason" className="text-gray-300">Reason</Label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter reason for leave request"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsFormOpen(false)
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

