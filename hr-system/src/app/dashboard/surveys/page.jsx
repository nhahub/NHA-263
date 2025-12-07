"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiClipboard } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllSurveys,
  createSurvey,
  updateSurvey,
  deleteSurvey,
} from "@/lib/api"

export default function SurveysPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    createdDate: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view surveys
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchSurveys()
    }
  }, [router])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllSurveys()
      setSurveys(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch surveys:", err)
      setError("Failed to load surveys. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      createdDate: "",
    })
    setSelectedSurvey(null)
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

    if (!formData.createdDate) {
      setError("Created date is required.")
      return
    }

    try {
      const surveyData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        createdDate: new Date(formData.createdDate).toISOString(),
      }

      if (selectedSurvey) {
        // Update existing survey
        const updateData = {
          surveyID: selectedSurvey.surveyID || selectedSurvey.id,
          ...surveyData,
        }
        await updateSurvey(
          selectedSurvey.surveyID || selectedSurvey.id,
          updateData
        )
      } else {
        // Create new survey
        await createSurvey(surveyData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchSurveys()
    } catch (err) {
      console.error("Failed to save survey:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save survey. Please check the data and try again."
      
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

  const handleEdit = (survey) => {
    setSelectedSurvey(survey)
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
      title: survey.title || "",
      description: survey.description || "",
      createdDate: formatDateForInput(survey.createdDate),
    })
  }

  const handleDelete = async (surveyId) => {
    if (!confirm("Are you sure you want to delete this survey?")) return

    try {
      await deleteSurvey(surveyId)
      await fetchSurveys()
    } catch (err) {
      console.error("Failed to delete survey:", err)
      setError("Failed to delete survey. Please try again.")
    }
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"
  const canManage = role === "admin" || role === "HR" // Both can create, but only admin can update/delete

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
              <FiClipboard className="w-8 h-8" />
              Surveys
            </h1>
            <p className="text-gray-300">
              {canManage
                ? "Manage surveys. Admin and HR can create surveys. Only Admin can update or delete."
                : "View surveys. Only Admin and HR can access this page."}
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
              New Survey
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

        {/* Surveys List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Surveys List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all survey details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading surveys...</p>
              </div>
            ) : surveys.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No surveys found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Title</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Description</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Created Date</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {surveys.map((survey, index) => (
                      <tr
                        key={survey.surveyID || survey.id || `survey-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {survey.surveyID || survey.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {survey.title || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">
                            {survey.description
                              ? (survey.description.length > 50
                                  ? `${survey.description.substring(0, 50)}...`
                                  : survey.description)
                              : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {survey.createdDate
                            ? new Date(survey.createdDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const surveyId = survey.surveyID || survey.id
                              
                              if (!surveyId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/surveys/${surveyId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all survey details"
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
                                        className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                        onClick={() => handleEdit(survey)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => handleDelete(surveyId)}
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
        {isFormOpen && canManage && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedSurvey ? "Edit Survey" : "New Survey"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedSurvey
                  ? "Update the selected survey's information. Only Admin can update surveys."
                  : "Create a new survey."}
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
                    placeholder="Enter survey title"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter survey description"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="createdDate" className="text-gray-300">
                    Created Date <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="createdDate"
                    name="createdDate"
                    type="date"
                    value={formData.createdDate}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                  />
                </div>

                {selectedSurvey && !isAdmin && (
                  <div className="p-3 text-sm text-yellow-400 bg-yellow-900/20 rounded-md border border-yellow-700">
                    Only Admin can update surveys. You can only view this survey.
                  </div>
                )}

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
                    disabled={selectedSurvey && !isAdmin}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedSurvey ? "Update Survey" : "Create Survey"}
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

