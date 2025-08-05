"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, Download } from "lucide-react"
import Image from "next/image"
import jsPDF from "jspdf"

interface ProductDetails {
  _id: string
  title: string
  price: number
  thumbnail: {
    url: string
  }
}

interface OrderProduct {
  product: ProductDetails
  quantity: number
  price: number
  totalPrice: number
  _id: string
}

interface Order {
  _id: string
  products: OrderProduct[]
  totalPrice: number
  status: "pending" | "delivered" | "cancelled"
  paymentStatus: string
  date: string
  code: string
}

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null

  const subtotal = order.products.reduce((sum, item) => sum + item?.product?.price * item.quantity, 0)
  const shipping = 15.0
  const tax = subtotal * 0.08 // 8% tax
 

  const handleDownloadInvoice = () => {
    const doc = new jsPDF()

    // Set up the PDF
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 20, 30)

    // Order details
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Order Code: #${order.code}`, 20, 50)
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 60)
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 70)
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, 80)

    // Products header
    doc.setFont("helvetica", "bold")
    doc.text("PRODUCTS", 20, 100)

    // Products table header
    doc.setFontSize(10)
    doc.text("Product Name", 20, 115)
    doc.text("Unit Price", 100, 115)
    doc.text("Quantity", 130, 115)
    doc.text("Total", 160, 115)

    // Draw line under header
    doc.line(20, 118, 190, 118)

    // Products data
    let yPosition = 130
    doc.setFont("helvetica", "normal")

    order.products.forEach((item) => {
      const productName =
        item.product.title.length > 25 ? item.product.title.substring(0, 25) + "..." : item.product.title

      doc.text(productName, 20, yPosition)
      doc.text(`$${item.product.price.toFixed(2)}`, 100, yPosition)
      doc.text(`${item.quantity} Box`, 130, yPosition)
      doc.text(`$${item.totalPrice.toFixed(2)}`, 160, yPosition)

      yPosition += 15
    })

    // Summary section
    yPosition += 10
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 15

    doc.setFont("helvetica", "bold")
    doc.text("BILLING SUMMARY", 20, yPosition)
    yPosition += 15

    doc.setFont("helvetica", "normal")
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 130, yPosition)
    yPosition += 10
    doc.text(`Shipping: $${shipping.toFixed(2)}`, 130, yPosition)
    yPosition += 10
    doc.text(`Tax (8%): $${tax.toFixed(2)}`, 130, yPosition)
    yPosition += 10

    // Total
    doc.line(130, yPosition, 190, yPosition)
    yPosition += 10
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`TOTAL: $${order.totalPrice.toFixed(2)}`, 130, yPosition)

    // Footer
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your order!", 20, 280)

    // Save the PDF
    doc.save(`invoice-${order.code}.pdf`)

    console.log("PDF Invoice downloaded for order:", order.code)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#272727]">Order Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Products Section */}
          <div className="space-y-4">
            {order.products.map((item) => (
              <div key={item._id} className="flex gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                  <Image
                    src={item?.product?.thumbnail?.url || "/placeholder.svg?height=80&width=80"}
                    width={100}
                    height={100}
                    alt={item?.product?.title || "product"}
                    className="object-cover rounded-lg w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#272727] text-sm sm:text-base line-clamp-2">
                    {item.product?.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 ml-1">4.5</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-lg sm:text-xl font-semibold text-[#272727]">
                      ${item.product?.price?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Qty: {item.quantity} Box{item.quantity > 1 ? "es" : ""}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#027405] mt-1">
                    Subtotal: ${item.totalPrice?.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Items Subtotal</span>
              <span className="font-medium text-[#272727]">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-[#272727]">${shipping.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-medium text-[#272727]">${tax.toFixed(2)}</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#272727]">Total</span>
                <span className="font-bold text-lg text-[#272727]">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-gray-600">Order Code</span>
              <span className="font-medium text-[#272727]">#{order.code}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Payment Status</span>
              <span
                className={`font-medium capitalize ${
                  order.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownloadInvoice}
            className="w-full bg-[#027405] hover:bg-[#025a04] text-white font-medium py-2.5"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
