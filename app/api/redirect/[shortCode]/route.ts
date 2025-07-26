import prisma from "@/lib/prisma";
import { getClientInfo } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    // Find the short URL in the database
    const shortUrl = await prisma.shortUrl.findUnique({ where: { shortCode } });
    if (!shortUrl) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    // Get analytics data
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || "direct";

    // Get geo data based on IP
    let geoData: {
      status: string;
      message?: string;
      country?: string;
      city?: string;
    } = { status: "unknown" };

    if (ip !== "unknown" && ip !== "::1") {
      console.log("Fetching geo data for IP:", ip);

      const geoResponse = await fetch(`http://ipapi.com/${ip}`);
      console.log("Geo data:", geoResponse);
      geoData = await geoResponse.json();

      if (geoData.status !== "success") {
        console.error("Failed to fetch geo data:", geoData.message);
      }
    }

    // Get client info from user agent
    const { browser, deviceType, os } = getClientInfo(userAgent);

    // Record the click in the database
    await prisma.click.create({
      data: {
        browser,
        deviceType,
        os,
        ip,
        referrer,
        country: geoData.country || "unknown",
        city: geoData.city || "unknown",
        shortUrlId: shortUrl.id,
        userAgent,
      },
    });

    // Redirect to the original URL
    return NextResponse.redirect(shortUrl.originalUrl);
  } catch (error) {
    console.error("Error in GET redirect request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
