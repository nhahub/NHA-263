"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiCalendar } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getAllEmployees,
  getAllUsers,
} from "@/lib/api"

export default function InterviewsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [interviews, setInterviews] = useState([])
  const [candidates, setCandidates] = useState([])
  const [interviewers, setInterviewers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [formData, setFormData] = useState({
    candidateID: "",
    date: "",
    result: "",
    description: "",
    interviewerID: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view interviews
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
      
      const [interviewsRes, employeesRes, usersRes] = await Promise.allSettled([
        getAllInterviews(),
        getAllEmployees(),
        getAllUsers(),
      ])

      if (interviewsRes.status === "fulfilled") {
        setInterviews(Array.isArray(interviewsRes.value.data) ? interviewsRes.value.data : [])
      } else {
        console.error("Failed to fetch interviews:", interviewsRes.reason)
        setError("Failed to load interviews. Please try again.")
      }

      // Use employees as candidates
      if (employeesRes.status === "fulfilled") {
        setCandidates(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
      } else {
        console.warn("Failed to fetch candidates:", employeesRes.reason)
        setCandidates([])
      }

      // Use users as interviewers
      if (usersRes.status === "fulfilled") {
        setInterviewers(Array.isArray(usersRes.value.data) ? usersRes.value.data : [])
      } else {
        console.warn("Failed to fetch interviewers:", usersRes.reason)
        setInterviewers([])
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
      candidateID: "",
      date: "",
      result: "",
      description: "",
      interviewerID: "",
    })
    setSelectedInterview(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.candidateID) {
      setError("Candidate is required.")
      return
    }

    if (!formData.date) {
      setError("Interview date is required.")
      return
    }

    if (!formData.interviewerID) {
      setError("Interviewer is required.")
      return
    }

    try {
      const interviewData = {
        candidateID: parseInt(formData.candidateID),
        date: new Date(formData.date).toISOString(),
        result: formData.result?.trim() || "",
        description: formData.description?.trim() || "",
        interviewerID: parseInt(formData.interviewerID),
      }

      if (selectedInterview) {
        // Update existing interview
        const updateData = {
          interviewID: selectedInterview.interviewID || selectedInterview.id,
          ...interviewData,
        }
        await updateInterview(
          selectedInterview.interviewID || selectedInterview.id,
          updateData
        )
      } else {
        // Create new interview
        await createInterview(interviewData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save interview:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save interview. Please check the data and try again."
      
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

  const handleEdit = (interview) => {
    setSelectedInterview(interview)
    setIsFormOpen(true)
    
    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      // Get local date in YYYY-MM-DD format
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    setFormData({
      candidateID: interview.candidateID?.toString() || "",
      date: formatDateForInput(interview.date),
      result: interview.result || "",
      description: interview.description || "",
      interviewerID: interview.interviewerID?.toString() || "",
    })
  }

  const handleDelete = async (interviewId) => {
    if (!confirm("Are you sure you want to delete this interview?")) return

    try {
      await deleteInterview(interviewId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete interview:", err)
      setError("Failed to delete interview. Please try again.")
    }
  }

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
              <FiCalendar className="w-8 h-8" />
              Interviews
            </h1>
            <p className="text-gray-300">
              Manage interview schedules and results. Admin and HR can create, update, or delete interviews.
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
              New Interview
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

        {/* Interviews List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Interviews List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all interview details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No interviews found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Candidate</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Interviewer</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Result</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {interviews.map((interview, index) => (
                      <tr
                        key={interview.interviewID || interview.id || `interview-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {interview.interviewID || interview.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {interview.candidateID ? getCandidateName(interview.candidateID) : "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {interview.interviewerID ? getInterviewerName(interview.interviewerID) : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {interview.date
                            ? new Date(interview.date).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          {getResultBadge(interview.result)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const interviewId = interview.interviewID || interview.id
                              
                              if (!interviewId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/interviews/${interviewId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all interview details"
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
                                        onClick={() => handleEdit(interview)}
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
                                      onClick={() => handleDelete(interviewId)}
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
                {selectedInterview ? "Edit Interview" : "New Interview"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedInterview
                  ? "Update the selected interview's information."
                  : "Schedule a new interview."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="candidateID" className="text-gray-300">
                      Candidate <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="candidateID"
                      name="candidateID"
                      value={formData.candidateID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a candidate</option>
                      {candidates.map((cand) => (
                        <option
                          key={cand.id || cand.employeeId}
                          value={cand.id || cand.employeeId}
                        >
                          {`${cand.firstName || ""} ${cand.lastName || ""}`.trim() ||
                            cand.name ||
                            cand.email ||
                            `Candidate #${cand.id || cand.employeeId}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="interviewerID" className="text-gray-300">
                      Interviewer <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="interviewerID"
                      name="interviewerID"
                      value={formData.interviewerID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select an interviewer</option>
                      {interviewers.map((user) => (
                        <option
                          key={user.id || user.userID}
                          value={user.id || user.userID}
                        >
                          {user.username ||
                            user.email ||
                            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                            `Interviewer #${user.id || user.userID}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-gray-300">
                      Interview Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="result" className="text-gray-300">Result</Label>
                    <Input
                      id="result"
                      name="result"
                      value={formData.result}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Pass, Fail, Pending"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter interview description or notes"
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
                    {selectedInterview ? "Update Interview" : "Create Interview"}
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

