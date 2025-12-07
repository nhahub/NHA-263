"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSelfServiceRequestById } from "@/lib/api"

export default function SelfServiceRequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState(null)
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

    const fetchRequest = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getSelfServiceRequestById(requestId)
        setRequest(data)
        console.log("Request data:", data)
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

    fetchRequest()
  }, [params?.id, router])

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
            <h1 className="text-2xl font-bold text-cyan-400">Self Service Request Details</h1>
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
                      {request.requestID || request.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        request.status
                      )}`}
                    >
                      {request.status || "-"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Employee ID</p>
                    <p className="text-base text-white">
                      {request.employeeID || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Request Type</p>
                    <p className="text-base text-white">
                      {request.requestType || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Request Date</p>
                    <p className="text-base text-white">
                      {request.requestDate
                        ? new Date(request.requestDate).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Approved By</p>
                    <p className="text-base text-white">
                      {request.approvedBy || request.approvedBy === 0 ? request.approvedBy : "-"}
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

