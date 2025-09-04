// utils/url.ts
import { POSTER_FALLBACK } from "../lib/constants";

/** Returns a safe URI for React Native <Image /> or a fallback if invalid */
export function toSafeImageUri(input?: string) {
  if (!input || !/^https?:\/\//i.test(input)) return POSTER_FALLBACK;

  try {
    // Encode ONLY the path segments so special chars (like commas) don't break on Android
    const u = new URL(input);
    const safePath = u.pathname
      .split("/")
      .map(seg => encodeURIComponent(seg))
      .join("/");

    const safe = `${u.origin}${safePath}${u.search ?? ""}${u.hash ?? ""}`;
    return safe;
  } catch {
    // Fallback: encode, plus explicitly encode commas
    return encodeURI(input).replace(/,/g, "%2C");
  }
}
