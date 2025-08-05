"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import FarmsCard from "./sheard/FramsCarda" // Assuming this path is correct
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import Add_Banner from "./Add_Banner" // Assuming this path is correct
import { useMap } from "react-leaflet"






// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false }) // Re-added CircleMarker

interface Location {
  street: string
  city: string
  state: string
  zipCode: string
}

interface FarmImage {
  public_id: string
  url: string
  _id: string
}

interface Seller {
  avatar: {
    public_id: string
    url: string
  }
  _id: string
}

interface Review {
  text: string
  rating: number
  user: string
  _id: string
}

interface Farm {
  _id: string
  status: "approved" | "pending" | "rejected"
  name: string
  description: string
  isOrganic?: boolean
  images: FarmImage[]
  seller: Seller | null
  code: string
  location?: Location
  review?: Review[]
  profileImage?: string
  longitude?: number
  latitude?: number
  createdAt: string
  updatedAt: string
  __v?: number
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    farm: Farm[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPage: number
    }
  }
}

interface ProductImage {
  public_id: string
  url: string
  type: string
  _id: string
}

interface ProductReview {
  text: string
  rating: number
  user: string
  _id: string
  date: string
}

interface Product {
  thumbnail: {
    public_id: string
    url: string
  }
  _id: string
  title: string
  price: number
  quantity: string
  category: string
  description?: string
  media: ProductImage[]
  farm: string
  status: "active" | "inactive" | "out_of_stock"
  code: string
  review: ProductReview[]
  createdAt: string
  updatedAt: string
  __v?: number
}

interface ProductApiResponse {
  success: boolean
  message: string
  data: Product[]
}

// Component to handle auto-fitting bounds
const AutoFitBounds = ({ farms }: { farms: Farm[] }) => {
  const map = useMap()

  useEffect(() => {
    const farmsWithCoordinates = farms.filter(
      (farm) =>
        farm.longitude !== undefined && farm.latitude !== undefined && !isNaN(farm.longitude) && !isNaN(farm.latitude),
    )

    if (farmsWithCoordinates.length > 0) {
      if (farmsWithCoordinates.length === 1) {
        // Single farm - center on it with reasonable zoom
        const farm = farmsWithCoordinates[0]
        map.setView([farm.latitude!, farm.longitude!], 11)
      } else {
        // Multiple farms - fit bounds to show all
        const bounds = farmsWithCoordinates.map((farm) => [farm.latitude!, farm.longitude!] as [number, number])
        map.fitBounds(bounds, {
          padding: [20, 20], // Add padding around the bounds
          maxZoom: 15, // Don't zoom in too much
        })
      }
    }
  }, [farms, map])

  return null
}

// Map component for displaying farms
const FarmsMap = ({ farms }: { farms: Farm[] }) => {
  // Filter farms that have coordinates
  const farmsWithCoordinates = farms.filter(
    (farm) =>
      farm.longitude !== undefined && farm.latitude !== undefined && !isNaN(farm.longitude) && !isNaN(farm.latitude),
  )

  // Default center (you can adjust this based on your needs)
  const defaultCenter: [number, number] = [34.0522, -118.2437] // Los Angeles coordinates

  // Calculate center based on farms or use default
  const mapCenter: [number, number] =
    farmsWithCoordinates.length > 0
      ? [
          farmsWithCoordinates.reduce((sum, farm) => sum + farm.latitude!, 0) / farmsWithCoordinates.length,
          farmsWithCoordinates.reduce((sum, farm) => sum + farm.longitude!, 0) / farmsWithCoordinates.length,
        ]
      : defaultCenter

  if (typeof window === "undefined") {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={farmsWithCoordinates.length === 1 ? 11 : 6} // Start with lower zoom for multiple farms
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit bounds component */}
        <AutoFitBounds farms={farms} />

        {farmsWithCoordinates.map((farm) => (
          <div key={farm._id}>
            {/* CircleMarker - fixed pixel radius, always visible as a central dot */}
            <CircleMarker
              center={[farm.latitude!, farm.longitude!]}
              radius={8} // Adjust radius for desired dot size
              pathOptions={{
                fillColor: "#16a34a", // Darker green fill
                color: "#16a34a", // Same color border
                fillOpacity: 0.8, // Solid fill
                weight: 1, // Thin border
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">{farm.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {farm.location?.city}, {farm.location?.state}
                  </p>
                  <p className="text-xs">{farm.description}</p>
                  {farm.isOrganic && <Badge className="mt-1 text-xs bg-green-100 text-green-800">Organic</Badge>}
                </div>
              </Popup>
            </CircleMarker>

            {/* Circle - geographic radius, shows service area when zoomed in */}
            <Circle
              center={[farm.latitude!, farm.longitude!]}
              radius={1000} // 1km radius in meters
              pathOptions={{
                fillColor: "#22c55e", // Green fill
                color: "#16a34a", // Darker green border
                fillOpacity: 0.2, // Slightly more opaque fill
                weight: 2, // Border thickness
              }}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  )
}

const Featured_Farms = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 8
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const categoryId = searchParams.get("category")

  // Check if we should show the split layout (when there's a search term)
  const showSplitLayout = !!searchTerm

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "")
    setCurrentPage(1)
  }, [searchParams])

  const calculateAverageRating = (reviews: { rating: number }[] = []) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((total, review) => total + review.rating, 0)
    return sum / reviews.length
  }

  const {
    data: farmsData,
    isLoading: isLoadingFarms,
    error: errorFarms,
  } = useQuery<ApiResponse>({
    queryKey: ["farms", currentPage, searchTerm],
    queryFn: async () => {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined")
      }
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`
      }
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/user/all-farm`)
      url.searchParams.set("page", currentPage.toString())
      url.searchParams.set("limit", limit.toString())
      if (searchTerm) {
        url.searchParams.set("search", searchTerm)
      }
      const response = await fetch(url.toString(), {
        headers,
      })
      if (!response.ok) {
        throw new Error(`"Not Found farms"`)
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "API returned unsuccessful response")
      }
      if (!Array.isArray(result.data.farm)) {
        throw new Error("Invalid API response format: farm data is not an array")
      }
      return result
    },
    enabled: !categoryId,
  })

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery<ProductApiResponse>({
    queryKey: ["products", categoryId],
    queryFn: async () => {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined")
      }
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/product-by-category/${categoryId}`, {
        headers,
      })
      if (!response.ok) {
        throw new Error(`"Not Found products"`)
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "API returned unsuccessful response")
      }
      if (!Array.isArray(result.data)) {
        throw new Error("Invalid API response format: product data is not an array")
      }
      return result
    },
    enabled: !!categoryId,
  })

  const isCategoryView = !!categoryId

  const getFirstLetter = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const renderFarmsWithAds = (farms: Farm[]) => {
    const items = []
    const firstFourFarms = farms.slice(0, 4)
    const remainingFarms = farms.slice(4)

    firstFourFarms.forEach((farm) => {
      const hasProfileImage = farm.seller?.avatar?.url
      items.push(
        <FarmsCard
          key={farm._id}
          id={farm._id}
          name={farm.name || "Farm Name"}
          location={farm.location?.city || "Unknown city"}
          street={farm.location?.street || "Unknown street"}
          state={farm.location?.state || "Unknown state"}
          image={farm.images?.[0]?.url || "/placeholder.svg?height=260&width=320"}
          profileImage={
            hasProfileImage
              ? farm.seller?.avatar?.url ||
                farm.profileImage ||
                "/placeholder.svg?height=50&width=50&text=" + encodeURIComponent(getFirstLetter(farm.name || "F"))
              : "/placeholder.svg?height=50&width=50&text=" + encodeURIComponent(getFirstLetter(farm.name || "F"))
          }
          description={farm.description || "No description available"}
          rating={calculateAverageRating(farm.review)}
        />,
      )
    })

    if (farms.length > 0 && !showSplitLayout) {
      items.push(
        <div key="banner-ad" className="col-span-full mb-6">
          <Add_Banner />
        </div>,
      )
    }

    remainingFarms.forEach((farm) => {
      const hasProfileImage = farm.seller?.avatar?.url || farm.profileImage
      items.push(
        <FarmsCard
          key={farm._id}
          id={farm._id}
          name={farm.name || "Farm Name"}
          location={farm.location?.city || "Unknown city"}
          street={farm.location?.street || "Unknown street"}
          state={farm.location?.state || "Unknown state"}
          image={farm.images?.[0]?.url || "/placeholder.svg?height=260&width=320"}
          profileImage={
            hasProfileImage
              ? farm.seller?.avatar?.url || farm.profileImage || "/placeholder.svg?height=260&width=320"
              : "/placeholder.svg?height=50&width=50&text=" + encodeURIComponent(getFirstLetter(farm.name || "F"))
          }
          description={farm.description || "No description available"}
          rating={calculateAverageRating(farm.review)}
        />,
      )
    })

    return items
  }

  const generatePageNumbers = () => {
    const pageNumbers = []
    const totalPage = farmsData?.data.pagination.totalPage || 0
    for (let i = 1; i <= totalPage; i++) {
      if (i === 1 || i === totalPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(i)
      } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
        pageNumbers.push("...")
      }
    }
    return pageNumbers
  }

  const currentIsLoading = isCategoryView ? isLoadingProducts : isLoadingFarms
  const currentError = isCategoryView ? errorProducts : errorFarms

  if (currentIsLoading) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-12 mt-[100px]">
        <h2 className="text-3xl text-[#272727] font-semibold mb-8">
          {isCategoryView ? "Loading Products..." : "Featured Farms"}
        </h2>
        <div
          className={`grid ${
            isCategoryView
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : showSplitLayout
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          } gap-6`}
        >
          {[...Array(isCategoryView ? 10 : 8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 w-full h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] rounded-[24px] sm:rounded-[28px] md:rounded-[32px]"></div>
              <div className="p-2 sm:p-3 md:p-4 lg:p-3 mt-4 sm:mt-5 md:mt-6">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-2 mb-2">
                  {!isCategoryView && (
                    <div className="bg-gray-300 rounded-full w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px] lg:w-[50px] lg:h-[50px]"></div>
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-300 h-4 rounded mb-1"></div>
                    <div className="bg-gray-300 h-3 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="bg-gray-300 h-3 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (currentError) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-12 mt-[100px]">
        <h2 className="text-3xl text-[#272727] font-semibold mb-8">
          {isCategoryView ? "Products by Category" : "Featured Farms"}
        </h2>
        <div className="text-center py-12">
          <p className="text-lg">{currentError instanceof Error ? currentError.message : "Error loading data."}</p>
        </div>
      </section>
    )
  }

  const farms = farmsData?.data.farm || []
  const products = productsData?.data || []
  const pagination = farmsData?.data.pagination

  return (
    <section className="container mx-auto px-4 md:px-2 py-12 mt-[40px] md:mt-[100px]">
      <div>
        <h2 className="text-3xl text-[#272727] font-semibold mb-8">
          {isCategoryView ? "Products by Category" : "Featured Farms"}
          {searchTerm && <span className="text-lg text-gray-600 ml-2">- Search results for &ldquo;{searchTerm}&rdquo;</span>}
        </h2>

        {isCategoryView ? (
          // Product Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <Link key={product._id} href={`/product-details/${product._id}`} className="group">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={product.thumbnail?.url || "/placeholder.svg"}
                        alt={product.title}
                        width={200}
                        height={200}
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
                    <p className="text-xs sm:text-sm text-[#4B5563] mb-1">{"2.5 kilometers away"}</p>
                    <p className="text-xs sm:text-sm text-[#4B5563] mb-2">{"Available all year"}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base text-[#111827]">
                        ${product.price} per Box
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                        <span className="text-sm sm:text-base text-gray-900">
                          {calculateAverageRating(product.review).toFixed(1)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">({product.review.length})</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">
                  {searchTerm ? "Product not found" : "No products available for this category."}
                </p>
              </div>
            )}
          </div>
        ) : showSplitLayout ? (
          // Split Layout: Farms on left, Map on right
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Farms */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {farms.length > 0 ? (
                  farms.map((farm) => {
                    const hasProfileImage = farm.seller?.avatar?.url || farm.profileImage
                    return (
                      <FarmsCard
                        key={farm._id}
                        id={farm._id}
                        name={farm.name || "Farm Name"}
                        location={farm.location?.city || "Unknown city"}
                        street={farm.location?.street || "Unknown street"}
                        state={farm.location?.state || "Unknown state"}
                        image={farm.images?.[0]?.url || "/placeholder.svg?height=260&width=320"}
                        profileImage={
                          hasProfileImage
                            ? farm.seller?.avatar?.url || farm.profileImage || "/placeholder.svg?height=260&width=320"
                            : "/placeholder.svg?height=50&width=50&text=" +
                              encodeURIComponent(getFirstLetter(farm.name || "F"))
                        }
                        description={farm.description || "No description available"}
                        rating={calculateAverageRating(farm.review)}
                      />
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 text-lg">
                      {searchTerm ? "Farm not found" : "No farms available at the moment."}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination for Split Layout */}
              {pagination && pagination.totalPage > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 border border-green-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {generatePageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === "..." ? (
                          <span className="px-2 py-1 text-sm text-gray-500">...</span>
                        ) : (
                          <Button
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page as number)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === page
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "hover:bg-gray-100 border border-green-600"
                            }`}
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(pagination.totalPage, currentPage + 1))}
                      disabled={currentPage === pagination.totalPage}
                      className="h-8 w-8 p-0 border border-green-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Map */}
            <div className="lg:sticky lg:top-4">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "600px" }}>
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Farm Locations</h3>
                  <p className="text-sm text-gray-600">
                    {farms.filter((f) => f.longitude && f.latitude).length} farms with location data
                  </p>
                </div>
                <div className="h-full">
                  <FarmsMap farms={farms} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Regular Farm Grid (no search)
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {farms.length > 0 ? (
                renderFarmsWithAds(farms)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">
                    {searchTerm ? "Farm not found" : "No farms available at the moment."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for Regular Layout */}
            {pagination && pagination.totalPage > 1 && (
              <div className="flex items-center justify-between mt-12">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border border-green-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {generatePageNumbers().map((page, index) => (
                    <div key={index}>
                      {page === "..." ? (
                        <span className="px-2 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className={`h-8 w-8 p-0 ${
                            currentPage === page
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "hover:bg-gray-100 border border-green-600"
                          }`}
                        >
                          {page}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pagination.totalPage, currentPage + 1))}
                    disabled={currentPage === pagination.totalPage}
                    className="h-8 w-8 p-0 border border-green-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Featured_Farms
