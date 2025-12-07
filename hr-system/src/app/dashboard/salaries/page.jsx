"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiDollarSign } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  getAllEmployees,
} from "@/lib/api"

export default function SalariesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [salaries, setSalaries] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSalary, setSelectedSalary] = useState(null)
  const [formData, setFormData] = useState({
    employeeID: "",
    baseSalary: "",
    bonus: "",
    deductions: "",
    netSalary: "",
    payDate: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      const isEmployee = userRole === "Employee"
      const employeeId = localStorage.getItem("employeeId")
      
      if (isEmployee) {
        // Employees can only view their own salary using GET /Salary/{id}
        // They need to know their salary ID - for now show message
        // In production, you might want to fetch employee data first to get salary ID
        setSalaries([])
        setLoading(false)
        setError("To view your salary, please use the salary detail page with your salary ID, or contact HR for assistance.")
      } else if (userRole === "admin" || userRole === "HR") {
        // Admin and HR can view all salaries
        fetchData()
      } else {
        router.push("/dashboard")
        return
      }
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [salariesRes, employeesRes] = await Promise.allSettled([
        getAllSalaries(),
        getAllEmployees(),
      ])

      if (salariesRes.status === "fulfilled") {
        setSalaries(Array.isArray(salariesRes.value.data) ? salariesRes.value.data : [])
      } else {
        console.error("Failed to fetch salaries:", salariesRes.reason)
        setError("Failed to load salary records. Please try again.")
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
      baseSalary: "",
      bonus: "",
      deductions: "",
      netSalary: "",
      payDate: "",
    })
    setSelectedSalary(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      
      // Auto-calculate netSalary if baseSalary, bonus, or deductions change
      if (name === "baseSalary" || name === "bonus" || name === "deductions") {
        const base = parseFloat(newData.baseSalary) || 0
        const bonus = parseFloat(newData.bonus) || 0
        const deductions = parseFloat(newData.deductions) || 0
        newData.netSalary = (base + bonus - deductions).toFixed(2)
      }
      
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.employeeID) {
      setError("Employee is required.")
      return
    }

    if (!formData.baseSalary || isNaN(parseFloat(formData.baseSalary))) {
      setError("Base salary must be a valid number.")
      return
    }

    if (!formData.payDate) {
      setError("Pay date is required.")
      return
    }

    try {
      const salaryData = {
        employeeID: parseInt(formData.employeeID),
        baseSalary: parseFloat(formData.baseSalary),
        bonus: parseFloat(formData.bonus) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        netSalary: parseFloat(formData.netSalary) || 0,
        payDate: new Date(formData.payDate).toISOString(),
      }

      if (selectedSalary) {
        // Update existing salary
        const updateData = {
          salaryID: selectedSalary.salaryID || selectedSalary.id,
          ...salaryData,
        }
        await updateSalary(
          selectedSalary.salaryID || selectedSalary.id,
          updateData
        )
      } else {
        // Create new salary
        await createSalary(salaryData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save salary:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save salary record. Please check the data and try again."
      
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

  const handleEdit = (salary) => {
    setSelectedSalary(salary)
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
      employeeID: salary.employeeID?.toString() || "",
      baseSalary: salary.baseSalary?.toString() || "0",
      bonus: salary.bonus?.toString() || "0",
      deductions: salary.deductions?.toString() || "0",
      netSalary: salary.netSalary?.toString() || "0",
      payDate: formatDateForInput(salary.payDate),
    })
  }

  const handleDelete = async (salaryId) => {
    if (!confirm("Are you sure you want to delete this salary record? This action cannot be undone.")) return

    try {
      await deleteSalary(salaryId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete salary:", err)
      setError("Failed to delete salary record. Please try again.")
    }
  }

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (emp) => emp.id === employeeId || emp.employeeId === employeeId
    )
    if (employee) {
      return `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || 
             employee.name || 
             employee.email || 
             `Employee #${employeeId}`
    }
    return `Employee #${employeeId}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const isAdmin = role === "admin"
  const isHR = role === "HR"
  const isEmployee = role === "Employee"
  const canView = isAdmin || isHR || isEmployee
  const canManage = isAdmin || isHR // Employees can only view (GET), not manage

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-red-400">
                You don't have permission to view this page. Salary information is restricted to Admin and HR only.
              </p>
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
              <FiDollarSign className="w-8 h-8" />
              Salary Records
            </h1>
            <p className="text-gray-300">
              Manage employee salary information. This is sensitive financial data. Only Admin and HR can access this page.
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
              New Salary Record
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

        {/* Salaries List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Salary Records</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all salary details. This information is highly sensitive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading salary records...</p>
              </div>
            ) : salaries.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No salary records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Employee</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Net Salary</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Pay Date</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {salaries.map((salary, index) => (
                      <tr
                        key={salary.salaryID || salary.id || `salary-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {salary.employeeID ? getEmployeeName(salary.employeeID) : "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-green-400">
                            {formatCurrency(salary.netSalary)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {salary.payDate
                            ? new Date(salary.payDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const salaryId = salary.salaryID || salary.id
                              
                              if (!salaryId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/salaries/${salaryId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all salary details"
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
                                        onClick={() => handleEdit(salary)}
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
                                      onClick={() => handleDelete(salaryId)}
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
                {selectedSalary ? "Edit Salary Record" : "New Salary Record"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedSalary
                  ? "Update the selected salary record. This is sensitive financial data."
                  : "Create a new salary record. Net salary will be calculated automatically."}
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
                    <Label htmlFor="payDate" className="text-gray-300">
                      Pay Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="payDate"
                      name="payDate"
                      type="date"
                      value={formData.payDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="baseSalary" className="text-gray-300">
                      Base Salary <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="baseSalary"
                      name="baseSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.baseSalary}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bonus" className="text-gray-300">Bonus</Label>
                    <Input
                      id="bonus"
                      name="bonus"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.bonus}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="deductions" className="text-gray-300">Deductions</Label>
                    <Input
                      id="deductions"
                      name="deductions"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.deductions}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="netSalary" className="text-gray-300">
                      Net Salary (Auto-calculated)
                    </Label>
                    <Input
                      id="netSalary"
                      name="netSalary"
                      type="number"
                      step="0.01"
                      value={formData.netSalary}
                      onChange={handleChange}
                      readOnly
                      className="bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Calculated as: Base Salary + Bonus - Deductions
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
                    {selectedSalary ? "Update Salary Record" : "Create Salary Record"}
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

