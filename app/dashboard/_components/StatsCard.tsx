'use client'
import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Define the API response interface
interface DashboardData {
  success: boolean;
  data: {
    totalSales: number;
    liveProducts: number;
    userId: string;
  };
}

// Fetch function for the dashboard data with token


export default function StatsCard() {
const session = useSession();
const token = session.data?.accessToken;
  const fetchDashboardData = async (): Promise<DashboardData> => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or expired token");
    }
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }

  const data: DashboardData = await response.json();
  return data;
};
  const { data, isLoading, error } = useQuery<DashboardData, Error>({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
  });

  // Format totalSales with commas for readability
  const formattedTotalSales = data?.data.totalSales.toLocaleString() ?? "0";
  const liveProducts = data?.data.liveProducts.toString() ?? "0";

  // Handle error message for display
  const errorMessage = error
    ? error.message.includes("Unauthorized")
      ? "Please log in again"
      : "Error loading data"
    : null;

  // Define color classes
  const colorClasses = {
    green: "text-green-600",
    orange: "text-orange-500",
    blue: "text-blue-600",
    red: "text-red-600",
  };

  return (
    <div className="w-full grid gap-6 md:grid-cols-2">
      {isLoading ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-x-[60px] items-center">
                <div>
                  <p className="text-xl text-[#272727] font-semibold">Total Sell</p>
                  <p className={cn("text-2xl font-bold mt-1", colorClasses.green)}>
                    Loading...
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-md">
                    <Image
                    src="/asset/dashbord1.png"
                    width={1000}
                    height={1000}
                    alt="logo"
                    className="h-[53px] w-[53px]"
                   
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-x-[60px] items-center">
                <div>
                  <p className="text-xl text-[#272727] font-semibold">Live Product</p>
                  <p className={cn("text-2xl font-bold mt-1", colorClasses.orange)}>
                    Loading...
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-md">
                    <Image
                    src="/asset/dashbord2.png"
                    width={1000}
                    height={1000}
                    alt="logo"
                    className="h-[53px] w-[53px]"
                   
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : error ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Sell</p>
                  <p className={cn("text-2xl font-bold mt-1", colorClasses.red)}>
                    {errorMessage}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-md">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-x-[60px] items-center">
                <div>
                  <p className="text-xl text-[#272727] font-semibold">Live Product</p>
                  <p className={cn("text-2xl font-bold mt-1", colorClasses.red)}>
                    {errorMessage}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-md">
                    <Image
                    src="/asset/dashbord2.png"
                    width={1000}
                    height={1000}
                    alt="logo"
                    className="h-[53px] w-[53px]"
                   
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-x-[60px]  items-center">
                <div>
                  <p className="text-xl text-[#272727] font-semibold">Total Sell</p>
                  <p className={cn("text-2xl font-bold mt-1", colorClasses.green)}>
                    {formattedTotalSales}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-md">
              
                  <Image
                    src="/asset/dashbord1.png"
                    width={1000}
                    height={1000}
                    alt="logo"
                    className="h-[53px] w-[53px]"
                   
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-x-[60px] items-center">
                <div>
                  <p className="text-xl text-[#272727] font-semibold">Live Product</p>
                  <p className={cn("text-2xl font-bold mt-1", colorClasses.orange)}>
                    {liveProducts}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-md">
                   <Image
                    src="/asset/dashbord2.png"
                    width={1000}
                    height={1000}
                    alt="logo"
                    className="h-[53px] w-[53px]"
                   
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
