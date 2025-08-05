"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface BannerAd {
  _id: string;
  thumbnail: {
    public_id: string;
    url: string;
  };
  title: string;
  link: string;
  clicked: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchBanners(): Promise<BannerAd[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-ads`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch banners");
  }
  return data.data;
}

async function trackClick(bannerId: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/post-click/${bannerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!data.success) {
      console.error("Failed to track click:", data.message);
    }
  } catch (error) {
    console.error("Error tracking click:", error);
  }
}

export default function Add_Banner() {
  const [isVisible, setIsVisible] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const {
    data: bannerAds = [],
    isLoading,
    error,
  } = useQuery<BannerAd[], Error>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  const handleBannerClick = (banner: BannerAd) => {
    // Track the click
    trackClick(banner._id);
    // Redirect to the banner's link
    window.open(banner.link, "_blank");
  };

  if (!isVisible) return null;
  if (error) return <div>Error loading banners: {error.message}</div>;
  if (bannerAds.length === 0 && !isLoading) return <div>No banners available</div>;

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {isLoading ? (
        <div className="w-full">
          {/* Skeleton for banner */}
          <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-200 animate-pulse rounded-lg" />
          {/* Skeleton for dot indicators */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full bg-gray-300 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {bannerAds.map((ad) => (
              <CarouselItem key={ad._id} className="w-full">
                <div
                  className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundImage: `url(${ad.thumbnail.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => handleBannerClick(ad)}
                  title={ad.title}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering banner click
                      setIsVisible(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

      {/* Dot indicators (only shown when not loading) */}
      {!isLoading && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {bannerAds.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                current === index + 1 ? "bg-black/70 w-6" : "bg-black/30"
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}