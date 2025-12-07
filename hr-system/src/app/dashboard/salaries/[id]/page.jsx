"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSalaryById } from "@/lib/api"

export default function SalaryDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [salary, setSalary] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const salaryId = params?.id
    
    // Validate ID exists and is not undefined
    if (!salaryId || salaryId === "undefined") {
      setError("Invalid salary ID.")
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

    const fetchSalary = async () => {
      try {
        setLoading(true)
        setError("")
        const { data } = await getSalaryById(salaryId)
        setSalary(data)
        console.log("Salary data:", data)
      } catch (err) {
        console.error("Failed to load salary:", err)
        setError(
          err.response?.data?.message ||
          err.message ||
          "You are not authorized to view this salary record or it does not exist. Employees can only view their own salary records."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSalary()
  }, [params?.id, router])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
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
            <h1 className="text-2xl font-bold text-cyan-400">Salary Record Details</h1>
            <p className="text-gray-300 text-sm">
              View salary information. Access rules are enforced on the server using your JWT. Employees can only view their own records.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Salary Information</CardTitle>
            <CardDescription className="text-gray-400">
              All data for this salary record as returned by the API. This is sensitive financial data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400">Loading salary record...</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : !salary ? (
              <p className="text-sm text-gray-400">Salary record not found.</p>
            ) : (
              <div className="space-y-4">
                {/* Key Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Salary ID</p>
                    <p className="text-base text-white font-medium">
                      {salary.salaryID || salary.id || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Employee ID</p>
                    <p className="text-base text-white">
                      {salary.employeeID || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Pay Date</p>
                    <p className="text-base text-white">
                      {salary.payDate
                        ? new Date(salary.payDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Base Salary</p>
                    <p className="text-base text-white font-semibold">
                      {formatCurrency(salary.baseSalary)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Bonus</p>
                    <p className="text-base text-green-400">
                      {formatCurrency(salary.bonus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Deductions</p>
                    <p className="text-base text-red-400">
                      {formatCurrency(salary.deductions)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">Net Salary</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(salary.netSalary)}
                    </p>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Calculation Breakdown</p>
                  <div className="bg-gray-800/50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Salary:</span>
                      <span className="text-white">{formatCurrency(salary.baseSalary || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">+ Bonus:</span>
                      <span className="text-green-400">{formatCurrency(salary.bonus || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">- Deductions:</span>
                      <span className="text-red-400">{formatCurrency(salary.deductions || 0)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                      <span className="text-gray-300 font-semibold">Net Salary:</span>
                      <span className="text-green-400 font-bold text-lg">
                        {formatCurrency(salary.netSalary || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* All Fields Display */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">All Fields</p>
                  <div className="space-y-3">
                    {Object.entries(salary).map(([key, value]) => (
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

