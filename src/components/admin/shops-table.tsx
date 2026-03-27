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
import { ShopModal } from "./modals/shop-modal";
import { DeleteAlertModal } from "./modals/delete-alert-modal";

interface Shop {
  id: string;
  name: string;
  rating: number;
}

export function ShopsTable() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);

  // Fetch shops
  const fetchShops = async () => {
    try {
      const res = await fetch("/api/shops");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setShops(data ?? []);
    } catch {
      toast.error("Failed to load shops");
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Filter & sort shops
  const filteredShops = shops
    .filter((shop) => shop.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return a.name.localeCompare(b.name) * order;
    });

  // Handle create/edit
  const handleSave = async (values: { name: string; rating: number }) => {
    setIsLoading(true);
    try {
      const url = editingShop ? `/api/shops/${editingShop.id}` : "/api/shops";
      const method = editingShop ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success(editingShop ? "Shop updated" : "Shop created");
      setIsModalOpen(false);
      setEditingShop(null);
      fetchShops();
    } catch {
      toast.error("Failed to save shop");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shops/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Shop deleted");
      setDeleteTarget(null);
      fetchShops();
    } catch {
      toast.error("Failed to delete shop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Managing Shops</h1>
        <Button
          onClick={() => {
            setEditingShop(null);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Shop
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑ Name" : "↓ Name"}
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Rating</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No shops found
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => (
                <tr key={shop.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{shop.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1">
                      ⭐ {shop.rating.toFixed(1)}
                    </span>
                  </td>
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
                            setEditingShop(shop);
                            setIsModalOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(shop)}
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
      <ShopModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        initialValues={editingShop}
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
