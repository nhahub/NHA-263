"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCandidateById, getAllJobs } from "@/lib/api"

export default function CandidateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState(null)
  const [jobApplications, setJobApplications] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const candidateId = params?.id
    
    // Validate ID exists and is not undefined
    if (!candidateId || candidateId === "undefined") {
      setError("Invalid candidate ID.")
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
        
        const [candidateRes, jobsRes] = await Promise.allSettled([
          getCandidateById(candidateId),
          getAllJobs(),
        ])

        if (candidateRes.status === "fulfilled") {
          setCandidate(candidateRes.value.data)
          console.log("Candidate data:", candidateRes.value.data)
        } else {
          setError(
            candidateRes.reason?.response?.data?.message ||
            candidateRes.reason?.message ||
            "You are not authorized to view this candidate or it does not exist."
          )
        }

        if (jobsRes.status === "fulfilled") {
          setJobApplications(Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load candidate:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this candidate or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

  const getJobApplicationName = (jobApplicationId) => {
    const job = jobApplications.find(
      (job) => job.id === jobApplicationId || job.jobID === jobApplicationId || job.jobApplicationId === jobApplicationId
    )
    if (job) {
      return job.title || job.jobTitle || job.name || `Job Application #${jobApplicationId}`
    }
    return `Job Application #${jobApplicationId}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("accepted") || statusLower.includes("approved") || statusLower.includes("hired")) {
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
    } else if (statusLower.includes("pending") || statusLower.includes("under review")) {
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
            <h1 className="text-2xl font-bold text-cyan-400">Candidate Details</h1>
            <p className="text-gray-300 text-sm">
              View candidate information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Candidate Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this candidate as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading candidate...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !candidate ? (
              <p className="text-sm text-gray-400">Candidate not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Candidate ID</p>
                    <p className="text-base text-white font-medium">
                      {candidate.candidateID || candidate.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Job Application</p>
                    <p className="text-base text-white">
                      {candidate.jobApplicationId ? getJobApplicationName(candidate.jobApplicationId) : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(candidate.status)}
                    </div>
                  </div>
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(candidate).map(([key, value]) => (
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


