"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getRecruitmentPortalById } from "@/lib/api"

export default function RecruitmentPortalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [portal, setPortal] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const portalId = params?.id
    
    // Validate ID exists and is not undefined
    if (!portalId || portalId === "undefined") {
      setError("Invalid portal ID.")
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

    const fetchPortal = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getRecruitmentPortalById(portalId)
        setPortal(data)
        console.log("Portal data:", data)
      } catch (err) {
        console.error("Failed to load portal:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this portal or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPortal()
  }, [params?.id, router])

  const getStatusBadge = (expiryDate) => {
    if (!expiryDate) return null
    
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)
    
    if (expiry < today) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
          Expired
        </span>
      )
    } else if (expiry.getTime() === today.getTime()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
          Expires Today
        </span>
      )
    } else {
      const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 7) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400 border border-orange-700">
            Expires Soon ({daysUntilExpiry} days)
          </span>
        )
      }
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          Active
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
            <h1 className="text-2xl font-bold text-cyan-400">Recruitment Portal Details</h1>
            <p className="text-gray-300 text-sm">
              View portal information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Portal Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this portal as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading portal...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !portal ? (
              <p className="text-sm text-gray-400">Portal not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Portal ID</p>
                    <p className="text-base text-white font-medium">
                      {portal.portalID || portal.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">HR Need ID</p>
                    <p className="text-base text-white">
                      {portal.hrNeedID || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Publish Date</p>
                    <p className="text-base text-white">
                      {portal.publishDate
                        ? new Date(portal.publishDate).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Expiry Date</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-white">
                        {portal.expiryDate
                          ? new Date(portal.expiryDate).toLocaleString()
                          : "-"}
                      </p>
                      {getStatusBadge(portal.expiryDate)}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Notes</p>
                    <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                      {portal.notes || "-"}
                    </p>
                  </div>
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(portal).map(([key, value]) => (
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

