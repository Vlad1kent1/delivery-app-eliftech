import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userName, userEmail, userPhone, address, items } = await req.json();
    if (!userName || !userEmail || !userPhone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    type InputItem = { productId: string; quantity: number; price: number }
    let totalPrice = 0;
    const orderItemsData = (items as InputItem[]).map((item) => {
      if (!item.productId || typeof item.quantity !== "number") throw new Error("Invalid item");
      if (item.quantity < 1) throw new Error("Quantity must be at least 1");
      totalPrice += item.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
      };
    });

    const order = await prisma.order.create({
      data: {
        userName,
        userEmail,
        userPhone,
        address,
        totalPrice,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }
}
