"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllHRDepartments,
  getHRDepartmentsByBranchId,
  createHRDepartment,
  updateHRDepartment,
  deleteHRDepartment,
  getAllBranches,
} from "@/lib/api"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [role, setRole] = useState("")
  const [userId, setUserId] = useState("")
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("")
  const [formData, setFormData] = useState({
    branchId: "",
    nameEn: "",
    nameAr: "",
    location: "",
    description: "",
    managerId: "",
    createdBy: "",
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const user = localStorage.getItem("userId")
      setRole(userRole || "")
      setUserId(user || "")
    }
    fetchBranches()
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (selectedBranchFilter) {
      fetchDepartmentsByBranch(selectedBranchFilter)
    } else {
      fetchDepartments()
    }
  }, [selectedBranchFilter])

  const fetchBranches = async () => {
    try {
      const response = await getAllBranches()
      setBranches(response.data || [])
    } catch (err) {
      console.error("Error fetching branches:", err)
    }
  }

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getAllHRDepartments()
      setDepartments(response.data || [])
    } catch (err) {
      console.error("Error fetching departments:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch departments"
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartmentsByBranch = async (branchId) => {
    try {
      setLoading(true)
      setError("")
      const response = await getHRDepartmentsByBranchId(branchId)
      setDepartments(response.data || [])
    } catch (err) {
      console.error("Error fetching departments by branch:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch departments"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.branchId) {
      errors.branchId = "Branch is required"
    }

    if (!formData.nameEn?.trim()) {
      errors.nameEn = "English name is required"
    }

    if (!formData.nameAr?.trim()) {
      errors.nameAr = "Arabic name is required"
    }

    if (formData.managerId && isNaN(parseInt(formData.managerId))) {
      errors.managerId = "Manager ID must be a valid number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setError("")
      const submitData = {
        branchId: parseInt(formData.branchId),
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        location: formData.location?.trim() || "",
        description: formData.description?.trim() || "",
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
        createdBy: parseInt(userId) || parseInt(formData.createdBy) || null,
      }

      if (editingDepartment) {
        // Update existing department
        const updateData = {
          ...submitData,
          departmentId: editingDepartment.departmentId,
        }
        await updateHRDepartment(editingDepartment.departmentId, updateData)
      } else {
        // Create new department
        await createHRDepartment(submitData)
      }

      // Reset form and close
      setFormData({
        branchId: "",
        nameEn: "",
        nameAr: "",
        location: "",
        description: "",
        managerId: "",
        createdBy: "",
      })
      setEditingDepartment(null)
      setShowForm(false)
      setFormErrors({})
      
      // Refresh departments based on current filter
      if (selectedBranchFilter) {
        fetchDepartmentsByBranch(selectedBranchFilter)
      } else {
        fetchDepartments()
      }
    } catch (err) {
      console.error("Error saving department:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        `Failed to ${editingDepartment ? "update" : "create"} department`
      )
    }
  }

  const handleEdit = async (id) => {
    try {
      // Note: We need to get department by ID, but the API might not have this endpoint
      // For now, we'll find it from the list
      const department = departments.find((d) => d.departmentId === id)
      if (department) {
        setEditingDepartment(department)
        setFormData({
          branchId: department.branchId?.toString() || "",
          nameEn: department.nameEn || "",
          nameAr: department.nameAr || "",
          location: department.location || "",
          description: department.description || "",
          managerId: department.managerId?.toString() || "",
          createdBy: department.createdBy?.toString() || userId || "",
        })
        setFormErrors({})
        setShowForm(true)
      }
    } catch (err) {
      console.error("Error fetching department:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch department"
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return
    }

    try {
      await deleteHRDepartment(id)
      // Refresh departments based on current filter
      if (selectedBranchFilter) {
        fetchDepartmentsByBranch(selectedBranchFilter)
      } else {
        fetchDepartments()
      }
    } catch (err) {
      console.error("Error deleting department:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete department"
      )
    }
  }

  const handleNew = () => {
    setEditingDepartment(null)
    setFormData({
      branchId: selectedBranchFilter || "",
      nameEn: "",
      nameAr: "",
      location: "",
      description: "",
      managerId: "",
      createdBy: userId || "",
    })
    setFormErrors({})
    setError("")
    setShowForm(true)
  }

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.branchId === branchId)
    return branch ? `${branch.code} - ${branch.nameEn}` : `Branch ID: ${branchId}`
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-red-400 font-medium">
                You dont have permission to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">HR Departments</h1>
            <p className="text-gray-300">Manage HR department information</p>
          </div>
        {isAdmin && (
          <Button
            onClick={handleNew}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            Create New Department
          </Button>
        )}
      </div>

      {error && !showForm && (
        <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-700">
          {error}
        </div>
      )}

      {/* Branch Filter */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="branchFilter" className="whitespace-nowrap text-gray-300">
              Filter by Branch:
            </Label>
            <select
              id="branchFilter"
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 max-w-xs"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.code} - {branch.nameEn}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingDepartment ? "Edit Department" : "Create Department"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {editingDepartment
                ? "Update the department information"
                : "Enter the department information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchId" className="text-gray-300">
                    Branch <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="branchId"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingDepartment}
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.code} - {branch.nameEn}
                      </option>
                    ))}
                  </select>
                  {formErrors.branchId && (
                    <p className="text-sm text-red-400">{formErrors.branchId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerId" className="text-gray-300">Manager ID</Label>
                  <Input
                    id="managerId"
                    name="managerId"
                    type="number"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.managerId && (
                    <p className="text-sm text-red-400">{formErrors.managerId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameEn" className="text-gray-300">
                    Name (English) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    required
                    placeholder="Training"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.nameEn && (
                    <p className="text-sm text-red-400">{formErrors.nameEn}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameAr" className="text-gray-300">
                    Name (Arabic) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nameAr"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    required
                    placeholder="التدريب"
                    dir="rtl"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.nameAr && (
                    <p className="text-sm text-red-400">{formErrors.nameAr}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Main Office"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createdBy" className="text-gray-300">Created By (User ID)</Label>
                  <Input
                    id="createdBy"
                    name="createdBy"
                    type="number"
                    value={formData.createdBy}
                    onChange={handleInputChange}
                    placeholder={userId || "1"}
                    disabled={!!userId}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Handles employee training"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingDepartment(null)
                    setFormErrors({})
                    setError("")
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {editingDepartment ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Departments List</CardTitle>
          <CardDescription className="text-gray-400">
            {departments.length} department{departments.length !== 1 ? "s" : ""} found
            {selectedBranchFilter &&
              ` for ${getBranchName(parseInt(selectedBranchFilter))}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-400">Loading...</p>
          ) : departments.length === 0 ? (
            <p className="text-center py-8 text-gray-400">
              No departments found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 font-semibold text-gray-300">ID</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Name (EN)</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Name (AR)</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Branch</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Location</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Manager ID</th>
                    {isAdmin && <th className="text-left p-3 font-semibold text-gray-300">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr
                      key={dept.departmentId}
                      className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-3 text-gray-300">{dept.departmentId}</td>
                      <td className="p-3 font-medium text-white">{dept.nameEn}</td>
                      <td className="p-3 text-gray-300" dir="rtl">{dept.nameAr}</td>
                      <td className="p-3 text-gray-300">{getBranchName(dept.branchId)}</td>
                      <td className="p-3 text-gray-300">{dept.location || "-"}</td>
                      <td className="p-3 text-gray-300">{dept.managerId || "-"}</td>
                      {isAdmin && (
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(dept.departmentId)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(dept.departmentId)}
                            >
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
      </div>
    </div>
  )
}

