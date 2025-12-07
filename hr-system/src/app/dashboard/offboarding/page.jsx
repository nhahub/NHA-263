"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiEye, FiLogOut } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllOffboarding,
  createOffboarding,
  updateOffboarding,
  getAllEmployees,
} from "@/lib/api"

export default function OffboardingPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [formData, setFormData] = useState({
    employeeID: "",
    resignationDate: "",
    exitReason: "",
    clearanceStatus: "",
    exitInterviewNotes: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can view offboarding
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [recordsRes, employeesRes] = await Promise.allSettled([
        getAllOffboarding(),
        getAllEmployees(),
      ])

      if (recordsRes.status === "fulfilled") {
        setRecords(Array.isArray(recordsRes.value.data) ? recordsRes.value.data : [])
      } else {
        console.error("Failed to fetch offboarding records:", recordsRes.reason)
        setError("Failed to load offboarding records. Please try again.")
      }

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
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
      employeeID: "",
      resignationDate: "",
      exitReason: "",
      clearanceStatus: "",
      exitInterviewNotes: "",
    })
    setSelectedRecord(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.employeeID || isNaN(parseInt(formData.employeeID))) {
      setError("Employee must be selected.")
      return
    }

    if (!formData.resignationDate) {
      setError("Resignation date is required.")
      return
    }

    try {
      if (selectedRecord) {
        // Update existing record (PUT doesn't include employeeID)
        const updateData = {
          resignationDate: new Date(formData.resignationDate).toISOString(),
          exitReason: formData.exitReason?.trim() || "",
          clearanceStatus: formData.clearanceStatus?.trim() || "",
          exitInterviewNotes: formData.exitInterviewNotes?.trim() || "",
        }
        await updateOffboarding(
          selectedRecord.id || selectedRecord.exitID || selectedRecord.offboardingId,
          updateData
        )
      } else {
        // Create new record
        const offboardingData = {
          employeeID: parseInt(formData.employeeID),
          resignationDate: new Date(formData.resignationDate).toISOString(),
          exitReason: formData.exitReason?.trim() || "",
          clearanceStatus: formData.clearanceStatus?.trim() || "",
          exitInterviewNotes: formData.exitInterviewNotes?.trim() || "",
        }
        await createOffboarding(offboardingData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save offboarding record:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save offboarding record. Please check the data and try again."
      
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

  const handleEdit = (record) => {
    setSelectedRecord(record)
    setIsFormOpen(true)
    
    // Format date for input field
    const resignationDate = record.resignationDate
      ? new Date(record.resignationDate).toISOString().slice(0, 16)
      : ""
    
    setFormData({
      employeeID: record.employeeID?.toString() || record.employeeId?.toString() || "",
      resignationDate: resignationDate,
      exitReason: record.exitReason || "",
      clearanceStatus: record.clearanceStatus || "",
      exitInterviewNotes: record.exitInterviewNotes || "",
    })
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

  const getClearanceStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("completed") || statusLower.includes("cleared") || statusLower.includes("approved")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("pending") || statusLower.includes("in progress")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("rejected") || statusLower.includes("blocked")) {
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
              <FiLogOut className="w-6 h-6" />
              Offboarding
            </h1>
            <p className="text-sm text-gray-400">
              Manage employee exit and clearance processes. Admin and HR can create and update records.
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
              New Record
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

        {/* Records List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Offboarding Records</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all record details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">No offboarding records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Resignation Date</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Clearance Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {records.map((record, index) => {
                      const recordId = record.id || record.exitID || record.offboardingId
                      return (
                        <tr
                          key={recordId || `record-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {recordId || "-"}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {record.employeeID || record.employeeId
                              ? getEmployeeName(record.employeeID || record.employeeId)
                              : "-"}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {formatDate(record.resignationDate)}
                          </td>
                          <td className="py-2 px-4">
                            {getClearanceStatusBadge(record.clearanceStatus)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {recordId ? (
                                <>
                                  <Link
                                    href={`/dashboard/offboarding/${recordId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all record details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {canManage && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                      onClick={() => handleEdit(record)}
                                    >
                                      <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                      Edit
                                    </Button>
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
                {selectedRecord ? "Edit Record" : "New Record"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedRecord
                  ? "Update the offboarding record's status and notes."
                  : "Create a new employee exit and clearance record."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="employeeID" className="text-gray-300">
                      Employee <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="employeeID"
                      name="employeeID"
                      value={formData.employeeID}
                      onChange={handleChange}
                      required
                      disabled={!!selectedRecord} // Disable when editing (PUT doesn't include employeeID)
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {selectedRecord && (
                      <p className="text-xs text-gray-400 mt-1">Employee cannot be changed when editing</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="resignationDate" className="text-gray-300">
                      Resignation Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="resignationDate"
                      name="resignationDate"
                      type="datetime-local"
                      value={formData.resignationDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="exitReason" className="text-gray-300">Exit Reason</Label>
                    <Input
                      id="exitReason"
                      name="exitReason"
                      value={formData.exitReason}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Resignation, Termination, Retirement"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="clearanceStatus" className="text-gray-300">Clearance Status</Label>
                    <Input
                      id="clearanceStatus"
                      name="clearanceStatus"
                      value={formData.clearanceStatus}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Pending, In Progress, Completed, Cleared"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="exitInterviewNotes" className="text-gray-300">Exit Interview Notes</Label>
                    <textarea
                      id="exitInterviewNotes"
                      name="exitInterviewNotes"
                      value={formData.exitInterviewNotes}
                      onChange={handleChange}
                      rows={4}
                      className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter exit interview notes and clearance details"
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
                    {selectedRecord ? "Update Record" : "Create Record"}
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

