"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import PacificPagination from "@/components/ui/PacificPagination";

interface Product {
  _id: string;
  title: string;
  price: number;
  quantity: string;
  code: string;
  createdAt: string;
  thumbnail: {
    url: string;
  };
}
interface PendingProductsListProps {
  onEdit: (productId: string) => void;
}

export function ActiveProductsList({ onEdit }: PendingProductsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session.data?.accessToken;

  // Fetch products with pagination
  const { data, isLoading } = useQuery({
    queryKey: ["activeProducts", page],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller/active-products?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const result = await response.json();
      return result;
    },
    enabled: !!session?.data?.accessToken,
  });

  // Assuming API returns something like:
  // { data: Product[], total: number, totalPage: number }

  const products: Product[] = data?.data || [];

  const totalPages = data?.totalPage || 1;
  const totalItems = data?.total || 0;

  console.log(products);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeProducts"] });
      setDeleteId(null);
    },
  });

  // Skeleton component for loading state
  const SkeletonLoader = () => (
    <div>
      {/* Table Skeleton */}
      <Table>
        <TableHeader>
          <TableRow className="text-base text-[#272727] font-normal">
            <TableHead>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </TableHead>
            <TableHead>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow
              className="text-[18px] text-[#323232] font-medium"
              key={index}
            >
              <TableCell>
                <div className="flex gap-3 items-center">
                  <div className="h-[60px] w-[100px] bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
              <TableCell>
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center mt-4 px-4 py-2">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-8 w-8 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow className="text-base text-[#272727] font-normal">
              <TableHead>Product Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                className="text-[18px] text-[#323232] font-medium"
                key={product._id}
              >
                <TableCell>
                  <div className="flex gap-3">
                    <Image
                      src={product.thumbnail.url || "/placeholder.svg"}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="rounded-md object-cover h-[60px] w-[100px]"
                    />
                    {product.title}
                  </div>
                </TableCell>
                <TableCell>{product.code}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  {new Date(product.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setDeleteId(product._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-4 py-2">
            <div className="text-sm text-muted-foreground">
              Showing {products.length} of {totalItems} products
            </div>
            <PacificPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="cursor-pointer"
            >
              No
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
