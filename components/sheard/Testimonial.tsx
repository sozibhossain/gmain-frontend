"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Define TypeScript interfaces
interface Avatar {
  public_id: string;
  url: string;
}

interface User {
  _id: string;
  name: string;
  avatar: Avatar;
}

interface Review {
  _id: string;
  rating: number;
  user: User;
  text?: string;
  location?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    review: Review[];
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
}

// Fetch reviews
const fetchReviews = async (token: string | undefined): Promise<Review[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/get-review-website`,
    {
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();
  return data.data[0]?.review || [];
};

// Skeleton component for loading state
function TestimonialSkeleton() {
  return (
    <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
      <div className="h-full">
        <Card className="border rounded-lg p-6 h-full">
          <CardContent className="p-0 space-y-4 flex flex-col h-full">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex items-center justify-center text-lg font-medium text-gray-600" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
  );
}

export default function TestimonialCarousel() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const {
    data: reviews = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Review[], Error>({
    queryKey: ["reviews", token],
    queryFn: () => fetchReviews(token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className="bg-white mb-[60px] md:mb-[120px]">
      <div className="container mx-auto px-4 md:px-0 py-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#272727] pb-2">
                What Our Customers Say
              </h2>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <CarouselPrevious className="h-9 w-[76px] rounded-[4px] border border-[#039B06] flex items-center justify-center text-[#039B06]  static" />
              <CarouselNext className="h-9 w-[76px] rounded-[4px] border border-[#039B06] flex items-center justify-center text-[#039B06]  static" />
            </div>
          </div>
          <CarouselContent className="-ml-4">
            {isLoading ? (
              <>
                <TestimonialSkeleton />
                <TestimonialSkeleton />
                <TestimonialSkeleton />
              </>
            ) : error ? (
              <div className="text-center py-12 text-red-500 col-span-full">
                Error loading reviews: {error.message}
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500 col-span-full">
                No reviews available.
              </div>
            ) : (
              reviews.map((review) => (
                <CarouselItem
                  key={review._id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <div className="h-full">
                    <Card className="border rounded-lg p-6 h-full">
                      <CardContent className="p-0 space-y-4 flex flex-col h-full">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-[#595959] fill-[#595959]"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-base text-[#272727] font-normal leading-[150%] flex-grow">
                          {review.text || "No review text provided."}
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                          {review.user.avatar.url &&
                          review.user.avatar.url !==
                            "/assets/placeholder.svg" ? (
                            <Image
                              src={review.user.avatar.url}
                              alt={review.user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium text-gray-600">
                              {review.user.name
                                .split(" ")
                                .map((word) => word.charAt(0).toUpperCase())
                                .slice(0, 2)
                                .join("")}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-[#595959] text-[18px]">
                              {review.user.name}
                            </p>
                            <p className="text-sm text-[#6B7280] font-normal">
                              {review.location || "Location not specified"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
