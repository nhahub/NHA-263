"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiUsers } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllHRNeedRequests,
  createHRNeedRequest,
  updateHRNeedRequest,
  deleteHRNeedRequest,
  getAllHRDepartments,
} from "@/lib/api"

export default function HRNeedRequestsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [requests, setRequests] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [formData, setFormData] = useState({
    departmentId: "",
    title: "",
    quantity: "",
    description: "",
    status: "",
    createdDate: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view requests
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [requestsRes, departmentsRes] = await Promise.allSettled([
        getAllHRNeedRequests(),
        getAllHRDepartments(),
      ])

      if (requestsRes.status === "fulfilled") {
        setRequests(Array.isArray(requestsRes.value.data) ? requestsRes.value.data : [])
      } else {
        console.error("Failed to fetch requests:", requestsRes.reason)
        setError("Failed to load HR need requests. Please try again.")
      }

      if (departmentsRes.status === "fulfilled") {
        setDepartments(Array.isArray(departmentsRes.value.data) ? departmentsRes.value.data : [])
      } else {
        console.warn("Failed to fetch departments:", departmentsRes.reason)
        setDepartments([])
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
      departmentId: "",
      title: "",
      quantity: "",
      description: "",
      status: "",
      createdDate: "",
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
    if (!formData.departmentId) {
      setError("Department is required.")
      return
    }

    if (!formData.title || !formData.title.trim()) {
      setError("Title is required.")
      return
    }

    if (!formData.quantity || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) <= 0) {
      setError("Quantity must be a positive number.")
      return
    }

    if (!formData.status || !formData.status.trim()) {
      setError("Status is required.")
      return
    }

    if (!formData.createdDate) {
      setError("Created date is required.")
      return
    }

    try {
      const requestData = {
        departmentId: parseInt(formData.departmentId),
        title: formData.title.trim(),
        quantity: parseInt(formData.quantity),
        description: formData.description?.trim() || "",
        status: formData.status.trim(),
        createdDate: new Date(formData.createdDate).toISOString(),
      }

      if (selectedRequest) {
        // Update existing request
        const updateData = {
          hrNeedID: selectedRequest.hrNeedID || selectedRequest.id,
          ...requestData,
        }
        await updateHRNeedRequest(
          selectedRequest.hrNeedID || selectedRequest.id,
          updateData
        )
      } else {
        // Create new request
        await createHRNeedRequest(requestData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save request:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save HR need request. Please check the data and try again."
      
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
      departmentId: request.departmentId?.toString() || "",
      title: request.title || "",
      quantity: request.quantity?.toString() || "",
      description: request.description || "",
      status: request.status || "",
      createdDate: formatDateForInput(request.createdDate),
    })
  }

  const handleDelete = async (requestId) => {
    if (!confirm("Are you sure you want to delete this HR need request?")) return

    try {
      await deleteHRNeedRequest(requestId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete request:", err)
      setError("Failed to delete HR need request. Please try again.")
    }
  }

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (dept) => dept.id === departmentId || dept.departmentID === departmentId
    )
    if (department) {
      return department.departmentName || department.name || `Department #${departmentId}`
    }
    return `Department #${departmentId}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("pending") || statusLower.includes("open")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("approved") || statusLower.includes("active")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("rejected") || statusLower.includes("closed") || statusLower.includes("cancelled")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
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

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"
  const canManage = role === "admin" || role === "HR"

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
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 flex items-center gap-3">
              <FiUsers className="w-8 h-8" />
              HR Need Requests
            </h1>
            <p className="text-gray-300">
              Manage staffing requests and HR needs. Admin and HR can create, update, or delete requests.
            </p>
          </div>
          {canManage && (
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
          )}
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
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Title</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Department</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Quantity</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Created Date</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {requests.map((request, index) => (
                      <tr
                        key={request.hrNeedID || request.id || `request-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {request.hrNeedID || request.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {request.title || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {request.departmentId ? getDepartmentName(request.departmentId) : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {request.quantity || 0}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {request.createdDate
                            ? new Date(request.createdDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const requestId = request.hrNeedID || request.id
                              
                              if (!requestId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/hr-need-requests/${requestId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all request details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {canManage && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                        onClick={() => handleEdit(request)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                    </>
                                  )}
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
        {isFormOpen && canManage && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedRequest ? "Edit Request" : "New Request"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedRequest
                  ? "Update the selected request's information."
                  : "Create a new HR need request (staffing request)."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="departmentId" className="text-gray-300">
                      Department <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.id || dept.departmentID}
                          value={dept.id || dept.departmentID}
                        >
                          {dept.departmentName || dept.name || `Department #${dept.id || dept.departmentID}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-gray-300">
                      Title <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Software Developer Position"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="quantity" className="text-gray-300">
                      Quantity <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-gray-300">
                      Status <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Pending, Approved, Rejected"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="createdDate" className="text-gray-300">
                      Created Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="createdDate"
                      name="createdDate"
                      type="date"
                      value={formData.createdDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter request description"
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

