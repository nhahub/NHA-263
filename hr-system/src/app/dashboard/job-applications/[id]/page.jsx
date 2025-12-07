"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getJobApplicationById, getAllJobs, getAllCVs } from "@/lib/api"

export default function JobApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState(null)
  const [jobs, setJobs] = useState([])
  const [cvs, setCvs] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const applicationId = params?.id
    
    // Validate ID exists and is not undefined
    if (!applicationId || applicationId === "undefined") {
      setError("Invalid application ID.")
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
        
        const [applicationRes, jobsRes, cvsRes] = await Promise.allSettled([
          getJobApplicationById(applicationId),
          getAllJobs(),
          getAllCVs(),
        ])

        if (applicationRes.status === "fulfilled") {
          setApplication(applicationRes.value.data)
          console.log("Application data:", applicationRes.value.data)
        } else {
          setError(
            applicationRes.reason?.response?.data?.message ||
            applicationRes.reason?.message ||
            "You are not authorized to view this application or it does not exist."
          )
        }

        if (jobsRes.status === "fulfilled") {
          setJobs(Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [])
        }

        if (cvsRes.status === "fulfilled") {
          setCvs(Array.isArray(cvsRes.value.data) ? cvsRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load application:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this application or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

  const getJobName = (jobID) => {
    const job = jobs.find((job) => job.id === jobID || job.jobID === jobID)
    if (job) {
      return job.title || job.jobTitle || job.name || `Job #${jobID}`
    }
    return `Job #${jobID}`
  }

  const getCVName = (cvID) => {
    if (!cvID || cvID === 0) return "-"
    const cv = cvs.find((cv) => cv.cV_ID === cvID || cv.id === cvID)
    if (cv) {
      return cv.fullName || cv.name || `CV #${cvID}`
    }
    return `CV #${cvID}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("hired") || statusLower.includes("accepted") || statusLower.includes("offer")) {
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
    } else if (statusLower.includes("interview") || statusLower.includes("screening")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("applied") || statusLower.includes("pending")) {
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
            <h1 className="text-2xl font-bold text-cyan-400">Job Application Details</h1>
            <p className="text-gray-300 text-sm">
              View application information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Application Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this application as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading application...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !application ? (
              <p className="text-sm text-gray-400">Application not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Application ID</p>
                    <p className="text-base text-white font-medium">
                      {application.jobApplicationId || application.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Job</p>
                    <p className="text-base text-white">
                      {application.jobID ? getJobName(application.jobID) : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Name</p>
                    <p className="text-base text-white font-semibold">
                      {application.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Email</p>
                    <p className="text-base text-white">
                      {application.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Phone</p>
                    <p className="text-base text-white">
                      {application.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Apply Date</p>
                    <p className="text-base text-white">
                      {formatDate(application.applyDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">CV</p>
                    <p className="text-base text-white">
                      {application.cV_ID ? getCVName(application.cV_ID) : "-"}
                    </p>
                  </div>
                  {application.cvFile && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 uppercase mb-1">CV File</p>
                      <p className="text-base text-white break-words bg-gray-800/50 p-3 rounded-md">
                        {application.cvFile}
                      </p>
                    </div>
                  )}
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(application).map(([key, value]) => (
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

