"use client";
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useQuery } from "@tanstack/react-query";
import CheckoutForm from "./CheckoutForm";

interface CheckoutFormWrapperProps {
  userId: string | "";
  serviceId?: string;
  amount: number;
  type: string;
}
// Define a specific interface for the body object
interface PaymentBody {
  userId?: string;
  orderId?: string;
  price: number;
  type: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function CheckoutFormWrapper({
  userId,
  serviceId,
  amount,
  type,
}: CheckoutFormWrapperProps) {
  const {
    data: clientSecret,
    error,
    isPending,
  } = useQuery({
    queryKey: ["create-payment-intent", userId, serviceId, amount, type],
    queryFn: async () => {
      const body: PaymentBody = {
        ...(userId ? { userId } : {}),
        orderId: serviceId,
        price: amount,
        type,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const data = await response.json();
      return data.clientSecret;
    },
    enabled: !!amount, // Only run if amount exists
    refetchOnWindowFocus: false,
  });

  if (error)
    return <div className="text-red-600 p-4">{(error as Error).message}</div>;
  if (isPending || !clientSecret)
    return <div className="p-4">Loading payment information...</div>;

  const appearance = { theme: "stripe" } as const;
  const options = { clientSecret, appearance };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        userId={userId}
        serviceId={serviceId ?? ""}
        price={amount}
        type={type}
      />
    </Elements>
  );
}
