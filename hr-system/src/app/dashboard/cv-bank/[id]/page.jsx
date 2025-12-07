"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCVById } from "@/lib/api"

export default function CVDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [cv, setCv] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cvId = params?.id
    
    // Validate ID exists and is not undefined
    if (!cvId || cvId === "undefined") {
      setError("Invalid CV ID.")
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

    const fetchCV = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getCVById(cvId)
        setCv(data)
        console.log("CV data:", data)
      } catch (err) {
        console.error("Failed to load CV:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this CV or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCV()
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
            <h1 className="text-2xl font-bold text-cyan-400">CV Details</h1>
            <p className="text-gray-300 text-sm">
              View CV information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">CV Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this CV as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading CV...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !cv ? (
              <p className="text-sm text-gray-400">CV not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">CV ID</p>
                    <p className="text-base text-white font-medium">
                      {cv.cV_ID || cv.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Added Date</p>
                    <p className="text-base text-white">
                      {cv.addedDate
                        ? new Date(cv.addedDate).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Full Name</p>
                    <p className="text-base text-white font-semibold">
                      {cv.fullName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Email</p>
                    <p className="text-base text-white">
                      {cv.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Phone Number</p>
                    <p className="text-base text-white">
                      {cv.phoneNumber || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">CV File</p>
                    <p className="text-base text-white break-all">
                      {cv.cV_File || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Notes</p>
                    <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                      {cv.notes || "-"}
                    </p>
                  </div>
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(cv).map(([key, value]) => (
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

