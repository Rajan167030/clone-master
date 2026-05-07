import HeroParallax from "@/components/ui/hero-parallax";
import slide1 from "@/assets/hero-slide1.jpg";
import slide2 from "@/assets/hero-slide2.jpg";
import slide3 from "@/assets/hero-slide3.jpg";
import slide4 from "@/assets/hero-slide4.jpg";

const products = [
  {
    title: "Community Moment 01",
    link: "#gallery",
    thumbnail: slide1,
  },
  {
    title: "Community Moment 02",
    link: "#gallery",
    thumbnail: slide2,
  },
  {
    title: "Community Moment 03",
    link: "#gallery",
    thumbnail: slide3,
  },
  {
    title: "Community Moment 04",
    link: "#gallery",
    thumbnail: slide4,
  },
  {
    title: "Community Moment 05",
    link: "#gallery",
    thumbnail: slide1,
  },
  {
    title: "Community Moment 06",
    link: "#gallery",
    thumbnail: slide2,
  },
  {
    title: "Community Moment 07",
    link: "#gallery",
    thumbnail: slide3,
  },
  {
    title: "Community Moment 08",
    link: "#gallery",
    thumbnail: slide4,
  },
  {
    title: "Community Moment 09",
    link: "#gallery",
    thumbnail: slide1,
  },
  {
    title: "Community Moment 10",
    link: "#gallery",
    thumbnail: slide2,
  },
  {
    title: "Community Moment 11",
    link: "#gallery",
    thumbnail: slide3,
  },
  {
    title: "Community Moment 12",
    link: "#gallery",
    thumbnail: slide4,
  },
  {
    title: "Community Moment 13",
    link: "#gallery",
    thumbnail: slide1,
  },
  {
    title: "Community Moment 14",
    link: "#gallery",
    thumbnail: slide2,
  },
  {
    title: "Community Moment 15",
    link: "#gallery",
    thumbnail: slide3,
  },
];

const GallerySection = () => <HeroParallax products={products} />;

export default GallerySection;