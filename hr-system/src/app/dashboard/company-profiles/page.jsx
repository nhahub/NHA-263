"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllCompanyProfiles,
  getCompanyProfileById,
  createCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
} from "@/lib/api"

export default function CompanyProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [role, setRole] = useState("")
  const [formData, setFormData] = useState({
    nameEn: "",
    insuranceNumber: "",
    taxNumber: "",
    phoneNumber: "",
    faxNumber: "",
    email: "",
    webSite: "",
    address: "",
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")
    }
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getAllCompanyProfiles()
      setProfiles(response.data || [])
    } catch (err) {
      console.error("Error fetching company profiles:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch company profiles"
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

    if (!formData.nameEn.trim()) {
      errors.nameEn = "Company name is required"
    } else if (formData.nameEn.length > 150) {
      errors.nameEn = "Company name must be 150 characters or less"
    }

    if (formData.insuranceNumber && !/^\d{10}$/.test(formData.insuranceNumber)) {
      errors.insuranceNumber = "Insurance number must be exactly 10 digits"
    }

    if (!formData.taxNumber.trim()) {
      errors.taxNumber = "Tax number is required"
    } else if (formData.taxNumber.length > 15) {
      errors.taxNumber = "Tax number must be 15 characters or less"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    if (formData.phoneNumber && !/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/[\s-]/g, ""))) {
      errors.phoneNumber = "Invalid phone number format"
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
      if (editingProfile) {
        // Update existing profile
        const updateData = {
          ...formData,
          companyProfileId: editingProfile.companyProfileId,
        }
        await updateCompanyProfile(editingProfile.companyProfileId, updateData)
      } else {
        // Create new profile
        await createCompanyProfile(formData)
      }

      // Reset form and close
      setFormData({
        nameEn: "",
        insuranceNumber: "",
        taxNumber: "",
        phoneNumber: "",
        faxNumber: "",
        email: "",
        webSite: "",
        address: "",
      })
      setEditingProfile(null)
      setShowForm(false)
      setFormErrors({})
      fetchProfiles()
    } catch (err) {
      console.error("Error saving company profile:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        `Failed to ${editingProfile ? "update" : "create"} company profile`
      )
    }
  }

  const handleEdit = async (id) => {
    try {
      const response = await getCompanyProfileById(id)
      const profile = response.data
      setEditingProfile(profile)
      setFormData({
        nameEn: profile.nameEn || "",
        insuranceNumber: profile.insuranceNumber || "",
        taxNumber: profile.taxNumber || "",
        phoneNumber: profile.phoneNumber || "",
        faxNumber: profile.faxNumber || "",
        email: profile.email || "",
        webSite: profile.webSite || "",
        address: profile.address || "",
      })
      setFormErrors({})
      setShowForm(true)
    } catch (err) {
      console.error("Error fetching company profile:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch company profile"
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this company profile?")) {
      return
    }

    try {
      await deleteCompanyProfile(id)
      fetchProfiles()
    } catch (err) {
      console.error("Error deleting company profile:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete company profile"
      )
    }
  }

  const handleNew = () => {
    setEditingProfile(null)
    setFormData({
      nameEn: "",
      insuranceNumber: "",
      taxNumber: "",
      phoneNumber: "",
      faxNumber: "",
      email: "",
      webSite: "",
      address: "",
    })
    setFormErrors({})
    setError("")
    setShowForm(true)
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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Company Profiles</h1>
            <p className="text-gray-300">Manage company profile information</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              Create New Profile
            </Button>
          )}
        </div>

        {error && !showForm && (
          <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{editingProfile ? "Edit Company Profile" : "Create Company Profile"}</CardTitle>
            <CardDescription className="text-gray-400">
              {editingProfile
                ? "Update the company profile information"
                : "Enter the company profile information"}
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
                  <Label htmlFor="nameEn" className="text-gray-300">
                    Company Name (English) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    required
                    maxLength={150}
                    placeholder="TechCorp Ltd"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.nameEn && (
                    <p className="text-sm text-red-400">{formErrors.nameEn}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxNumber" className="text-gray-300">
                    Tax Number <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="taxNumber"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    required
                    maxLength={15}
                    placeholder="TX987654"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.taxNumber && (
                    <p className="text-sm text-red-400">{formErrors.taxNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceNumber" className="text-gray-300">Insurance Number</Label>
                  <Input
                    id="insuranceNumber"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="1234567890"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.insuranceNumber && (
                    <p className="text-sm text-red-400">{formErrors.insuranceNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+201234567890"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-sm text-red-400">{formErrors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faxNumber" className="text-gray-300">Fax Number</Label>
                  <Input
                    id="faxNumber"
                    name="faxNumber"
                    value={formData.faxNumber}
                    onChange={handleInputChange}
                    placeholder="0201234567"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="info@techcorp.com"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-400">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webSite" className="text-gray-300">Website</Label>
                  <Input
                    id="webSite"
                    name="webSite"
                    type="url"
                    value={formData.webSite}
                    onChange={handleInputChange}
                    placeholder="https://techcorp.com"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-gray-300">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Cairo, Egypt"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProfile(null)
                    setFormErrors({})
                    setError("")
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {editingProfile ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Company Profiles List</CardTitle>
          <CardDescription className="text-gray-400">
            {profiles.length} company profile{profiles.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-400">Loading...</p>
          ) : profiles.length === 0 ? (
            <p className="text-center py-8 text-gray-400">
              No company profiles found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 font-semibold text-gray-300">ID</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Company Name</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Tax Number</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Email</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Phone</th>
                    <th className="text-left p-3 font-semibold text-gray-300">Address</th>
                    {isAdmin && <th className="text-left p-3 font-semibold text-gray-300">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.companyProfileId} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 text-gray-300">{profile.companyProfileId}</td>
                      <td className="p-3 font-medium text-white">{profile.nameEn}</td>
                      <td className="p-3 text-gray-300">{profile.taxNumber}</td>
                      <td className="p-3 text-gray-300">{profile.email || "-"}</td>
                      <td className="p-3 text-gray-300">{profile.phoneNumber || "-"}</td>
                      <td className="p-3 text-gray-300">{profile.address || "-"}</td>
                      {isAdmin && (
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(profile.companyProfileId)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(profile.companyProfileId)}
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

