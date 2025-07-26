import { Prisma } from "@/app/generated/prisma";
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

    await generateRandomClicks({ shortCode });

    return NextResponse.json({
      shortCode,
      shortUrl: `${process.env.VERCEL_URL}/${shortCode}`,
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

// List of country names to randomly assign
const countries = [
  "United States",
  "Canada",
  "Brazil",
  "India",
  "China",
  "Germany",
  "France",
  "Australia",
  "South Africa",
  "Japan",
  "United Kingdom",
  "Italy",
  "Spain",
  "Russia",
  "Mexico",
  "Argentina",
  "Egypt",
  "Turkey",
  "Indonesia",
  "Nigeria",
];

// List of random user agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "Mozilla/5.0 (Linux; Android 10)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
  "Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X)",
  "Mozilla/5.0 (Linux; U; Android 4.0.3)",
  "Mozilla/5.0 (Windows NT 6.1; WOW64)",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64)",
];

async function generateRandomClicks({
  count = 1000,
  shortCode,
}: {
  count?: number;
  shortCode: string;
}) {
  const shortUrl = await prisma.shortUrl.findUnique({ where: { shortCode } });
  if (!shortUrl) throw new Error("Short URL not found");

  const clicks: Prisma.ClickCreateManyInput[] = [];
  for (let i = 0; i < count; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const referrer =
      Math.random() < 0.5
        ? "direct"
        : `https://example${Math.floor(Math.random() * 4)}.com`;

    clicks.push({
      shortUrlId: shortUrl.id,
      country,
      userAgent,
      referrer,
      deviceType: Math.random() < 0.5 ? "desktop" : "mobile",
      os: Math.random() < 0.5 ? "Windows" : "MacOS",
      browser: Math.random() < 0.5 ? "Chrome" : "Firefox",
      ip: nanoid(10),
      timestamp: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)
      ), // Random date within the last 30 days
    });
  }
  await prisma.click.createMany({
    data: clicks,
  });
  console.log(`Created ${count} random clicks for shortCode: ${shortCode}`);
}
