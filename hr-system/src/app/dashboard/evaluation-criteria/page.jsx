"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiCheckSquare } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllEvaluationCriteria,
  createEvaluationCriteria,
  updateEvaluationCriteria,
  deleteEvaluationCriteria,
} from "@/lib/api"

export default function EvaluationCriteriaPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [criteria, setCriteria] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCriterion, setSelectedCriterion] = useState(null)
  const [formData, setFormData] = useState({
    criteriaName: "",
    description: "",
    weight: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view criteria
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchCriteria()
    }
  }, [router])

  const fetchCriteria = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllEvaluationCriteria()
      setCriteria(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch criteria:", err)
      setError("Failed to load evaluation criteria. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      criteriaName: "",
      description: "",
      weight: "",
    })
    setSelectedCriterion(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.criteriaName || !formData.criteriaName.trim()) {
      setError("Criteria name is required.")
      return
    }

    if (formData.weight === "" || isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) < 0) {
      setError("Weight must be a valid non-negative number.")
      return
    }

    try {
      const criteriaData = {
        criteriaName: formData.criteriaName.trim(),
        description: formData.description?.trim() || "",
        weight: parseFloat(formData.weight) || 0,
      }

      if (selectedCriterion) {
        // Update existing criterion
        const updateData = {
          criteriaID: selectedCriterion.criteriaID || selectedCriterion.id,
          ...criteriaData,
        }
        await updateEvaluationCriteria(
          selectedCriterion.criteriaID || selectedCriterion.id,
          updateData
        )
      } else {
        // Create new criterion
        await createEvaluationCriteria(criteriaData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchCriteria()
    } catch (err) {
      console.error("Failed to save criterion:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save evaluation criterion. Please check the data and try again."
      
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

  const handleEdit = (criterion) => {
    setSelectedCriterion(criterion)
    setIsFormOpen(true)
    
    setFormData({
      criteriaName: criterion.criteriaName || "",
      description: criterion.description || "",
      weight: criterion.weight?.toString() || "0",
    })
  }

  const handleDelete = async (criterionId) => {
    if (!confirm("Are you sure you want to delete this evaluation criterion?")) return

    try {
      await deleteEvaluationCriteria(criterionId)
      await fetchCriteria()
    } catch (err) {
      console.error("Failed to delete criterion:", err)
      setError("Failed to delete evaluation criterion. Please try again.")
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
              <FiCheckSquare className="w-8 h-8" />
              Evaluation Criteria
            </h1>
            <p className="text-gray-300">
              Manage evaluation criteria for performance assessments. Admin and HR can create, update, or delete criteria.
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
              New Criterion
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

        {/* Criteria List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Criteria List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all criterion details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading criteria...</p>
              </div>
            ) : criteria.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No criteria found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Criteria Name</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Weight</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Description</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {criteria.map((criterion, index) => (
                      <tr
                        key={criterion.criteriaID || criterion.id || `criterion-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {criterion.criteriaID || criterion.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {criterion.criteriaName || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {criterion.weight || 0}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          <div className="max-w-md truncate">
                            {criterion.description || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const criterionId = criterion.criteriaID || criterion.id
                              
                              if (!criterionId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/evaluation-criteria/${criterionId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all criterion details"
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
                                        onClick={() => handleEdit(criterion)}
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
                                      onClick={() => handleDelete(criterionId)}
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
                {selectedCriterion ? "Edit Criterion" : "New Criterion"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedCriterion
                  ? "Update the selected criterion's information."
                  : "Create a new evaluation criterion."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="criteriaName" className="text-gray-300">
                      Criteria Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="criteriaName"
                      name="criteriaName"
                      value={formData.criteriaName}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Technical Skills, Communication"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="weight" className="text-gray-300">
                      Weight <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter the weight/importance of this criterion</p>
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
                      placeholder="Enter criterion description"
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
                    {selectedCriterion ? "Update Criterion" : "Create Criterion"}
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


