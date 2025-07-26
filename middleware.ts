import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.slice(1); // Remove leading slash
  
  // Skip API routes and known paths
  if (
    path.startsWith("api") ||
    path.startsWith("_next") ||
    path.includes(".") ||
    path === "" ||
    path.startsWith("analytics")
  ) {
    return NextResponse.next();
  }

  // Redirect to the API route that will handle tracking and redirection
  return NextResponse.redirect(new URL(`/api/redirect/${path}`, request.url));
}

export const config = {
    matcher: '/:path*', // Apply middleware to all paths
}