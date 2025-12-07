"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAssetById, getAllEmployees } from "@/lib/api"

export default function AssetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = useState(null)
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const assetId = params?.id
    
    if (!assetId || assetId === "undefined") {
      setError("Invalid asset ID.")
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
        
        const [assetRes, employeesRes] = await Promise.allSettled([
          getAssetById(assetId),
          getAllEmployees(),
        ])

        if (assetRes.status === "fulfilled") {
          setAsset(assetRes.value.data)
        } else {
          setError(
            assetRes.reason?.response?.data?.message ||
            assetRes.reason?.message ||
            "You are not authorized to view this asset or it does not exist."
          )
        }

        if (employeesRes.status === "fulfilled") {
          setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load asset:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this asset or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

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
    
    if (statusLower.includes("assigned") || statusLower.includes("active")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("returned") || statusLower.includes("completed")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("lost") || statusLower.includes("damaged")) {
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
            <h1 className="text-2xl font-bold text-cyan-400">Asset Details</h1>
            <p className="text-gray-300 text-sm">
              View asset information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Asset Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this asset as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading asset...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !asset ? (
              <p className="text-sm text-gray-400">Asset not found.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Asset ID</p>
                    <p className="text-base text-white font-medium">
                      {asset.id || asset.assetID || asset.assetId || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Serial Number</p>
                    <p className="text-base text-white">
                      {asset.serialNumber || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Asset Name</p>
                    <p className="text-base text-white font-semibold">
                      {asset.assetName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Assigned To</p>
                    <p className="text-base text-white">
                      {asset.assignedTo || asset.assignedToId
                        ? getEmployeeName(asset.assignedTo || asset.assignedToId)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(asset.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Assigned Date</p>
                    <p className="text-base text-white">
                      {formatDate(asset.assignedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Return Date</p>
                    <p className="text-base text-white">
                      {formatDate(asset.returnDate)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(asset).map(([key, value]) => (
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
