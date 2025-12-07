"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiBriefcase } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  getAllJobs,
  getAllCVs,
} from "@/lib/api"

export default function JobApplicationsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [formData, setFormData] = useState({
    jobID: "",
    name: "",
    email: "",
    phone: "",
    cvFile: "",
    status: "",
    applyDate: "",
    cV_ID: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view job applications
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
      
      const [applicationsRes, jobsRes, cvsRes] = await Promise.allSettled([
        getAllJobApplications(),
        getAllJobs(),
        getAllCVs(),
      ])

      if (applicationsRes.status === "fulfilled") {
        setApplications(Array.isArray(applicationsRes.value.data) ? applicationsRes.value.data : [])
      } else {
        console.error("Failed to fetch job applications:", applicationsRes.reason)
        setError("Failed to load job applications. Please try again.")
      }

      if (jobsRes.status === "fulfilled") {
        setJobs(Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [])
      } else {
        console.warn("Failed to fetch jobs:", jobsRes.reason)
        setJobs([])
      }

      if (cvsRes.status === "fulfilled") {
        setCvs(Array.isArray(cvsRes.value.data) ? cvsRes.value.data : [])
      } else {
        console.warn("Failed to fetch CVs:", cvsRes.reason)
        setCvs([])
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
      jobID: "",
      name: "",
      email: "",
      phone: "",
      cvFile: "",
      status: "",
      applyDate: "",
      cV_ID: "",
    })
    setSelectedApplication(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      setError("Name is required.")
      return
    }

    if (!formData.email || !formData.email.trim()) {
      setError("Email is required.")
      return
    }

    if (!formData.jobID || isNaN(parseInt(formData.jobID))) {
      setError("Job must be selected.")
      return
    }

    if (!formData.applyDate) {
      setError("Apply date is required.")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.")
      return
    }

    try {
      const applicationData = {
        jobID: parseInt(formData.jobID),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || "",
        cvFile: formData.cvFile?.trim() || "",
        status: formData.status?.trim() || "",
        applyDate: new Date(formData.applyDate).toISOString(),
        cV_ID: formData.cV_ID ? parseInt(formData.cV_ID) : 0,
      }

      if (selectedApplication) {
        // Update existing application
        const updateData = {
          jobApplicationId: selectedApplication.jobApplicationId || selectedApplication.id,
          ...applicationData,
        }
        await updateJobApplication(
          selectedApplication.jobApplicationId || selectedApplication.id,
          updateData
        )
      } else {
        // Create new application
        await createJobApplication(applicationData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save job application:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save job application. Please check the data and try again."
      
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

  const handleEdit = (application) => {
    setSelectedApplication(application)
    setIsFormOpen(true)
    
    // Format date for input field (YYYY-MM-DDTHH:mm)
    const applyDate = application.applyDate
      ? new Date(application.applyDate).toISOString().slice(0, 16)
      : ""
    
    setFormData({
      jobID: application.jobID?.toString() || "",
      name: application.name || "",
      email: application.email || "",
      phone: application.phone || "",
      cvFile: application.cvFile || "",
      status: application.status || "",
      applyDate: applyDate,
      cV_ID: application.cV_ID?.toString() || "",
    })
  }

  const handleDelete = async (applicationId) => {
    if (!confirm("Are you sure you want to delete this job application?")) return

    try {
      await deleteJobApplication(applicationId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete job application:", err)
      setError("Failed to delete job application. Please try again.")
    }
  }

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
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-1 flex items-center gap-2">
              <FiBriefcase className="w-6 h-6" />
              Job Applications
            </h1>
            <p className="text-sm text-gray-400">
              Manage job applications. Admin and HR can create, update, or delete applications.
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
              New Application
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

        {/* Applications List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Applications List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all application details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">No applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Job</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {applications.map((application, index) => (
                      <tr
                        key={application.jobApplicationId || application.id || `application-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-2 px-4 text-gray-300 font-medium">
                          {application.jobApplicationId || application.id || "-"}
                        </td>
                        <td className="py-2 px-4">
                          <div className="font-medium text-white">
                            {application.name || "-"}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-gray-300">
                          {application.jobID ? getJobName(application.jobID) : "-"}
                        </td>
                        <td className="py-2 px-4">
                          {getStatusBadge(application.status)}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const applicationId = application.jobApplicationId || application.id
                              
                              if (!applicationId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/job-applications/${applicationId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all application details"
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
                                        onClick={() => handleEdit(application)}
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
                                      onClick={() => handleDelete(applicationId)}
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
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">
                {selectedApplication ? "Edit Application" : "New Application"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedApplication
                  ? "Update the selected application's information."
                  : "Create a new job application."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="jobID" className="text-gray-300">
                      Job <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="jobID"
                      name="jobID"
                      value={formData.jobID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a job</option>
                      {jobs.map((job) => {
                        const jobId = job.id || job.jobID
                        const jobName = job.title || job.jobTitle || job.name || `Job #${jobId}`
                        return (
                          <option key={jobId} value={jobId}>
                            {jobName}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-gray-300">Status</Label>
                    <Input
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Applied, Screening, Interview, Offer, Rejected, Hired"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-gray-300">
                      Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Applicant name"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-gray-300">
                      Email <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="applicant@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="applyDate" className="text-gray-300">
                      Apply Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="applyDate"
                      name="applyDate"
                      type="datetime-local"
                      value={formData.applyDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cV_ID" className="text-gray-300">CV</Label>
                    <select
                      id="cV_ID"
                      name="cV_ID"
                      value={formData.cV_ID}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a CV (optional)</option>
                      {cvs.map((cv) => {
                        const cvId = cv.cV_ID || cv.id
                        const cvName = cv.fullName || cv.name || `CV #${cvId}`
                        return (
                          <option key={cvId} value={cvId}>
                            {cvName}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="cvFile" className="text-gray-300">CV File Path</Label>
                    <Input
                      id="cvFile"
                      name="cvFile"
                      value={formData.cvFile}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="CV file path or URL"
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
                    {selectedApplication ? "Update Application" : "Create Application"}
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

