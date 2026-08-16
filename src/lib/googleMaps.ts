/**
 * Converts a Google Maps URL (share link, place link, @lat,lng link, or an
 * already-embeddable link) into a `/maps?...&output=embed` URL suitable for
 * an <iframe>. Google Maps share links can't be embedded directly (they're
 * blocked by X-Frame-Options), so this extracts whatever location signal it
 * can (coordinates, then a `q`/`query` param, then a /place/ name) and falls
 * back to searching the raw string so the embed still resolves in most cases.
 */
export const getGoogleMapsEmbedUrl = (mapUrl: string | undefined | null): string | null => {
  const url = mapUrl?.trim();
  if (!url) return null;

  if (url.includes("/maps/embed")) return url;

  const coordsMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (coordsMatch) {
    const [, lat, lng] = coordsMatch;
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }

  try {
    const parsed = new URL(url);
    const query = parsed.searchParams.get("q") || parsed.searchParams.get("query");
    if (query) {
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    }

    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
    }
  } catch {
    // Not a valid absolute URL — fall through to the raw-string fallback below.
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
};
