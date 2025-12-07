"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPerformanceEvaluationById } from "@/lib/api"

export default function PerformanceEvaluationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const evaluationId = params?.id
    
    // Validate ID exists and is not undefined
    if (!evaluationId || evaluationId === "undefined") {
      setError("Invalid evaluation ID.")
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

    const fetchEvaluation = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getPerformanceEvaluationById(evaluationId)
        setEvaluation(data)
        console.log("Evaluation data:", data)
      } catch (err) {
        console.error("Failed to load evaluation:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this evaluation or it does not exist."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluation()
  }, [params?.id, router])

  const getScoreBadgeColor = (score) => {
    const numScore = parseFloat(score) || 0
    if (numScore >= 90) {
      return "bg-green-900/50 text-green-400 border border-green-700"
    } else if (numScore >= 70) {
      return "bg-yellow-900/50 text-yellow-400 border border-yellow-700"
    } else if (numScore >= 50) {
      return "bg-orange-900/50 text-orange-400 border border-orange-700"
    } else {
      return "bg-red-900/50 text-red-400 border border-red-700"
    }
  }

  const getScoreLabel = (score) => {
    const numScore = parseFloat(score) || 0
    if (numScore >= 90) return "Excellent"
    if (numScore >= 70) return "Good"
    if (numScore >= 50) return "Average"
    return "Needs Improvement"
  }

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
            <h1 className="text-2xl font-bold text-cyan-400">Performance Evaluation Details</h1>
            <p className="text-gray-300 text-sm">
              View evaluation information. Access rules are enforced on the server using your JWT.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Evaluation Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this evaluation as returned by the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading evaluation...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !evaluation ? (
              <p className="text-sm text-gray-400">Evaluation not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Evaluation ID</p>
                    <p className="text-base text-white font-medium">
                      {evaluation.evaluationID || evaluation.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Employee ID</p>
                    <p className="text-base text-white">
                      {evaluation.employeeID || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Evaluation Date</p>
                    <p className="text-base text-white">
                      {evaluation.date
                        ? new Date(evaluation.date).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Criteria ID</p>
                    <p className="text-base text-white">
                      {evaluation.criteriaID || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Score</p>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-base font-semibold ${getScoreBadgeColor(
                          evaluation.score
                        )}`}
                      >
                        {evaluation.score || 0}
                      </span>
                      <span className="text-white text-sm">
                        ({getScoreLabel(evaluation.score)})
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Comments</p>
                    <p className="text-base text-white whitespace-pre-wrap bg-gray-800/50 p-3 rounded-md">
                      {evaluation.comments || "-"}
                    </p>
                  </div>
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(evaluation).map(([key, value]) => (
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

