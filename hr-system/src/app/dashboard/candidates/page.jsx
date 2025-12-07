"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiUser } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getAllJobs,
} from "@/lib/api"

export default function CandidatesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [candidates, setCandidates] = useState([])
  const [jobApplications, setJobApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [formData, setFormData] = useState({
    status: "",
    jobApplicationId: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view candidates
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [candidatesRes, jobsRes] = await Promise.allSettled([
        getAllCandidates(),
        getAllJobs(),
      ])

      if (candidatesRes.status === "fulfilled") {
        setCandidates(Array.isArray(candidatesRes.value.data) ? candidatesRes.value.data : [])
      } else {
        console.error("Failed to fetch candidates:", candidatesRes.reason)
        setError("Failed to load candidates. Please try again.")
      }

      // Use jobs as job applications (assuming jobApplicationId refers to job applications)
      // If there's a separate JobApplication API, it should be used instead
      if (jobsRes.status === "fulfilled") {
        setJobApplications(Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [])
      } else {
        console.warn("Failed to fetch job applications:", jobsRes.reason)
        setJobApplications([])
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      status: "",
      jobApplicationId: "",
    })
    setSelectedCandidate(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.status || !formData.status.trim()) {
      setError("Status is required.")
      return
    }

    if (!formData.jobApplicationId || isNaN(parseInt(formData.jobApplicationId))) {
      setError("Job Application ID must be a valid number.")
      return
    }

    try {
      const candidateData = {
        status: formData.status.trim(),
        jobApplicationId: parseInt(formData.jobApplicationId),
      }

      if (selectedCandidate) {
        // Update existing candidate
        const updateData = {
          candidateID: selectedCandidate.candidateID || selectedCandidate.id,
          ...candidateData,
        }
        await updateCandidate(
          selectedCandidate.candidateID || selectedCandidate.id,
          updateData
        )
      } else {
        // Create new candidate
        await createCandidate(candidateData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save candidate:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save candidate. Please check the data and try again."
      
      if (err.response?.data) {
        const errorData = err.response.data
        
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.title) {
          errorMessage = errorData.title
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          errorMessage = validationErrors || errorMessage
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    }
  }

  const handleEdit = (candidate) => {
    setSelectedCandidate(candidate)
    setIsFormOpen(true)
    
    setFormData({
      status: candidate.status || "",
      jobApplicationId: candidate.jobApplicationId?.toString() || "",
    })
  }

  const handleDelete = async (candidateId) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return

    try {
      await deleteCandidate(candidateId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete candidate:", err)
      setError("Failed to delete candidate. Please try again.")
    }
  }

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

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"
  const canManage = role === "admin" || role === "HR"

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-red-400">You don't have permission to view this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 flex items-center gap-3">
              <FiUser className="w-8 h-8" />
              Candidates
            </h1>
            <p className="text-gray-300">
              Manage candidate records. Admin and HR can create, update, or delete candidates.
            </p>
          </div>
          {canManage && (
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}
            >
              <FiPlus className="w-4 h-4" />
              New Candidate
            </Button>
          )}
        </div>

        {error && (
          <Card className="border-red-700 bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Candidates List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Candidates List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all candidate details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No candidates found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Job Application</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {candidates.map((candidate, index) => (
                      <tr
                        key={candidate.candidateID || candidate.id || `candidate-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {candidate.candidateID || candidate.id || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {candidate.jobApplicationId ? getJobApplicationName(candidate.jobApplicationId) : "-"}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(candidate.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const candidateId = candidate.candidateID || candidate.id
                              
                              if (!candidateId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/candidates/${candidateId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all candidate details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {canManage && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                        onClick={() => handleEdit(candidate)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                    </>
                                  )}
                                  {isAdmin && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="h-7 px-3 text-xs"
                                      onClick={() => handleDelete(candidateId)}
                                    >
                                      <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                      Delete
                                    </Button>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Form */}
        {isFormOpen && canManage && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedCandidate ? "Edit Candidate" : "New Candidate"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedCandidate
                  ? "Update the selected candidate's information."
                  : "Add a new candidate."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="jobApplicationId" className="text-gray-300">
                      Job Application <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="jobApplicationId"
                      name="jobApplicationId"
                      value={formData.jobApplicationId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a job application</option>
                      {jobApplications.map((job) => {
                        const jobId = job.id || job.jobID || job.jobApplicationId
                        const jobName = job.title || job.jobTitle || job.name || `Job Application #${jobId}`
                        return (
                          <option key={jobId} value={jobId}>
                            {jobName}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-gray-300">
                      Status <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Pending, Accepted, Rejected"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsFormOpen(false)
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {selectedCandidate ? "Update Candidate" : "Create Candidate"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


