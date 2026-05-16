import { useEffect, useState } from "react";
import { getPublicGalleryApi, type GalleryImage } from "@/lib/api";

type GalleryTile = GalleryImage & {
  aspectRatio?: "square" | "portrait" | "landscape";
  spanClass?: string;
};

// Fallback Indian meetup/event images with different aspect ratios for masonry
const fallbackImages: GalleryTile[] = [
  {
    _id: "fallback-1",
    title: "Startup Meetup - Delhi",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80&fit=crop",
    order: 1,
    isActive: true,
    aspectRatio: "square",
    spanClass: "md:row-span-2",
  },
  {
    _id: "fallback-2",
    title: "Founders Circle - Mumbai",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&q=80&fit=crop",
    order: 2,
    isActive: true,
    aspectRatio: "portrait",
  },
  {
    _id: "fallback-3",
    title: "Investor Roundtable",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&q=80&fit=crop",
    order: 3,
    isActive: true,
    aspectRatio: "landscape",
  },
  {
    _id: "fallback-4",
    title: "Tech Meetup - Bengaluru",
    imageUrl: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=900&q=80&fit=crop",
    order: 4,
    isActive: true,
    aspectRatio: "square",
    spanClass: "md:row-span-2",
  },
  {
    _id: "fallback-5",
    title: "Pitch Session - Hyderabad",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80&fit=crop",
    order: 5,
    isActive: true,
    aspectRatio: "portrait",
  },
  {
    _id: "fallback-6",
    title: "Women Founders Meetup",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&q=80&fit=crop",
    order: 6,
    isActive: true,
    aspectRatio: "landscape",
  },
  {
    _id: "fallback-7",
    title: "Hackathon Night - Pune",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&fit=crop",
    order: 7,
    isActive: true,
    aspectRatio: "square",
  },
  {
    _id: "fallback-8",
    title: "AI Workshop - Chennai",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80&fit=crop",
    order: 8,
    isActive: true,
    aspectRatio: "portrait",
    spanClass: "md:row-span-2",
  },
  {
    _id: "fallback-9",
    title: "VC Networking Lounge",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80&fit=crop",
    order: 9,
    isActive: true,
    aspectRatio: "landscape",
  },
  {
    _id: "fallback-10",
    title: "Product Demo Day",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&q=80&fit=crop",
    order: 10,
    isActive: true,
    aspectRatio: "square",
  },
  {
    _id: "fallback-11",
    title: "Founder Breakfast - Noida",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=80&fit=crop",
    order: 11,
    isActive: true,
    aspectRatio: "portrait",
  },
  {
    _id: "fallback-12",
    title: "Community Meetup - Jaipur",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80&fit=crop",
    order: 12,
    isActive: true,
    aspectRatio: "landscape",
  },
];

const GallerySection = ({ className }: { className?: string }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

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

  const displayImages = (images.length > 0 ? images : fallbackImages) as GalleryTile[];

  return (
    <section className={`py-12 sm:py-16 md:py-24 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-primary">
              Gallery
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
            Community <span className="text-gradient">Moments</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 md:mt-4">
            Capturing the energy and collaboration from our events and meetups.
          </p>
        </div>

        {/* Masonry Gallery Grid */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-muted/50 animate-pulse rounded-lg aspect-square" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[220px] sm:auto-rows-[240px] md:auto-rows-[260px] gap-3 md:gap-4 lg:gap-6">
              {displayImages.map((image, index) => (
                <div
                  key={image._id || index}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 ${image.spanClass || "md:row-span-1"}`}
                >
                  {/* Image */}
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/35 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Title on hover */}
                  <div className="absolute inset-0 flex items-end p-4 md:p-5">
                    <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300 w-full">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90 mb-2">
                        Indian Meetup
                      </div>
                      <h3 className="font-heading font-semibold text-sm md:text-base text-white line-clamp-2 drop-shadow">
                        {image.title}
                      </h3>
                    </div>
                  </div>

                  {/* Icon indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .auto-rows-\\[250px\\] {
            grid-auto-rows: 200px;
          }
        }
      `}</style>
    </section>
  );
};

export default GallerySection;