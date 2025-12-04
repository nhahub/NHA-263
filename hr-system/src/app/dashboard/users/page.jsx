"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "@/lib/api"
import { FiUser, FiEdit2, FiTrash2, FiEye } from "react-icons/fi"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [role, setRole] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showRoleUpdate, setShowRoleUpdate] = useState(false)
  const [newRole, setNewRole] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("role")
      setRole(userRole || "")
    }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getAllUsers()
      setUsers(response.data || [])
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch users"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = async (id) => {
    try {
      setError("")
      const response = await getUserById(id)
      setSelectedUser(response.data)
      setShowUserDetails(true)
    } catch (err) {
      console.error("Error fetching user:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch user details"
      )
    }
  }

  const handleUpdateRole = async (userId, currentRole) => {
    setUpdatingUserId(userId)
    setNewRole(currentRole)
    setShowRoleUpdate(true)
    setError("")
  }

  const handleRoleUpdateSubmit = async (e) => {
    e.preventDefault()

    if (!newRole.trim()) {
      setError("Role is required")
      return
    }

    try {
      setError("")
      setSuccess("")
      await updateUserRole(updatingUserId, newRole.trim())
      setSuccess(`User role updated to ${newRole} successfully`)
      setShowRoleUpdate(false)
      setUpdatingUserId(null)
      setNewRole("")
      fetchUsers()
    } catch (err) {
      console.error("Error updating user role:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update user role"
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return
    }

    try {
      setError("")
      setSuccess("")
      await deleteUser(id)
      setSuccess("User deleted successfully")
      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to delete user"
      )
    }
  }

  const getRoleBadgeColor = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
      case "hr":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "employee":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  const isAdmin = role === "admin"
  const canView = role === "admin" || role === "HR"

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-red-400 font-medium">
                You don't have permission to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Users Management</h1>
            <p className="text-gray-300">Manage system users and their roles</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-400 bg-green-900/20 rounded-md border border-green-700">
            {success}
          </div>
        )}

        {/* Role Update Modal */}
        {showRoleUpdate && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 border-2 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Update User Role</CardTitle>
              <CardDescription className="text-gray-400">
                Change the role for user ID: {updatingUserId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRoleUpdateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newRole" className="text-gray-300">
                    New Role <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="newRole"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="HR">HR</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRoleUpdate(false)
                      setUpdatingUserId(null)
                      setNewRole("")
                      setError("")
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Update Role
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Details</CardTitle>
              <CardDescription className="text-gray-400">Detailed information about the user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-400">User ID</Label>
                  <p className="font-medium text-white">{selectedUser.userId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Username</Label>
                  <p className="font-medium text-white">{selectedUser.username || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Employee ID</Label>
                  <p className="font-medium text-white">{selectedUser.employeeId || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Role</Label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role || "-"}
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserDetails(false)
                    setSelectedUser(null)
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Users List</CardTitle>
            <CardDescription className="text-gray-400">
              {users.length} user{users.length !== 1 ? "s" : ""} found in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-400">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-center py-8 text-gray-400">
                No users found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 font-semibold text-gray-300">ID</th>
                      <th className="text-left p-3 font-semibold text-gray-300">Username</th>
                      <th className="text-left p-3 font-semibold text-gray-300">Employee ID</th>
                      <th className="text-left p-3 font-semibold text-gray-300">Role</th>
                      <th className="text-left p-3 font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                        <td className="p-3 text-gray-300">{user.userId}</td>
                        <td className="p-3 font-medium text-white">{user.username || "-"}</td>
                        <td className="p-3 text-gray-300">{user.employeeId || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role || "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUser(user.userId)}
                              title="View Details"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <FiEye size={16} />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateRole(user.userId, user.role)}
                                  title="Update Role"
                                  className="border-gray-600 text-blue-400 hover:bg-gray-700 hover:text-blue-300"
                                >
                                  <FiEdit2 size={16} />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(user.userId)}
                                  title="Delete User"
                                >
                                  <FiTrash2 size={16} />
                                </Button>
                              </>
                            )}
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
      </div>
    </div>
  )
}

