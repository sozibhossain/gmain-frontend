import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Download } from "lucide-react"

interface Order {
  id: string
  product: string
  quantity: string
  price: string
  date: string
  status: string
}

interface OrderSummaryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
}

export function OrderSummaryModal({ isOpen, onOpenChange, order }: OrderSummaryModalProps) {
  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Summary</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image src="/placeholder.svg?height=64&width=64" alt={order.product} fill className="object-cover" />
            </div>
            <div className="grid gap-1">
              <h3 className="font-medium">{order.product}</h3>
              <p className="text-sm text-muted-foreground">Sunshine Organic Farm</p>
              <div className="text-sm">
                {order.quantity.split(" ")[0]} x ${Number.parseInt(order.price.substring(1)) / 2}{" "}
                <span className="font-medium">{order.price}</span>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{order.price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>${(Number.parseInt(order.price.substring(1)) * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>${(Number.parseInt(order.price.substring(1)) * 1.08).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">Order ID:</span> {order.id}
            </div>
            <div className="text-sm">
              <span className="font-medium">Date:</span> {order.date}
            </div>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
