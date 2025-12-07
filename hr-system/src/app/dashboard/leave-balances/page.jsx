"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiPlus, FiEdit2, FiCalendar } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getLeaveBalanceByEmployeeId,
  createLeaveBalance,
  updateLeaveBalance,
  getAllEmployees,
  getAllLeaveTypes,
} from "@/lib/api"

export default function LeaveBalancesPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [userId, setUserId] = useState("")
  const [balances, setBalances] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("") // For viewing balances
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    allocatedDays: "",
    year: new Date().getFullYear().toString(),
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      const currentUserId = localStorage.getItem("userId")
      setRole(userRole || "")
      setUserId(currentUserId || "")

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
      const employeeIdToFetch = isEmployee ? parseInt(userId) : (selectedEmployeeId ? parseInt(selectedEmployeeId) : null)
      
      const [balancesRes, employeesRes, typesRes] = await Promise.allSettled([
        employeeIdToFetch ? getLeaveBalanceByEmployeeId(employeeIdToFetch) : Promise.resolve({ data: [] }),
        getAllEmployees(),
        getAllLeaveTypes(),
      ])

      if (balancesRes.status === "fulfilled") {
        setBalances(Array.isArray(balancesRes.value.data) ? balancesRes.value.data : [])
      } else {
        console.error("Failed to fetch balances:", balancesRes.reason)
        setError("Failed to load leave balances. Please try again.")
      }

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
        
        // Auto-select current employee if user is Employee role
        if (isEmployee && userId) {
          setSelectedEmployeeId(userId)
        }
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
      }

      if (typesRes.status === "fulfilled") {
        setLeaveTypes(Array.isArray(typesRes.value.data) ? typesRes.value.data : [])
      } else {
        console.warn("Failed to fetch leave types:", typesRes.reason)
        setLeaveTypes([])
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEmployeeId && (role === "admin" || role === "HR")) {
      fetchData()
    }
  }, [selectedEmployeeId])

  const resetForm = () => {
    setFormData({
      employeeId: "",
      leaveTypeId: "",
      allocatedDays: "",
      year: new Date().getFullYear().toString(),
    })
    setSelectedBalance(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.employeeId || isNaN(parseInt(formData.employeeId))) {
      setError("Employee must be selected.")
      return
    }

    if (!formData.leaveTypeId || isNaN(parseInt(formData.leaveTypeId))) {
      setError("Leave type must be selected.")
      return
    }

    if (formData.allocatedDays === "" || isNaN(parseInt(formData.allocatedDays)) || parseInt(formData.allocatedDays) < 0) {
      setError("Allocated days must be a valid non-negative number.")
      return
    }

    if (formData.year === "" || isNaN(parseInt(formData.year))) {
      setError("Year must be a valid number.")
      return
    }

    try {
      if (selectedBalance) {
        // Update existing balance (PUT only updates usedDays)
        const updateData = {
          balanceId: selectedBalance.balanceId || selectedBalance.id || selectedBalance.leaveBalanceId,
          usedDays: formData.allocatedDays ? parseInt(formData.allocatedDays) : 0,
        }
        await updateLeaveBalance(
          selectedBalance.balanceId || selectedBalance.id || selectedBalance.leaveBalanceId,
          updateData
        )
      } else {
        // Create new balance
        const balanceData = {
          employeeId: parseInt(formData.employeeId),
          leaveTypeId: parseInt(formData.leaveTypeId),
          allocatedDays: parseInt(formData.allocatedDays),
          year: parseInt(formData.year),
        }
        await createLeaveBalance(balanceData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save leave balance:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save leave balance. Please check the data and try again."
      
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

  const handleEdit = (balance) => {
    setSelectedBalance(balance)
    setIsFormOpen(true)
    
    setFormData({
      employeeId: balance.employeeId?.toString() || balance.employeeID?.toString() || "",
      leaveTypeId: balance.leaveTypeId?.toString() || balance.leaveTypeID?.toString() || "",
      allocatedDays: balance.usedDays?.toString() || balance.allocatedDays?.toString() || "0",
      year: balance.year?.toString() || new Date().getFullYear().toString(),
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

  const getLeaveTypeName = (leaveTypeID) => {
    const type = leaveTypes.find(
      (t) => t.leaveTypeId === leaveTypeID || t.id === leaveTypeID || t.leaveTypeID === leaveTypeID
    )
    if (type) {
      return type.name || `Leave Type #${leaveTypeID}`
    }
    return `Leave Type #${leaveTypeID}`
  }

  const canView = role === "admin" || role === "HR" || role === "Employee"
  const canManage = role === "admin" || role === "HR"
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
              <FiCalendar className="w-6 h-6" />
              Leave Balances
            </h1>
            <p className="text-sm text-gray-400">
              {isEmployee
                ? "View your leave balances."
                : "Manage employee leave balances. Admin and HR can create and update balances."}
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
              New Balance
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
              <CardTitle className="text-white text-lg">View Balances by Employee</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Select an employee to view their leave balances.
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balances List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Leave Balances</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              View leave balances for {isEmployee ? "your account" : "the selected employee"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading balances...</p>
              </div>
            ) : balances.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">
                  {isEmployee
                    ? "No leave balances found for your account."
                    : selectedEmployeeId
                    ? "No leave balances found for this employee."
                    : "Please select an employee to view their leave balances."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                      {canManage && (
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                      )}
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Leave Type</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Allocated Days</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Used Days</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Year</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {balances.map((balance, index) => {
                      const balanceId = balance.balanceId || balance.id || balance.leaveBalanceId
                      const allocated = balance.allocatedDays || 0
                      const used = balance.usedDays || 0
                      const remaining = allocated - used
                      return (
                        <tr
                          key={balanceId || `balance-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {balanceId || "-"}
                          </td>
                          {canManage && (
                            <td className="py-2 px-4 text-gray-300">
                              {balance.employeeId || balance.employeeID
                                ? getEmployeeName(balance.employeeId || balance.employeeID)
                                : "-"}
                            </td>
                          )}
                          <td className="py-2 px-4 text-gray-300">
                            {balance.leaveTypeId || balance.leaveTypeID
                              ? getLeaveTypeName(balance.leaveTypeId || balance.leaveTypeID)
                              : "-"}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {allocated}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {used}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {balance.year || "-"}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {canManage && balanceId && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                                  onClick={() => handleEdit(balance)}
                                >
                                  <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                  Edit
                                </Button>
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
                {selectedBalance ? "Edit Balance" : "New Balance"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {selectedBalance
                  ? "Update the used days for this leave balance."
                  : "Create a new leave balance for an employee."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="employeeId" className="text-gray-300">
                      Employee <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      disabled={!!selectedBalance}
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
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="leaveTypeId" className="text-gray-300">
                      Leave Type <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="leaveTypeId"
                      name="leaveTypeId"
                      value={formData.leaveTypeId}
                      onChange={handleChange}
                      required
                      disabled={!!selectedBalance}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a leave type</option>
                      {leaveTypes.map((type) => {
                        const typeId = type.leaveTypeId || type.id || type.leaveTypeID
                        return (
                          <option key={typeId} value={typeId}>
                            {type.name || `Leave Type #${typeId}`}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {!selectedBalance && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="allocatedDays" className="text-gray-300">
                          Allocated Days <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="allocatedDays"
                          name="allocatedDays"
                          type="number"
                          min="0"
                          value={formData.allocatedDays}
                          onChange={handleChange}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="year" className="text-gray-300">
                          Year <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="year"
                          name="year"
                          type="number"
                          min="2000"
                          max="2100"
                          value={formData.year}
                          onChange={handleChange}
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                          placeholder={new Date().getFullYear().toString()}
                        />
                      </div>
                    </>
                  )}

                  {selectedBalance && (
                    <div className="space-y-1">
                      <Label htmlFor="allocatedDays" className="text-gray-300">
                        Used Days <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="allocatedDays"
                        name="allocatedDays"
                        type="number"
                        min="0"
                        value={formData.allocatedDays}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">Update the used days for this balance</p>
                    </div>
                  )}
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
                    {selectedBalance ? "Update Balance" : "Create Balance"}
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

