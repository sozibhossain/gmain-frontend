
'use client';
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';

interface CheckoutFormProps {
  userId: string;
  serviceId: string;
  price: number;
  type: string;
}

const confirmPayment = async ({ paymentIntentId }: { paymentIntentId: string }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('API URL is not defined');

  const response = await fetch(`${apiUrl}/payment/confirm-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId }),
  });
  if (!response.ok) throw new Error('Failed to confirm payment');
  return response.json();
};

export default function CheckoutForm({  price, type }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const confirmPaymentMutation = useMutation({
    mutationFn: confirmPayment,
    onSuccess: () => {
      setMessage('Payment succeeded!');
      // Redirect based on type
      const redirectUrl = type === 'order' ? '/succeess' : '/donate-success';
      window.location.href = redirectUrl;
    },
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setMessage(error.message || 'An unknown error occurred.');
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${type === 'order' ? '/succeess' : '/donate-success'}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message ?? 'An unknown error occurred.');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      await confirmPaymentMutation.mutateAsync({ paymentIntentId: paymentIntent.id });
    } else {
      setMessage(`Payment status: ${paymentIntent?.status ?? 'unknown'}`);
      setLoading(false);
    }
  };

  // Format the price as currency (assuming USD for this example)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return (
    <div className="flex items-center justify-center h-[600px] overflow-y-auto">
      <div className="w-full rounded-xl p-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          Complete Your Payment
        </h2>
        {/* Display the payment amount */}
        <div className="mb-4 text-center">
          <p className="text-lg sm:text-xl font-semibold text-gray-700">
            Amount to Pay: {formattedPrice}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <PaymentElement />
          </div>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center text-sm sm:text-base ${
              message.includes('succeeded') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}