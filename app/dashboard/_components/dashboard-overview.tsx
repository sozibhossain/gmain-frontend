"use client"

import { useState, useEffect } from "react"
import { DashboardStats } from "./dashboard-stats"


import SellReportChart from "./SellReportChart"

interface DashboardData {
  totalSales: number
  liveProducts: number
}

export function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 132570,
    liveProducts: 8,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true)
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setDashboardData({
        totalSales: 132570,
        liveProducts: 8,
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Dashboard</p>
        </div>
      </div>

      <DashboardStats totalSales={dashboardData.totalSales} liveProducts={dashboardData.liveProducts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SellReportChart />
       
      </div>
    </div>
  )
}
