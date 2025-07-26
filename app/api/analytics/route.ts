import prisma from "@/lib/prisma";
import { format, subDays } from "date-fns";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
  const ShortCode = z.string();
  try {
    const { shortCode: shortCode_raw, days = 30 } = await request.json();

    const shortCode = ShortCode.parse(shortCode_raw);

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { shortCode },
      include: { clicks: { orderBy: { timestamp: "asc" } } },
    });

    if (!shortUrl) {
      return NextResponse.json({ error: "URL not  found" }, { status: 404 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Filter clicks within date range
    const filteredClicks = shortUrl.clicks.filter(
      (click) => new Date(click.timestamp) >= startDate
    );

    // Process analytics data
    const referrers: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const dailyClicks: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    // For map: aggregate clicks by country only
    const geoClicks: { country: string; count: number }[] = [];
    const geoMap: Record<string, { country: string; count: number }> = {};

    filteredClicks.forEach((click) => {
      // Referrers
      const referrer = click.referrer || "direct";
      referrers[referrer] = (referrers[referrer] || 0) + 1;

      // Devices
      const device = click.deviceType || "unknown";
      devices[device] = (devices[device] || 0) + 1;

      // Daily clicks
      const dateKey = format(new Date(click.timestamp), "yyyy-MM-dd");
      dailyClicks[dateKey] = (dailyClicks[dateKey] || 0) + 1;

      // Countries
      const country = click.country || "unknown";
      countries[country] = (countries[country] || 0) + 1;

      // Browsers
      const browser = click.browser || "unknown";
      browsers[browser] = (browsers[browser] || 0) + 1;

      // Geo aggregation for map (country only)
      const geoKey = country;
      if (!geoMap[geoKey]) {
        geoMap[geoKey] = { country, count: 1 };
      } else {
        geoMap[geoKey].count += 1;
      }
    });

    // Convert geoMap to array for frontend
    Object.values(geoMap).forEach((geo) => geoClicks.push(geo));

    return NextResponse.json({
      shortCode,
      originalUrl: shortUrl.originalUrl,
      totalClicks: shortUrl.clicks.length,
      createdAt: shortUrl.createdAt,
      referrers,
      devices,
      dailyClicks,
      countries,
      browsers,
      geoClicks, // Array of { country, count }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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
