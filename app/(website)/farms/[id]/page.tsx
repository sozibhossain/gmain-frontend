"use client";

import Image from "next/image";
import { MapPin, Star, MessageCircle, Clock6, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/sheard/PageHeader";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Product {
  _id: string;
  title: string;
  thumbnail?: { url: string };
  price: number;
  quantity: string;
  review: { rating: number; user: string; text: string; _id: string }[];
  status: string;
}

interface Farm {
  _id: string;
  name: string;
  isOrganic: boolean;
  description: string;
  images?: { url: string; public_id: string; _id: string }[];
  location: {
    city: string;
    state: string;
    street: string;
  };
  review: { rating: number; user: string; text: string; _id: string }[];
  latitude?: number;
  longitude?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    farm: Farm;
    product: Product[];
  };
}

interface ReviewData {
  review: string;
  rating: number;
  farm: string;
}

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function FarmPage() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const params = useParams();
  const farmId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const token = session?.accessToken;

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["farm", farmId],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/user/farm/${farmId}`);
      if (!response.ok) throw new Error("Failed to fetch farm data");
      return response.json();
    },
  });

  const postReview = useMutation({
    mutationFn: async (reviewData: ReviewData) => {
      const response = await fetch(`${BASE_URL}/user/write-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error("Failed to submit review");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Review submitted successfully!");
        setIsReviewModalOpen(false);
        setReviewText("");
        setRating(0);
        queryClient.invalidateQueries({ queryKey: ["farm", farmId] });
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    },
    onError: () => {
      toast.error("Failed to submit review. Please try again.");
    },
  });

  const handleStartChat = async () => {
    if (!token) {
      toast.error("Please login to start a chat");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/chat/create-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ farmId }),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/messages/`);
        toast.success("Chat is opening...");
      } else {
        throw new Error(data.message || "Failed to create chat");
      }
    } catch {
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareExperience = () => {
    if (!token) {
      toast.error("Please login to share your experience");
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error("Please enter a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    postReview.mutate({ review: reviewText, rating, farm: farmId });
  };

  const handleRating = (star: number) => setRating(star);

  if (isLoading) {
    return (
      <div className="min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="animate-pulse">
          <div className="h-40 sm:h-56 md:h-72 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="w-full lg:w-96 h-48 sm:h-64 lg:h-80 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Error loading farm data. Please try again later.
        </p>
      </div>
    );
  }

  const farm = data.data.farm;
  const products = data.data.product;
  const position = [farm.latitude, farm.longitude] as [number, number];

  // if (typeof farm.latitude !== "number" || typeof farm.longitude !== "number") {
  //   return <p>Invalid coordinates provided for the map.</p>;
  // }

  // const position: [number, number] = [farm.latitude, farm.longitude];

  const averageRating =
    farm.review.length > 0
      ? farm.review.reduce((sum, review) => sum + review.rating, 0) /
        farm.review.length
      : 0;

  return (
    <div className="min-h-screen">
      <PageHeader
        image={farm.images?.[0]?.url || "/asset/framheader.jpg"}
        title={farm.name}
        gradientColor="0, 115, 2"
        gradientOpacity={0.4}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={farm.images?.[0]?.url || "/asset/profile1.png"}
                  alt={`${farm.name} profile`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 640px) 80px, 100px"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#272727] mb-2">
                  {farm.name}
                </h1>
                {farm.isOrganic && (
                  <div className="flex items-center gap-2 mb-2">
                    <Clock6 className="w-4 h-4 text-[#039B06] flex-shrink-0" />
                    <span className="text-sm sm:text-base text-[#039B06]">
                      Organic Products
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4 text-[#039B06] flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    {farm.location.city}, {farm.location.state}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-6">
              <p className="text-sm sm:text-base text-[#4B5563] mb-4">
                {farm.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                  <span className="font-semibold text-sm sm:text-base">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm sm:text-base text-[#272727]">
                    ({farm.review.length})
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleStartChat}
                  disabled={loading}
                  className="bg-[#039B06] hover:bg-[#039B06]/80 text-white rounded-md w-full sm:w-auto text-sm sm:text-base px-4 py-2"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {loading ? "Starting..." : "Message Farmer"}
                </Button>
                <Button
                  onClick={handleShareExperience}
                  disabled={loading}
                  className="border border-[#039B06] bg-transparent text-[#039B06] hover:bg-[#039B06]/10 rounded-md w-full sm:w-auto text-sm sm:text-base px-4 py-2"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Experience
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[600px] lg:h-[300px] rounded-lg overflow-hidden border border-gray-200 z-10">
            {farm.latitude && farm.longitude ? (
              <div className="w-full h-[450px]">
                <MapContainer
                  center={position}
                  zoom={11}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* <Marker position={position}>
                    <Popup>{farm.name}</Popup>
                  </Marker> */}

                  <Circle
                    center={position}
                    radius={1000} // radius in meters (e.g. 1000 = 1km)
                    pathOptions={{
                      fillColor: "green",
                      color: "green",
                      fillOpacity: 0.2,
                    }}
                  />
                </MapContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
                Map not available
              </div>
            )}
          </div>
        </div>

        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Share Your Experience
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rating" className="text-sm sm:text-base">
                  Rating
                </Label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`cursor-pointer text-2xl sm:text-3xl ${
                        star <= rating ? "text-[#FACC15]" : "text-gray-300"
                      }`}
                      onClick={() => handleRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="review" className="text-sm sm:text-base">
                  Review
                </Label>
                <Input
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                  className="mt-2 h-12 text-sm sm:text-base"
                />
              </div>
            </div>
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setIsReviewModalOpen(false)}
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={postReview.isPending}
                className="bg-[#039B06] hover:bg-[#039B06]/80 w-full sm:w-auto text-sm sm:text-base"
              >
                {postReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="pb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#272727] mb-6">
            Farm Products
          </h2>
          {products.length === 0 ? (
            <div className="text-center text-sm sm:text-base text-[#4B5563]">
              No products available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  href={`/product-details/${product._id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={product.thumbnail?.url || "/placeholder.svg"}
                        alt={product.title}
                        width={1000}
                        height={1000}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                    {product.status !== "active" && (
                      <Badge className="absolute top-2 left-2 bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <div className="pt-3">
                    <h3 className="font-semibold text-sm sm:text-base text-[#111827] mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4B5563] mb-1">
                      2.5 kilometers away
                    </p>
                    <p className="text-xs sm:text-sm text-[#4B5563] mb-2">
                      Available all year
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base text-[#111827]">
                        ${product.price} per Box
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                        <span className="text-sm sm:text-base text-gray-900">
                          {(
                            product.review.reduce(
                              (acc, r) => acc + r.rating,
                              0
                            ) / product.review.length || 0
                          ).toFixed(1)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          ({product.review.length})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
