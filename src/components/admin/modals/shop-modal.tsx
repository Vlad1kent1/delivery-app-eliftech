"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";

const shopSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  rating: z.number().min(1, "Minimum 1.0").max(5, "Maximum 5.0"),
});

type ShopFormValues = z.infer<typeof shopSchema>;

interface ShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ShopFormValues) => Promise<void>;
  initialValues?: { id: string; name: string; rating: number } | null;
  isLoading: boolean;
}

export function ShopModal({
  open,
  onOpenChange,
  onSave,
  initialValues,
  isLoading,
}: ShopModalProps) {
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: { name: "", rating: 4 },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({ name: initialValues.name, rating: initialValues.rating });
    } else {
      form.reset({ name: "", rating: 4 });
    }
  }, [initialValues, open, form]);

  const onSubmit = async (values: ShopFormValues) => {
    await onSave(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Shop" : "Create New Shop"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Mc Donny" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
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
                {initialValues ? "Update" : "Create"} Shop
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
