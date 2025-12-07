"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getInterviewById, getAllEmployees, getAllUsers } from "@/lib/api"

export default function InterviewDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [interview, setInterview] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [interviewers, setInterviewers] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interviewId = params?.id
    
    // Validate ID exists and is not undefined
    if (!interviewId || interviewId === "undefined") {
      setError("Invalid interview ID.")
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
        
        const [interviewRes, employeesRes, usersRes] = await Promise.allSettled([
          getInterviewById(interviewId),
          getAllEmployees(),
          getAllUsers(),
        ])

        if (interviewRes.status === "fulfilled") {
          setInterview(interviewRes.value.data)
          console.log("Interview data:", interviewRes.value.data)
        } else {
          setError(
            interviewRes.reason?.response?.data?.message ||
            interviewRes.reason?.message ||
            "You are not authorized to view this interview or it does not exist."
          )
        }

        if (employeesRes.status === "fulfilled") {
          setCandidates(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        }

        if (usersRes.status === "fulfilled") {
          setInterviewers(Array.isArray(usersRes.value.data) ? usersRes.value.data : [])
        }
      } catch (err) {
        console.error("Failed to load interview:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this interview or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params?.id, router])

  const getCandidateName = (candidateId) => {
    const candidate = candidates.find(
      (cand) => cand.id === candidateId || cand.employeeId === candidateId
    )
    if (candidate) {
      return `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || 
             candidate.name || 
             candidate.email || 
             `Candidate #${candidateId}`
    }
    return `Candidate #${candidateId}`
  }

  const getInterviewerName = (interviewerId) => {
    const interviewer = interviewers.find(
      (user) => user.id === interviewerId || user.userID === interviewerId
    )
    if (interviewer) {
      return interviewer.username || 
             interviewer.email || 
             `${interviewer.firstName || ""} ${interviewer.lastName || ""}`.trim() ||
             `Interviewer #${interviewerId}`
    }
    return `Interviewer #${interviewerId}`
  }

  const getResultBadge = (result) => {
    if (!result) return null
    
    const resultLower = result.toLowerCase()
    
    if (resultLower.includes("pass") || resultLower.includes("accepted") || resultLower.includes("approved")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {result}
        </span>
      )
    } else if (resultLower.includes("fail") || resultLower.includes("rejected") || resultLower.includes("declined")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
          {result}
        </span>
      )
    } else if (resultLower.includes("pending") || resultLower.includes("scheduled")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
          {result}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
          {result}
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
            <h1 className="text-2xl font-bold text-cyan-400">Interview Details</h1>
            <p className="text-gray-300 text-sm">
              View interview information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Interview Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this interview as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading interview...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !interview ? (
              <p className="text-sm text-gray-400">Interview not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Interview ID</p>
                    <p className="text-base text-white font-medium">
                      {interview.interviewID || interview.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Interview Date</p>
                    <p className="text-base text-white">
                      {interview.date
                        ? new Date(interview.date).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Candidate</p>
                    <p className="text-base text-white font-semibold">
                      {interview.candidateID ? getCandidateName(interview.candidateID) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Interviewer</p>
                    <p className="text-base text-white">
                      {interview.interviewerID ? getInterviewerName(interview.interviewerID) : "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Result</p>
                    <div className="flex items-center gap-2">
                      {getResultBadge(interview.result)}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Description</p>
                    <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                      {interview.description || "-"}
                    </p>
                  </div>
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(interview).map(([key, value]) => (
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

