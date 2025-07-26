import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import * as z from "zod";

export async function POST(request: Request) {
  const URL = z.string();
  try {
    const { url: url_raw, customAlias } = await request.json();

    // Validate URL
    const url = URL.parse(url_raw);

    const shortCode = customAlias || nanoid(6);

    // Check if short url already exists
    const existingUrl = await prisma.shortUrl.findUnique({
      where: { shortCode },
    });

    if (existingUrl) {
      return NextResponse.json(
        { error: "Alias already exists" },
        { status: 409 }
      );
    }

    await prisma.shortUrl.create({
      data: {
        originalUrl: url,
        shortCode,
      },
    });

    return NextResponse.json({
      shortCode,
      shortUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/${shortCode}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Validation error:", error);
      return NextResponse.json(
        { error: "Validation Error", details: error },
        { status: 400 }
      );
    }
    console.error("Error shortening URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
