"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiTag } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllPermissionTypes,
  createPermissionType,
  updatePermissionType,
  deletePermissionType,
} from "@/lib/api"

export default function PermissionTypesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({
    permission_type_name: "",
    monthly_limit_in_hours: "",
    is_deductible: false,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view permission types
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchTypes()
    }
  }, [router])

  const fetchTypes = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllPermissionTypes()
      setTypes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch permission types:", err)
      setError("Failed to load permission types. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      permission_type_name: "",
      monthly_limit_in_hours: "",
      is_deductible: false,
    })
    setSelectedType(null)
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
    setError("")

    // Validate required fields
    if (!formData.permission_type_name || !formData.permission_type_name.trim()) {
      setError("Permission type name is required.")
      return
    }

    if (formData.monthly_limit_in_hours === "" || isNaN(parseInt(formData.monthly_limit_in_hours)) || parseInt(formData.monthly_limit_in_hours) < 0) {
      setError("Monthly limit in hours must be a valid non-negative number.")
      return
    }

    try {
      const typeData = {
        permission_type_name: formData.permission_type_name.trim(),
        monthly_limit_in_hours: parseInt(formData.monthly_limit_in_hours) || 0,
        is_deductible: formData.is_deductible,
      }

      if (selectedType) {
        // Update existing type
        await updatePermissionType(
          selectedType.id || selectedType.permissionTypeId || selectedType.permission_type_id,
          typeData
        )
      } else {
        // Create new type
        await createPermissionType(typeData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchTypes()
    } catch (err) {
      console.error("Failed to save permission type:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save permission type. Please check the data and try again."
      
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

  const handleEdit = (type) => {
    setSelectedType(type)
    setIsFormOpen(true)
    
    setFormData({
      permission_type_name: type.permission_type_name || "",
      monthly_limit_in_hours: type.monthly_limit_in_hours?.toString() || "0",
      is_deductible: type.is_deductible || false,
    })
  }

  const handleDelete = async (typeId) => {
    if (!confirm("Are you sure you want to delete this permission type?")) return

    try {
      await deletePermissionType(typeId)
      await fetchTypes()
    } catch (err) {
      console.error("Failed to delete permission type:", err)
      setError("Failed to delete permission type. Please try again.")
    }
  }

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
              <FiTag className="w-6 h-6" />
              Permission Types
            </h1>
            <p className="text-sm text-gray-400">
              Manage permission and leave types with their rules. Admin and HR can create, update, or delete types.
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
              New Type
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

        {/* Types List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Types List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all type details including rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading types...</p>
              </div>
            ) : types.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">No permission types found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Type Name</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Monthly Limit (Hours)</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Deductible</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {types.map((type, index) => {
                      const typeId = type.id || type.permissionTypeId || type.permission_type_id
                      return (
                        <tr
                          key={typeId || `type-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {typeId || "-"}
                          </td>
                          <td className="py-2 px-4">
                            <div className="font-medium text-white">
                              {type.permission_type_name || "-"}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {type.monthly_limit_in_hours ?? "-"}
                          </td>
                          <td className="py-2 px-4">
                            {type.is_deductible ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {typeId ? (
                                <>
                                  <Link
                                    href={`/dashboard/permission-types/${typeId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all type details including rules"
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
                                        onClick={() => handleEdit(type)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => handleDelete(typeId)}
                                      >
                                        <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                      </Button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-500 text-xs">No ID</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
                {selectedType ? "Edit Permission Type" : "New Permission Type"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedType
                  ? "Update the selected permission type's information and rules."
                  : "Create a new permission or leave type with rules."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="permission_type_name" className="text-gray-300">
                      Permission Type Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="permission_type_name"
                      name="permission_type_name"
                      value={formData.permission_type_name}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Annual Leave, Sick Leave, Emergency"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="monthly_limit_in_hours" className="text-gray-300">
                      Monthly Limit (Hours) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="monthly_limit_in_hours"
                      name="monthly_limit_in_hours"
                      type="number"
                      min="0"
                      value={formData.monthly_limit_in_hours}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum hours allowed per month for this type</p>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_deductible"
                        name="is_deductible"
                        checked={formData.is_deductible}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-gray-800"
                      />
                      <Label htmlFor="is_deductible" className="text-gray-300 cursor-pointer">
                        Is Deductible
                      </Label>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      If checked, this permission type will be deducted from the employee's balance
                    </p>
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
                    {selectedType ? "Update Type" : "Create Type"}
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

