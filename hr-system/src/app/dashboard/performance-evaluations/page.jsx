"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiTrendingUp } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllPerformanceEvaluations,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
  getAllEmployees,
} from "@/lib/api"

export default function PerformanceEvaluationsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [evaluations, setEvaluations] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)
  const [formData, setFormData] = useState({
    employeeID: "",
    date: "",
    score: "",
    comments: "",
    criteriaID: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view evaluations
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
      
      const [evaluationsRes, employeesRes] = await Promise.allSettled([
        getAllPerformanceEvaluations(),
        getAllEmployees(),
      ])
      // console.log(evaluationsRes)
      // console.log(employeesRes)

      if (evaluationsRes.status === "fulfilled") {
        setEvaluations(Array.isArray(evaluationsRes.value.data) ? evaluationsRes.value.data : [])
      } else {
        console.error("Failed to fetch evaluations:", evaluationsRes.reason)
        setError("Failed to load performance evaluations. Please try again.")
      }

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
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
      employeeID: "",
      date: "",
      score: "",
      comments: "",
      criteriaID: "",
    })
    setSelectedEvaluation(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.employeeID) {
      setError("Employee is required.")
      return
    }

    if (!formData.date) {
      setError("Evaluation date is required.")
      return
    }

    if (formData.score === "" || isNaN(parseFloat(formData.score))) {
      setError("Score must be a valid number.")
      return
    }

    if (!formData.criteriaID || isNaN(parseInt(formData.criteriaID))) {
      setError("Criteria ID must be a valid number.")
      return
    }

    try {
      const evaluationData = {
        employeeID: parseInt(formData.employeeID),
        date: new Date(formData.date).toISOString(),
        score: parseFloat(formData.score),
        comments: formData.comments?.trim() || "",
        criteriaID: parseInt(formData.criteriaID),
      }

      if (selectedEvaluation) {
        // Update existing evaluation
        const updateData = {
          evaluationID: selectedEvaluation.evaluationID || selectedEvaluation.id,
          ...evaluationData,
        }
        await updatePerformanceEvaluation(
          selectedEvaluation.evaluationID || selectedEvaluation.id,
          updateData
        )
      } else {
        // Create new evaluation
        await createPerformanceEvaluation(evaluationData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save evaluation:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save performance evaluation. Please check the data and try again."
      
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

  const handleEdit = (evaluation) => {
    setSelectedEvaluation(evaluation)
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
      employeeID: evaluation.employeeID?.toString() || "",
      date: formatDateForInput(evaluation.date),
      score: evaluation.score?.toString() || "0",
      comments: evaluation.comments || "",
      criteriaID: evaluation.criteriaID?.toString() || "",
    })
  }

  const handleDelete = async (evaluationId) => {
    if (!confirm("Are you sure you want to delete this performance evaluation?")) return

    try {
      await deletePerformanceEvaluation(evaluationId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete evaluation:", err)
      setError("Failed to delete performance evaluation. Please try again.")
    }
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

  const getScoreBadgeColor = (score) => {
    const numScore = parseFloat(score) || 0
    if (numScore >= 90) {
      return "bg-green-900/50 text-green-400 border border-green-700"
    } else if (numScore >= 70) {
      return "bg-yellow-900/50 text-yellow-400 border border-yellow-700"
    } else if (numScore >= 50) {
      return "bg-orange-900/50 text-orange-400 border border-orange-700"
    } else {
      return "bg-red-900/50 text-red-400 border border-red-700"
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
              <FiTrendingUp className="w-8 h-8" />
              Performance Evaluations
            </h1>
            <p className="text-gray-300">
              Manage employee performance evaluation records. Admin and HR can create, update, or delete evaluations.
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
              New Evaluation
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

        {/* Evaluations List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Evaluations List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all evaluation details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading evaluations...</p>
              </div>
            ) : evaluations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No evaluations found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Employee</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Score</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Criteria ID</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {evaluations.map((evaluation, index) => (
                      <tr
                        key={evaluation.evaluationID || evaluation.id || `evaluation-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {evaluation.evaluationID || evaluation.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {evaluation.employeeID ? getEmployeeName(evaluation.employeeID) : "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {evaluation.date
                            ? new Date(evaluation.date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeColor(
                              evaluation.score
                            )}`}
                          >
                            {evaluation.score || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {evaluation.criteriaID || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const evaluationId = evaluation.evaluationID || evaluation.id
                              
                              if (!evaluationId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/performance-evaluations/${evaluationId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all evaluation details"
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
                                        onClick={() => handleEdit(evaluation)}
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
                                      onClick={() => handleDelete(evaluationId)}
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
                {selectedEvaluation ? "Edit Evaluation" : "New Evaluation"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedEvaluation
                  ? "Update the selected evaluation's information."
                  : "Create a new performance evaluation record."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="employeeID" className="text-gray-300">
                      Employee <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="employeeID"
                      name="employeeID"
                      value={formData.employeeID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option
                          key={emp.id || emp.employeeId}
                          value={emp.id || emp.employeeId}
                        >
                          {`${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                            emp.name ||
                            emp.email ||
                            `Employee #${emp.id || emp.employeeId}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-gray-300">
                      Evaluation Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="score" className="text-gray-300">
                      Score <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="score"
                      name="score"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.score}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter a score from 0 to 100</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="criteriaID" className="text-gray-300">
                      Criteria ID <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="criteriaID"
                      name="criteriaID"
                      type="number"
                      min="0"
                      value={formData.criteriaID}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Enter criteria ID"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="comments" className="text-gray-300">Comments</Label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    rows={4}
                    className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter evaluation comments or notes"
                  />
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
                    {selectedEvaluation ? "Update Evaluation" : "Create Evaluation"}
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

