"use client";

import { Card, Checkbox, ScrollArea } from "@/components/ui";
import { Star } from "lucide-react";
import { Shop, RATING_RANGES } from "./types";

interface ShopSidebarProps {
  shops: Shop[];
  selectedShopId: string;
  selectedRatingRanges: number[];
  onShopSelect: (shopId: string) => void;
  onRatingToggle: (rangeIndex: number) => void;
}

export function ShopSidebar({
  shops,
  selectedShopId,
  selectedRatingRanges,
  onShopSelect,
  onRatingToggle,
}: ShopSidebarProps) {
  // Filter shops by rating
  const filteredShops = shops.filter(shop => {
    if (selectedRatingRanges.length === 0) return true;
    return selectedRatingRanges.some(rangeIndex => {
      const range = RATING_RANGES[rangeIndex];
      return shop.rating >= range.min && shop.rating < range.max;
    });
  });

  return (
    <div className="lg:col-span-1">
      <div className="space-y-6">
        {/* Shop Rating Filters */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Shop Rating</h3>
          <div className="space-y-2">
            {RATING_RANGES.map((range, index) => (
              <div key={`rating-${range.label}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${index}`}
                  checked={selectedRatingRanges.includes(index)}
                  onCheckedChange={() => onRatingToggle(index)}
                />
                <label
                  htmlFor={`rating-${index}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Shop List */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Shops</h3>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredShops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => onShopSelect(shop.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedShopId === shop.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{shop.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{shop.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}