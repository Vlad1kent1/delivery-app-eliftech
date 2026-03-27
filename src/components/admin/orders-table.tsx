"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { MoreHorizontal, Trash2, Eye } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui";
import { toast } from "sonner";
import { DeleteAlertModal } from "./modals/delete-alert-modal";

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  address: string;
  totalPrice: number;
  createdAt: string;
}

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(
        data.map((order: { id: string; customerName: string; customerEmail: string; customerPhone: string; total: number; createdAt: string; items: unknown[] }) => ({
          ...order,
          createdAt: new Date(order.createdAt).toLocaleDateString(),
        })) ?? []
      );
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Order deleted");
      setDeleteTarget(null);
      fetchOrders();
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Managing Orders</h1>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Customer</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Total</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{order.userName}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{order.userEmail}</td>
                  <td className="px-6 py-4 text-gray-600">{order.userPhone}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{order.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedOrder(order)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(order)}
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

      {/* Details modal - simple display */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="max-w-md p-6 bg-white">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">ID:</span> {selectedOrder.id}</div>
              <div><span className="font-semibold">Name:</span> {selectedOrder.userName}</div>
              <div><span className="font-semibold">Email:</span> {selectedOrder.userEmail}</div>
              <div><span className="font-semibold">Phone:</span> {selectedOrder.userPhone}</div>
              <div><span className="font-semibold">Address:</span> {selectedOrder.address}</div>
              <div><span className="font-semibold">Total:</span> ${selectedOrder.totalPrice.toFixed(2)}</div>
              <div><span className="font-semibold">Date:</span> {selectedOrder.createdAt}</div>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => setSelectedOrder(null)}
              variant="outline"
            >
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Delete modal */}
      <DeleteAlertModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={`Order #${deleteTarget?.id?.slice(0, 8)}`}
        isLoading={isLoading}
      />
    </div>
  );
}
