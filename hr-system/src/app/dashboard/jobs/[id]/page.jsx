"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getJobById, getAllHRDepartments } from "@/lib/api"

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const jobId = params?.id
    
    // Validate ID exists and is not undefined
    if (!jobId || jobId === "undefined") {
      setError("Invalid job ID.")
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
        
        const [jobRes, departmentsRes] = await Promise.allSettled([
          getJobById(jobId),
          getAllHRDepartments(),
        ])

        if (jobRes.status === "fulfilled") {
          setJob(jobRes.value.data)
          console.log("Job data:", jobRes.value.data)
        } else {
          setError(
            jobRes.reason?.response?.data?.message ||
            jobRes.reason?.message ||
            "You are not authorized to view this job or it does not exist."
          )
        }

        if (departmentsRes.status === "fulfilled") {
          setDepartments(Array.isArray(departmentsRes.value.data) ? departmentsRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load job:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this job or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

  const getDepartmentName = (departmentID) => {
    const dept = departments.find(
      (dept) => dept.id === departmentID || dept.departmentId === departmentID
    )
    if (dept) {
      return dept.nameEn || dept.name || `Department #${departmentID}`
    }
    return `Department #${departmentID}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("open") || statusLower.includes("active") || statusLower.includes("hiring")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("closed") || statusLower.includes("filled")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("pending") || statusLower.includes("draft")) {
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
            <h1 className="text-2xl font-bold text-cyan-400">Job Details</h1>
            <p className="text-gray-300 text-sm">
              View job information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Job Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this job as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading job...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !job ? (
              <p className="text-sm text-gray-400">Job not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Job ID</p>
                    <p className="text-base text-white font-medium">
                      {job.jobID || job.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Department</p>
                    <p className="text-base text-white">
                      {job.departmentID ? getDepartmentName(job.departmentID) : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Title</p>
                    <p className="text-base text-white font-semibold">
                      {job.title || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Posted Date</p>
                    <p className="text-base text-white">
                      {formatDate(job.postedDate)}
                    </p>
                  </div>
                  {job.description && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 uppercase mb-1">Description</p>
                      <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                        {job.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(job).map(([key, value]) => (
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

