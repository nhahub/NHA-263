"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPermissionRequestById, approvePermissionRequest, rejectPermissionRequest, getAllEmployees } from "@/lib/api"

export default function PermissionRequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState(null)
  const [employees, setEmployees] = useState([])
  const [role, setRole] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const requestId = params?.id
    
    // Validate ID exists and is not undefined
    if (!requestId || requestId === "undefined") {
      setError("Invalid request ID.")
      setLoading(false)
      return
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")
      
      if (!token) {
        router.push("/login")
        return
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        setSuccess("")
        
        const [requestRes, employeesRes] = await Promise.allSettled([
          getPermissionRequestById(requestId),
          getAllEmployees(),
        ])

        if (requestRes.status === "fulfilled") {
          setRequest(requestRes.value.data)
          console.log("Permission request data:", requestRes.value.data)
        } else {
          setError(
            requestRes.reason?.response?.data?.message ||
            requestRes.reason?.response?.data?.detail ||
            requestRes.reason?.message ||
            "You are not authorized to view this request or it does not exist."
          )
        }

        if (employeesRes.status === "fulfilled") {
          setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load request:", err)
        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "You are not authorized to view this request or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this permission request?")) return

    try {
      setError("")
      setSuccess("")
      const requestId = request?.permissionID || request?.id || request?.permissionId
      await approvePermissionRequest(requestId)
      setSuccess("Permission request approved successfully.")
      // Refresh the data
      const { data } = await getPermissionRequestById(requestId)
      setRequest(data)
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

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this permission request?")) return

    try {
      setError("")
      setSuccess("")
      const requestId = request?.permissionID || request?.id || request?.permissionId
      await rejectPermissionRequest(requestId)
      setSuccess("Permission request rejected successfully.")
      // Refresh the data
      const { data } = await getPermissionRequestById(requestId)
      setRequest(data)
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

  const canManage = role === "admin" || role === "HR"
  const status = request?.status || ""
  const isPending = status.toLowerCase().includes("pending") || status.toLowerCase().includes("waiting")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Permission Request Details</h1>
            <p className="text-gray-300 text-sm">
              View request information. Access rules are enforced on the server using your JWT.
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

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Request Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this permission request as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading request...</p>
            ) : !request ? (
              <p className="text-sm text-gray-400">Request not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Request ID</p>
                    <p className="text-base text-white font-medium">
                      {request.permissionID || request.id || request.permissionId || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Employee</p>
                    <p className="text-base text-white">
                      {request.employeeID || request.employeeId
                        ? getEmployeeName(request.employeeID || request.employeeId)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                  {request.requestDate && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase mb-1">Request Date</p>
                      <p className="text-base text-white">
                        {formatDate(request.requestDate)}
                      </p>
                    </div>
                  )}
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(request).map(([key, value]) => (
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

                {/* Approve/Reject Actions */}
                {canManage && isPending && (
                  <div className="border-t border-gray-700 pt-4 mt-4 flex gap-3">
                    <Button
                      type="button"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleApprove}
                    >
                      <FiCheck className="w-4 h-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      onClick={handleReject}
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

