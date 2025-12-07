"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiPackage } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAssetById,
  getAssetsByEmployeeId,
  getMyAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getAllEmployees,
} from "@/lib/api"

// Note: There's no GET all endpoint for AssetManagement
// Admin/HR can view assets by employee ID using getAssetsByEmployeeId

export default function AssetManagementPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("") // For Admin/HR to view assets by employee
  const [formData, setFormData] = useState({
    assetName: "",
    serialNumber: "",
    assignedTo: "",
    assignedDate: "",
    returnDate: "",
    status: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const isEmployee = role === "Employee"
      
      // Employees fetch their own assets using GET /api/AssetManagement/my-assets
      if (isEmployee) {
        const [assetsRes, employeesRes] = await Promise.allSettled([
          getMyAssets(),
          getAllEmployees(),
        ])
        
        if (assetsRes.status === "fulfilled") {
          const responseData = assetsRes.value
          console.log("My Assets API Response:", responseData)
          
          // Handle different response structures
          let assetsData = []
          if (Array.isArray(responseData.data)) {
            assetsData = responseData.data
          } else if (Array.isArray(responseData)) {
            assetsData = responseData
          } else if (responseData?.data && Array.isArray(responseData.data)) {
            assetsData = responseData.data
          } else if (responseData?.result && Array.isArray(responseData.result)) {
            assetsData = responseData.result
          }
          
          console.log("Extracted Assets Data:", assetsData)
          setAssets(assetsData)
        } else {
          console.error("Failed to fetch my assets:", assetsRes.reason)
          const errorMsg = assetsRes.reason?.response?.data?.message || 
                          assetsRes.reason?.message || 
                          "Failed to load your assets. Please try again."
          setError(errorMsg)
          setAssets([])
        }

        if (employeesRes.status === "fulfilled") {
          setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        } else {
          console.warn("Failed to fetch employees:", employeesRes.reason)
          setEmployees([])
        }
      } else {
        // Admin/HR: Fetch employees list, assets will be loaded when employee is selected
        try {
          const { data } = await getAllEmployees()
          setEmployees(Array.isArray(data) ? data : [])
        } catch (err) {
          console.warn("Failed to fetch employees:", err)
          setEmployees([])
        }
        setAssets([]) // Start with empty list
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
      assetName: "",
      serialNumber: "",
      assignedTo: "",
      assignedDate: "",
      returnDate: "",
      status: "",
    })
    setSelectedAsset(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.assetName || !formData.assetName.trim()) {
      setError("Asset name is required.")
      return
    }

    if (!formData.assignedTo || isNaN(parseInt(formData.assignedTo))) {
      setError("Employee must be selected.")
      return
    }

    if (!formData.assignedDate) {
      setError("Assigned date is required.")
      return
    }

    try {
      const assetData = {
        assetName: formData.assetName.trim(),
        serialNumber: formData.serialNumber?.trim() || "",
        assignedTo: parseInt(formData.assignedTo),
        assignedDate: new Date(formData.assignedDate).toISOString(),
        returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : null,
        status: formData.status?.trim() || "",
      }

      if (selectedAsset) {
        // Update existing asset
        await updateAsset(
          selectedAsset.id || selectedAsset.assetID || selectedAsset.assetId,
          assetData
        )
      } else {
        // Create new asset
        await createAsset(assetData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save asset:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save asset. Please check the data and try again."
      
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

  const handleEdit = (asset) => {
    setSelectedAsset(asset)
    setIsFormOpen(true)
    
    // Format dates for input fields
    const assignedDate = asset.assignedDate
      ? new Date(asset.assignedDate).toISOString().slice(0, 16)
      : ""
    const returnDate = asset.returnDate
      ? new Date(asset.returnDate).toISOString().slice(0, 16)
      : ""
    
    setFormData({
      assetName: asset.assetName || "",
      serialNumber: asset.serialNumber || "",
      assignedTo: asset.assignedTo?.toString() || asset.assignedToId?.toString() || "",
      assignedDate: assignedDate,
      returnDate: returnDate,
      status: asset.status || "",
    })
  }

  const handleDelete = async (assetId) => {
    if (!confirm("Are you sure you want to delete this asset record?")) return

    try {
      await deleteAsset(assetId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete asset:", err)
      setError("Failed to delete asset. Please try again.")
    }
  }

  const handleViewByEmployee = async () => {
    if (!selectedEmployeeId || isNaN(parseInt(selectedEmployeeId))) {
      setError("Please select an employee to view their assets.")
      return
    }

    try {
      setLoading(true)
      setError("")
      const { data } = await getAssetsByEmployeeId(parseInt(selectedEmployeeId))
      setAssets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch assets by employee:", err)
      setError("Failed to load assets for this employee. Please try again.")
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeName = (employeeID) => {
    const employee = employees.find(
      (emp) => emp.id === employeeID || emp.employeeId === employeeID
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || employee.email || `Employee #${employeeID}`
    }
    return `Employee #${employeeID}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("assigned") || statusLower.includes("active")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("returned") || statusLower.includes("completed")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("lost") || statusLower.includes("damaged")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-700">
          {status}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
          {status}
        </span>
      )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const canView = role === "admin" || role === "HR" || role === "Employee"
  const canManage = role === "admin"
  const isAdmin = role === "admin"
  const isEmployee = role === "Employee"

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
              <FiPackage className="w-6 h-6" />
              Asset Management
            </h1>
            <p className="text-sm text-gray-400">
              {role === "Employee"
                ? "View your assigned assets."
                : "Manage company asset assignments and tracking. Admin can create, update, or delete assets."}
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
              New Asset
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

        {/* Employee Selector for Admin/HR */}
        {!isEmployee && canManage && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">View Assets by Employee</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Select an employee to view their assigned assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => {
                    const empId = emp.id || emp.employeeId
                    const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || emp.email || `Employee #${empId}`
                    return (
                      <option key={empId} value={empId}>
                        {empName}
                      </option>
                    )
                  })}
                </select>
                <Button
                  type="button"
                  onClick={handleViewByEmployee}
                  disabled={!selectedEmployeeId}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  View Assets
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Assets List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              {role === "Employee"
                ? "Your assigned assets."
                : "Click the eye icon to view all asset details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">
                  {role === "Employee"
                    ? "No assets assigned to you."
                    : "No assets found. Use the employee view to see assets by employee ID."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Asset Name</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Serial Number</th>
                      {canManage && (
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Assigned To</th>
                      )}
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {assets.map((asset, index) => {
                      const assetId = asset.id || asset.assetID || asset.assetId
                      return (
                        <tr
                          key={assetId || `asset-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {assetId || "-"}
                          </td>
                          <td className="py-2 px-4">
                            <div className="font-medium text-white">
                              {asset.assetName || "-"}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {asset.serialNumber || "-"}
                          </td>
                          {canManage && (
                            <td className="py-2 px-4 text-gray-300">
                              {asset.assignedTo || asset.assignedToId
                                ? getEmployeeName(asset.assignedTo || asset.assignedToId)
                                : "-"}
                            </td>
                          )}
                          <td className="py-2 px-4">
                            {getStatusBadge(asset.status)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {assetId ? (
                                <>
                                  <Link
                                    href={`/dashboard/asset-management/${assetId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all asset details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {canManage && (
                                    <>
                            {canManage && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                  onClick={() => handleEdit(asset)}
                                >
                                  <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 px-3 text-xs"
                                  onClick={() => handleDelete(assetId)}
                                >
                                  <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                  Delete
                                </Button>
                              </>
                            )}
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
                {selectedAsset ? "Edit Asset" : "New Asset"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedAsset
                  ? "Update the asset assignment information."
                  : "Assign a new asset to an employee."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="assetName" className="text-gray-300">
                      Asset Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="assetName"
                      name="assetName"
                      value={formData.assetName}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Laptop, Phone, Monitor"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="serialNumber" className="text-gray-300">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Asset serial number"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="assignedTo" className="text-gray-300">
                      Assigned To <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => {
                        const empId = emp.id || emp.employeeId
                        const empName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || emp.email || `Employee #${empId}`
                        return (
                          <option key={empId} value={empId}>
                            {empName}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="assignedDate" className="text-gray-300">
                      Assigned Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="assignedDate"
                      name="assignedDate"
                      type="datetime-local"
                      value={formData.assignedDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="returnDate" className="text-gray-300">Return Date</Label>
                    <Input
                      id="returnDate"
                      name="returnDate"
                      type="datetime-local"
                      value={formData.returnDate}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-gray-300">Status</Label>
                    <Input
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Assigned, Returned, Lost, Damaged"
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
                    {selectedAsset ? "Update Asset" : "Create Asset"}
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
