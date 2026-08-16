import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPublicGalleryApi, type GalleryImage } from "@/lib/api";
import { Image as ImageIcon, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Gallery = () => {
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
          setImages([]);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Group images by event name
  const groupedImages = images.reduce((acc, img) => {
    const eventName = img.eventName || "General Community Moments";
    if (!acc[eventName]) {
      acc[eventName] = [];
    }
    acc[eventName].push(img);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  const eventNames = Object.keys(groupedImages).sort((a, b) => {
    if (a === "General Community Moments") return 1;
    if (b === "General Community Moments") return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-6 md:pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary uppercase tracking-widest px-3 py-1 text-xs">
              Event Gallery
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold md:text-5xl lg:text-6xl text-foreground">
              Community <span className="text-gradient">Moments</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Relive the energy, connections, and insights from our exclusive founder meetups and investor nights.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-48 bg-muted/50 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : eventNames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-3xl bg-slate-50/50">
              <ImageIcon className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-heading font-semibold text-slate-700">No photos yet</h3>
              <p className="text-slate-500 mt-2">Check back later for updates from our latest events.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-16 md:gap-24">
              {eventNames.map((eventName) => (
                <section key={eventName} className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                      {eventName}
                    </h2>
                    <div className="h-[1px] flex-1 bg-border/60" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {groupedImages[eventName].map((image) => (
                      <div 
                        key={image._id} 
                        className="group relative overflow-hidden rounded-2xl aspect-square sm:aspect-[4/3] bg-muted shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <img 
                          src={image.imageUrl} 
                          alt={image.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <h3 className="text-white font-semibold text-sm md:text-base leading-tight drop-shadow-md">
                            {image.title}
                          </h3>
                          {image.caption && (
                            <p className="text-slate-300 text-xs mt-1 line-clamp-2 drop-shadow-sm">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Gallery;