interface EventBannerImageProps {
  src: string;
  alt: string;
  /** Controls the box's sizing/position/visibility (e.g. "relative h-48 w-full" or "absolute inset-0"). */
  className?: string;
}

// Shows the full event photo without cropping, regardless of its aspect ratio:
// a blurred, scaled-up copy fills the box as a backdrop, and the real photo
// sits on top with object-contain so nothing gets cut off.
const EventBannerImage = ({ src, alt, className }: EventBannerImageProps) => (
  <div className={`overflow-hidden bg-slate-950 ${className ?? ""}`}>
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-60 saturate-150"
    />
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-contain"
    />
  </div>
);

export default EventBannerImage;
