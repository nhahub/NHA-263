"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMessageSquare } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllSurveyResponses,
  createSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
  getAllSurveys,
  getAllEmployees,
} from "@/lib/api"

export default function SurveyResponsesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [responses, setResponses] = useState([])
  const [surveys, setSurveys] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [formData, setFormData] = useState({
    surveyID: "",
    employeeID: "",
    responseText: "",
    rating: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const employeeId = localStorage.getItem("employeeId")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Auto-fill employee ID for employees
      if (userRole === "Employee" && employeeId) {
        setFormData((prev) => ({
          ...prev,
          employeeID: employeeId,
        }))
      }

      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const isEmployee = role === "Employee"
      
      if (isEmployee) {
        // Employees can only POST survey responses, not GET all surveys or responses
        // They don't need to fetch surveys list - they can create responses without it
        // Or if surveys are needed, they should use a different endpoint
        setResponses([])
        setSurveys([])
        setEmployees([])
      } else {
        // Admin/HR: Fetch all data
        const [responsesRes, surveysRes, employeesRes] = await Promise.allSettled([
          getAllSurveyResponses(),
          getAllSurveys(),
          getAllEmployees(),
        ])

        if (responsesRes.status === "fulfilled") {
          setResponses(Array.isArray(responsesRes.value.data) ? responsesRes.value.data : [])
        } else {
          console.error("Failed to fetch responses:", responsesRes.reason)
          setError("Failed to load survey responses. Please try again.")
        }

        if (surveysRes.status === "fulfilled") {
          setSurveys(Array.isArray(surveysRes.value.data) ? surveysRes.value.data : [])
        } else {
          console.warn("Failed to fetch surveys:", surveysRes.reason)
          // Handle 403 Forbidden specifically
          if (surveysRes.reason?.response?.status === 403) {
            console.warn("Access denied to surveys endpoint")
          }
          setSurveys([])
        }

        if (employeesRes.status === "fulfilled") {
          setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        } else {
          console.warn("Failed to fetch employees:", employeesRes.reason)
          setEmployees([])
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      if (role === "admin" || role === "HR") {
        setError("Failed to load data. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    const isEmployee = role === "Employee"
    const employeeId = localStorage.getItem("employeeId")
    
    setFormData({
      surveyID: "",
      employeeID: isEmployee ? (employeeId || "") : "",
      responseText: "",
      rating: "",
    })
    setSelectedResponse(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.surveyID) {
      setError("Survey is required.")
      return
    }

    if (!formData.employeeID) {
      setError("Employee is required.")
      return
    }

    if (!formData.responseText || !formData.responseText.trim()) {
      setError("Response text is required.")
      return
    }

    if (formData.rating === "" || isNaN(parseInt(formData.rating))) {
      setError("Rating must be a valid number.")
      return
    }

    try {
      const responseData = {
        surveyID: parseInt(formData.surveyID),
        employeeID: parseInt(formData.employeeID),
        responseText: formData.responseText.trim(),
        rating: parseInt(formData.rating),
      }

      if (selectedResponse) {
        // Update existing response
        const updateData = {
          responseID: selectedResponse.responseID || selectedResponse.id,
          ...responseData,
        }
        await updateSurveyResponse(
          selectedResponse.responseID || selectedResponse.id,
          updateData
        )
      } else {
        // Create new response
        await createSurveyResponse(responseData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save response:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save survey response. Please check the data and try again."
      
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

  const handleEdit = (response) => {
    setSelectedResponse(response)
    setIsFormOpen(true)
    
    setFormData({
      surveyID: response.surveyID?.toString() || "",
      employeeID: response.employeeID?.toString() || "",
      responseText: response.responseText || "",
      rating: response.rating?.toString() || "0",
    })
  }

  const handleDelete = async (responseId) => {
    if (!confirm("Are you sure you want to delete this survey response?")) return

    try {
      await deleteSurveyResponse(responseId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete response:", err)
      setError("Failed to delete response. Please try again.")
    }
  }

  const getSurveyTitle = (surveyId) => {
    const survey = surveys.find(
      (s) => s.surveyID === surveyId || s.id === surveyId
    )
    return survey?.title || `Survey #${surveyId}`
  }

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (emp) => emp.id === employeeId || emp.employeeId === employeeId
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || 
             employee.name || 
             employee.email || 
             `Employee #${employeeId}`
    }
    return `Employee #${employeeId}`
  }

  const getRatingStars = (rating) => {
    const numRating = parseInt(rating) || 0
    return "★".repeat(numRating) + "☆".repeat(5 - numRating)
  }

  const isAdmin = role === "admin"
  const isHR = role === "HR"
  const isEmployee = role === "Employee"
  const canView = isAdmin || isHR
  const canCreate = isAdmin || isHR || isEmployee
  const canUpdate = isAdmin || isHR
  const canDelete = isAdmin

  // Employees can view the page to submit responses, but can't see all responses
  if (!canView && !isEmployee) {
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
              <FiMessageSquare className="w-8 h-8" />
              Survey Responses
            </h1>
            <p className="text-gray-300">
              {canView
                ? "Manage survey responses. All users can submit responses. Admin and HR can view, update, or delete."
                : "Submit your survey responses. You can create new responses here."}
            </p>
          </div>
          {canCreate && (
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}
            >
              <FiPlus className="w-4 h-4" />
              New Response
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

        {/* Responses List - Only visible to Admin and HR */}
        {canView && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Responses List</CardTitle>
              <CardDescription className="text-gray-400">
                Click the eye icon to view all response details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-400">Loading responses...</p>
                </div>
              ) : responses.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-400">No responses found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50">
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Survey</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Employee</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Response Text</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Rating</th>
                        <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {responses.map((response, index) => (
                        <tr
                          key={response.responseID || response.id || `response-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-4 px-6 text-gray-300 font-medium">
                            {response.responseID || response.id || "-"}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-white">
                              {response.surveyID ? getSurveyTitle(response.surveyID) : "-"}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-300">
                              {response.employeeID ? getEmployeeName(response.employeeID) : "-"}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-300 text-sm">
                              {response.responseText
                                ? (response.responseText.length > 50
                                    ? `${response.responseText.substring(0, 50)}...`
                                    : response.responseText)
                                : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 text-sm">
                                {getRatingStars(response.rating)}
                              </span>
                              <span className="text-gray-300 text-sm">
                                ({response.rating || 0}/5)
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              {(() => {
                                const responseId = response.responseID || response.id
                                
                                if (!responseId) {
                                  return <span className="text-gray-500 text-xs">No ID</span>
                                }
                                
                                return (
                                  <>
                                    <Link
                                      href={`/dashboard/survey-responses/${responseId}`}
                                      className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                      title="View all response details"
                                    >
                                      <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                      View
                                    </Link>
                                    {canUpdate && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                        onClick={() => handleEdit(response)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                    )}
                                    {canDelete && (
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => handleDelete(responseId)}
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
        )}

        {/* Employee View - Show message if they can't see responses */}
        {isEmployee && !canView && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Submit Survey Response</CardTitle>
              <CardDescription className="text-gray-400">
                Use the form below to submit a new survey response. You can view your responses through the detail page.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Create / Edit Form */}
        {isFormOpen && canCreate && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedResponse ? "Edit Response" : "New Response"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedResponse
                  ? "Update the selected response's information. Only Admin and HR can update responses."
                  : "Submit a new survey response."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="surveyID" className="text-gray-300">
                      Survey ID <span className="text-red-400">*</span>
                    </Label>
                    {isEmployee ? (
                      // Employees enter survey ID manually since they can't fetch surveys list
                      <Input
                        id="surveyID"
                        name="surveyID"
                        type="number"
                        value={formData.surveyID}
                        onChange={handleChange}
                        required
                        placeholder="Enter survey ID"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    ) : (
                      // Admin/HR can select from dropdown
                      <select
                        id="surveyID"
                        name="surveyID"
                        value={formData.surveyID}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      >
                        <option value="">Select a survey</option>
                        {surveys.map((survey) => (
                          <option
                            key={survey.surveyID || survey.id}
                            value={survey.surveyID || survey.id}
                          >
                            {survey.title || `Survey #${survey.surveyID || survey.id}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="employeeID" className="text-gray-300">
                      Employee ID <span className="text-red-400">*</span>
                    </Label>
                    {isEmployee ? (
                      // Employees use their own ID automatically
                      <Input
                        id="employeeID"
                        name="employeeID"
                        type="number"
                        value={formData.employeeID || localStorage.getItem("employeeId") || ""}
                        onChange={handleChange}
                        required
                        placeholder="Employee ID"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                        readOnly={isEmployee} // Auto-filled for employees
                      />
                    ) : (
                      // Admin/HR can select from dropdown
                      <select
                        id="employeeID"
                        name="employeeID"
                        value={formData.employeeID}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      >
                        <option value="">Select an employee</option>
                        {employees.map((emp) => {
                          const empId = emp.id || emp.employeeId
                          const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || emp.email || `Employee #${empId}`
                          return (
                            <option key={empId} value={empId}>
                              {empName}
                            </option>
                          )
                        })}
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="responseText" className="text-gray-300">
                    Response Text <span className="text-red-400">*</span>
                  </Label>
                  <textarea
                    id="responseText"
                    name="responseText"
                    value={formData.responseText}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your response to the survey"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rating" className="text-gray-300">
                    Rating (0-5) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Enter rating from 0 to 5"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter a number between 0 and 5</p>
                </div>

                {selectedResponse && !canUpdate && (
                  <div className="p-3 text-sm text-yellow-400 bg-yellow-900/20 rounded-md border border-yellow-700">
                    Only Admin and HR can update responses. You can only view this response.
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
                    disabled={selectedResponse && !canUpdate}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedResponse ? "Update Response" : "Submit Response"}
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

