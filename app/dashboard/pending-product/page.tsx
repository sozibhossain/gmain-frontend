"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreateProductForm } from "../active-product/_components/create-product-form";
import { PendingProductsList } from "./_components/pending-products-list";
import { useQueryClient } from "@tanstack/react-query";

export default function ActiveProductsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Pending Product List"}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pending Product", href: "/dashboard/pending-product" },
          { label: "List" },
        ]}
        action={{
          label: "Add Product",
          onClick: () => setShowCreateForm(true),
        }}
      />

      {showCreateForm ? (
        <CreateProductForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            // Refresh the list
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      ) : editingProduct ? (
        <CreateProductForm
          productId={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            // Refresh the list
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      ) : (
        <PendingProductsList onEdit={setEditingProduct} />
      )}
    </div>
  );
}
