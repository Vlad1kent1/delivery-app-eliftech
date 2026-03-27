"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { 
  Button,
  Card,
  Input,
  ScrollArea,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui";
import { ShoppingCart, ShoppingBag, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const orderFormSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[0-9+\-\s()]*$/, "Phone must contain only numbers and common phone characters"),
  address: z.string().min(1, "Address is required").min(5, "Address must be at least 5 characters"),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const getCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = window.localStorage.getItem("cart");
  if (!cart) return [];

  try {
    const parsed = JSON.parse(cart);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item?.name && typeof item.price === "number" && typeof item.quantity === "number");
  } catch {
    return [];
  }
};

const setCartToStorage = (cart: CartItem[]) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("cart", JSON.stringify(cart));
  }
};

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
    const loadCart = () => {
      setIsLoading(true);
      const localCart = getCartFromStorage();
      setCartItems(localCart);
      setIsLoading(false);
    };

    loadCart();
  }, []);

  const updateCart = (updated: CartItem[]) => {
    setCartItems(updated);
    setCartToStorage(updated);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    updateCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const onSubmit = async (data: OrderFormValues) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Add products before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userName: data.name,
        userEmail: data.email,
        userPhone: data.phone,
        address: data.address,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || "Failed to create order");
      }

      const result = await response.json();
      toast.success("Order placed successfully!");
      setCartItems([]);
      setCartToStorage([]);
      form.reset();
      console.log("Order created:", result);
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-700">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Shopping Cart</h1>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shop
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200 rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </Card>

          <Card className="border border-gray-200 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
              <span className="text-sm font-medium text-gray-600">{cartItems.length} items</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <ShoppingBag className="h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">Empty Cart</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your cart is empty. Go back to the Shop page to add items.
                </p>
                <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Back to Shop
                </Link>
              </div>
            ) : (
              <ScrollArea className="h-72 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-2 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, Number(e.target.value) || 1)}
                            className="w-14 text-center p-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-2 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="mt-4 border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <span className="text-lg font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>

            <Button
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={cartItems.length === 0 || isSubmitting}
              className="mt-4 w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Order"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
