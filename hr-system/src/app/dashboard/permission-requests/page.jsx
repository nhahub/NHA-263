"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiEye, FiCheck, FiX, FiClock } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  getAllPermissionRequests,
  getPermissionRequestById,
  approvePermissionRequest,
  rejectPermissionRequest,
  getAllEmployees,
} from "@/lib/api"

export default function PermissionRequestsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [userId, setUserId] = useState("")
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      
      const [requestsRes, employeesRes] = await Promise.allSettled([
        getAllPermissionRequests(),
        getAllEmployees(),
      ])
      console.log(requestsRes)
      console.log(employeesRes)
      if (requestsRes.status === "fulfilled") {
        let allRequests = Array.isArray(requestsRes.value.data) ? requestsRes.value.data : []
        
        // Admin and HR can see all requests
        // Note: Employees cannot access GET /PermissionRequest (admin/HR only)
        // They can only view individual requests via GET /PermissionRequest/{id}
        setRequests(allRequests)
      } else {
        console.error("Failed to fetch permission requests:", requestsRes.reason)
        const errorReason = requestsRes.reason
        if (role === "Employee") {
          // Employees can only view their own request using GET /PermissionRequest/{id}
          // They need to know their request ID - show message
          setError("To view your permission request, please use the request detail page with your request ID, or contact HR for assistance.")
          setRequests([])
        } else {
          setError(
            errorReason?.response?.data?.message ||
            errorReason?.response?.data?.detail ||
            errorReason?.message ||
            "Failed to load permission requests. Please try again."
          )
        }
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

  const handleApprove = async (permissionId) => {
    if (!confirm("Are you sure you want to approve this permission request?")) return

    try {
      setError("")
      setSuccess("")
      await approvePermissionRequest(permissionId)
      setSuccess("Permission request approved successfully.")
      await fetchData()
    } catch (err) {
      console.error("Failed to approve request:", err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to approve permission request. Please try again."
      )
    }
  }

  const handleReject = async (permissionId) => {
    if (!confirm("Are you sure you want to reject this permission request?")) return

    try {
      setError("")
      setSuccess("")
      await rejectPermissionRequest(permissionId)
      setSuccess("Permission request rejected successfully.")
      await fetchData()
    } catch (err) {
      console.error("Failed to reject request:", err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to reject permission request. Please try again."
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

  const canViewAll = role === "admin" || role === "HR"
  const canManage = role === "admin" || role === "HR"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-1 flex items-center gap-2">
              <FiClock className="w-6 h-6" />
              Permission Requests
            </h1>
            <p className="text-sm text-gray-400">
              {canViewAll
                ? "Manage employee permission and leave requests. Admin and HR can approve or reject requests."
                : "View your permission and leave requests."}
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
                <p className="text-sm text-gray-400">No permission requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      {canViewAll && (
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                      )}
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {requests.map((request, index) => {
                      const requestId = request.permissionID || request.id || request.permissionId
                      const status = request.status || ""
                      const isPending = status.toLowerCase().includes("pending") || status.toLowerCase().includes("waiting")
                      
                      return (
                        <tr
                          key={requestId || `request-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {requestId || "-"}
                          </td>
                          {canViewAll && (
                            <td className="py-2 px-4 text-gray-300">
                              {request.employeeID || request.employeeId
                                ? getEmployeeName(request.employeeID || request.employeeId)
                                : "-"}
                            </td>
                          )}
                          <td className="py-2 px-4">
                            {getStatusBadge(status)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {requestId ? (
                                <>
                                  <Link
                                    href={`/dashboard/permission-requests/${requestId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all request details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {canManage && isPending && (
                                    <>
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleApprove(requestId)}
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
                                      >
                                        <FiX className="w-3.5 h-3.5 mr-1.5" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </>
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

