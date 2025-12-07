"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiEdit2 } from "react-icons/fi"
import Link from "next/link"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getEmployeeById } from "@/lib/api"

export default function MyProfilePage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      const currentEmployeeId = localStorage.getItem("employeeId")
      const role = localStorage.getItem("role")

      if (!token) {
        router.push("/login")
        return
      }

      if (role !== "Employee") {
        router.push("/dashboard")
        return
      }

      if (currentEmployeeId) {
        setEmployeeId(currentEmployeeId)
        fetchEmployee(currentEmployeeId)
      } else {
        setError("Employee ID not found. Please log in again.")
        setLoading(false)
      }
    }
  }, [router])

  const fetchEmployee = async (id) => {
    try {
      setLoading(true)
      setError("")
      const { data } = await getEmployeeById(id)
      setEmployee(data)
    } catch (err) {
      console.error("Failed to load employee profile:", err)
      setError("Failed to load your profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground text-sm">
              View and manage your personal information
            </p>
          </div>
        </div>
        {employee && (
          <Link href={`/dashboard/employees/${employeeId}`}>
            <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
              <FiEdit2 className="w-4 h-4" />
              View Full Details
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : !employee ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Profile not found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Name</p>
                  <p className="text-base font-medium">
                    {employee.name || employee.firstName || employee.lastName
                      ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.name
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
                  <p className="text-base font-medium">{employee.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Phone</p>
                  <p className="text-base font-medium">{employee.phone || employee.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Employee ID</p>
                  <p className="text-base font-medium">{employee.id || employee.employeeId || employeeId || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Your employment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Hire Date</p>
                  <p className="text-base font-medium">{formatDate(employee.hireDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Employment Status</p>
                  <p className="text-base font-medium">
                    {employee.employmentStatus ? (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          employee.employmentStatus.toLowerCase() === "active"
                            ? "bg-green-100 text-green-800"
                            : employee.employmentStatus.toLowerCase() === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {employee.employmentStatus}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                {employee.jobId && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Job ID</p>
                    <p className="text-base font-medium">{employee.jobId}</p>
                  </div>
                )}
                {employee.departmentId && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">Department ID</p>
                    <p className="text-base font-medium">{employee.departmentId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {Object.keys(employee).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>All available profile data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(employee)
                    .filter(([key]) => !["name", "email", "phone", "phoneNumber", "hireDate", "employmentStatus", "jobId", "departmentId", "id", "employeeId"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-2">
                        <p className="text-xs text-muted-foreground uppercase mb-1">{key}</p>
                        <p className="text-base break-words">
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value, null, 2)
                            : String(value ?? "")}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

