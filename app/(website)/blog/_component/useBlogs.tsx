import { useQuery } from "@tanstack/react-query"

interface BlogThumbnail {
  public_id: string
  url: string
}

interface Blog {
  _id: string
  blogName: string
  description: string
  thumbnail: BlogThumbnail
  createdAt: string
  updatedAt: string
}

interface BlogsResponse {
  success: boolean
  data: {
    blogs: Blog[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPage: number
    }
  }
}

const fetchBlogs = async (page: number, limit: number): Promise<BlogsResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/blogs?page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error("Failed to fetch blogs")
  }
  return response.json()
}

export const useBlogs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["blogs", page, limit],
    queryFn: () => fetchBlogs(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export type { Blog, BlogsResponse }
