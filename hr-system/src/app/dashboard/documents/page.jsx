"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFolder } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getAllEmployees,
  getDocumentsByEmployeeId,
} from "@/lib/api"

export default function DocumentsPage() {
  const router = useRouter()
  const [role, setRole] = useState("")
  const [documents, setDocuments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("")
  const [formData, setFormData] = useState({
    employeeID: "",
    documentType: "",
    uploadDate: "",
    expiryDate: "",
    filePath: "",
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
        // Employees can only view their own documents using GET /api/DocumentManagement/employee/{employeeId}
        if (employeeId) {
          console.log("Employee accessing documents with ID:", employeeId)
          fetchDocumentsByEmployee(employeeId)
        } else {
          setError("Employee ID not found. Please log in again.")
          setLoading(false)
        }
      } else if (userRole === "admin" || userRole === "HR") {
        // Admin and HR can view all documents
        fetchEmployees()
        fetchDocuments()
      } else {
        router.push("/dashboard")
        return
      }
    }
  }, [router])

  useEffect(() => {
    if (selectedEmployeeFilter) {
      fetchDocumentsByEmployee(selectedEmployeeFilter)
    } else {
      fetchDocuments()
    }
  }, [selectedEmployeeFilter])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getAllDocuments()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch documents:", err)
      setError("Failed to load documents. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentsByEmployee = async (employeeId) => {
    try {
      setLoading(true)
      setError("")
      
      console.log("Fetching documents for employee ID:", employeeId)
      const response = await getDocumentsByEmployeeId(employeeId)
      const responseData = response
      console.log("Documents API Response:", responseData)
      
      // Handle different response structures
      let documentsData = []
      if (Array.isArray(responseData.data)) {
        documentsData = responseData.data
      } else if (Array.isArray(responseData)) {
        documentsData = responseData
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        documentsData = responseData.data
      } else if (responseData?.result && Array.isArray(responseData.result)) {
        documentsData = responseData.result
      }
      
      console.log("Extracted Documents Data:", documentsData)
      setDocuments(documentsData)
    } catch (err) {
      console.error("Failed to fetch documents by employee:", err)
      
      // Handle network errors specifically
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("Cannot connect to the server. Please ensure the API server is running at http://localhost:5179")
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.")
        router.push("/login")
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view these documents.")
      } else {
        const errorMsg = err.response?.data?.message || 
                        err.response?.data?.detail ||
                        err.message || 
                        "Failed to load documents. Please try again."
        setError(errorMsg)
      }
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployees()
      setEmployees(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.warn("Failed to fetch employees:", err)
      setEmployees([])
    }
  }

  const resetForm = () => {
    setFormData({
      employeeID: "",
      documentType: "",
      uploadDate: "",
      expiryDate: "",
      filePath: "",
    })
    setSelectedDocument(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.employeeID) {
      setError("Employee is required.")
      return
    }

    if (!formData.documentType || !formData.documentType.trim()) {
      setError("Document type is required.")
      return
    }

    if (!formData.uploadDate) {
      setError("Upload date is required.")
      return
    }

    if (!formData.filePath || !formData.filePath.trim()) {
      setError("File path is required.")
      return
    }

    // Validate dates if expiry date is provided
    if (formData.expiryDate) {
      const uploadDate = new Date(formData.uploadDate)
      const expiryDate = new Date(formData.expiryDate)
      if (expiryDate < uploadDate) {
        setError("Expiry date must be after upload date.")
        return
      }
    }

    try {
      const documentData = {
        employeeID: parseInt(formData.employeeID),
        documentType: formData.documentType.trim(),
        uploadDate: new Date(formData.uploadDate).toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        filePath: formData.filePath.trim(),
      }

      if (selectedDocument) {
        // Update existing document
        const updateData = {
          documentID: selectedDocument.documentID || selectedDocument.id,
          ...documentData,
        }
        await updateDocument(
          selectedDocument.documentID || selectedDocument.id,
          updateData
        )
      } else {
        // Create new document
        await createDocument(documentData)
      }

      resetForm()
      setIsFormOpen(false)
      
      // Refresh documents based on current filter
      if (selectedEmployeeFilter) {
        await fetchDocumentsByEmployee(selectedEmployeeFilter)
      } else {
        await fetchDocuments()
      }
    } catch (err) {
      console.error("Failed to save document:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Failed to save document. Please check the data and try again."
      
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

  const handleEdit = (document) => {
    setSelectedDocument(document)
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
      employeeID: document.employeeID?.toString() || "",
      documentType: document.documentType || "",
      uploadDate: formatDateForInput(document.uploadDate),
      expiryDate: formatDateForInput(document.expiryDate),
      filePath: document.filePath || "",
    })
  }

  const handleDelete = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await deleteDocument(documentId)
      
      // Refresh documents based on current filter
      if (selectedEmployeeFilter) {
        await fetchDocumentsByEmployee(selectedEmployeeFilter)
      } else {
        await fetchDocuments()
      }
    } catch (err) {
      console.error("Failed to delete document:", err)
      setError("Failed to delete document. Please try again.")
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

  const getExpiryStatus = (expiryDate) => {
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
      if (daysUntilExpiry <= 30) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400 border border-orange-700">
            Expires Soon ({daysUntilExpiry} days)
          </span>
        )
      }
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700">
          Valid
        </span>
      )
    }
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
              <FiFolder className="w-8 h-8" />
              Document Management
            </h1>
            <p className="text-gray-300">
              Manage employee documents. Admin and HR can create, update, or delete documents.
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
              New Document
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

        {/* Employee Filter */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="employeeFilter" className="whitespace-nowrap text-gray-300">
                Filter by Employee:
              </Label>
              <select
                id="employeeFilter"
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50 max-w-xs"
              >
                <option value="">All Employees</option>
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
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Documents List</CardTitle>
            <CardDescription className="text-gray-400">
              Click the eye icon to view all document details.
              {selectedEmployeeFilter && ` Showing documents for ${getEmployeeName(parseInt(selectedEmployeeFilter))}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">No documents found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Employee</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Document Type</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Upload Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Expiry Date</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {documents.map((doc, index) => (
                      <tr
                        key={doc.documentID || doc.id || `document-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium">
                          {doc.documentID || doc.id || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-white">
                            {doc.employeeID ? getEmployeeName(doc.employeeID) : "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {doc.documentType || "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {doc.uploadDate
                            ? new Date(doc.uploadDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {doc.expiryDate
                            ? new Date(doc.expiryDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          {getExpiryStatus(doc.expiryDate)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {(() => {
                              const documentId = doc.documentID || doc.id
                              
                              if (!documentId) {
                                return <span className="text-gray-500 text-xs">No ID</span>
                              }
                              
                              return (
                                <>
                                  <Link
                                    href={`/dashboard/documents/${documentId}`}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 hover:border-gray-500 transition-colors"
                                    title="View all document details"
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
                                        onClick={() => handleEdit(doc)}
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
                                      onClick={() => handleDelete(documentId)}
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
                {selectedDocument ? "Edit Document" : "New Document"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {selectedDocument
                  ? "Update the selected document's information."
                  : "Upload a new document (e.g., contract)."}
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
                    <Label htmlFor="documentType" className="text-gray-300">
                      Document Type <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="documentType"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="e.g., Contract, ID, Certificate"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="uploadDate" className="text-gray-300">
                      Upload Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="uploadDate"
                      name="uploadDate"
                      type="date"
                      value={formData.uploadDate}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="expiryDate" className="text-gray-300">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      min={formData.uploadDate}
                      className="bg-gray-700 border-gray-600 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="filePath" className="text-gray-300">
                      File Path <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="filePath"
                      name="filePath"
                      value={formData.filePath}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      placeholder="Enter file path or URL"
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
                    {selectedDocument ? "Update Document" : "Create Document"}
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

