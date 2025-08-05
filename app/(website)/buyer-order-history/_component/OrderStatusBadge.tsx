import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return {
          label: "Delivered",
          className: "bg-green-600 text-white",
        }
      case "pending":
        return {
          label: "Pending",
          className: "bg-amber-500 text-white",
        }
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-red-600 text-white",
        }
      default:
        return {
          label: status,
          className: "bg-gray-500 text-white",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full",
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}
