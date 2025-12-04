"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiBook } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllTrainings,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} from "@/lib/api"

export default function TrainingsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view trainings
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchTrainings()
    }
  }, [router])

  const fetchTrainings = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllTrainings()
      setTrainings(Array.isArray(data) ? data : [])
      console.log("Trainings data:", data)
      if (data && data.length > 0) {
        console.log("First training structure:", data[0])
        console.log("Available fields:", Object.keys(data[0]))
      }
    } catch (err) {
      console.error("Failed to fetch trainings:", err)
      setError("Failed to load trainings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
    })
    setSelectedTraining(null)
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
      setError("Training title is required.")
      return
    }

    if (!formData.startDate) {
      setError("Start date is required.")
      return
    }

    if (!formData.endDate) {
      setError("End date is required.")
      return
    }

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (endDate < startDate) {
      setError("End date must be after start date.")
      return
    }

    try {
      const trainingId = selectedTraining?.trainingID || selectedTraining?.id || selectedTraining?.trainingId
      
      // Prepare data according to API schema
      const trainingData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }
      
      if (selectedTraining && trainingId) {
        // Update existing training
        await updateTraining(trainingId, trainingData)
      } else {
        // Create new training
        await createTraining(trainingData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchTrainings()
    } catch (err) {
      console.error("Failed to save training:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save training. Please check the data and try again."
      
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

  const handleEdit = (training) => {
    setSelectedTraining(training)
    setIsFormOpen(true)
    
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split('T')[0]
    }
    
    setFormData({
      title: training.title || "",
      description: training.description || "",
      startDate: formatDateForInput(training.startDate),
      endDate: formatDateForInput(training.endDate),
    })
  }

  const handleDelete = async (trainingId) => {
    if (!confirm("Are you sure you want to delete this training course?")) return

    try {
      await deleteTraining(trainingId)
      await fetchTrainings()
    } catch (err) {
      console.error("Failed to delete training:", err)
      setError("Failed to delete training. Please try again.")
    }
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"

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
              <FiBook className="w-8 h-8" />
              Training Courses
            </h1>
            <p className="text-gray-300">
              Manage training course definitions. Admin and HR can view, but only Admin can create, update, or delete.
            </p>
          </div>
          {isAdmin && (
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}
            >
              <FiPlus className="w-4 h-4" />
              New Training Course
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

        {/* Trainings List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Training Courses List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all training course details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading training courses...</p>
              </div>
            ) : trainings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No training courses found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Title</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Description</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Start Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">End Date</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {trainings.map((training, index) => (
                      <tr
                        key={training.trainingID || training.id || training.trainingId || `training-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {training.trainingID || training.id || training.trainingId || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">{training.title || "-"}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">
                            {training.description 
                              ? (training.description.length > 50 
                                  ? `${training.description.substring(0, 50)}...` 
                                  : training.description)
                              : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {training.startDate 
                            ? new Date(training.startDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {training.endDate 
                            ? new Date(training.endDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const trainingId = training.trainingID || training.id || training.trainingId
                              
                              if (!trainingId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/trainings/${trainingId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all training course details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {isAdmin && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        onClick={() => handleEdit(training)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleDelete(trainingId)}
                                      >
                                        <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                      </Button>
                                    </>
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
        {isFormOpen && isAdmin && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedTraining ? "Edit Training Course" : "New Training Course"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedTraining
                  ? "Update the selected training course's information."
                  : "Create a new training course definition."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter training course title"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Enter training course description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-gray-300">
                      Start Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-gray-300">
                      End Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
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
                    className="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {selectedTraining ? "Update Training Course" : "Create Training Course"}
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

