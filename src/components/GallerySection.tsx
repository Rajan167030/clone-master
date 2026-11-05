import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getPublicGalleryApi, type GalleryImage } from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

type GalleryTile = GalleryImage & {
  aspectRatio?: "square" | "portrait" | "landscape";
  spanClass?: string;
};

const formatFrameId = (index: number) => `FC-${String(index + 1).padStart(3, "0")}`;

const getRollCode = (index: number) => `${String(24 + (index % 6)).padStart(2, "0")}A`;

const getVenue = (image: GalleryTile) => image.eventName || image.title || "Community";

const getDateLabel = (image: GalleryTile) => {
  if (!image.createdAt) return "Undated";

  const parsed = new Date(image.createdAt);
  if (Number.isNaN(parsed.getTime())) return image.createdAt;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAltText = (image: GalleryTile) =>
  image.altText || image.caption || `${getVenue(image)} community moment`;

// Fallback: real Founders Connect event photos from Cloudinary
const fallbackImages: GalleryTile[] = [
  {
    _id: "fallback-1",
    title: "Founders Connect Community",
    imageUrl: "https://res.cloudinary.com/dbgsxczyi/image/upload/v1786221749/founders-connect/gallery/xx3fozg1vndbhsbmh0oj.jpg",
    order: 1,
    isActive: true,
  },
  {
    _id: "fallback-2",
    title: "Panel Discussion",
    imageUrl: "https://res.cloudinary.com/dbgsxczyi/image/upload/v1786222144/founders-connect/gallery/usgaweokqegducd8kquj.jpg",
    order: 2,
    isActive: true,
  },
  {
    _id: "fallback-3",
    title: "Speaker Session",
    imageUrl: "https://res.cloudinary.com/dbgsxczyi/image/upload/v1786222082/founders-connect/gallery/uuasihojyktrhraetyci.jpg",
    order: 3,
    isActive: true,
  },
  {
    _id: "fallback-4",
    title: "Founders in the Audience",
    imageUrl: "https://res.cloudinary.com/dbgsxczyi/image/upload/v1786222253/founders-connect/gallery/hqvohs2f74yryfhl1rtq.jpg",
    order: 4,
    isActive: true,
  },
  {
    _id: "fallback-5",
    title: "Community Meetup",
    imageUrl: "https://res.cloudinary.com/dbgsxczyi/image/upload/v1786221916/founders-connect/gallery/jmbhmbacwwuavz8lwlem.jpg",
    order: 5,
    isActive: true,
  },
];

const GallerySection = ({ className }: { className?: string }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryTile | null>(null);

  useEffect(() => {
    let mounted = true;

    getPublicGalleryApi()
      .then((response) => {
        if (mounted) {
          setImages(response.images || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setImages(fallbackImages);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedImage]);

  const displayImages = (images.length > 0 ? images : fallbackImages) as GalleryTile[];
  const currentYear = new Date().getFullYear();

  const renderFilmFrame = (image: GalleryTile, index: number, keyPrefix: string, isDuplicate = false) => {
    const venue = getVenue(image);
    const dateLabel = getDateLabel(image);

    return (
      <div key={`${keyPrefix}-${image._id}-${index}`} className="filmstrip-frame group" aria-hidden={isDuplicate || undefined}>
        <div className="mb-2 flex items-center justify-between font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6862]">
          <span>{formatFrameId(index % displayImages.length)}</span>
          <span className="text-[#c9861a]">{getRollCode(index)}</span>
        </div>

        <button
          type="button"
          aria-label={`View full image from ${venue}`}
          tabIndex={isDuplicate ? -1 : 0}
          disabled={isDuplicate}
          onClick={isDuplicate ? undefined : () => setSelectedImage(image)}
          className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-default"
        >
          <span className="block aspect-[3/2] border-2 border-[#141414] bg-[#141414] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <img
              src={optimizeCloudinaryUrl(image.imageUrl, 900)}
              alt={getAltText(image)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            />
          </span>
        </button>

        <div className="mt-3 flex items-center justify-between gap-4 font-['IBM_Plex_Mono'] text-[11px]">
          <span className="min-w-0 truncate border border-[#F5A623]/45 bg-[#F5A623]/10 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-[#8A5A09]">
            {venue}
          </span>
          <span className="shrink-0 text-[#6B6862]">{dateLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <section className={`bg-white py-12 sm:py-16 md:py-24 lg:py-32 ${className || ""}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="mb-4 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9861a]">
            <span>
              Roll {String(Math.max(1, Math.ceil(displayImages.length / 12))).padStart(3, "0")} - Developed {currentYear}
            </span>
          </div>
          <h2 className="font-['Archivo_Black'] text-4xl font-black uppercase tracking-normal text-[#141414] sm:text-5xl md:text-6xl">
            Community Moments
          </h2>
          <p className="font-['Inter'] text-sm sm:text-base text-[#6B6862] mt-3 md:mt-4">
            Capturing the energy and collaboration from our events and meetups.
          </p>
        </div>

        {/* Contact-sheet filmstrip gallery */}
        <div className="w-full overflow-hidden">
          {loading ? (
            <div className="filmstrip-reel flex gap-5 overflow-hidden p-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[360px] w-[min(460px,78vw)] shrink-0 animate-pulse bg-[#EDEAE0]" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-[26px]">
              <div className="filmstrip-reel">
                <div className="filmstrip-edge-fade filmstrip-edge-left" />
                <div className="filmstrip-edge-fade filmstrip-edge-right" />

                <div className="filmstrip-track filmstrip-track-left">
                  {[...displayImages, ...displayImages].map((image, index) =>
                    renderFilmFrame(image, index, "row-left", index >= displayImages.length)
                  )}
                </div>
              </div>

              <div className="filmstrip-reel">
                <div className="filmstrip-edge-fade filmstrip-edge-left" />
                <div className="filmstrip-edge-fade filmstrip-edge-right" />

                <div className="filmstrip-track filmstrip-track-right">
                  {[...displayImages, ...displayImages].map((image, index) =>
                    renderFilmFrame(image, index, "row-right", index >= displayImages.length)
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox: click a tile above to view its full image. Rendered via a
          portal to document.body so it's never confined by an ancestor's
          transform (e.g. this section's own GSAP scroll-reveal animation),
          which would otherwise break `position: fixed` centering. */}
      {selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X size={22} />
            </button>

            <figure
              className="flex max-h-full max-w-full flex-col items-center gap-4"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={optimizeCloudinaryUrl(selectedImage.imageUrl, 1600)}
                alt={getAltText(selectedImage)}
                className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              />
              {selectedImage.title && (
                <figcaption className="text-center text-sm text-white/80 sm:text-base">
                  {selectedImage.title}
                </figcaption>
              )}
            </figure>
          </div>,
          document.body
        )}
    </section>
  );
};

export default GallerySection;
