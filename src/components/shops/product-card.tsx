"use client";

import Image from "next/image";
import { Card, Badge, Button } from "@/components/ui";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>

        <p className="text-lg font-semibold text-gray-900 mb-3">
          ${product.price.toFixed(2)}
        </p>

        <Button
          onClick={() => onAddToCart(product)}
          className="w-full"
          size="sm"
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}