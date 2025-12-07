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
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  getAllHRDepartments,
} from "@/lib/api"

export default function JobsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    departmentID: "",
    postedDate: "",
    status: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view jobs
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
      
      const [jobsRes, departmentsRes] = await Promise.allSettled([
        getAllJobs(),
        getAllHRDepartments(),
      ])

      if (jobsRes.status === "fulfilled") {
        setJobs(Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [])
      } else {
        console.error("Failed to fetch jobs:", jobsRes.reason)
        setError("Failed to load jobs. Please try again.")
      }

      if (departmentsRes.status === "fulfilled") {
        setDepartments(Array.isArray(departmentsRes.value.data) ? departmentsRes.value.data : [])
      } else {
        console.warn("Failed to fetch departments:", departmentsRes.reason)
        setDepartments([])
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
      title: "",
      description: "",
      departmentID: "",
      postedDate: "",
      status: "",
    })
    setSelectedJob(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      setError("Title is required.")
      return
    }

    if (!formData.departmentID || isNaN(parseInt(formData.departmentID))) {
      setError("Department must be selected.")
      return
    }

    if (!formData.postedDate) {
      setError("Posted date is required.")
      return
    }

    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        departmentID: parseInt(formData.departmentID),
        postedDate: new Date(formData.postedDate).toISOString(),
        status: formData.status?.trim() || "",
      }

      if (selectedJob) {
        // Update existing job
        const updateData = {
          jobID: selectedJob.jobID || selectedJob.id,
          ...jobData,
        }
        await updateJob(
          selectedJob.jobID || selectedJob.id,
          updateData
        )
      } else {
        // Create new job
        await createJob(jobData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save job:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save job. Please check the data and try again."
      
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

  const handleEdit = (job) => {
    setSelectedJob(job)
    setIsFormOpen(true)
    
    // Format date for input field (YYYY-MM-DDTHH:mm)
    const postedDate = job.postedDate
      ? new Date(job.postedDate).toISOString().slice(0, 16)
      : ""
    
    setFormData({
      title: job.title || "",
      description: job.description || "",
      departmentID: job.departmentID?.toString() || "",
      postedDate: postedDate,
      status: job.status || "",
    })
  }

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      await deleteJob(jobId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete job:", err)
      setError("Failed to delete job. Please try again.")
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4">
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
              Jobs
            </h1>
            <p className="text-sm text-gray-400">
              Manage job positions. Admin and HR can create, update, or delete jobs.
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
              New Job
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

        {/* Jobs List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Jobs List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all job details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">No jobs found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Title</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Department</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {jobs.map((job, index) => (
                      <tr
                        key={job.jobID || job.id || `job-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-2 px-4 text-gray-300 font-medium">
                          {job.jobID || job.id || "-"}
                        </td>
                        <td className="py-2 px-4">
                          <div className="font-medium text-white">
                            {job.title || "-"}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-gray-300">
                          {job.departmentID ? getDepartmentName(job.departmentID) : "-"}
                        </td>
                        <td className="py-2 px-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const jobId = job.jobID || job.id
                              
                              if (!jobId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/jobs/${jobId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all job details"
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
                                        onClick={() => handleEdit(job)}
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
                                      onClick={() => handleDelete(jobId)}
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
                {selectedJob ? "Edit Job" : "New Job"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedJob
                  ? "Update the selected job's information."
                  : "Create a new job position."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-gray-300">
                      Title <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Job title"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="departmentID" className="text-gray-300">
                      Department <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="departmentID"
                      name="departmentID"
                      value={formData.departmentID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => {
                        const deptId = dept.id || dept.departmentId
                        const deptName = dept.nameEn || dept.name || `Department #${deptId}`
                        return (
                          <option key={deptId} value={deptId}>
                            {deptName}
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
                      placeholder="e.g., Open, Closed, Pending"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="postedDate" className="text-gray-300">
                      Posted Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="postedDate"
                      name="postedDate"
                      type="datetime-local"
                      value={formData.postedDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
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
                      placeholder="Job description"
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
                    {selectedJob ? "Update Job" : "Create Job"}
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

