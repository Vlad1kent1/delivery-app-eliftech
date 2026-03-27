import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

function safeBase64ToBuffer(dataUrl: string) {
  const matches = dataUrl.match(/^data:(image\/jpeg|image\/png|image\/webp);base64,(.+)$/);
  if (!matches) return null;
  const base64 = matches[2];
  return Buffer.from(base64, "base64");
}

function fileExtensionFromDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:(image\/jpeg|image\/png|image\/webp);base64/);
  if (!matches) return null;
  const mime = matches[1];
  return mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
}

async function saveImageFile(imageData: string, imageName: string) {
  const buffer = safeBase64ToBuffer(imageData);
  if (!buffer) throw new Error("Invalid image data");

  const extension = fileExtensionFromDataUrl(imageData);
  if (!extension) throw new Error("Unsupported image format");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = imageName.replace(/[^a-zA-Z0-9-_\.]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const filePath = path.join(uploadsDir, `${filename}.${extension}`);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${filename}.${extension}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  if (idsParam) {
    const ids = idsParam.split(",").filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { shop: true },
    });
    return NextResponse.json(products);
  }

  const products = await prisma.product.findMany({ include: { shop: true } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const { name, price, category, shopId, imageData, imageName, imagePath } = await req.json();

    if (!name || typeof price !== "number" || !category || !shopId) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    let image = imagePath ?? "";

    if (imageData && imageName) {
      image = await saveImageFile(imageData, imageName);
    }

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        image,
        shopId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PRISMA POST ERROR:", error);
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, price, category, shopId, imageData, imageName, imagePath } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    let image = imagePath ?? "";

    if (imageData && imageName) {
      image = await saveImageFile(imageData, imageName);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        category,
        image,
        shopId,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error("PRISMA PUT ERROR:", error);
    return NextResponse.json({ error: "Product not found or update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required in query params" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    console.error("PRISMA DELETE ERROR:", error);
    return NextResponse.json({ error: "Unable to delete product" }, { status: 500 });
  }
}