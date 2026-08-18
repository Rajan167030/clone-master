import { MapPin, ExternalLink } from "lucide-react";
import { getGoogleMapsEmbedUrl } from "@/lib/googleMaps";

interface EventMapPreviewProps {
  mapUrl?: string | null;
  locationLabel?: string | null;
  className?: string;
  title?: string;
}

const EventMapPreview = ({
  mapUrl,
  locationLabel,
  className = "h-48 w-full",
  title = "Event location map",
}: EventMapPreviewProps) => {
  const embedUrl = getGoogleMapsEmbedUrl(mapUrl, locationLabel);
  const targetUrl =
    mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel || "Bengaluru")}`;

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-border bg-slate-900 shadow-md transition-all hover:shadow-xl cursor-pointer"
      title="Click to open location in Google Maps"
    >
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={title}
        className={`${className} pointer-events-none opacity-90 transition-opacity group-hover:opacity-100`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0 }}
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-3 py-1.5 font-sans text-xs font-semibold text-white backdrop-blur-md border border-white/10 shadow-lg transition-transform group-hover:scale-105">
        <MapPin size={14} className="text-red-400" />
        Open Google Maps
        <ExternalLink size={12} className="opacity-80" />
      </div>
    </a>
  );
};

export default EventMapPreview;

