"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FutureProduct from "./Future_product";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Truck,
  Shield,
  Minus,
  Plus,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// Type definitions
interface Location {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Farm {
  _id: string;
  name: string;
  location: Location;
  isOrganic: boolean;
  status: string;
  description: string;
  images: Array<{
    public_id: string;
    url: string;
    _id: string;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videos: any[];
  seller: string;
  longitude: number;
  latitude: number;
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  review: any[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaItem {
  public_id: string;
  url: string;
  type: "video" | "photo";
  _id: string;
}

interface Thumbnail {
  public_id: string;
  url: string;
}

interface Review {
  user: {
    name?: string;
    username?: string;
    avatar?: {
      url: string;
    };
  };
  rating: number;
  text: string;
  date: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  quantity: string;
  category: Category;
  description: string;
  media: MediaItem[];
  thumbnail: Thumbnail;
  farm: Farm;
  status: "active" | "inactive";
  code: string;
  review: Review[];
  createdAt: string;
  updatedAt: string;
  weight?: string;
}

interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

interface ReviewRequest {
  review: string;
  rating: number;
  product: string;
  token: string;
}

interface CartRequest {
  productId: string;
  quantity: number;
  token: string;
}

interface MediaItemProps {
  media:
    | MediaItem
    | { url: string; type: "photo" | "video"; public_id?: string };
  alt: string;
  className: string;
  isMain?: boolean;
  onClick?: () => void;
}

// API functions with proper typing
async function fetchProduct(id: string): Promise<ProductResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/product/${id}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

async function postReview({
  review,
  rating,
  product,
  token,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
ReviewRequest): Promise<any> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/write-review`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ review, rating, product }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to post review");
  }
  return response.json();
}

async function addToCart({
  productId,
  quantity,
  token,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
CartRequest): Promise<any> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) {
    throw new Error("Failed to add to cart");
  }
  return response.json();
}

// Media Item Component for handling both images and videos
function MediaItem({
  media,
  alt,
  className,
  isMain = false,
  onClick,
}: MediaItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const handleVideoClick = (e: React.MouseEvent) => {
    if (media.type === "video") {
      e.stopPropagation();
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
    }
    if (onClick) onClick();
  };

  const handleVideoLoad = () => {
    if (videoRef.current && isMain) {
      videoRef.current.play().catch(console.error);
    }
  };

  if (media.type === "video") {
    return (
      <div
        className={`relative ${className} cursor-pointer`}
        onClick={handleVideoClick}
        onMouseEnter={() => setShowPlayButton(true)}
        onMouseLeave={() => setShowPlayButton(false)}
      >
        <video
          ref={videoRef}
          src={media.url}
          className="w-full h-full object-cover"
          autoPlay={isMain}
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoad}
        />
        {/* Play/Pause overlay */}
        {(showPlayButton || !isPlaying) && isMain && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
            <div className="bg-white/80 rounded-full p-3">
              {isPlaying ? (
                <Pause className="h-6 w-6 text-gray-800" />
              ) : (
                <Play className="h-6 w-6 text-gray-800" />
              )}
            </div>
          </div>
        )}
        {/* Video indicator for thumbnails */}
        {!isMain && (
          <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5">
            <Play className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Image
      src={media.url || "/placeholder.svg"}
      alt={alt}
      fill={isMain}
      width={isMain ? undefined : 1000}
      height={isMain ? undefined : 1000}
      className={className}
      priority={isMain}
      onClick={onClick}
    />
  );
}

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "details" | "reviews"
  >("description");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const { data: session } = useSession();
  const token = session?.accessToken as string;
  const [farmId, setFarmId] = useState("");

  const productId = Array.isArray(id) ? id[0] : id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId as string),
    enabled: !!productId,
  });

  const reviewMutation = useMutation({
    mutationFn: postReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewDescription("");
      toast.success("Review posted successfully");
    },
    onError: (error: Error) => {
      console.error("Error posting review:", error.message);
      toast.error("Failed to post review");
    },
  });

  const cartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart successfully");
    },
    onError: (error: Error) => {
      console.error("Error adding to cart:", error.message);
      toast.error("Failed to add to cart");
    },
  });

  const product = data?.data;

  // Set farmId when product changes
  useEffect(() => {
    if (product?.farm?._id) {
      setFarmId(product.farm._id);
    }
  }, [product]);

  // Create media array with both images and videos, including thumbnail
  const mediaItems: Array<{
    url: string;
    type: "photo" | "video";
    public_id?: string;
  }> = [
    ...(product?.media || []),
    ...(product?.thumbnail?.url
      ? [
          {
            url: product.thumbnail.url,
            type: "photo" as const,
            public_id: product.thumbnail.public_id,
          },
        ]
      : []),
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length
    );
  };

  const updateQuantity = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleSaveReview = () => {
    if (!productId || !token) return;

    reviewMutation.mutate({
      review: reviewDescription,
      rating: reviewRating,
      product: productId,
      token,
    });
  };

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    if (!productId || !token) return;

    cartMutation.mutate({
      productId,
      quantity,
      token,
    });
  };

  const handlePurchase = () => {
    if (!session) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    router.push(`/checkout?productId=${productId}&quantity=${quantity}`);
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  if (!product)
    return <div className="text-center py-10">No product data available</div>;

  return (
    <div className="mt-16">
      <div className="container mx-auto px-4 py-6 sm:py-8 shadow-md mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-8">
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full h-[200px] sm:h-[300px] lg:h-[353px] rounded-lg overflow-hidden">
              {mediaItems[currentImageIndex] && (
                <MediaItem
                  media={mediaItems[currentImageIndex]}
                  alt={product.title}
                  className="object-cover"
                  isMain={true}
                />
              )}
              {/* Show navigation buttons only if there are multiple media items */}
              {mediaItems.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {mediaItems.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index
                      ? "border-green-500"
                      : "border-gray-200"
                  }`}
                >
                  <MediaItem
                    media={media}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover w-full h-[60px] sm:h-[80px] lg:h-[116px]"
                    isMain={false}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#272727] mb-4">
                {product.title}
              </h1>
              <p className="text-sm sm:text-base text-[#323232] font-normal underline mb-2">
                {product.farm.name}
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-[#707070]">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {product.farm.location.street} • 2.5 kilometers away
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#FFD700] text-[#FACC15]" />
                  <span className="text-xs sm:text-sm font-medium">
                    {product.review.length > 0
                      ? product.review[0]?.rating
                      : "No reviews"}
                  </span>
                  <span className="text-xs sm:text-sm text-[#707070]">
                    ({product.review.length})
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-lg sm:text-xl font-semibold text-[#111827] mt-6 mb-1">
                  ${product.price} per box
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 text-xs sm:text-sm"
                >
                  {product.status === "active" ? "In stock" : "Out of stock"}
                </Badge>
              </div>
            </div>
            {/* Quantity and Purchase */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-7">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    QTY
                  </label>
                  <div className="flex items-center border-[1px] border-[#595959] rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(-1)}
                      className="h-8 sm:h-10 w-8 sm:w-10 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-3 sm:px-4 py-1 sm:py-2 min-w-[40px] sm:min-w-[60px] text-center text-sm sm:text-base">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(1)}
                      className="h-8 sm:h-10 w-8 sm:w-10 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base text-[#707070] font-medium mb-1">
                    Total
                  </div>
                  <div className="text-lg sm:text-xl text-[#111827] font-normal">
                    ${(product.price * quantity).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Button
                  className="bg-[#039B06] w-full h-10 sm:h-11 hover:bg-[#039B06]/80 text-white rounded text-sm sm:text-base"
                  onClick={handlePurchase}
                >
                  Purchase
                </Button>
                <Button
                  className="h-10 sm:h-11 w-full sm:w-auto rounded bg-transparent border border-[#00000033] text-[#039B06] hover:bg-transparent text-sm sm:text-base"
                  onClick={handleAddToCart}
                >
                  {cartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>
            {/* Features */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#595959] font-normal">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#595959] font-normal">
                <Shield className="h-4 w-4" />
                <span>Satisfaction guaranteed or your money back</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Tab Implementation */}
        <Card className="shadow-none border-none">
          <CardContent className="p-0">
            <div className="w-full">
              {/* Custom Tab Headers */}
              <div className="flex border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium flex-shrink-0 ${
                    activeTab === "description"
                      ? "text-[#039B06] border-b-2 border-[#039B06]"
                      : "text-gray-600"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium flex-shrink-0 ${
                    activeTab === "details"
                      ? "text-[#039B06] border-b-2 border-[#039B06]"
                      : "text-gray-600"
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium flex-shrink-0 ${
                    activeTab === "reviews"
                      ? "text-[#039B06] border-b-2 border-[#039B06]"
                      : "text-gray-600"
                  }`}
                >
                  Reviews
                </button>
              </div>
              {/* Tab Content */}
              {activeTab === "description" && (
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {product.description}
                  </p>
                </div>
              )}
              {activeTab === "details" && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                        Product Specifications
                      </h3>
                      <div className="space-y-2 text-sm sm:text-base">
                        <div className="flex items-center">
                          <span className="text-gray-600 w-48">Origin:</span>
                          <span className="font-medium ml-4">
                            {product.farm.location.street || "California, USA"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 w-48">
                            Organic Certified:
                          </span>
                          <span className="font-medium ml-4">
                            {product.farm.isOrganic ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 w-48">Weight:</span>
                          <span className="font-medium ml-4">
                            {product.weight || "5 lbs per box"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 w-48">
                            Delivery Date:
                          </span>
                          <span className="font-medium ml-4">
                            {new Date(product.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                        Farm Practices
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Sustainable farming, No synthetic pesticides, Drip
                        irrigation
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="p-4 sm:p-6 ">
                  <div className="space-y-6">
                    <div>
                      <Dialog
                        open={showReviewModal}
                        onOpenChange={setShowReviewModal}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-[#039B06] h-10 sm:h-11 rounded text-white hover:bg-[#039B06]/80 mt-6 sm:mt-8 text-sm sm:text-base"
                          >
                            Write a Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                              Write Your Review
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Star Rating */}
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                                Rate Us
                              </Label>
                              <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                                        star <= reviewRating
                                          ? "fill-[#FACC15] text-[#FACC15]"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Description */}
                            <div>
                              <Label
                                htmlFor="review-description"
                                className="text-xs sm:text-sm font-medium text-gray-700 mb-3"
                              >
                                Description
                              </Label>
                              <Textarea
                                id="review-description"
                                value={reviewDescription}
                                onChange={(e) =>
                                  setReviewDescription(e.target.value)
                                }
                                placeholder="Write your review here..."
                                rows={4}
                                className="mt-2 resize-none text-sm sm:text-base"
                              />
                            </div>
                            {/* Save Button */}
                            <Button
                              onClick={handleSaveReview}
                              className="w-full bg-[#039B06] hover:bg-[#039B06]/80 text-white h-10 sm:h-11 rounded text-sm sm:text-base"
                              disabled={reviewMutation.isPending}
                            >
                              {reviewMutation.isPending
                                ? "Submitting..."
                                : "Save"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div>
                      {product.review.length === 0 ? (
                        <p className="text-gray-700 text-sm sm:text-base">
                          No reviews yet. Be the first to write a review!
                        </p>
                      ) : (
                        product.review.map((review, index) => (
                          <div key={index} className="mb-6 border-b pb-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                <AvatarImage
                                  src={
                                    review.user.avatar?.url ||
                                    "/placeholder.svg?height=50&width=50" ||
                                    "/placeholder.svg"
                                  }
                                />
                                <AvatarFallback>
                                  {review.user.name?.[0] || "US"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="gap-2 mb-2">
                                  <span className="font-medium text-base sm:text-lg text-[#595959]">
                                    {review.user.name ||
                                      review.user.username ||
                                      "Anon"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.round(review.rating)
                                          ? "fill-[#FACC15] text-[#FACC15]"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs sm:text-sm text-gray-500 ml-3">
                                    {new Date(review.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-[#272727] text-sm sm:text-base font-normal leading-[150%] mt-4 sm:mt-6 ">
                              {review.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <FutureProduct farmId={farmId} />
    </div>
  );
}
