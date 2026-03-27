"use client";

import { useEffect, useState } from "react";
import { 
  Button, Input, Card,
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui";
import { MoreHorizontal, Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductModal, ProductSavePayload } from "./modals/product-modal";
import { DeleteAlertModal } from "./modals/delete-alert-modal";

type ProductCategory = "Burgers" | "Drinks" | "Desserts";

interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  shopId: string;
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data ?? []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create/edit
  const handleSave = async (values: ProductSavePayload) => {
    setIsLoading(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success(editingProduct ? "Product updated" : "Product created");
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Managing Products</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Price</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(product)}
                          className="gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Modals */}
      <ProductModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        initialValues={editingProduct}
        isLoading={isLoading}
      />

      <DeleteAlertModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
        isLoading={isLoading}
      />
    </div>
  );
}
