"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FiPlus, FiEdit2, FiTrash2, FiGift } from "react-icons/fi"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllBenefitTypes,
  createBenefitType,
  updateBenefitType,
  deleteBenefitType,
} from "@/lib/api"

export default function BenefitTypesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [benefitTypes, setBenefitTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBenefitType, setSelectedBenefitType] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    isActive: true,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view benefit types, only Admin can manage
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchBenefitTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchBenefitTypes = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllBenefitTypes()
      setBenefitTypes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch benefit types:", err)
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load benefit types. Please try again."
      
      // More specific error messages based on status code
      if (err.response?.status === 500) {
        setError("Server error: The backend encountered an issue. Please check the server logs or contact support.")
      } else if (err.response?.status === 401) {
        setError("Unauthorized: Please log in again.")
      } else if (err.response?.status === 403) {
        setError("Forbidden: You don't have permission to view benefit types.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      isActive: true,
    })
    setSelectedBenefitType(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (selectedBenefitType) {
        const updateData = {
          ...selectedBenefitType,
          ...formData,
        }
        console.log("Updating benefit type with data:", updateData)
        await updateBenefitType(selectedBenefitType.id || selectedBenefitType.benefitTypeId, updateData)
      } else {
        console.log("Creating benefit type with data:", formData)
        await createBenefitType(formData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchBenefitTypes()
    } catch (err) {
      console.error("Failed to save benefit type:", err)
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save benefit type. Please check the data and try again."
      
      // More specific error messages based on status code
      if (err.response?.status === 500) {
        setError("Server error: The backend encountered an issue while saving. Please check the server logs or contact support.")
      } else if (err.response?.status === 400) {
        setError(`Validation error: ${errorMessage}. Please check your input and try again.`)
      } else if (err.response?.status === 401) {
        setError("Unauthorized: Please log in again.")
      } else if (err.response?.status === 403) {
        setError("Forbidden: You don't have permission to perform this action.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (benefitType) => {
    setSelectedBenefitType(benefitType)
    setIsFormOpen(true)
    setFormData({
      name: benefitType.name || "",
      nameAr: benefitType.nameAr || "",
      description: benefitType.description || "",
      descriptionAr: benefitType.descriptionAr || "",
      isActive: benefitType.isActive !== undefined ? benefitType.isActive : true,
    })
  }

  const handleDelete = async (benefitTypeId) => {
    if (!confirm("Are you sure you want to delete this benefit type?")) return

    try {
      await deleteBenefitType(benefitTypeId)
      await fetchBenefitTypes()
    } catch (err) {
      console.error("Failed to delete benefit type:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete benefit type. Please try again."
      )
    }
  }

  const canManage = role === "admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 flex items-center gap-3">
              <FiGift className="w-8 h-8" />
              Benefit Types
            </h1>
            <p className="text-gray-300">
              {canManage
                ? "Manage benefit types. Only Admin can create, update, or delete benefit types."
                : "View benefit types. Only Admin can manage benefit types."}
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
              New Benefit Type
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

        {/* Benefit Types List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Benefit Types List</CardTitle>
            <CardDescription className="text-gray-400">
              {benefitTypes.length === 0
                ? "No benefit types available."
                : `Showing ${benefitTypes.length} benefit type${benefitTypes.length !== 1 ? "s" : ""}.`}
            </CardDescription>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-400">Loading benefit types...</p>
            </div>
          ) : benefitTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiGift className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-sm text-gray-400">No benefit types found.</p>
              {canManage && (
                <Button
                  variant="outline"
                  className="mt-4 border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => {
                    resetForm()
                    setIsFormOpen(true)
                  }}
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create First Benefit Type
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Name (Arabic)</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Description</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                    {canManage && (
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {benefitTypes.map((bt, index) => (
                    <tr
                      key={bt.id || bt.benefitTypeId || `benefit-type-${index}`}
                      className="hover:bg-gray-800/50 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-white">{bt.name || "-"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">{bt.nameAr || "-"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300 text-sm">
                          {bt.description ? (
                            bt.description.length > 50 ? (
                              <span title={bt.description}>
                                {bt.description.substring(0, 50)}...
                              </span>
                            ) : (
                              bt.description
                            )
                          ) : (
                            "-"
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bt.isActive !== false
                              ? "bg-green-900/50 text-green-400 border border-green-700"
                              : "bg-gray-700 text-gray-400 border border-gray-600"
                          }`}
                        >
                          {bt.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                              onClick={() => handleEdit(bt)}
                            >
                              <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDelete(bt.id || bt.benefitTypeId)}
                            >
                              <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      )}
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
            <CardTitle className="text-white">{selectedBenefitType ? "Edit Benefit Type" : "New Benefit Type"}</CardTitle>
            <CardDescription className="text-gray-400">
              {selectedBenefitType
                ? "Update the selected benefit type's information."
                : "Create a new benefit type record."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-gray-300">Name (English) *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Health Insurance"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nameAr" className="text-gray-300">Name (Arabic)</Label>
                  <Input
                    id="nameAr"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleChange}
                    placeholder="e.g., تأمين صحي"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-gray-300">Description (English)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the benefit type"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="descriptionAr" className="text-gray-300">Description (Arabic)</Label>
                  <Input
                    id="descriptionAr"
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleChange}
                    placeholder="وصف مختصر لنوع الم benefit"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-cyan-400 border-gray-600 rounded focus:ring-cyan-400 bg-gray-700"
                />
                <Label htmlFor="isActive" className="cursor-pointer text-gray-300">
                  Active (Benefit type is currently available)
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsFormOpen(false)
                  }}
                  disabled={isSubmitting}
                  className="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  {isSubmitting
                    ? "Saving..."
                    : selectedBenefitType
                    ? "Update Benefit Type"
                    : "Create Benefit Type"}
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

