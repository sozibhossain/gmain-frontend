"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Types for the API response
interface BlogData {
  _id: string;
  blogName: string;
  description: string;
  thumbnail?: {
    public_id: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: BlogData;
  errorSources?: Array<{
    path: string;
    message: string;
  }>;
}

export default function BlogDetails() {
  const params = useParams();
  const id = params.id as string;

  // Debug logging
  useEffect(() => {
    console.log("Debug Info:", {
      id,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    });
  }, [id]);

  // Fetch blog data
  async function fetchBlogData(id: string): Promise<BlogData> {
    console.log("Fetching blog data for ID:", id);

    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("API URL not configured");
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/blog/${id}`;
    console.log("Fetching from URL:", url);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to fetch blog data");
    }

    return result.data;
  }

  // Use react-query to fetch blog data
  const {
    data: blog,
    isLoading,
    error,
  } = useQuery<BlogData, Error>({
    queryKey: ["blog", id],
    queryFn: () => fetchBlogData(id),
    enabled: !!id, // Only fetch if id is available
  });

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col mt-16 sm:mt-20 md:mt-24 lg:mt-[100px]">
        <main className="flex-1 flex flex-col">
          <p>Loading blog post...</p>
        </main>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col mt-16 sm:mt-20 md:mt-24 lg:mt-[100px]">
        <main className="flex-1 flex flex-col">
          <p className="text-red-500">Error: {error.message}</p>
          <Link
            href="/blog"
            className="inline-flex items-center text-[#039B06] hover:underline font-medium mt-4"
          >
            ← Back to Blog
          </Link>
        </main>
      </div>
    );
  }

  // Handle case where blog data is not available
  if (!blog) {
    return (
      <div className="flex flex-col mt-16 sm:mt-20 md:mt-24 lg:mt-[100px]">
        <main className="flex-1 flex flex-col">
          <p>No blog post found.</p>
          <Link
            href="/blog"
            className="inline-flex items-center text-[#039B06] hover:underline font-medium mt-4"
          >
            ← Back to Blog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 lg:px-0">
      <div className="flex flex-col mt-16 sm:mt-20 md:mt-24 lg:mt-[100px]">
        <main className="flex-1 flex flex-col">
          {/* Navigation bar */}
          <div className="">
            <span className="text-sm sm:text-base font-medium text-[#039B06]">
              {formatDate(blog.createdAt)}
            </span>
            <span className="mx-1 sm:mx-2 text-sm sm:text-base font-medium text-[#039B06]">
              |
            </span>
            <span className="text-sm sm:text-base font-medium text-[#039B06]">
              Blog Post
            </span>
          </div>

          {/* Main content */}
          <div className="">
            <div className="mt-6 sm:mt-8">
              <h1 className="mb-4 text-[#272727] text-xl sm:text-2xl md:text-[24px] font-semibold leading-tight">
                {blog.blogName}
              </h1>

              {blog.thumbnail?.url && (
                <div className="h-[250px] sm:h-[350px] md:h-[450px] lg:h-[561px] overflow-hidden mb-4 pt-4 sm:pt-6 md:pt-[50px]">
                  <Image
                    src={blog.thumbnail.url || "/placeholder.svg"}
                    alt={blog.blogName}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-[32px]"
                    priority
                    onError={(e) => {
                      console.error(
                        "Image failed to load:",
                        blog.thumbnail?.url
                      );
                      e.currentTarget.src = "/placeholder.svg"; // Fallback image
                    }}
                  />
                </div>
              )}
            </div>

            {/* Blog content */}
            <div className="mb-8 mt-8 sm:mt-10 md:mt-[60px]">
              <div className="text-base sm:text-lg md:text-[18px] text-[#595959] leading-relaxed md:leading-[150%] font-normal">
                {blog.description ? (
                  <div className="prose prose-lg max-w-none">
                    {blog.description.includes("<") ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: blog.description }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {blog.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No content available for this blog post.</p>
                )}
              </div>
            </div>

            {/* Back to blog link */}
            <div className="mt-8 pt-6 border-t pb-10">
              <Link
                href="/blog"
                className="inline-flex items-center text-[#039B06] hover:underline font-medium"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
