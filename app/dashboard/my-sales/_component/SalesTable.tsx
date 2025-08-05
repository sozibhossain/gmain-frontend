"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PacificPagination from "@/components/ui/PacificPagination";

import { useTransformedSalesData } from "./useSalesData";

export default function SalesTable() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { sales, isLoading, error, totalPage, total } = useTransformedSalesData(
    page,
    limit
  );

  if (isLoading) {
    return (
      <>
        <div className="text-xl text-[#272727] font-medium">Sales History</div>
        <Card className="shadow-none border-none bg-transparent">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="text-base text-[#272727] font-medium">
                  <TableHead>Order Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Sell Amount</TableHead>
                  <TableHead>Admin Charge</TableHead>
                  <TableHead>My Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow className="h-[70px]" key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="text-xl text-[#272727] font-medium">Sales History</div>
        <Card>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load sales data. Please try again later.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="text-xl text-[#272727] font-medium mb-4">Sales History</div>

      <CardContent>
        {sales.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No sales data available
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="text-base text-[#272727] font-medium">
                  <TableHead>Order Code</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Sell Amount</TableHead>
                  <TableHead>
                    Admin <span className="text-[#039B06]">Charge (4.99%)</span>
                  </TableHead>
                  <TableHead>My Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale, index) => (
                  <TableRow
                    className="h-[70px] text-[18px] text-[#323232] font-medium"
                    key={`${sale.orderId}-${sale.productId}-${index}`}
                  >
                    <TableCell className="">
                      {sale.orderCode}
                    </TableCell>
                    <TableCell>
                      <div className="">
                        {sale.productTitle}
                      </div>
                    </TableCell>
                    <TableCell className="">
                      {sale.customer}
                    </TableCell>
                    <TableCell className="">
                      {sale.quantity} box
                    </TableCell>
                    <TableCell className="">
                      {sale.date}
                    </TableCell>
                    <TableCell className="">
                      ${sale.totalSellAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="">
                      ${sale.adminCharge.toFixed(2)}
                    </TableCell>
                    <TableCell className="">
                      ${sale.myRevenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPage > 10 && (
              <div className="flex justify-between items-center mt-4 px-4 py-2">
                <div className="text-sm text-muted-foreground">
                  Showing {sales.length} of {total} sales
                </div>
                <PacificPagination
                  currentPage={page}
                  totalPages={totalPage}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </>
  );
}