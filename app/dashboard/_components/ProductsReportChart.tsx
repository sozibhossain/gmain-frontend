"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import * as Tabs from "@radix-ui/react-tabs";
import { useSession } from "next-auth/react";

// Define interfaces for API response and chart data
interface ReportItem {
  date: string;
  count: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    report: ReportItem[];
    userId: string;
  };
}

interface ChartData {
  name: string;
  value: number;
  color: string;
  products: number;
}

// Fetch data from API
const fetchProductsReport = async (range: string, token: string | undefined): Promise<ReportItem[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller/new-products-report?period=${range}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products report");
  }

  const data: ApiResponse = await response.json();
  if (!data.success) {
    throw new Error("API request was not successful");
  }

  return data.data.report;
};

// Transform API data to match PieChart format
const transformData = (report: ReportItem[]): ChartData[] => {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayCount = report
    .filter((item) => new Date(item.date).toDateString() === today.toDateString())
    .reduce((sum, item) => sum + item.count, 0);

  const weekCount = report
    .filter((item) => new Date(item.date) >= weekAgo)
    .reduce((sum, item) => sum + item.count, 0);

  const monthCount = report
    .filter((item) => new Date(item.date) >= monthAgo)
    .reduce((sum, item) => sum + item.count, 0);

  return [
    { name: "This Day", value: todayCount, color: "#8b5cf6", products: todayCount },
    { name: "This Week", value: weekCount, color: "#0d9488", products: weekCount },
    { name: "This Month", value: monthCount, color: "#22c55e", products: monthCount },
  ];
};

// Custom tooltip component with proper types
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">Products: {data.products}</p>
        <p className="text-sm">Completion: {data.value}</p>
      </div>
    );
  }
  return null;
};

export default function ProductsReportChart() {
  const [view, setView] = useState<"day" | "week" | "month" | "year">("month");
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data: reportData, isLoading, error } = useQuery<ReportItem[], Error>({
    queryKey: ["productsReport", view],
    queryFn: () => fetchProductsReport(view, token),
    enabled: !!token, // Only fetch if token exists
  });

  if (isLoading) {
    return <div className="p-6 bg-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 bg-white">Error: {error.message}</div>;
  }

  if (!reportData) {
    return <div className="p-6 bg-white">No data available</div>;
  }

  const data = transformData(reportData);

  return (
    <div className="p-6 bg-white">
      <div className="grid grid-cols-6 gap-8">
        <div className="col-span-4 space-y-2">
          <h3 className="font-medium text-lg">Total New Products Report</h3>

          <Tabs.Root
            value={view}
            onValueChange={(value) => setView(value as "day" | "week" | "month" | "year")}
            className=""
          >
            <Tabs.List className="bg-slate-100 rounded-md grid grid-cols-4 gap-4 p-1">
              <Tabs.Trigger
                value="day"
                className="px-3 py-1 text-sm rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Day
              </Tabs.Trigger>
              <Tabs.Trigger
                value="week"
                className="px-3 py-1 text-sm rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Week
              </Tabs.Trigger>
              <Tabs.Trigger
                value="month"
                className="px-3 py-1 text-sm rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Month
              </Tabs.Trigger>
              <Tabs.Trigger
                value="year"
                className="px-3 py-1 text-sm rounded-md data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Year
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                <span className="text-xs">This Day</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span className="text-xs">This Week</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs">This Month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-[30px]">
        <ResponsiveContainer width={300} height={300}>
          <PieChart>
            {/* Background circles */}
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="70%"
              fill="#f3f4f6"
              stroke="none"
              dataKey="value"
            />
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="50%"
              innerRadius="75%"
              outerRadius="85%"
              fill="#f3f4f6"
              stroke="none"
              dataKey="value"
            />
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="50%"
              innerRadius="90%"
              outerRadius="100%"
              fill="#f3f4f6"
              stroke="none"
              dataKey="value"
            />

            {/* Data circles */}
            <Pie
              data={[
                { ...data[0], name: data[0].name, products: data[0].products },
                { value: Math.max(100 - data[0].value, 0), name: "Remaining", products: 0 },
              ]}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius="90%"
              outerRadius="100%"
              dataKey="value"
              strokeWidth={0}
              nameKey="name"
            >
              <Cell fill={data[0].color} />
              <Cell fill="transparent" />
            </Pie>
            <Pie
              data={[
                { ...data[1], name: data[1].name, products: data[1].products },
                { value: Math.max(100 - data[1].value, 0), name: "Remaining", products: 0 },
              ]}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius="75%"
              outerRadius="85%"
              dataKey="value"
              strokeWidth={0}
              nameKey="name"
            >
              <Cell fill={data[1].color} />
              <Cell fill="transparent" />
            </Pie>
            <Pie
              data={[
                { ...data[2], name: data[2].name, products: data[2].products },
                { value: Math.max(100 - data[2].value, 0), name: "Remaining", products: 0 },
              ]}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius="60%"
              outerRadius="70%"
              dataKey="value"
              strokeWidth={0}
              nameKey="name"
            >
              <Cell fill={data[2].color} />
              <Cell fill="transparent" />
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}