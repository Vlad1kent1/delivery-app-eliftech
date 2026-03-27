"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { ShopsTable } from "@/components/admin/shops-table";
import { ProductsTable } from "@/components/admin/products-table";
import { OrdersTable } from "@/components/admin/orders-table";

type TableType = "shops" | "products" | "orders";

const TABLES: { id: TableType; label: string }[] = [
  { id: "shops", label: "Shops" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
];

export default function AdminPage() {
  const [activeTable, setActiveTable] = useState<TableType>("shops");

  const renderContent = () => {
    switch (activeTable) {
      case "shops":
        return <ShopsTable />;
      case "products":
        return <ProductsTable />;
      case "orders":
        return <OrdersTable />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* Sidebar */}
        <Card className="w-1/4 border border-gray-200 bg-white p-4 overflow-y-auto">
          <div className="space-y-2">
            {TABLES.map((table) => (
              <Button
                key={table.id}
                onClick={() => setActiveTable(table.id)}
                variant={activeTable === table.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
              >
                {table.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Content Area */}
        <Card className="flex-1 border border-gray-200 bg-white p-6 overflow-y-auto">
          {renderContent()}
        </Card>
      </div>
    </div>
  );
}
