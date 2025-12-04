"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProjectById } from "@/lib/api"

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const projectId = params?.id
    
    // Validate ID exists and is not undefined
    if (!projectId || projectId === "undefined") {
      setError("Invalid project ID.")
      setLoading(false)
      return
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }
    }

    const fetchProject = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getProjectById(projectId)
        setProject(data)
        console.log("Project data:", data)
        if (data) {
          console.log("Project ID fields:", {
            id: data.id,
            projectId: data.projectId,
            projectID: data.projectID
          })
        }
      } catch (err) {
        console.error("Failed to load project:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this project or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params?.id, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Project Details</h1>
            <p className="text-gray-300 text-sm">
              View project information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Project Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this project as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading project...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !project ? (
              <p className="text-sm text-gray-400">Project not found.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(project).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-700 pb-3 last:border-0">
                    <p className="text-xs text-gray-400 uppercase mb-1">{key}</p>
                    <p className="text-base text-white break-words">
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value, null, 2)
                        : String(value ?? "-")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

