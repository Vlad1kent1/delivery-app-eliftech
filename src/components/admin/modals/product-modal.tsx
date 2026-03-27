"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Must be > 0"),
  category: z.enum(["Burgers", "Drinks", "Desserts"]),
  shopId: z.string().min(1, "Shop is required"),
});

const imageFileSchema = z
  .any()
  .refine((file) => file instanceof File, "Image file is required")
  .refine(
    (file) => file && ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Allowed formats: JPG, PNG, WEBP"
  )
  .refine((file) => file && file.size <= 5 * 1024 * 1024, "Max file size is 5MB");

type ProductFormValues = z.infer<typeof productSchema>;

export type ProductSavePayload = ProductFormValues & {
  imageData?: string;
  imageName?: string;
  imagePath?: string;
};

interface Shop {
  id: string;
  name: string;
}

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProductSavePayload) => Promise<void>;
  initialValues?: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    shopId: string;
  } | null;
  isLoading: boolean;
}

export function ProductModal({
  open,
  onOpenChange,
  onSave,
  initialValues,
  isLoading,
}: ProductModalProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const previewSrc = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return initialValues?.image || "";
  }, [imageFile, initialValues?.image]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      category: "Burgers",
      shopId: "",
    },
  });

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("/api/shops");
        const data = await res.json();
        setShops(data ?? []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (initialValues) {
      const { ...formValues } = initialValues;
      form.reset(formValues as ProductFormValues);
    } else {
      form.reset({
        name: "",
        price: 0,
        category: "Burgers",
        shopId: "",
      });
    }
  }, [initialValues, form]);

  // Reset image file when modal opens/closes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageFile(null);
  }, [open]);

  const onSubmit = async (values: ProductFormValues) => {
    // File validation using Zod
    if (!imageFile && !initialValues?.image) {
      toast.error("Image file is required");
      return;
    }

    if (imageFile) {
      const validation = imageFileSchema.safeParse(imageFile);
      if (!validation.success) {
        const issueMessage = validation.error.issues?.[0]?.message || "Invalid image file";
        toast.error(issueMessage);
        return;
      }
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Image read failed"));
        reader.readAsDataURL(imageFile);
      });

      await onSave({
        ...values,
        imageData,
        imageName: imageFile.name,
      });
    } else {
      await onSave({
        ...values,
        imagePath: initialValues?.image,
      });
    }

    form.reset();
    setImageFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Product" : "Create New Product"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Big Big Burger" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Burgers">Burgers</SelectItem>
                        <SelectItem value="Drinks">Drinks</SelectItem>
                        <SelectItem value="Desserts">Desserts</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setImageFile(file);
                  }}
                />
              </FormControl>
              <FormMessage />

              {previewSrc && (
                <div className="mt-2">
                  <Image
                    src={previewSrc}
                    alt="Image preview"
                    width={96}
                    height={96}
                    className="rounded-lg object-cover border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setImageFile(null);
                    }}
                  >
                    Clear Image
                  </Button>
                </div>
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="shopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shop" />
                      </SelectTrigger>
                      <SelectContent>
                        {shops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {initialValues ? "Update" : "Create"} Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
