"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, MapPin } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic"; // Import dynamic
import Link from "next/link";
import { Navbar } from "@/components/sheard/Navbar";
import { Footer } from "@/components/sheard/Footer";
import { signIn } from "next-auth/react";

// Dynamically import MapModal with ssr: false
const MapModal = dynamic(() => import("./_component/MapModal"), { ssr: false });

export default function SellerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sellerRegisterId, setSellerRegisterId] = useState<string>("");
  const [formData, setFormData] = useState({
    farmName: "",
    description: "",
    isOrganic: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Add a new state to track if the form was submitted without a location
  const [locationError, setLocationError] = useState<string | null>(null);

  const router = useRouter();

  // Ensure code runs only on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const getSellerRegisterId = () => {
      if (typeof document === "undefined") {
        return ""; // Return an empty string or handle as appropriate for server-side
      }
      const registerIdFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sellerRegisterId="))
        ?.split("=")[1];
      return registerIdFromCookie || "";
    };

    const registerId = getSellerRegisterId();
    setSellerRegisterId(registerId);

    if (!registerId) {
      toast.error("Please complete registration first");
      router.push("/sign-up");
    }
  }, [isClient, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 3) {
        toast.error("You can upload a maximum of 3 images");
        return;
      }
      setImages([...images, ...newFiles]);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newUrls = [...imageUrls];
    URL.revokeObjectURL(newUrls[index]);
    newImages.splice(index, 1);
    newUrls.splice(index, 1);
    setImages(newImages);
    setImageUrls(newUrls);
  };

  const handleLocationSelect = (
    lat: number,
    lng: number,
    place: string | null
  ) => {
    setLatitude(lat);
    setLongitude(lng);
    setPlaceName(place);
    console.log("Selected Location:", {
      latitude: lat,
      longitude: lng,
      placeName: place,
    });
    setIsMapOpen(false);
  };

  // Existing handleSubmit function with location validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmName) {
      toast.error("Please enter your farm name");
      return;
    }

    if (!sellerRegisterId) {
      toast.error("Seller registration ID is required");
      return;
    }

    if (latitude === null || longitude === null || !placeName) {
      toast.error("Please select your farm location");
      setLocationError(
        "Please select your farm location using the Map button."
      );
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("farmName", formData.farmName);
      submitData.append("description", formData.description);
      submitData.append("isOrganic", formData.isOrganic.toString());
      submitData.append("id", sellerRegisterId);
      submitData.append("latitude", latitude.toString());
      submitData.append("longitude", longitude.toString());
      submitData.append("placeName", placeName);

      images.forEach((image) => {
        submitData.append("media", image);
      });

      let accessToken = "";
      if (isClient) {
        accessToken =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1] || "";
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller/apply`,
        {
          method: "POST",
          headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: submitData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Farm profile created successfully!");

        // Try auto-login using stored credentials
        const email = sessionStorage.getItem("email");
        const password = sessionStorage.getItem("password");

        if (email && password) {
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (signInResult?.error) {
            toast.error(
              "Farm created, but login failed. Please log in manually."
            );
            router.push("/login");
          } else {
            toast.success("You're now logged in!");
            router.push("/dashboard");
          }

          // Clear credentials from storage
          sessionStorage.removeItem("email");
          sessionStorage.removeItem("password");
        } else {
          toast.warning(
            "Farm created, but login skipped (credentials missing)."
          );
          router.push("/login");
        }
      } else {
        toast.error(result.message || "Failed to create farm profile");
      }
    } catch (error) {
      console.error("Error submitting farm profile:", error);
      toast.error("An error occurred while setting up your farm profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || !sellerRegisterId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Set Up Your Seller Profile</h1>
              <div className="">
                <Link href="/become-seller">
                  <ArrowLeft />
                </Link>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="farmName">Set Farm Name</Label>
                <Input
                  id="farmName"
                  placeholder="Set name"
                  value={formData.farmName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      farmName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Upload Your Farm Pictures</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 flex flex-col items-center justify-center relative"
                    >
                      {index < imageUrls.length ? (
                        <>
                          <Image
                            src={imageUrls[index] || "/placeholder.svg"}
                            width={1000}
                            height={1000}
                            alt={`Farm image ${index + 1}`}
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                          <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Add Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Describe Your Farm</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your farm, what you grow, your farming practices, etc."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organic"
                  checked={formData.isOrganic}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isOrganic: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="organic" className="text-sm font-medium">
                  Select only if you produce organic products
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Farm Location</Label>
                {placeName ? (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {placeName}
                  </p>
                ) : (
                  <p
                    className={`text-base text-center py-4 ${
                      locationError ? "text-red-500" : "text-gray-600"
                    }`}
                  >
                    {locationError ||
                      "Click the Map button below to select your farm location."}
                  </p>
                )}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    className="w-[146px] h-[44px] bg-[#039B06] text-white hover:bg-[#039B06]"
                    onClick={() => {
                      setIsMapOpen(true);
                      setLocationError(null); // Clear error when opening map
                    }}
                  >
                    <MapPin />
                    Map
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-[146px] h-[44px] bg-[#039B06] hover:bg-[#039B06]"
                  disabled={isLoading}
                >
                  {isLoading ? "Setting up..." : "Continue"}
                </Button>
              </div>
            </form>
          </div>
          {isMapOpen && (
            <MapModal
              isOpen={isMapOpen}
              onClose={() => setIsMapOpen(false)}
              onLocationSelect={handleLocationSelect}
              initialLat={latitude ?? null}
              initialLng={longitude ?? null}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
