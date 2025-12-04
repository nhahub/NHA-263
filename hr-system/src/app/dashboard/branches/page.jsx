"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllBranches,
  getBranchById,
  getBranchesByCompanyId,
  createBranch,
  updateBranch,
  deleteBranch,
  getAllCompanyProfiles,
} from "@/lib/api"

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [role, setRole] = useState("")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState("")
  const [formData, setFormData] = useState({
    companyId: "",
    code: "",
    nameEn: "",
    description: "",
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")
    }
    fetchCompanies()
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedCompanyFilter) {
      fetchBranchesByCompany(selectedCompanyFilter)
    } else {
      fetchBranches()
    }
  }, [selectedCompanyFilter])

  const fetchCompanies = async () => {
    try {
      const response = await getAllCompanyProfiles()
      setCompanies(response.data || [])
    } catch (err) {
      console.error("Error fetching companies:", err)
    }
  }

  const fetchBranches = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getAllBranches()
      setBranches(response.data || [])
    } catch (err) {
      console.error("Error fetching branches:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch branches"
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchBranchesByCompany = async (companyId) => {
    try {
      setLoading(true)
      setError("")
      const response = await getBranchesByCompanyId(companyId)
      setBranches(response.data || [])
    } catch (err) {
      console.error("Error fetching branches by company:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch branches"
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

    if (!formData.companyId) {
      errors.companyId = "Company is required"
    }

    if (!formData.code?.trim()) {
      errors.code = "Branch code is required"
    }

    if (!formData.nameEn?.trim()) {
      errors.nameEn = "Branch name is required"
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
      if (editingBranch) {
        // Update existing branch
        const updateData = {
          ...formData,
          branchId: editingBranch.branchId,
          companyId: parseInt(formData.companyId),
        }
        await updateBranch(editingBranch.branchId, updateData)
      } else {
        // Create new branch
        const createData = {
          ...formData,
          companyId: parseInt(formData.companyId),
        }
        await createBranch(createData)
      }

      // Reset form and close
      setFormData({
        companyId: "",
        code: "",
        nameEn: "",
        description: "",
      })
      setEditingBranch(null)
      setShowForm(false)
      setFormErrors({})
      
      // Refresh branches based on current filter
      if (selectedCompanyFilter) {
        fetchBranchesByCompany(selectedCompanyFilter)
      } else {
        fetchBranches()
      }
    } catch (err) {
      console.error("Error saving branch:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        `Failed to ${editingBranch ? "update" : "create"} branch`
      )
    }
  }

  const handleEdit = async (id) => {
    try {
      const response = await getBranchById(id)
      const branch = response.data
      setEditingBranch(branch)
      setFormData({
        companyId: branch.companyId?.toString() || "",
        code: branch.code || "",
        nameEn: branch.nameEn || "",
        description: branch.description || "",
      })
      setFormErrors({})
      setShowForm(true)
    } catch (err) {
      console.error("Error fetching branch:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch branch"
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this branch?")) {
      return
    }

    try {
      await deleteBranch(id)
      // Refresh branches based on current filter
      if (selectedCompanyFilter) {
        fetchBranchesByCompany(selectedCompanyFilter)
      } else {
        fetchBranches()
      }
    } catch (err) {
      console.error("Error deleting branch:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete branch"
      )
    }
  }

  const handleNew = () => {
    setEditingBranch(null)
    setFormData({
      companyId: selectedCompanyFilter || "",
      code: "",
      nameEn: "",
      description: "",
    })
    setFormErrors({})
    setError("")
    setShowForm(true)
  }

  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.companyProfileId === companyId)
    return company ? company.nameEn : `Company ID: ${companyId}`
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Company Branches</h1>
            <p className="text-gray-300">Manage company branch information</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              Create New Branch
            </Button>
          )}
        </div>

        {error && !showForm && (
          <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-700">
            {error}
          </div>
        )}

      {/* Company Filter */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="companyFilter" className="whitespace-nowrap text-gray-300">
              Filter by Company:
            </Label>
            <select
              id="companyFilter"
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 max-w-xs"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.companyProfileId} value={company.companyProfileId}>
                  {company.nameEn}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{editingBranch ? "Edit Branch" : "Create Branch"}</CardTitle>
            <CardDescription className="text-gray-400">
              {editingBranch
                ? "Update the branch information"
                : "Enter the branch information"}
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
                  <Label htmlFor="companyId" className="text-gray-300">
                    Company <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingBranch}
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.companyProfileId} value={company.companyProfileId}>
                        {company.nameEn}
                      </option>
                    ))}
                  </select>
                  {formErrors.companyId && (
                    <p className="text-sm text-red-400">{formErrors.companyId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-300">
                    Branch Code <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="BR004"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.code && (
                    <p className="text-sm text-red-400">{formErrors.code}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nameEn" className="text-gray-300">
                    Branch Name (English) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    required
                    placeholder="New Cairo Branch"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.nameEn && (
                    <p className="text-sm text-red-400">{formErrors.nameEn}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="New branch in New Cairo"
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
                    setEditingBranch(null)
                    setFormErrors({})
                    setError("")
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {editingBranch ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Branches List</CardTitle>
          <CardDescription className="text-gray-400">
            {branches.length} branch{branches.length !== 1 ? "es" : ""} found
            {selectedCompanyFilter && ` for ${getCompanyName(parseInt(selectedCompanyFilter))}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-400">Loading...</p>
          ) : branches.length === 0 ? (
            <p className="text-center py-8 text-gray-400">
              No branches found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 font-semibold text-gray-300">ID</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Code</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Branch Name</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Company</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Description</th>
                    {isAdmin && <th className="text-left p-3 font-semibold text-gray-300">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.branchId} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 text-gray-300">{branch.branchId}</td>
                      <td className="p-3 font-medium text-white">{branch.code}</td>
                      <td className="p-3 text-gray-300">{branch.nameEn}</td>
                      <td className="p-3 text-gray-300">{getCompanyName(branch.companyId)}</td>
                      <td className="p-3 text-gray-300">{branch.description || "-"}</td>
                      {isAdmin && (
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(branch.branchId)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(branch.branchId)}
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

