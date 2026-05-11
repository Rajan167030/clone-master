import { useEffect, useState } from "react";
import HeroParallax from "@/components/ui/hero-parallax";
import { getPublicGalleryApi, type GalleryImage } from "@/lib/api";

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    let mounted = true;

    getPublicGalleryApi()
      .then((response) => {
        if (mounted) setImages(response.images || []);
      })
      .catch(() => {
        if (mounted) setImages([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const products = images.map((image) => ({
    title: image.title,
    link: image.linkUrl || "#gallery",
    thumbnail: image.imageUrl,
  }));

  return <HeroParallax products={products} />;
};

export default GallerySection;