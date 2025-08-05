"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

export default function VerifyOtpContent() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const decodedEmail = email ? decodeURIComponent(email) : "";

  useEffect(() => {
    if (!decodedEmail) {
      toast.error("Email is required for OTP verification");
      router.push("/change-password");
    }

    // Start countdown for resend OTP
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [decodedEmail, router]);

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setCountdown(30);

    try {
      // Here you would call your API to resend OTP
      // await resendOtp(decodedEmail)
      toast.success("New OTP sent successfully!");
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      // Here you would verify the OTP with your backend
      // const isValid = await verifyOtp(decodedEmail, otpString)

      // For demo purposes, we'll simulate successful verification
      const isValid = true;

      if (isValid) {
        toast.success("OTP verified successfully!");

        // Store verification data
        sessionStorage.setItem("verifiedOtp", otpString);
        sessionStorage.setItem("otpVerificationTime", new Date().toISOString());
        sessionStorage.setItem("verifiedEmail", decodedEmail);

        // Redirect to password update with email and OTP in query parameters
        router.push(
          `/change-password?email=${encodeURIComponent(
            decodedEmail
          )}&otp=${encodeURIComponent(otpString)}`
        );
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    const maskedLocal =
      localPart.length > 2
        ? localPart.slice(0, 2) + "*".repeat(localPart.length - 2)
        : localPart;
    return `${maskedLocal}@${domain}`;
  };

  if (!decodedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex">
        {/* Left side - Hero Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/asset/authentication.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container relative z-10 flex flex-col justify-center items-center p-12 text-white">
            <div className="mb-8 backdrop-blur-[50px] bg-white/23 shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] p-5 rounded-[16px]">
              <div className="flex items-start gap-2">
                <Image
                  src="/asset/logo.png"
                  width={40}
                  height={53}
                  alt="Table Fresh Logo"
                  className="h-[53px] w-[40px]"
                />
                <div className="flex flex-col">
                  <div className="">
                    <p className="text-[16px] font-semibold text-black">
                      TABLE
                    </p>
                    <p className="text-[16px] font-normal text-[#039B06]">
                      FRESH
                    </p>
                  </div>
                  <span className="text-[6px] font-medium leading-[120%] text-[#8F8F8F]">
                    Fresh & Healthy
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">Input the one-time code</h1>
            <p className="text-lg opacity-90 text-center">
              Discover fresh, local produce from farms around the world
            </p>
          </div>
        </div>

        {/* Right side - OTP Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Reset password
              </h2>
              <p className="text-gray-600">
                Enter your email to receive the OTP
              </p>
              {decodedEmail && (
                <p className="text-sm text-gray-500 mt-2">
                  We&apos;ve sent a verification code to{" "}
                  <span className="font-medium text-gray-700">
                    {maskEmail(decodedEmail)}
                  </span>
                </p>
              )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className="flex justify-center space-x-3"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    {resendDisabled
                      ? `Resend OTP in ${countdown} seconds`
                      : "Enter the 6-digit code sent to your email"}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={otp.join("").length !== 6 || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify Now"}
                </Button>
              </form>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  ← Back to forgot password
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                  className="text-green-600 text-sm hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
