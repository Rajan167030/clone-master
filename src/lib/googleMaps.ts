/**
 * Converts a Google Maps URL or Location Label into an embeddable Google Maps URL
 * suitable for an <iframe>. Handles shortlinks, coordinates, place names, and location labels.
 */
export const getGoogleMapsEmbedUrl = (
  mapUrl?: string | null,
  locationLabel?: string | null
): string => {
  const url = (mapUrl || "").trim();
  const label = (locationLabel || "").trim();

  // If already an embed URL
  if (url.includes("/maps/embed")) return url;

  // Extract coordinates if present in @lat,lng format
  const coordsMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (coordsMatch) {
    const [, lat, lng] = coordsMatch;
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }

  // Parse query parameters or place names
  try {
    if (url.startsWith("http")) {
      const parsed = new URL(url);
      const query = parsed.searchParams.get("q") || parsed.searchParams.get("query");
      if (query) {
        return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
      }

      const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&z=15&output=embed`;
      }
    }
  } catch {
    // ignore parse errors
  }

  // If mapUrl is a shortlink (goo.gl / maps.app.goo.gl) or invalid for iframe, prefer locationLabel
  if (label) {
    return `https://www.google.com/maps?q=${encodeURIComponent(label)}&z=15&output=embed`;
  }

  const queryTerm = url || "Bengaluru, India";
  return `https://www.google.com/maps?q=${encodeURIComponent(queryTerm)}&z=15&output=embed`;
};

