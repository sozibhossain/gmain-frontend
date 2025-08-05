"use client";

import { useQuery } from "@tanstack/react-query";
import FarmsCard from "./sheard/FramsCarda";

interface Location {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Image {
  public_id: string;
  url: string;
  _id: string;
}

interface Seller {
  avatar: {
    public_id: string;
    url: string;
  };
  _id: string;
}

interface Farm {
  _id: string;
  status: "approved" | "pending" | "rejected";
  name: string;
  description: string;
  isOrganic?: boolean;
  images: Image[];
  seller: Seller | null;
  code: string;
  location?: Location;
  rating?: number;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    farm: Farm[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
  };
}

const All_farms = () => {
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["farms"],
    queryFn: async () => {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/all-farm`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch farms: ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "API returned unsuccessful response");
      }
      if (!Array.isArray(result.data.farm)) {
        throw new Error("Invalid API response format: farm data is not an array");
      }
      return result;
    },
  });

  // Helper function to get first letter of farm name
  const getFirstLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-12 mt-[100px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 w-full h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] rounded-[24px] sm:rounded-[28px] md:rounded-[32px]"></div>
              <div className="p-2 sm:p-3 md:p-4 lg:p-3 mt-4 sm:mt-5 md:mt-6">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-2 mb-2">
                  <div className="bg-gray-300 rounded-full w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[55px] md:h-[55px] lg:w-[50px] lg:h-[50px]"></div>
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
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-12 mt-[100px]">
      
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">
            {error instanceof Error
              ? error.message
              : "Error loading farms. Please try again later."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 md:px-0 py-12 mt-[40px] md:mt-[100px]">
      <div>
       

        {/* Grid layout for farm cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data && data.data && data.data.farm && data.data.farm.length > 0 ? (
            data.data.farm.map((farm: Farm) => {
              const hasProfileImage = farm.seller?.avatar?.url || farm.profileImage;
              
              return (
                <FarmsCard
                  key={farm._id}
                  id={farm._id}
                  name={farm.name || "Farm Name"}
                  location={farm.location?.city || "Unknown city"}
                  street={farm.location?.street || "Unknown street"}
                  state={farm.location?.state || "Unknown state"}
                  image={
                    farm.images?.[0]?.url ||
                    "/placeholder.svg?height=260&width=320"
                  }
                  profileImage={
                    hasProfileImage
                      ? farm.seller?.avatar?.url ||
                        farm.profileImage ||
                        "/placeholder.svg?height=260&width=320"
                      : "/placeholder.svg?height=50&width=50&text=" + encodeURIComponent(getFirstLetter(farm.name || "F"))
                  }
                  description={farm.description || "No description available"}
                  rating={farm.rating || 0}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No farms available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default All_farms;