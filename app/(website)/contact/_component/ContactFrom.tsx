"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"


interface ContactFormData {
  email: string
  name: string
  phone: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    name: "",
    phone: "",
    message: "",
  })

  // TanStack Query mutation for form submission
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/contact-us`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Message sent successfully!", {
        description: "We'll get back to you soon.",
      })
      // Reset form
      setFormData({
        email: "",
        name: "",
        phone: "",
        message: "",
      })
    },
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message || "Please try again later.",
      })
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.email || !formData.name || !formData.phone || !formData.message) {
      toast.error("Please fill in all fields")
      return
    }

    contactMutation.mutate(formData)
  }

  return (
    <div className="my-16 md:my-24 lg:my-[100px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 min-h-[600px] lg:min-h-[629px]">
            {/* Contact Information Panel */}
            <div
              className="relative w-full h-full min-h-[340px] lg:min-h-[629px] !rounded-[10px] bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/asset/contact.png')`,
              }}
            >
              <div className="absolute inset-0  !rounded-[10px]"></div>
              <div className="relative z-10 p-6 sm:p-8 lg:p-[32px] h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-xl lg:text-2xl text-[#272727] font-semibold mb-4">Contact Information</h2>
                  <p className="text-[#595959] font-medium mb-8 sm:mb-12 lg:mb-[120px] text-sm sm:text-base">
                    Contact Us at info@tablefresh.org
                  </p>

                  {/* <div className="space-y-6 lg:space-y-8">
                   
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Phone className="w-5 h-5 text-[#595959]" />
                      </div>
                      <span className="text-sm sm:text-base text-[#595959]">+1 (555) 000-0000</span>
                    </div>

                   
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#595959]" />
                      </div>
                      <span className="text-sm sm:text-base text-[#595959]">info@acme123.com</span>
                    </div>

                  
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <MapPin className="w-5 h-5 text-[#595959]" />
                      </div>
                      <span className="text-sm sm:text-base text-[#595959]">
                        00000 Artesia Blvd., Suite A-000,
                        <br />
                        Cerritos, CA 00000-0000
                      </span>
                    </div>
                  </div> */}
                </div>

                {/* Decorative circles */}
                <div className="relative">
                  <div className="absolute -bottom-4 -right-4 opacity-20">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10"></div>
                  </div>
                  <div className="absolute -bottom-8 -right-8 opacity-10">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white !rounded-[10px] p-6 sm:p-8 lg:p-0 flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="space-y-9 w-full max-w-full mx-auto md:p-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#0000001A] h-12 sm:h-[58px] rounded-[8px] text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#0000001A] h-12 sm:h-[58px] rounded-[8px] text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#0000001A] h-12 sm:h-[58px] rounded-[8px] text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Text..."
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#0000001A] h-32 sm:h-48 lg:h-[258px] rounded-[8px] resize-none text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="w-full md:pt-5">
                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 sm:h-[60px] px-8 rounded-[8px] font-medium transition-colors duration-200 w-full text-sm sm:text-base"
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
