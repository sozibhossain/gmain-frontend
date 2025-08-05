
"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

async function fetchProduct(id) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/product/${id}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

async function postReview({ review, rating, product, token }) {
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


export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [farmId, setFarmId] = useState("");


async function addToCart({ productId, quantity, token }) {
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
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  return response.json();
}

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: postReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewDescription("");
      toast.success("Review posted successfully");
    },
    onError: (error) => {
      console.error("Error posting review:", error.message);
      toast.error("Failed to post review");
    },
  });

  const cartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      toast.success("Added to cart successfully");
    },
    onError: (error) => {
      console.error("Error adding to cart:", error.message);
      toast.error("Failed to add effect to cart");
    },
  });

  const product = data?.data;


  // Set farmId when product changes
  useEffect(() => {
    if (product?.farm?._id) {
      setFarmId(product.farm._id);
    }
  }, [product]);

  // const images = product?.media?.map((item) => item.url) || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  
const images = [
  ...(product?.media?.map((item) => item.url) || []),
  ...(product?.thumbnail?.url ? [product.thumbnail.url] : []),
];

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const updateQuantity = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleSaveReview = () => {
    reviewMutation.mutate({
      review: reviewDescription,
      rating: reviewRating,
      product: id,
      token,
    });
  };

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    cartMutation.mutate({
      productId: id,
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
    router.push(`/checkout?productId=${id}&quantity=${quantity}`);
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error.message}
      </div>
    );
  if (!product)
    return <div className="text-center py-10">No product data available</div>;

  return (
    <div className="mt-16">
      <div className="container mx-auto px-4 py-6 sm:py-8 shadow-md mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-8">
          {/* Image Gallery */}
          

<div className="space-y-4">
  <div className="relative aspect-square w-full h-[200px] sm:h-[300px] lg:h-[353px] rounded-lg overflow-hidden">
    <Image
      src={images[currentImageIndex] || "/placeholder.svg"}
      alt={product.title}
      fill
      className="object-cover"
      priority
    />
    {/* Show navigation buttons only if there are multiple images */}
    {images.length > 1 && (
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
    {images.map((image, index) => (
      <button
        key={index}
        onClick={() => setCurrentImageIndex(index)}
        className={`rounded-lg overflow-hidden border-2 transition-colors ${
          currentImageIndex === index ? "border-green-500" : "border-gray-200"
        }`}
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={`Thumbnail ${index + 1}`}
          width={1000}
          height={1000}
          className="object-cover w-full h-[60px] sm:h-[80px] lg:h-[116px]"
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
                      personally="sm"
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
                            ) || "05/09/2025"}
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
                        className="!bg-black"
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
                                    "/placeholder.svg?height=50&width=50"
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
                                    {new Date(
                                      review.date
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
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