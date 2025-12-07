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
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "@/lib/api"

export default function LeaveTypesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    isPaid: false,
    requiresMedicalNote: false,
    isDeductFromBalance: false,
    maxDaysPerYear: "",
    description: "",
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

      // Only Admin and HR can view leave types
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
      const { data } = await getAllLeaveTypes()
      setTypes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch leave types:", err)
      setError("Failed to load leave types. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      isPaid: false,
      requiresMedicalNote: false,
      isDeductFromBalance: false,
      maxDaysPerYear: "",
      description: "",
      isActive: true,
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
    if (!formData.name || !formData.name.trim()) {
      setError("Leave type name is required.")
      return
    }

    if (formData.maxDaysPerYear !== "" && (isNaN(parseInt(formData.maxDaysPerYear)) || parseInt(formData.maxDaysPerYear) < 0)) {
      setError("Max days per year must be a valid non-negative number.")
      return
    }

    try {
      const typeData = {
        name: formData.name.trim(),
        isPaid: formData.isPaid,
        requiresMedicalNote: formData.requiresMedicalNote,
        isDeductFromBalance: formData.isDeductFromBalance,
        maxDaysPerYear: formData.maxDaysPerYear ? parseInt(formData.maxDaysPerYear) : 0,
        description: formData.description?.trim() || "",
        isActive: formData.isActive,
      }

      if (selectedType) {
        // Update existing type
        const updateData = {
          leaveTypeId: selectedType.leaveTypeId || selectedType.id || selectedType.leaveTypeID,
          ...typeData,
        }
        await updateLeaveType(
          selectedType.leaveTypeId || selectedType.id || selectedType.leaveTypeID,
          updateData
        )
      } else {
        // Create new type
        await createLeaveType(typeData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchTypes()
    } catch (err) {
      console.error("Failed to save leave type:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save leave type. Please check the data and try again."
      
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
      name: type.name || "",
      isPaid: type.isPaid || false,
      requiresMedicalNote: type.requiresMedicalNote || false,
      isDeductFromBalance: type.isDeductFromBalance || false,
      maxDaysPerYear: type.maxDaysPerYear?.toString() || "0",
      description: type.description || "",
      isActive: type.isActive !== undefined ? type.isActive : true,
    })
  }

  const handleDelete = async (typeId) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return

    try {
      await deleteLeaveType(typeId)
      await fetchTypes()
    } catch (err) {
      console.error("Failed to delete leave type:", err)
      setError("Failed to delete leave type. Please try again.")
    }
  }

  const canView = role === "admin" || role === "HR"
  const canManage = role === "admin"

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
              <FiCalendar className="w-6 h-6" />
              Leave Types
            </h1>
            <p className="text-sm text-gray-400">
              Manage leave types and their rules. Only Admin can create, update, or delete types.
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
            <CardTitle className="text-white text-lg">Leave Types List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all type details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading leave types...</p>
              </div>
            ) : types.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">No leave types found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Max Days/Year</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {types.map((type, index) => {
                      const typeId = type.leaveTypeId || type.id || type.leaveTypeID
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
                              {type.name || "-"}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {type.maxDaysPerYear ?? "-"}
                          </td>
                          <td className="py-2 px-4">
                            {type.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {typeId ? (
                                <>
                                  <Link
                                    href={`/dashboard/leave-types/${typeId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all type details"
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
                {selectedType ? "Edit Leave Type" : "New Leave Type"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedType
                  ? "Update the leave type's information and rules."
                  : "Create a new leave type with rules and settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="e.g., Annual Leave, Sick Leave, Maternity"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="maxDaysPerYear" className="text-gray-300">Max Days Per Year</Label>
                    <Input
                      id="maxDaysPerYear"
                      name="maxDaysPerYear"
                      type="number"
                      min="0"
                      value={formData.maxDaysPerYear}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Leave type description"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPaid"
                        name="isPaid"
                        checked={formData.isPaid}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-gray-800"
                      />
                      <Label htmlFor="isPaid" className="text-gray-300 cursor-pointer">
                        Is Paid Leave
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresMedicalNote"
                        name="requiresMedicalNote"
                        checked={formData.requiresMedicalNote}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-gray-800"
                      />
                      <Label htmlFor="requiresMedicalNote" className="text-gray-300 cursor-pointer">
                        Requires Medical Note
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDeductFromBalance"
                        name="isDeductFromBalance"
                        checked={formData.isDeductFromBalance}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-gray-800"
                      />
                      <Label htmlFor="isDeductFromBalance" className="text-gray-300 cursor-pointer">
                        Deduct From Balance
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-gray-800"
                      />
                      <Label htmlFor="isActive" className="text-gray-300 cursor-pointer">
                        Is Active
                      </Label>
                    </div>
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

