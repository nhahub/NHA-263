"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllHRDepartments,
} from "@/lib/api"

export default function EmployeesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hireDate: "",
    jobId: "",
    departmentId: "",
    employmentStatus: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      // Only Admin and HR can manage employees
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
      
      // Fetch employees and departments in parallel
      const [employeesRes, departmentsRes] = await Promise.allSettled([
        getAllEmployees(),
        getAllHRDepartments(),
      ])

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
      } else {
        console.error("Failed to fetch employees:", employeesRes.reason)
        setError("Failed to load employees. Please try again.")
      }

      if (departmentsRes.status === "fulfilled") {
        setDepartments(Array.isArray(departmentsRes.value.data) ? departmentsRes.value.data : [])
      } else {
        console.warn("Failed to fetch departments:", departmentsRes.reason)
        setDepartments([])
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
      name: "",
      email: "",
      phone: "",
      hireDate: "",
      jobId: "",
      departmentId: "",
      employmentStatus: "",
    })
    setSelectedEmployee(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Prepare data according to API schema
      const employeeData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || "",
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : null,
        jobId: formData.jobId ? parseInt(formData.jobId) : 0,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : 0,
        employmentStatus: formData.employmentStatus || "",
      }

      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id || selectedEmployee.employeeId, {
          ...selectedEmployee,
          ...employeeData,
        })
      } else {
        await createEmployee(employeeData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save employee:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save employee. Please check the data and try again."
      
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (employee) => {
    setSelectedEmployee(employee)
    setIsFormOpen(true)
    
    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split('T')[0]
    }
    
    setFormData({
      name: employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "",
      email: employee.email || "",
      phone: employee.phone || employee.phoneNumber || "",
      hireDate: formatDateForInput(employee.hireDate),
      jobId: employee.jobId?.toString() || "",
      departmentId: employee.departmentId?.toString() || "",
      employmentStatus: employee.employmentStatus || "",
    })
  }

  const handleDelete = async (employeeId) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      await deleteEmployee(employeeId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete employee:", err)
      setError("Failed to delete employee. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Employees</h1>
            <p className="text-gray-300">
              Manage employee records. Only Admin and HR can create, update, or delete employees.
            </p>
          </div>
          <Button
            type="button"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
          >
            <FiPlus className="w-4 h-4" />
            New Employee
          </Button>
        </div>

        {error && (
          <Card className="border-red-700 bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Employees List - Full Width */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Employee List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all employee details and fields returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No employees found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Phone</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {employees.map((emp) => (
                      <tr 
                        key={emp.id || emp.employeeId} 
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {((emp.firstName || "") + " " + (emp.lastName || "")).trim() || 
                             emp.name || 
                             emp.fullName || 
                             "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">{emp.email || emp.emailAddress || "-"}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">{emp.phoneNumber || emp.phone || emp.mobile || "-"}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/employees/${emp.id || emp.employeeId}`}
                              className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                              title="View all employee details"
                            >
                              <FiEye className="w-3.5 h-3.5 mr-1.5" />
                              View
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={() => handleEdit(emp)}
                            >
                              <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={() => handleDelete(emp.id || emp.employeeId)}
                            >
                              <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                              Delete
                            </Button>
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
        {isFormOpen && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{selectedEmployee ? "Edit Employee" : "New Employee"}</CardTitle>
              <CardDescription className="text-gray-400">
                {selectedEmployee
                  ? "Update the selected employee's information."
                  : "Create a new employee record."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-gray-300">Name <span className="text-red-400">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-gray-300">Email <span className="text-red-400">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="hireDate" className="text-gray-300">Hire Date</Label>
                  <Input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="jobId" className="text-gray-300">Job ID</Label>
                    <Input
                      id="jobId"
                      name="jobId"
                      type="number"
                      value={formData.jobId}
                      onChange={handleChange}
                      min="0"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Enter job ID"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="departmentId" className="text-gray-300">Department</Label>
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => {
                        const deptId = dept.id || dept.departmentId
                        const deptName = dept.nameEn || dept.name || `Department #${deptId}`
                        return (
                          <option key={deptId} value={deptId}>
                            {deptName}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="employmentStatus" className="text-gray-300">Employment Status</Label>
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Resigned">Resigned</option>
                  </select>
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
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {isSubmitting ? "Saving..." : selectedEmployee ? "Update Employee" : "Create Employee"}
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
