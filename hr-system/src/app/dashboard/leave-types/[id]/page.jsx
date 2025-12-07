"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getLeaveTypeById } from "@/lib/api"

export default function LeaveTypeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [type, setType] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const typeId = params?.id
    
    if (!typeId || typeId === "undefined") {
      setError("Invalid leave type ID.")
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

    const fetchType = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getLeaveTypeById(typeId)
        setType(data)
      } catch (err) {
        console.error("Failed to load leave type:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this leave type or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchType()
  }, [params?.id, router])

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
            <h1 className="text-2xl font-bold text-cyan-400">Leave Type Details</h1>
            <p className="text-gray-300 text-sm">
              View leave type information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Leave Type Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this leave type as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading leave type...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !type ? (
              <p className="text-sm text-gray-400">Leave type not found.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Type ID</p>
                    <p className="text-base text-white font-medium">
                      {type.leaveTypeId || type.id || type.leaveTypeID || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Max Days Per Year</p>
                    <p className="text-base text-white">
                      {type.maxDaysPerYear ?? "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Name</p>
                    <p className="text-base text-white font-semibold">
                      {type.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Is Paid</p>
                    <p className="text-base text-white">
                      {type.isPaid ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Is Active</p>
                    <p className="text-base text-white">
                      {type.isActive ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Requires Medical Note</p>
                    <p className="text-base text-white">
                      {type.requiresMedicalNote ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Deduct From Balance</p>
                    <p className="text-base text-white">
                      {type.isDeductFromBalance ? "Yes" : "No"}
                    </p>
                  </div>
                  {type.description && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 uppercase mb-1">Description</p>
                      <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                        {type.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(type).map(([key, value]) => (
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

