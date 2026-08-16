import { getGoogleMapsEmbedUrl } from "@/lib/googleMaps";

interface EventMapPreviewProps {
  mapUrl: string | undefined | null;
  className?: string;
  title?: string;
}

const EventMapPreview = ({ mapUrl, className, title }: EventMapPreviewProps) => {
  const embedUrl = getGoogleMapsEmbedUrl(mapUrl);
  if (!embedUrl) return null;

  return (
    <iframe
      key={embedUrl}
      src={embedUrl}
      title={title || "Event location map"}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      style={{ border: 0 }}
    />
  );
};

export default EventMapPreview;
