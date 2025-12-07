"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getHRNeedRequestById, getAllHRDepartments } from "@/lib/api"

export default function HRNeedRequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState(null)
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState("")
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
      if (!token) {
        router.push("/login")
        return
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        
        const [requestRes, departmentsRes] = await Promise.allSettled([
          getHRNeedRequestById(requestId),
          getAllHRDepartments(),
        ])

        if (requestRes.status === "fulfilled") {
          setRequest(requestRes.value.data)
          console.log("Request data:", requestRes.value.data)
        } else {
          setError(
            requestRes.reason?.response?.data?.message ||
            requestRes.reason?.message ||
            "You are not authorized to view this request or it does not exist."
          )
        }

        if (departmentsRes.status === "fulfilled") {
          setDepartments(Array.isArray(departmentsRes.value.data) ? departmentsRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load request:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this request or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

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
            <h1 className="text-2xl font-bold text-cyan-400">HR Need Request Details</h1>
            <p className="text-gray-300 text-sm">
              View request information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Request Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this request as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading request...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !request ? (
              <p className="text-sm text-gray-400">Request not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Request ID</p>
                    <p className="text-base text-white font-medium">
                      {request.hrNeedID || request.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Created Date</p>
                    <p className="text-base text-white">
                      {request.createdDate
                        ? new Date(request.createdDate).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Title</p>
                    <p className="text-base text-white font-semibold">
                      {request.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Department</p>
                    <p className="text-base text-white">
                      {request.departmentId ? getDepartmentName(request.departmentId) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Quantity</p>
                    <p className="text-base text-white">
                      {request.quantity || 0}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Description</p>
                    <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                      {request.description || "-"}
                    </p>
                  </div>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

