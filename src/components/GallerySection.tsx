import slide1 from "@/assets/hero-slide1.jpg";
import slide2 from "@/assets/hero-slide2.jpg";
import slide3 from "@/assets/hero-slide3.jpg";
import slide4 from "@/assets/hero-slide4.jpg";

const galleryImages = [
  { src: slide1, alt: "Founders Connect community moment 1" },
  { src: slide2, alt: "Founders Connect community moment 2" },
  { src: slide3, alt: "Founders Connect community moment 3" },
  { src: slide4, alt: "Founders Connect community moment 4" },
];

const firstRow = [...galleryImages, ...galleryImages];
const secondRow = [...galleryImages].reverse().concat([...galleryImages].reverse());

const GallerySection = () => (
  <section id="gallery" className="relative overflow-hidden border-t border-border py-24">
    <div className="container mx-auto px-4">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Gallery
          </span>
        </div>
        <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Moments that shape <span className="text-gradient">Founders Connect</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          A living gallery of our events and community energy, moving in two parallel rows.
        </p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="gallery-track gallery-track-left flex w-max gap-5 px-4 py-2">
          {firstRow.map((item, index) => (
            <article
              key={`gallery-top-${index}`}
              className="group relative h-52 w-80 flex-shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg shadow-black/5"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-semibold text-white">Community Moment</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="gallery-track gallery-track-right flex w-max gap-5 px-4 py-2">
          {secondRow.map((item, index) => (
            <article
              key={`gallery-bottom-${index}`}
              className="group relative h-52 w-80 flex-shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg shadow-black/5"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-semibold text-white">Founders Connect</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default GallerySection;