import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const shops = await prisma.shop.findMany({})
  return NextResponse.json(shops)
}

export async function POST(req: NextRequest) {
  try {
    const { name, rating } = await req.json();
    if (!name || typeof rating !== "number") {
      return NextResponse.json({ error: "Name and rating required" }, { status: 400 });
    }
    const shop = await prisma.shop.create({ data: { name, rating } });
    return NextResponse.json(shop);
  } catch (error: unknown) {
    console.error("PRISMA ERROR:", error);
    return NextResponse.json({ error: "Unable to create shop" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, rating } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });
    }

    const updatedShop = await prisma.shop.update({
      where: { id },
      data: { name, rating },
    });

    return NextResponse.json(updatedShop);
  } catch (error: unknown) {
    console.error("PRISMA PUT ERROR:", error);
    return NextResponse.json({ error: "Shop not found or update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Shop ID is required in query params" }, { status: 400 });
    }

    await prisma.shop.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Shop deleted successfully" });
  } catch (error: unknown) {
    console.error("PRISMA DELETE ERROR:", error);
    return NextResponse.json({ error: "Unable to delete shop" }, { status: 500 });
  }
}
