"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPermissionTypeById } from "@/lib/api"

export default function PermissionTypeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [type, setType] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const typeId = params?.id
    
    // Validate ID exists and is not undefined
    if (!typeId || typeId === "undefined") {
      setError("Invalid permission type ID.")
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
        const { data } = await getPermissionTypeById(typeId)
        setType(data)
        console.log("Permission type data:", data)
      } catch (err) {
        console.error("Failed to load permission type:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this permission type or it does not exist."
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
            <h1 className="text-2xl font-bold text-cyan-400">Permission Type Details</h1>
            <p className="text-gray-300 text-sm">
              View permission type information including all associated rules. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Permission Type Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this permission type including rules as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading permission type...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !type ? (
              <p className="text-sm text-gray-400">Permission type not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Type ID</p>
                    <p className="text-base text-white font-medium">
                      {type.id || type.permissionTypeId || type.permission_type_id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Monthly Limit (Hours)</p>
                    <p className="text-base text-white">
                      {type.monthly_limit_in_hours ?? "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Permission Type Name</p>
                    <p className="text-base text-white font-semibold">
                      {type.permission_type_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Is Deductible</p>
                    <div className="flex items-center gap-2">
                      {type.is_deductible ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                          No
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rules Section (if present) */}
                {type.rules && (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-300 mb-3">Rules</p>
                    <div className="bg-gray-800/50 p-4 rounded-md">
                      {typeof type.rules === "object" ? (
                        <pre className="text-sm text-white whitespace-pre-wrap">
                          {JSON.stringify(type.rules, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-white">{String(type.rules)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* All Fields Display */}
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

