"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFile } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllCVs,
  createCV,
  updateCV,
  deleteCV,
} from "@/lib/api"

export default function CVBankPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCV, setSelectedCV] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    cV_File: "",
    addedDate: "",
    notes: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view CVs
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchCVs()
    }
  }, [router])

  const fetchCVs = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllCVs()
      setCvs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch CVs:", err)
      setError("Failed to load CVs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      cV_File: "",
      addedDate: "",
      notes: "",
    })
    setSelectedCV(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.fullName || !formData.fullName.trim()) {
      setError("Full name is required.")
      return
    }

    if (!formData.email || !formData.email.trim()) {
      setError("Email is required.")
      return
    }

    if (!formData.addedDate) {
      setError("Added date is required.")
      return
    }

    try {
      const cvData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || "",
        cV_File: formData.cV_File?.trim() || "",
        addedDate: new Date(formData.addedDate).toISOString(),
        notes: formData.notes?.trim() || "",
      }

      if (selectedCV) {
        // Update existing CV
        const updateData = {
          cV_ID: selectedCV.cV_ID || selectedCV.id,
          ...cvData,
        }
        await updateCV(
          selectedCV.cV_ID || selectedCV.id,
          updateData
        )
      } else {
        // Create new CV
        await createCV(cvData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchCVs()
    } catch (err) {
      console.error("Failed to save CV:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save CV. Please check the data and try again."
      
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

  const handleEdit = (cv) => {
    setSelectedCV(cv)
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
      fullName: cv.fullName || "",
      email: cv.email || "",
      phoneNumber: cv.phoneNumber || "",
      cV_File: cv.cV_File || "",
      addedDate: formatDateForInput(cv.addedDate),
      notes: cv.notes || "",
    })
  }

  const handleDelete = async (cvId) => {
    if (!confirm("Are you sure you want to delete this CV?")) return

    try {
      await deleteCV(cvId)
      await fetchCVs()
    } catch (err) {
      console.error("Failed to delete CV:", err)
      setError("Failed to delete CV. Please try again.")
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
              <FiFile className="w-8 h-8" />
              CV Bank
            </h1>
            <p className="text-gray-300">
              Manage CVs and resumes. Admin and HR can create, update, or delete CVs.
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
              New CV
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

        {/* CVs List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">CVs List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all CV details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading CVs...</p>
              </div>
            ) : cvs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No CVs found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Full Name</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Phone</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Added Date</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {cvs.map((cv, index) => (
                      <tr
                        key={cv.cV_ID || cv.id || `cv-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {cv.cV_ID || cv.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {cv.fullName || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {cv.email || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {cv.phoneNumber || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {cv.addedDate
                            ? new Date(cv.addedDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const cvId = cv.cV_ID || cv.id
                              
                              if (!cvId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/cv-bank/${cvId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all CV details"
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
                                        onClick={() => handleEdit(cv)}
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
                                      onClick={() => handleDelete(cvId)}
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
                {selectedCV ? "Edit CV" : "New CV"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedCV
                  ? "Update the selected CV's information."
                  : "Add a new CV to the bank."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-gray-300">
                      Full Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-gray-300">
                      Email <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="addedDate" className="text-gray-300">
                      Added Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="addedDate"
                      name="addedDate"
                      type="date"
                      value={formData.addedDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="cV_File" className="text-gray-300">CV File Path</Label>
                    <Input
                      id="cV_File"
                      name="cV_File"
                      value={formData.cV_File}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Enter CV file path or URL"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter any additional notes or comments"
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
                    {selectedCV ? "Update CV" : "Create CV"}
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

