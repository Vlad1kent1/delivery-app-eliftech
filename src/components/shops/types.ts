export interface Shop {
  id: string;
  name: string;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  shopId: string;
  shop: Shop;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const CATEGORIES = ["Burgers", "Drinks", "Desserts"] as const;
export type Category = typeof CATEGORIES[number];

export const RATING_RANGES = [
  { label: "5.0", min: 5.0, max: 5.1 },
  { label: "4.0 - 5.0", min: 4.0, max: 5.0 },
  { label: "3.0 - 4.0", min: 3.0, max: 4.0 },
  { label: "2.0 - 3.0", min: 2.0, max: 3.0 },
] as const;

export type ShopsState = {
  shops: Shop[];
  products: Product[];
  selectedShopId: string;
  selectedCategories: Category[];
  selectedRatingRanges: number[];
  sortBy: string;
  isLoading: boolean;
};

export type ShopsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { shops: Shop[]; products: Product[] } }
  | { type: 'SELECT_SHOP'; payload: string }
  | { type: 'TOGGLE_CATEGORY'; payload: Category }
  | { type: 'TOGGLE_RATING_RANGE'; payload: number }
  | { type: 'SET_SORT'; payload: string };