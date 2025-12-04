"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getEmployeeById } from "@/lib/api"

export default function EmployeeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return

    // Only allow access if user is logged in; backend handles role/ownership via JWT
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const { data } = await getEmployeeById(params.id)
        setEmployee(data)
      } catch (err) {
        console.error("Failed to load employee:", err)
        setError("You are not authorized to view this employee or it does not exist.")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [params?.id, router])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight">Employee Details</h1>
          <p className="text-muted-foreground text-sm">
            View employee information. Access rules are enforced on the server using your JWT.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            All data for this employee as returned by the API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading employee...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !employee ? (
            <p className="text-sm text-muted-foreground">Employee not found.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(employee).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground uppercase">{key}</p>
                  <p className="text-base break-words">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? "")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


