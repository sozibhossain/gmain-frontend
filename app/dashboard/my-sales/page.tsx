"use client";
import SalesTable from "./_component/SalesTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SalesPage() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">My Sales</h1>
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Sales</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* <Card className="bg-green-600 text-white">
        <CardContent className="p-6">
          <div>
            <p className="text-sm opacity-90">Total Sales Revenue</p>
            {isLoading ? (
              <Skeleton className="h-8 w-32 bg-green-500" />
            ) : (
              <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
            )}
          </div>
        </CardContent>
      </Card> */}
      <SalesTable />
    </div>
  );
}
