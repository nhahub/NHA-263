"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from "react-icons/fi"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllBenefitsCompensations,
  createBenefitsCompensation,
  updateBenefitsCompensation,
  deleteBenefitsCompensation,
  getAllEmployees,
  getAllBenefitTypes,
} from "@/lib/api"

export default function BenefitsCompensationPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [benefitsCompensations, setBenefitsCompensations] = useState([])
  const [employees, setEmployees] = useState([])
  const [benefitTypes, setBenefitTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCompensation, setSelectedCompensation] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: "",
    benefitTypeId: "",
    amount: "",
    startDate: "",
    endDate: "",
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

      // Only Admin and HR can view, only Admin can manage
      if (!(userRole === "admin" || userRole === "HR")) {
        router.push("/dashboard")
        return
      }

      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch all data in parallel with individual error handling
      const [compensationsRes, employeesRes, benefitTypesRes] = await Promise.allSettled([
        getAllBenefitsCompensations(),
        getAllEmployees(),
        getAllBenefitTypes(),
      ])

      // Handle compensations result
      if (compensationsRes.status === "fulfilled") {
        setBenefitsCompensations(Array.isArray(compensationsRes.value.data) ? compensationsRes.value.data : [])
      } else {
        console.error("Failed to fetch compensations:", compensationsRes.reason)
        setBenefitsCompensations([])
        const error = compensationsRes.reason
        if (error.response?.status === 500) {
          setError("Server error: Unable to load compensation records. The backend encountered an issue. Please check the server logs or contact support.")
        } else if (error.response?.status === 401) {
          setError("Unauthorized: Please log in again.")
        } else if (error.response?.status === 403) {
          setError("Forbidden: You don't have permission to view benefits compensation.")
        } else {
          setError(error.response?.data?.message || error.message || "Failed to load compensation records.")
        }
      }

      // Handle employees result
      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
      }

      // Handle benefit types result
      if (benefitTypesRes.status === "fulfilled") {
        setBenefitTypes(Array.isArray(benefitTypesRes.value.data) ? benefitTypesRes.value.data : [])
      } else {
        console.warn("Failed to fetch benefit types:", benefitTypesRes.reason)
        setBenefitTypes([])
      }
    } catch (err) {
      console.error("Unexpected error in fetchData:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      benefitTypeId: "",
      amount: "",
      startDate: "",
      endDate: "",
      description: "",
      isActive: true,
    })
    setSelectedCompensation(null)
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
      const submitData = {
        ...formData,
        employeeId: formData.employeeId ? parseInt(formData.employeeId) : null,
        benefitTypeId: formData.benefitTypeId ? parseInt(formData.benefitTypeId) : null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
      }

      if (selectedCompensation) {
        const updateData = {
          ...selectedCompensation,
          ...submitData,
        }
        console.log("Updating benefits compensation with data:", updateData)
        await updateBenefitsCompensation(
          selectedCompensation.id || selectedCompensation.benefitsCompensationId,
          updateData
        )
      } else {
        console.log("Creating benefits compensation with data:", submitData)
        await createBenefitsCompensation(submitData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save benefits compensation:", err)
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save benefits compensation. Please check the data and try again."
      
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

  const handleEdit = (compensation) => {
    setSelectedCompensation(compensation)
    setIsFormOpen(true)
    setFormData({
      employeeId: compensation.employeeId?.toString() || "",
      benefitTypeId: compensation.benefitTypeId?.toString() || "",
      amount: compensation.amount?.toString() || "",
      startDate: compensation.startDate ? compensation.startDate.split("T")[0] : "",
      endDate: compensation.endDate ? compensation.endDate.split("T")[0] : "",
      description: compensation.description || "",
      isActive: compensation.isActive !== undefined ? compensation.isActive : true,
    })
  }

  const handleDelete = async (compensationId) => {
    if (!confirm("Are you sure you want to delete this benefits compensation record?")) return

    try {
      await deleteBenefitsCompensation(compensationId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete benefits compensation:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete benefits compensation. Please try again."
      )
    }
  }

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (emp) => emp.id === employeeId || emp.employeeId === employeeId
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name || employee.email || `Employee #${employeeId}`
    }
    return `Employee #${employeeId}`
  }

  const getBenefitTypeName = (benefitTypeId) => {
    const benefitType = benefitTypes.find(
      (bt) => bt.id === benefitTypeId || bt.benefitTypeId === benefitTypeId
    )
    return benefitType?.name || `Benefit Type #${benefitTypeId}`
  }

  const canManage = role === "admin"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 flex items-center gap-3">
              <FiDollarSign className="w-8 h-8" />
              Benefits Compensation
            </h1>
            <p className="text-gray-300">
              {canManage
                ? "Manage employee benefits compensation. Only Admin can create, update, or delete records."
                : "View employee benefits compensation. Only Admin can manage records."}
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
              New Compensation
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

        {/* Benefits Compensation List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Compensation Records</CardTitle>
            <CardDescription className="text-gray-400">
              {benefitsCompensations.length === 0
                ? "No compensation records available."
                : `Showing ${benefitsCompensations.length} record${benefitsCompensations.length !== 1 ? "s" : ""}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading compensation records...</p>
              </div>
            ) : benefitsCompensations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FiDollarSign className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-sm text-gray-400">No compensation records found.</p>
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
                    Create First Record
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Employee</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Benefit Type</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Amount</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Start Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">End Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                      {canManage && (
                        <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {benefitsCompensations.map((comp, index) => (
                      <tr
                        key={comp.id || comp.benefitsCompensationId || `compensation-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {comp.employeeId ? getEmployeeName(comp.employeeId) : "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">
                            {comp.benefitTypeId ? getBenefitTypeName(comp.benefitTypeId) : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300 font-medium">
                            {comp.amount !== null && comp.amount !== undefined
                              ? `$${parseFloat(comp.amount).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">
                            {comp.startDate
                              ? new Date(comp.startDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">
                            {comp.endDate
                              ? new Date(comp.endDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              comp.isActive !== false
                                ? "bg-green-900/50 text-green-400 border border-green-700"
                                : "bg-gray-700 text-gray-400 border border-gray-600"
                            }`}
                          >
                            {comp.isActive !== false ? "Active" : "Inactive"}
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
                                onClick={() => handleEdit(comp)}
                              >
                                <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDelete(comp.id || comp.benefitsCompensationId)}
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
              <CardTitle className="text-white">
                {selectedCompensation ? "Edit Benefits Compensation" : "New Benefits Compensation"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedCompensation
                  ? "Update the selected compensation record."
                  : "Create a new benefits compensation record."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="employeeId" className="text-gray-300">Employee *</Label>
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option
                          key={emp.id || emp.employeeId}
                          value={emp.id || emp.employeeId}
                        >
                          {`${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                            emp.name ||
                            emp.email ||
                            `Employee #${emp.id || emp.employeeId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="benefitTypeId" className="text-gray-300">Benefit Type *</Label>
                    <select
                      id="benefitTypeId"
                      name="benefitTypeId"
                      value={formData.benefitTypeId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a benefit type</option>
                      {benefitTypes.map((bt) => (
                        <option
                          key={bt.id || bt.benefitTypeId}
                          value={bt.id || bt.benefitTypeId}
                        >
                          {bt.name || `Benefit Type #${bt.id || bt.benefitTypeId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="amount" className="text-gray-300">Amount *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-gray-300">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Additional notes or description"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
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
                    Active (Compensation is currently active)
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
                      : selectedCompensation
                      ? "Update Compensation"
                      : "Create Compensation"}
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

