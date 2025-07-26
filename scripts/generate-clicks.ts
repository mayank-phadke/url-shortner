import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

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
  count = 100,
  shortCode,
}: {
  count?: number;
  shortCode: string;
}) {
  const shortUrl = await prisma.shortUrl.findUnique({ where: { shortCode } });
  if (!shortUrl) throw new Error("Short URL not found");

  for (let i = 0; i < count; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const referrer =
      Math.random() < 0.5
        ? "direct"
        : `https://example${Math.floor(Math.random() * 10)}.com`;
    await prisma.click.create({
      data: {
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
      },
    });
    if (i % 10 === 0) console.log(`Created ${i + 1} clicks...`);
  }
  console.log(`Created ${count} random clicks for shortCode: ${shortCode}`);
}

// Usage: node scripts/generate-clicks.js <shortCode> <count>
if (require.main === module) {
  const args = process.argv.slice(2);
  const shortCode = args[0];
  const count = args[1] ? parseInt(args[1], 10) : 100;
  if (!shortCode) {
    console.error("Usage: node scripts/generate-clicks.js <shortCode> <count>");
    process.exit(1);
  }
  generateRandomClicks({ count, shortCode })
    .catch((err) => {
      console.error("Error generating clicks:", err);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
