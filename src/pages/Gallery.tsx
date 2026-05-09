import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const Gallery = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">
      <GallerySection />
    </main>
    <Footer />
  </div>
);

export default Gallery;