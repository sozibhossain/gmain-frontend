"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"


// Define static banner images
const staticBanners = [
  {
    _id: "1",
    thumbnail: {
      url: "/images/dummy.jpg", 
    },
  },
 

];

export default function DummyBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)



  // Use static banners instead
  const bannerAds = staticBanners;

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [api])

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  if (!isVisible) return null

  // No need to check loading/error states for static data
  if (bannerAds.length === 0) return <div>No banners available</div>

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
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
                className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center"
                style={{
                  backgroundImage: `url(${ad.thumbnail.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
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
    </div>
  )
}
