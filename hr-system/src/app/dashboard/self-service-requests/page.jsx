"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllSelfServiceRequests,
  getSelfServiceRequestById,
  createSelfServiceRequest,
  updateSelfServiceRequest,
  deleteSelfServiceRequest,
  getAllEmployees,
} from "@/lib/api"

export default function SelfServiceRequestsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [formData, setFormData] = useState({
    employeeID: "",
    requestType: "",
    requestDate: "",
    status: "",
    approvedBy: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      const isEmployee = userRole === "Employee"
      
      if (isEmployee) {
        // Employees can only view their own request using GET /SelfServiceRequest/{id}
        // They need to know their request ID - show message
        setRequests([])
        setLoading(false)
        setError("To view your self-service request, please use the request detail page with your request ID, or contact HR for assistance.")
      } else if (userRole === "admin" || userRole === "HR") {
        // Admin and HR can view all requests
        fetchData()
      } else {
        router.push("/dashboard")
        return
      }
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [requestsRes, employeesRes] = await Promise.allSettled([
        getAllSelfServiceRequests(),
        getAllEmployees(),
      ])

      if (requestsRes.status === "fulfilled") {
        setRequests(Array.isArray(requestsRes.value.data) ? requestsRes.value.data : [])
      } else {
        console.error("Failed to fetch requests:", requestsRes.reason)
        setError("Failed to load self-service requests. Please try again.")
      }

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
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

  const resetForm = () => {
    setFormData({
      employeeID: "",
      requestType: "",
      requestDate: "",
      status: "",
      approvedBy: "",
    })
    setSelectedRequest(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.employeeID) {
      setError("Employee ID is required.")
      return
    }

    if (!formData.requestType || !formData.requestType.trim()) {
      setError("Request type is required.")
      return
    }

    if (!formData.requestDate) {
      setError("Request date is required.")
      return
    }

    if (!formData.status || !formData.status.trim()) {
      setError("Status is required.")
      return
    }

    try {
      const requestData = {
        employeeID: parseInt(formData.employeeID),
        requestType: formData.requestType.trim(),
        requestDate: new Date(formData.requestDate).toISOString(),
        status: formData.status.trim(),
        approvedBy: formData.approvedBy ? parseInt(formData.approvedBy) : 0,
      }

      if (selectedRequest) {
        // Update existing request
        const updateData = {
          requestID: selectedRequest.requestID || selectedRequest.id,
          ...requestData,
        }
        await updateSelfServiceRequest(
          selectedRequest.requestID || selectedRequest.id,
          updateData
        )
      } else {
        // Create new request
        await createSelfServiceRequest(requestData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save request:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save request. Please check the data and try again."
      
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

  const handleEdit = (request) => {
    setSelectedRequest(request)
    setIsFormOpen(true)
    
    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      // Get local date in YYYY-MM-DD format
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    setFormData({
      employeeID: request.employeeID?.toString() || "",
      requestType: request.requestType || "",
      requestDate: formatDateForInput(request.requestDate),
      status: request.status || "",
      approvedBy: request.approvedBy?.toString() || "",
    })
  }

  const handleDelete = async (requestId) => {
    if (!confirm("Are you sure you want to delete this self-service request?")) return

    try {
      await deleteSelfServiceRequest(requestId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete request:", err)
      setError("Failed to delete request. Please try again.")
    }
  }

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (emp) => emp.id === employeeId || emp.employeeId === employeeId
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || 
             employee.name || 
             employee.email || 
             `Employee #${employeeId}`
    }
    return `Employee #${employeeId}`
  }

  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase() || ""
    switch (statusLower) {
      case "approved":
        return "bg-green-900/50 text-green-400 border border-green-700"
      case "pending":
        return "bg-yellow-900/50 text-yellow-400 border border-yellow-700"
      case "rejected":
      case "denied":
        return "bg-red-900/50 text-red-400 border border-red-700"
      default:
        return "bg-gray-700 text-gray-400 border border-gray-600"
    }
  }

  const isAdmin = role === "admin"
  const isHR = role === "HR"
  const isEmployee = role === "Employee"
  const canView = isAdmin || isHR || isEmployee
  const canManage = isAdmin || isHR // Employees can only view (GET), not manage

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Self Service Requests</h1>
            <p className="text-gray-300">
              Manage employee self-service requests. Admin and HR can create, update, or delete requests.
            </p>
          </div>
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

        {/* Requests List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Requests List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all request details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Employee</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Request Type</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Request Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {requests.map((req, index) => (
                      <tr
                        key={req.requestID || req.id || `request-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {req.requestID || req.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {req.employeeID ? getEmployeeName(req.employeeID) : "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">{req.requestType || "-"}</span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {req.requestDate
                            ? new Date(req.requestDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              req.status
                            )}`}
                          >
                            {req.status || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const requestId = req.requestID || req.id
                              
                              if (!requestId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/self-service-requests/${requestId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all request details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={() => handleEdit(req)}
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                    Edit
                                  </Button>
                                  {isAdmin && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="h-7 px-3 text-xs"
                                      onClick={() => handleDelete(requestId)}
                                    >
                                      <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                      Delete
                                    </Button>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Form */}
        {isFormOpen && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedRequest ? "Edit Request" : "New Request"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedRequest
                  ? "Update the selected request's information."
                  : "Create a new self-service request."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="employeeID" className="text-gray-300">
                      Employee <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="employeeID"
                      name="employeeID"
                      value={formData.employeeID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option
                          key={emp.id || emp.employeeId}
                          value={emp.id || emp.employeeId}
                        >
                          {`${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                            emp.name ||
                            emp.email ||
                            `Employee #${emp.id || emp.employeeId}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="requestType" className="text-gray-300">
                      Request Type <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="requestType"
                      name="requestType"
                      value={formData.requestType}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Leave Request, Document Request"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="requestDate" className="text-gray-300">
                      Request Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="requestDate"
                      name="requestDate"
                      type="date"
                      value={formData.requestDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-gray-300">
                      Status <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="approvedBy" className="text-gray-300">Approved By (User ID)</Label>
                    <Input
                      id="approvedBy"
                      name="approvedBy"
                      type="number"
                      value={formData.approvedBy}
                      onChange={handleChange}
                      min="0"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Enter user ID (0 if none)"
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
                    {selectedRequest ? "Update Request" : "Create Request"}
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

