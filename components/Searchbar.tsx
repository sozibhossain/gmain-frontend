"use client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPage: number;
    };
  };
}

interface SearchbarProps {
  searchParams?: {
    search?: string;
    category?: string;
  };
}

export default function Searchbar({ searchParams }: SearchbarProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams?.search || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.category || "all"
  );

  const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // No Authorization header
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: ApiResponse = await response.json();
    return data.data.categories;
  };

  const { data: categories = [], isLoading } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams();
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-5xl px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="bg-white rounded-[50px] md:rounded-[50px] lg:rounded-[999px] shadow-lg sm:shadow-xl lg:shadow-2xl p-2 sm:p-3 md:p-4 ">
        <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 items-stretch sm:items-center">
          {/* Where Section */}
          <div className="flex-1 sm:border-r sm:border-gray-200 sm:pr-3 md:pr-4 lg:pr-6 pl-4">
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-gray-900 uppercase sm:normal-case tracking-wide sm:tracking-normal hidden lg:block ml-4">
                Where
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search destinations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex-1 sm:pl-3 md:pl-4 lg:pl-6">
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-gray-900 hidden lg:block uppercase sm:normal-case tracking-wide sm:tracking-normal">
                Filter by Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  const params = new URLSearchParams();
                  if (searchQuery.trim()) {
                    params.set("search", searchQuery.trim());
                  }
                  if (value !== "all") {
                    params.set("category", value); // Using _id here
                  }
                  const queryString = params.toString();
                  const newUrl = queryString
                    ? `${window.location.pathname}?${queryString}`
                    : window.location.pathname;
                  router.push(newUrl, { scroll: false });
                }}
              >
                <SelectTrigger className="border-0 focus:ring-0 focus:ring-offset-0 bg-transparent text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12 w-full cursor-pointer">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end pb-0 sm:pb-1">
            <Button
              size="icon"
              onClick={handleSearch}
              className="bg-[#039B06] hover:bg-[#039B06]/80 rounded-full w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center justify-center"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
