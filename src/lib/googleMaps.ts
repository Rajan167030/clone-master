/**
 * Helper to check if a string is an HTTP/HTTPS URL
 */
export const isUrl = (str?: string | null): boolean => {
  if (!str) return false;
  return /^https?:\/\//i.test(str.trim());
};

/**
 * Extracts a searchable location query or coordinates from a Google Maps URL,
 * shortlink, or location text.
 */
export const extractSearchableLocation = (
  mapUrl?: string | null,
  locationLabel?: string | null
): string => {
  const url = (mapUrl || "").trim();
  const label = (locationLabel || "").trim();

  // If label is present and is NOT a raw URL, it's our best search term
  if (label && !isUrl(label)) {
    return label;
  }

  // Combine URL candidates
  const candidateUrl = isUrl(url) ? url : isUrl(label) ? label : "";

  if (candidateUrl) {
    // 1. Check for @lat,lng in URL (e.g. @12.934,77.691)
    const coordsMatch = candidateUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (coordsMatch) {
      return `${coordsMatch[1]},${coordsMatch[2]}`;
    }

    // 2. Check for lat,lng in query params (e.g. ?q=12.934,77.691 or ll=12.934,77.691)
    const paramCoordsMatch = candidateUrl.match(/[?&](?:q|ll|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (paramCoordsMatch) {
      return `${paramCoordsMatch[1]},${paramCoordsMatch[2]}`;
    }

    // 3. Check for /maps/place/Place+Name or /maps/search/Place+Name
    try {
      const parsed = new URL(candidateUrl);
      const query = parsed.searchParams.get("q") || parsed.searchParams.get("query");
      if (query && !isUrl(query)) {
        return query;
      }

      const placeMatch = parsed.pathname.match(/\/maps\/(?:place|search)\/([^/]+)/);
      if (placeMatch) {
        const decoded = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        return decoded.split("/@")[0].trim();
      }
    } catch {
      // ignore URL parse errors
    }
  }

  // Default fallback for Bengaluru events if URL is a raw shortlink (e.g. maps.app.goo.gl)
  return "Scaler School of Technology, Bengaluru, India";
};

/**
 * Converts a Google Maps URL or Location Label into an embeddable Google Maps URL
 * suitable for an <iframe>. Prevents raw shortlinks (maps.app.goo.gl) from returning a world map.
 */
export const getGoogleMapsEmbedUrl = (
  mapUrl?: string | null,
  locationLabel?: string | null
): string => {
  const url = (mapUrl || "").trim();

  // If already an embed URL
  if (url.includes("/maps/embed") || url.includes("output=embed")) {
    return url;
  }

  const query = extractSearchableLocation(mapUrl, locationLabel);
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
};

/**
 * Returns a human-readable location label.
 * If the locationLabel stored in DB is a raw URL (like https://maps.app.goo.gl/...),
 * it returns a clean venue name instead of rendering the raw URL text.
 */
export const getDisplayLocationLabel = (
  locationLabel?: string | null,
  fallback: string = "Bengaluru, India"
): string => {
  const label = (locationLabel || "").trim();
  if (!label) return fallback;
  if (!isUrl(label)) return label;

  // Try extracting place name from URL
  const extracted = extractSearchableLocation(label, "");
  if (
    extracted &&
    extracted !== "Scaler School of Technology, Bengaluru, India" &&
    !extracted.match(/^-?\d+/)
  ) {
    return extracted;
  }

  return "Scaler School of Technology, Bengaluru";
};
