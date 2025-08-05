"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ApiResponse {
  success: boolean;
  data: {
    thisMonth: { date: string; total: number }[];
    lastMonth: { date: string; total: number }[];
    farm: string;
  };
}

interface ChartData {
  date: string;
  thisMonth: number;
  lastMonth: number;
}

const fetchSellReport = async (range: string, token: string | undefined): Promise<ChartData[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller/sell-report?period=${range}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sell report");
  }
  const result: ApiResponse = await response.json();
  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  // Transform API data to match chart format
  const { thisMonth, lastMonth } = result.data;
  // Ensure data is sorted by date
  const sortedThisMonth = [...thisMonth].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedLastMonth = [...lastMonth].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Merge thisMonth and lastMonth data by date
  const allDates = Array.from(
    new Set([...thisMonth.map((d) => d.date), ...lastMonth.map((d) => d.date)])
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return allDates.map((date) => {
    const thisMonthEntry = sortedThisMonth.find((entry) => entry.date === date);
    const lastMonthEntry = sortedLastMonth.find((entry) => entry.date === date);
    return {
      date: new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" }), // Format: "1 Oct"
      thisMonth: thisMonthEntry ? thisMonthEntry.total / 1000 : 0, // Convert to 'k' units
      lastMonth: lastMonthEntry ? lastMonthEntry.total / 1000 : 0, // Convert to 'k' units
    };
  });
};

export default function SellReportChart() {
  const [view, setView] = useState<"day" | "week" | "month" | "year">("month");
  const { data: session } = useSession();
  const token = session?.accessToken; // Adjust based on your session structure

  const { data, isLoading, error } = useQuery<ChartData[], Error>({
    queryKey: ["sellReport", view],
    queryFn: () => fetchSellReport(view, token),
    enabled: !!token, // Only fetch if token exists
  });

  const formatTooltipValue = (value: number) => `${value}k`;

  return (
    <div className="p-6 bg-white">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="font-semibold text-[#272727] text-lg">Sell Report</h3>
        <Tabs value={view} onValueChange={(value) => setView(value as "day" | "week" | "month" | "year")}>
          <TabsList className="grid grid-cols-4 bg-gray-100 p-1 h-auto">
            <TabsTrigger
              value="day"
              className={`${
                view === "day" ? "!bg-[#039B06] text-white" : "text-gray-600 hover:text-gray-900"
              } px-3 py-1 text-sm rounded transition-colors`}
            >
              Day
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className={`${
                view === "week" ? "!bg-[#039B06] text-white" : "text-gray-600 hover:text-gray-900"
              } px-3 py-1 text-sm rounded transition-colors`}
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className={`${
                view === "month" ? "!bg-[#039B06] text-white" : "text-gray-600 hover:text-gray-900"
              } px-3 py-1 text-sm rounded transition-colors`}
            >
              Month
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className={`${
                view === "year" ? "!bg-[#039B06] text-white" : "text-gray-600 hover:text-gray-900"
              } px-3 py-1 text-sm rounded transition-colors`}
            >
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs">This Month</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="text-xs">Last Month</span>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 ">Error: {error.message}</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#f5f5f5" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              tickFormatter={(value) => `${value}k`}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              name="This Month"
              type="monotone"
              dataKey="thisMonth"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ stroke: "#22c55e", strokeWidth: 2, r: 4, fill: "white" }}
              activeDot={{ r: 6, fill: "#22c55e" }}
            />
            <Line
              name="Last Month"
              type="monotone"
              dataKey="lastMonth"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ stroke: "#60a5fa", strokeWidth: 2, r: 4, fill: "white" }}
              activeDot={{ r: 6, fill: "#60a5fa" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}