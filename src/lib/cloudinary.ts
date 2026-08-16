/**
 * Injects Cloudinary's f_auto,q_auto (auto format + auto quality) into any
 * Cloudinary-hosted image URL, so admin-uploaded images (event banners, gallery
 * photos, etc.) get served compressed/modern-format on the fly, regardless of
 * how large the original upload was. Non-Cloudinary URLs pass through unchanged.
 */
export const optimizeCloudinaryUrl = (url: string | undefined | null, width?: number): string => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url || "";
  }

  const transform = width ? `f_auto,q_auto,c_limit,w_${width}` : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transform}/`);
};
