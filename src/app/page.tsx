import { Suspense } from "react";
import ShopsPageClient from "./shops-page-client";

async function getShops() {
  try {
    const res = await fetch('/api/shops', {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch shops');
    return res.json();
  } catch (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
}

async function getProducts() {
  try {
    const res = await fetch('/api/products', {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function ShopsPage() {
  const [shops, products] = await Promise.all([getShops(), getProducts()]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ShopsPageClient initialShops={shops} initialProducts={products} />
    </Suspense>
  );
}
