"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PacificPagination from "@/components/ui/PacificPagination";

interface Product {
  _id: string;
  title: string;
  price: number;
  quantity: string;
  createdAt: string;
  thumbnail: { url: string } | null;
  code: string;
  status: string;
  category: {
    _id: string;
    name: string;
  };
}

interface PendingProductsListProps {
  onEdit: (productId: string) => void;
}

export function PendingProductsList({ onEdit }: PendingProductsListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session.data?.accessToken;

  // Fetch products with pagination
  const { data, isLoading } = useQuery({
    queryKey: ["pendingProducts", page],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller/pending-products?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      return data.success ? data : { data: [], total: 0, totalPage: 1 };
    },
    enabled: !!session?.data?.accessToken,
  });

  const products = data?.data || [];
  const pagination = {
    total: data?.total || 0,
    totalPage: data?.totalPage || 1,
    page,
  };

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/seller/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingProducts"] });
      toast.success("Product deleted successfully");
      setDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast.error("Error deleting product");
    },
  });

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Skeleton component for loading state
  const SkeletonLoader = () => (
    <Card className="shadow-none border-none bg-transparent">
      <CardContent className="!p-0">
        <Table>
          <TableHeader className="py-2">
            <TableRow>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
              <TableHead className="text-base text-[#272727] font-medium">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[18px] text-[#323232] font-medium">
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-[100px] h-[60px] rounded-[8px] bg-gray-200 animate-pulse"></div>
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
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
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
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No pending products found.
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("PPPPPPPPPPPPPP",products)

  return (
    <>
      <Card className="shadow-none border-none bg-transparent">
        <CardContent className="!p-0">
          <Table>
            <TableHeader className="py-2">
              <TableRow>
                <TableHead className="text-base text-[#272727] font-medium">Product Name</TableHead>
                <TableHead className="text-base text-[#272727] font-medium">ID</TableHead>
                <TableHead className="text-base text-[#272727] font-medium">Price</TableHead>
                <TableHead className="text-base text-[#272727] font-medium">Quantity</TableHead>
                <TableHead className="text-base text-[#272727] font-medium">Date</TableHead>
                <TableHead className="text-base text-[#272727] font-medium">Action</TableHead>
                <TableHead className="text-base text-[#272727] font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[18px] text-[#323232] font-medium">
              {products.map((product: Product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          product.thumbnail?.url ||
                          "/placeholder.svg?height=48&width=48"
                        }
                        alt={product.title}
                        width={1000}
                        height={1000}
                        className=" w-[100px] h-[60px] rounded-[8px] object-cover"
                      />
                      {product.title}
                    </div>
                  </TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{formatDate(product.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
                        onClick={() => handleDeleteClick(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        product.status === "pending"
                          ? "bg-[#FFA300] text-white py-[6px] px-5"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {product.status.charAt(0).toUpperCase() +
                        product.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPage > 1 && (
            <div className="flex justify-between items-center mt-4 px-4 py-2">
              <div className="text-sm text-muted-foreground">
                Showing {products.length} of {pagination.total} product requests
              </div>
              <PacificPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </>
  );
}