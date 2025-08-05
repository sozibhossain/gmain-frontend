"use client"
import Image from "next/image"
import Link from "next/link"


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md rounded-xl p-6 sm:p-8">
        <DialogHeader className="relative flex flex-col items-center text-center">
         
          <Image
            src="/asset/logo.png"
            width={40}
            height={53}
            alt="Table Fresh Logo"
            className="mb-4 h-[53px] w-[40px]"
            priority
          />
          <DialogTitle className="text-2xl font-bold text-gray-800">Make a Secure Donation</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p className="mb-4">
            I want to thank everyone who has sign up and is using our platform. Tablefresh is free to use, building
            community and connecting everyone to fresh nutritious food, Any and all donations are greatly appreciated ,
            ensuring the future of the best fresh food global platform
          </p>
          <p className="font-semibold">Thank You from the Tablefresh Team</p>
        </div>
        <div className="mt-6 flex flex-col items-center gap-4">
          <Link href="#" className="text-md font-semibold text-[#039B06] underline hover:no-underline">
            Set Your Payment
          </Link>
          <Input
            type="text"
            placeholder="Enter your Amount..."
            className="w-full rounded-md border border-gray-300 p-3 text-center text-lg focus:border-[#039B06] focus:ring-[#039B06]"
          />
          <Button className="w-full rounded-md bg-[#039B06] py-3 text-lg font-semibold text-white hover:bg-[#028a05]">
            Donate Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
  
}
