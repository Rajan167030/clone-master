import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";

export type HeroParallaxProduct = {
  title: string;
  link: string;
  thumbnail: string;
};

type HeroParallaxProps = {
  products: HeroParallaxProduct[];
};

// Cloudinary image optimization function
const getOptimizedImageUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url.includes('cloudinary.com')) return url;

  // Insert transformations before the image path
  const transformations = `f_auto,q_${quality},w_${width},c_limit`;
  return url.replace('/upload/', `/upload/${transformations}/`);
};

// Lazy loading image component with preloading
const OptimizedImage = ({
  src,
  alt,
  className,
  priority = false,
  onLoad,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src);

  return (
    <>
      {!isLoaded && !hasError && (
        <div className={`${className} bg-muted animate-pulse rounded-lg`} />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        {...props}
      />
    </>
  );
};

const splitIntoRows = (products: HeroParallaxProduct[]) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);

  return [firstRow, secondRow].filter((row) => row.length > 0);
};

const ParallaxRow = ({
  products,
  translateX,
  reverse = false,
}: {
  products: HeroParallaxProduct[];
  translateX: ReturnType<typeof useTransform>;
  reverse?: boolean;
}) => (
  <motion.div style={{ x: translateX }} className="flex w-max gap-6 px-4 py-3">
    {[...products, ...products].map((product, index) => (
      <motion.a
        key={`${product.title}-${index}`}
        href={product.link}
        target="_blank"
        rel="noreferrer"
        whileHover={{ y: reverse ? -6 : 6 }}
        className="group relative block h-72 w-[22rem] flex-shrink-0 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl shadow-black/5"
      >
        <OptimizedImage
          src={product.thumbnail}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          priority={index < 3} // Preload first 3 images
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Gallery highlight</p>
            <h3 className="mt-2 text-xl font-bold leading-tight">{product.title}</h3>
          </div>

          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </motion.a>
    ))}
  </motion.div>
);

export function HeroParallax({ products }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rows = splitIntoRows(products);
  const rowTransforms = [
    useTransform(scrollYProgress, [0, 1], [0, -1100]),
    useTransform(scrollYProgress, [0, 1], [-150, 950]),
  ];

  return (
    <section ref={containerRef} id="gallery" className="relative overflow-hidden border-t border-border py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-blob" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-blob" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Gallery</span>
          </div>
          <h2 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Moments that shape <span className="text-gradient">Founders Connect</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A parallax gallery of community moments, founder conversations, and event energy.
          </p>
        </div>
      </div>

      <div className="mt-14 space-y-6">
        {rows.map((row, index) => (
          <ParallaxRow
            key={`gallery-row-${index}`}
            products={row}
            translateX={rowTransforms[index]}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroParallax;