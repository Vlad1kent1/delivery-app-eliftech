import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, price, category, image, shopId } = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: { name, price, category, image: image ?? "", shopId },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Unable to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete product" }, { status: 500 });
  }
}
