"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { ActiveProductsList } from "./_components/active-products-list";
import { CreateProductForm } from "./_components/create-product-form";

export default function ActiveProductsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Product List"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Active Product", href: "/dashboard/active-product" },
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
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      ) : editingProduct ? (
        <CreateProductForm
          productId={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      ) : (
        <ActiveProductsList onEdit={setEditingProduct} />
      )}
    </div>
  );
}