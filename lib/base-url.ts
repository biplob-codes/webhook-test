export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Client-side: use current browser origin
    return window.location.origin;
  }
  // Server-side: use env var (set on Vercel), fallback to localhost
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
