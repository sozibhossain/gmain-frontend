import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function page() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center bg-gray-100 px-4  dark:bg-gray-950">
      <Card className="w-full max-w-md rounded-lg shadow-lg">
        <CardHeader className="flex flex-col items-center p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Thank you for your Donation!</CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Your donation has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <Link href="/">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Continue </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
