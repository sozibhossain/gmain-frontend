"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { OrderSummaryModal } from "./_components/order-summary-modal"

export default function OrderHistoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // eslint-disable-next-line
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const orders = Array.from({ length: 8 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    product: "Fresh Strawberries",
    quantity: "2 Box",
    price: "$50",
    date: "06/03/2025",
    status: i % 4 === 1 ? "Pending" : i % 4 === 3 ? "Cancelled" : "Delivered",
  }))

  // eslint-disable-next-line
  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">Order History</h1>
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead className="hidden sm:table-cell">Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.product}</TableCell>
                  <TableCell className="hidden sm:table-cell">{order.quantity}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        order.status === "Delivered"
                          ? "border-green-500 bg-green-500 text-white"
                          : order.status === "Pending"
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-red-500 bg-red-500 text-white"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="link"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleOpenDetails(order)}
                    >
                      See Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="text-sm text-muted-foreground">Showing 1 to 5 of 12 results</div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">8</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <OrderSummaryModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} order={selectedOrder} />
    </div>
  )
}
