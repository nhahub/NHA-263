"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiGlobe } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllRecruitmentPortals,
  createRecruitmentPortal,
  updateRecruitmentPortal,
  deleteRecruitmentPortal,
} from "@/lib/api"

export default function RecruitmentPortalsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [portals, setPortals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPortal, setSelectedPortal] = useState(null)
  const [formData, setFormData] = useState({
    hrNeedID: "",
    publishDate: "",
    expiryDate: "",
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

      // Only Admin and HR can view portals
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchPortals()
    }
  }, [router])

  const fetchPortals = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllRecruitmentPortals()
      setPortals(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch portals:", err)
      setError("Failed to load recruitment portals. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      hrNeedID: "",
      publishDate: "",
      expiryDate: "",
      notes: "",
    })
    setSelectedPortal(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.hrNeedID || isNaN(parseInt(formData.hrNeedID))) {
      setError("HR Need ID must be a valid number.")
      return
    }

    if (!formData.publishDate) {
      setError("Publish date is required.")
      return
    }

    if (!formData.expiryDate) {
      setError("Expiry date is required.")
      return
    }

    // Validate dates
    const publishDate = new Date(formData.publishDate)
    const expiryDate = new Date(formData.expiryDate)
    if (expiryDate < publishDate) {
      setError("Expiry date must be after publish date.")
      return
    }

    try {
      const portalData = {
        hrNeedID: parseInt(formData.hrNeedID),
        publishDate: new Date(formData.publishDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        notes: formData.notes?.trim() || "",
      }

      if (selectedPortal) {
        // Update existing portal
        const updateData = {
          portalID: selectedPortal.portalID || selectedPortal.id,
          ...portalData,
        }
        await updateRecruitmentPortal(
          selectedPortal.portalID || selectedPortal.id,
          updateData
        )
      } else {
        // Create new portal
        await createRecruitmentPortal(portalData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchPortals()
    } catch (err) {
      console.error("Failed to save portal:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save recruitment portal. Please check the data and try again."
      
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

  const handleEdit = (portal) => {
    setSelectedPortal(portal)
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
      hrNeedID: portal.hrNeedID?.toString() || "",
      publishDate: formatDateForInput(portal.publishDate),
      expiryDate: formatDateForInput(portal.expiryDate),
      notes: portal.notes || "",
    })
  }

  const handleDelete = async (portalId) => {
    if (!confirm("Are you sure you want to delete this recruitment portal?")) return

    try {
      await deleteRecruitmentPortal(portalId)
      await fetchPortals()
    } catch (err) {
      console.error("Failed to delete portal:", err)
      setError("Failed to delete recruitment portal. Please try again.")
    }
  }

  const getStatusBadge = (expiryDate) => {
    if (!expiryDate) return null
    
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)
    
    if (expiry < today) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
          Expired
        </span>
      )
    } else if (expiry.getTime() === today.getTime()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
          Expires Today
        </span>
      )
    } else {
      const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 7) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400 border border-orange-700">
            Expires Soon ({daysUntilExpiry} days)
          </span>
        )
      }
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          Active
        </span>
      )
    }
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"
  const canManage = role === "admin" // Only Admin can create, update, or delete

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
              <FiGlobe className="w-8 h-8" />
              Recruitment Portals
            </h1>
            <p className="text-gray-300">
              {canManage
                ? "Manage recruitment portals and job boards. Only Admin can create, update, or delete portals."
                : "View recruitment portals and job boards. Only Admin can manage portals."}
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
              New Portal
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

        {/* Portals List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Portals List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all portal details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading portals...</p>
              </div>
            ) : portals.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No portals found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">HR Need ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Publish Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Expiry Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {portals.map((portal, index) => (
                      <tr
                        key={portal.portalID || portal.id || `portal-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {portal.portalID || portal.id || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {portal.hrNeedID || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {portal.publishDate
                            ? new Date(portal.publishDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {portal.expiryDate
                            ? new Date(portal.expiryDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(portal.expiryDate)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const portalId = portal.portalID || portal.id
                              
                              if (!portalId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/recruitment-portals/${portalId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all portal details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {isAdmin && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                        onClick={() => handleEdit(portal)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => handleDelete(portalId)}
                                      >
                                        <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                      </Button>
                                    </>
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
                {selectedPortal ? "Edit Portal" : "New Portal"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedPortal
                  ? "Update the selected portal's information. Only Admin can update portals."
                  : "Create a new recruitment portal."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="hrNeedID" className="text-gray-300">
                    HR Need ID <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="hrNeedID"
                    name="hrNeedID"
                    type="number"
                    min="0"
                    value={formData.hrNeedID}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Enter HR Need ID"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="publishDate" className="text-gray-300">
                      Publish Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="publishDate"
                      name="publishDate"
                      type="date"
                      value={formData.publishDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="expiryDate" className="text-gray-300">
                      Expiry Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                      min={formData.publishDate}
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter any additional notes or comments"
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
                    {selectedPortal ? "Update Portal" : "Create Portal"}
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

