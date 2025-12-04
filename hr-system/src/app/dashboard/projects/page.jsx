"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api"
export default function ProjectsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [formData, setFormData] = useState({
    projectName: "",
    startDate: "",
    endDate: "",
    managerID: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")

      if (!userRole) {
        router.push("/login")
        return
      }

      fetchProjects()
    }
  }, [router])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllProjects()
      setProjects(Array.isArray(data) ? data : [])
      console.log("Projects data:", data)
      if (data && data.length > 0) {
        console.log("First project structure:", data[0])
        console.log("Available fields:", Object.keys(data[0]))
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err)
      setError("Failed to load projects. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      projectName: "",
      startDate: "",
      endDate: "",
      managerID: "",
    })
    setSelectedProject(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.projectName || !formData.projectName.trim()) {
      setError("Project name is required.")
      return
    }

    if (!formData.startDate) {
      setError("Start date is required.")
      return
    }

    if (!formData.endDate) {
      setError("End date is required.")
      return
    }

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    if (endDate < startDate) {
      setError("End date must be after start date.")
      return
    }

    try {
      const projectId = selectedProject?.id || selectedProject?.projectId || selectedProject?.projectID
      
      // Prepare data according to API schema
      const projectData = {
        projectName: formData.projectName.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        managerID: formData.managerID ? parseInt(formData.managerID) : 0,
      }
      
      if (selectedProject && projectId) {
        // Update existing project
        await updateProject(projectId, projectData)
      } else {
        // Create new project
        await createProject(projectData)
      }

      resetForm()
      setIsFormOpen(false)
      await fetchProjects()
    } catch (err) {
      console.error("Failed to save project:", err)
      console.error("Error response:", err.response?.data)
      
      // Extract detailed error message
      let errorMessage = "Failed to save project. Please check the data and try again."
      
      if (err.response?.data) {
        const errorData = err.response.data
        
        // Try different error message formats
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.title) {
          errorMessage = errorData.title
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.errors) {
          // Handle validation errors
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

  const handleEdit = (project) => {
    setSelectedProject(project)
    setIsFormOpen(true)
    
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split('T')[0]
    }
    
    setFormData({
      projectName: project.projectName || project.name || "",
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      managerID: project.managerID || project.managerId || project.managerID || "",
    })
  }

  const handleDelete = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      await deleteProject(projectId)
      await fetchProjects()
    } catch (err) {
      console.error("Failed to delete project:", err)
      setError("Failed to delete project. Please try again.")
    }
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR" || role === "Employee"

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
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Projects</h1>
            <p className="text-gray-300">
              Manage project definitions. All users can view, but only Admin can create, update, or delete.
            </p>
          </div>
          {isAdmin && (
            <Button
              type="button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => {
                resetForm()
                setIsFormOpen(true)
              }}
            >
              <FiPlus className="w-4 h-4" />
              New Project
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

        {/* Projects List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Project List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all project details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No projects found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Project Name</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Start Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">End Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Manager ID</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {projects.map((project, index) => (
                      <tr
                        key={project.id || project.projectId || project.projectID || `project-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {project.id || project.projectId || project.projectID || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {project.projectName || project.name || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {project.startDate 
                            ? new Date(project.startDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {project.endDate 
                            ? new Date(project.endDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {project.managerID || project.managerId || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const projectId = project.id || project.projectId || project.projectID
                              
                              if (!projectId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/projects/${projectId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all project details"
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
                                        className="h-7 px-3 text-xs border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        onClick={() => handleEdit(project)}
                                      >
                                        <FiEdit2 className="w-3.5 h-3.5 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleDelete(projectId)}
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
        {isFormOpen && isAdmin && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedProject ? "Edit Project" : "New Project"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedProject
                  ? "Update the selected project's information."
                  : "Create a new project definition."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="projectName" className="text-gray-300">
                    Project Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Enter project name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-gray-300">
                      Start Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-gray-300">
                      End Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="managerID" className="text-gray-300">Manager ID</Label>
                  <Input
                    id="managerID"
                    name="managerID"
                    type="number"
                    value={formData.managerID}
                    onChange={handleChange}
                    min="0"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    placeholder="Enter manager ID (0 if none)"
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
                    className="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {selectedProject ? "Update Project" : "Create Project"}
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

