"use client";

import { Card, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Product, Category, CATEGORIES } from "./types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  selectedShopId: string;
  selectedCategories: Category[];
  sortBy: string;
  shops: { id: string; name: string }[];
  onCategoryToggle: (category: Category) => void;
  onSortChange: (sort: string) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({
  products,
  selectedShopId,
  selectedCategories,
  sortBy,
  shops,
  onCategoryToggle,
  onSortChange,
  onAddToCart,
}: ProductGridProps) {
  // Get products for selected shop
  const shopProducts = products.filter(product => product.shopId === selectedShopId);

  // Filter products by category
  const filteredProducts = shopProducts.filter(product => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(product.category as Category);
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const selectedShop = shops.find(s => s.id === selectedShopId);

  return (
    <div className="lg:col-span-3">
      <div className="space-y-6">
        {/* Product Filters and Sorting */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedShop?.name || 'Select a Shop'}
              </h2>
              <p className="text-sm text-gray-600">
                {sortedProducts.length} products available
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your filters.</p>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}