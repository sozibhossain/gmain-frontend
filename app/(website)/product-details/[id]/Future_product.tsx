
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"

interface Product {
  id: string
  name: string
  image: string
  distance: string
  availability: string
  price: number
  rating: number
  reviews: number
  inStock: boolean
}

interface farmid {
  farmId: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    farm: {
      location: {
        city: string
        zipCode: string
        state: string
        street: string
      }
      isOrganic: boolean
    }
    product: Array<{
      _id: string
      title: string
      price: number
      quantity: string
      thumbnail: { url: string }
      review: Array<{ rating: number }>
    }>
  }
}

const fetchProducts = async (farmId: string): Promise<Product[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/farm/${farmId}`)
  const data: ApiResponse = await response.json()
  if (!data.success) throw new Error(data.message)
  
  return data.data.product.map((product) => ({
    id: product._id,
    name: product.title,
    image: product?.thumbnail?.url,
    distance: `${data.data.farm.location.city}, ${data.data.farm.location.state} ${data.data.farm.location.zipCode}`,
    availability: data.data.farm.isOrganic ? "Organic Certified" : "Conventional",
    price: product.price,
    rating: product.review.length > 0 
      ? product.review.reduce((acc, curr) => acc + curr.rating, 0) / product.review.length 
      : 0,
    reviews: product.review.length,
    inStock: parseInt(product.quantity) > 0,
  }))
}

export default function FutureProduct({farmId}: farmid) {
  const [favorites, setFavorites] = useState<string[]>([])

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["products", farmId],
    queryFn: () => fetchProducts(farmId),
  })

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => 
      prev.includes(productId) 
        ? prev.filter((id) => id !== productId) 
        : [...prev, productId]
    )
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error.message}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Products</h2>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 gap-y-10">
        {products?.map((product) => (
          <Link key={product.id} href={`/product-details/${product.id}`}>
            <div className="group cursor-pointer relative overflow-hidden">
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(product.id)
                  }}
                  className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full transition-colors ${
                    favorites.includes(product.id) ? "bg-black border-2 border-white" : "bg-white/80 hover:bg-white"
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                      favorites.includes(product.id) ? "text-white fill-white" : "text-gray-600 hover:text-red-500"
                    }`}
                  />
                </button>
                {!product.inStock && (
                  <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="pt-3 sm:pt-4">
                <h3 className="font-semibold text-sm sm:text-base text-[#111827] mb-2 sm:mb-3 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm font-normal text-[#4B5563] mb-1">{product.distance}</p>
                <p className="text-xs sm:text-sm font-normal text-[#4B5563] mb-2 sm:mb-3">{product.availability}</p>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-[#111827]">${product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-[#FACC15] text-[#FACC15]" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{product.rating.toFixed(1)}</span>
                    <span className="text-xs sm:text-sm text-gray-600">({product.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}