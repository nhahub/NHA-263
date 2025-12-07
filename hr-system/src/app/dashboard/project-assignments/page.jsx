"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiTrash2, FiEye, FiBriefcase } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllProjectAssignments,
  getMyAssignments,
  createProjectAssignment,
  deleteProjectAssignment,
  getAllEmployees,
  getAllProjects,
} from "@/lib/api"

export default function ProjectAssignmentsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [assignments, setAssignments] = useState([])
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    employeeID: "",
    projectID: "",
    roleInProject: "",
    hoursWorked: "",
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
      const [assignmentsRes, employeesRes, projectsRes] = await Promise.allSettled([
        isEmployee ? getMyAssignments() : getAllProjectAssignments(),
        getAllEmployees(),
        getAllProjects(),
      ])
      
      console.log("Assignments API Response:", assignmentsRes)

      if (assignmentsRes.status === "fulfilled") {
        const responseData = assignmentsRes.value
        console.log("Full Response Data:", responseData)
        
        // Handle different response structures
        let assignmentsData = []
        if (Array.isArray(responseData.data)) {
          assignmentsData = responseData.data
        } else if (Array.isArray(responseData)) {
          assignmentsData = responseData
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          assignmentsData = responseData.data
        } else if (responseData?.result && Array.isArray(responseData.result)) {
          assignmentsData = responseData.result
        }
        
        console.log("Extracted Assignments:", assignmentsData)
        setAssignments(assignmentsData)
      } else {
        console.error("Failed to fetch assignments:", assignmentsRes.reason)
        const errorReason = assignmentsRes.reason
        
        // Handle network errors specifically
        if (errorReason?.code === 'ERR_NETWORK' || errorReason?.message === 'Network Error') {
          setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
        } else if (errorReason?.response?.status === 401) {
          setError("Your session has expired. Please log in again.")
          router.push("/login")
        } else if (errorReason?.response?.status === 403) {
          setError("You don't have permission to view project assignments.")
        } else {
          const errorMsg = errorReason?.response?.data?.message || 
                          errorReason?.response?.data?.detail ||
                          errorReason?.message || 
                          "Failed to load project assignments. Please try again."
          setError(errorMsg)
        }
        setAssignments([])
      }

      if (employeesRes.status === "fulfilled") {
        setEmployees(Array.isArray(employeesRes.value.data) ? employeesRes.value.data : [])
      } else {
        console.warn("Failed to fetch employees:", employeesRes.reason)
        setEmployees([])
      }

      if (projectsRes.status === "fulfilled") {
        setProjects(Array.isArray(projectsRes.value.data) ? projectsRes.value.data : [])
      } else {
        console.warn("Failed to fetch projects:", projectsRes.reason)
        setProjects([])
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
      } else {
        setError("Failed to load data. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeID: "",
      projectID: "",
      roleInProject: "",
      hoursWorked: "",
      status: "",
    })
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

    if (!formData.projectID || isNaN(parseInt(formData.projectID))) {
      setError("Project must be selected.")
      return
    }

    if (formData.hoursWorked !== "" && (isNaN(parseInt(formData.hoursWorked)) || parseInt(formData.hoursWorked) < 0)) {
      setError("Hours worked must be a valid non-negative number.")
      return
    }

    try {
      const assignmentData = {
        employeeID: parseInt(formData.employeeID),
        projectID: parseInt(formData.projectID),
        roleInProject: formData.roleInProject?.trim() || "",
        hoursWorked: formData.hoursWorked ? parseInt(formData.hoursWorked) : 0,
        status: formData.status?.trim() || "",
      }

      await createProjectAssignment(assignmentData)
      resetForm()
      setIsFormOpen(false)
      await fetchData()
    } catch (err) {
      console.error("Failed to save assignment:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save project assignment. Please check the data and try again."
      
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

  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this project assignment?")) return

    try {
      await deleteProjectAssignment(assignmentId)
      await fetchData()
    } catch (err) {
      console.error("Failed to delete assignment:", err)
      setError("Failed to delete project assignment. Please try again.")
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

  const getProjectName = (projectID) => {
    const project = projects.find(
      (proj) => proj.id === projectID || proj.projectID === projectID
    )
    if (project) {
      return project.projectName || project.name || `Project #${projectID}`
    }
    return `Project #${projectID}`
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes("active") || statusLower.includes("assigned")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("completed") || statusLower.includes("finished")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-700">
          {status}
        </span>
      )
    } else if (statusLower.includes("inactive") || statusLower.includes("removed")) {
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

  const canView = role === "admin" || role === "HR" || role === "Employee"
  const canManage = role === "admin" || role === "HR"
  const isAdmin = role === "admin"

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
              <FiBriefcase className="w-6 h-6" />
              Project Assignments
            </h1>
            <p className="text-sm text-gray-400">
              {role === "Employee"
                ? "View your assigned projects."
                : "Manage employee project assignments. Admin and HR can create assignments."}
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
              New Assignment
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

        {/* Assignments List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Assignments List</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Click the eye icon to view all assignment details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-gray-400">No project assignments found.</p>
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
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Project</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Role</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-2 px-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {assignments.map((assignment, index) => {
                      const assignmentId = assignment.id || assignment.assignmentID || assignment.projectAssignmentId
                      return (
                        <tr
                          key={assignmentId || `assignment-${index}`}
                          className="hover:bg-gray-800/50 transition-colors duration-150"
                        >
                          <td className="py-2 px-4 text-gray-300 font-medium">
                            {assignmentId || "-"}
                          </td>
                          {canManage && (
                            <td className="py-2 px-4 text-gray-300">
                              {assignment.employeeID || assignment.employeeId
                                ? getEmployeeName(assignment.employeeID || assignment.employeeId)
                                : "-"}
                            </td>
                          )}
                          <td className="py-2 px-4 text-gray-300">
                            {assignment.projectID || assignment.projectId
                              ? getProjectName(assignment.projectID || assignment.projectId)
                              : "-"}
                          </td>
                          <td className="py-2 px-4 text-gray-300">
                            {assignment.roleInProject || "-"}
                          </td>
                          <td className="py-2 px-4">
                            {getStatusBadge(assignment.status)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-end gap-2">
                              {assignmentId ? (
                                <>
                                  <Link
                                    href={`/dashboard/project-assignments/${assignmentId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all assignment details"
                                  >
                                    <FiEye className="w-3.5 h-3.5 mr-1.5" />
                                    View
                                  </Link>
                                  {isAdmin && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="h-7 px-3 text-xs"
                                      onClick={() => handleDelete(assignmentId)}
                                    >
                                      <FiTrash2 className="w-3.5 h-3.5 mr-1.5" />
                                      Delete
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

        {/* Create Form */}
        {isFormOpen && canManage && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">New Assignment</CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Assign an employee to a project.
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
                    <Label htmlFor="projectID" className="text-gray-300">
                      Project <span className="text-red-400">*</span>
                    </Label>
                    <select
                      id="projectID"
                      name="projectID"
                      value={formData.projectID}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select a project</option>
                      {projects.map((proj) => {
                        const projId = proj.id || proj.projectID
                        const projName = proj.projectName || proj.name || `Project #${projId}`
                        return (
                          <option key={projId} value={projId}>
                            {projName}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="roleInProject" className="text-gray-300">Role in Project</Label>
                    <Input
                      id="roleInProject"
                      name="roleInProject"
                      value={formData.roleInProject}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Developer, Manager, Analyst"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="hoursWorked" className="text-gray-300">Hours Worked</Label>
                    <Input
                      id="hoursWorked"
                      name="hoursWorked"
                      type="number"
                      min="0"
                      value={formData.hoursWorked}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="0"
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
                      placeholder="e.g., Active, Completed, Inactive"
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
                    Create Assignment
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

