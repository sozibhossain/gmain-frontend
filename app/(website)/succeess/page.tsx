import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function page() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md rounded-lg shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Thank you for your order!</CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Your order has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y- px-6">
          {/* <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Order Number:</span>
              <span className="text-gray-600 dark:text-gray-300">#ORD-12345678</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Estimated Delivery:</span>
              <span className="text-gray-600 dark:text-gray-300">June 15, 2023</span>
            </div>
          </div> */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-3">
            We&apos;ve sent a confirmation email to your email address with all the details of your order.
          </p>
          <Link href="/">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Continue Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
