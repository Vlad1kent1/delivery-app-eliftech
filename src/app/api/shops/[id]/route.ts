import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, rating } = await req.json();
    const shop = await prisma.shop.update({
      where: { id },
      data: { name, rating },
    });
    return NextResponse.json(shop);
  } catch {
    return NextResponse.json({ error: "Unable to update shop" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.shop.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete shop" }, { status: 500 });
  }
}
