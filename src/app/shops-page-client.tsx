"use client";

import { useReducer, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { ShopSidebar } from "@/components/shops/shop-sidebar";
import { ProductGrid } from "@/components/shops/product-grid";
import { Shop, Product, CartItem, ShopsState, ShopsAction, Category } from "@/components/shops/types";

function shopsPageReducer(state: ShopsState, action: ShopsAction): ShopsState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        shops: action.payload.shops,
        products: action.payload.products,
        selectedShopId: action.payload.shops.length > 0 ? action.payload.shops[0].id : '',
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SELECT_SHOP':
      return { ...state, selectedShopId: action.payload };
    case 'TOGGLE_CATEGORY':
      return {
        ...state,
        selectedCategories: state.selectedCategories.includes(action.payload)
          ? state.selectedCategories.filter(c => c !== action.payload)
          : [...state.selectedCategories, action.payload]
      };
    case 'TOGGLE_RATING_RANGE':
      return {
        ...state,
        selectedRatingRanges: state.selectedRatingRanges.includes(action.payload)
          ? state.selectedRatingRanges.filter(r => r !== action.payload)
          : [...state.selectedRatingRanges, action.payload]
      };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    default:
      return state;
  }
}

interface ShopsPageClientProps {
  initialShops: Shop[];
  initialProducts: Product[];
}

export default function ShopsPageClient({ initialShops, initialProducts }: ShopsPageClientProps) {
  const [state, dispatch] = useReducer(shopsPageReducer, {
    shops: initialShops,
    products: initialProducts,
    selectedShopId: initialShops.length > 0 ? initialShops[0].id : '',
    selectedCategories: [],
    selectedRatingRanges: [],
    sortBy: 'name-asc',
    isLoading: false,
  });

  // Load cart from localStorage
  const getCartFromStorage = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  };

  // Save cart to localStorage
  const saveCartToStorage = (cart: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  };

  // Add item to cart
  const addToCart = (product: Product) => {
    const cart = getCartFromStorage();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    saveCartToStorage(cart);
    toast.success(`${product.name} added to cart!`);
  };

  // Fetch data if not provided initially
  useEffect(() => {
    if (initialShops.length === 0 || initialProducts.length === 0) {
      const fetchData = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const [shopsRes, productsRes] = await Promise.all([
            fetch('/api/shops'),
            fetch('/api/products')
          ]);

          if (!shopsRes.ok || !productsRes.ok) {
            throw new Error('Failed to fetch data');
          }

          const shopsData = await shopsRes.json();
          const productsData = await productsRes.json();

          dispatch({ type: 'SET_DATA', payload: { shops: shopsData, products: productsData } });
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load shops and products');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      fetchData();
    }
  }, [initialShops.length, initialProducts.length]);

  // Handle category toggle
  const toggleCategory = (category: Category) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: category });
  };

  // Handle rating range toggle
  const toggleRatingRange = (rangeIndex: number) => {
    dispatch({ type: 'TOGGLE_RATING_RANGE', payload: rangeIndex });
  };

  // Handle shop selection
  const selectShop = (shopId: string) => {
    dispatch({ type: 'SELECT_SHOP', payload: shopId });
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    dispatch({ type: 'SET_SORT', payload: sortBy });
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Shops</h1>
            <Link href="/shopping-cart">
              <Button variant="outline" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Cart
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ShopSidebar
            shops={state.shops}
            selectedShopId={state.selectedShopId}
            selectedRatingRanges={state.selectedRatingRanges}
            onShopSelect={selectShop}
            onRatingToggle={toggleRatingRange}
          />

          <ProductGrid
            products={state.products}
            selectedShopId={state.selectedShopId}
            selectedCategories={state.selectedCategories}
            sortBy={state.sortBy}
            shops={state.shops}
            onCategoryToggle={toggleCategory}
            onSortChange={handleSortChange}
            onAddToCart={addToCart}
          />
        </div>
      </div>
    </div>
  );
}
