import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClientInfo(userAgent: string) {
  let deviceType = "desktop";
  let os = "unknown";
  let browser = "unknown";

  // Detect device type
  if (/mobile/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/tablet/i.test(userAgent)) {
    deviceType = "tablet";
  }

  // Detect OS
  if (/windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = "MacOS";
  } else if (/linux/i.test(userAgent)) {
    os = "Linux";
  } else if (/android/i.test(userAgent)) {
    os = "Android";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = "iOS";
  }

  // Detect browser
  if (/edg/i.test(userAgent)) {
    browser = "Edge";
  } else if (/opr/i.test(userAgent)) {
    browser = "Opera";
  } else if (/chrome/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/safari/i.test(userAgent)) {
    browser = "Safari";
  } else if (/firefox/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/msie|trident/i.test(userAgent)) {
    browser = "IE";
  }

  return { deviceType, os, browser };
}
