import { useState } from "react";
import { MapPin, Navigation, Copy, Check, ExternalLink, Compass } from "lucide-react";
import { getGoogleMapsEmbedUrl, getDisplayLocationLabel, extractSearchableLocation, isUrl } from "@/lib/googleMaps";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface EventLocationVisualizerProps {
  mapUrl?: string | null;
  locationLabel?: string | null;
  eventTitle?: string;
  className?: string;
  showCardWrapper?: boolean;
}

const EventLocationVisualizer = ({
  mapUrl,
  locationLabel,
  eventTitle = "Event Venue",
  className = "",
  showCardWrapper = true,
}: EventLocationVisualizerProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const displayAddress = getDisplayLocationLabel(locationLabel);
  const searchableLocation = extractSearchableLocation(mapUrl, locationLabel);
  const embedUrl = getGoogleMapsEmbedUrl(mapUrl, locationLabel);

  const mapsTargetUrl = (mapUrl && isUrl(mapUrl))
    ? mapUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchableLocation)}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchableLocation)}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      toast({
        title: "Address Copied! 📍",
        description: `Copied "${displayAddress}" to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy address to clipboard.",
        variant: "destructive",
      });
    }
  };

  const mapContent = (
    <div className={`space-y-4 ${className}`}>
      {/* Map Header Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900/90 border border-slate-800 p-4 text-white shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <MapPin size={20} className="animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Venue Address</span>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px]">
                Live Location
              </Badge>
            </div>
            <p className="font-semibold text-sm sm:text-base text-slate-100 truncate" title={displayAddress}>
              {displayAddress}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="h-9 gap-1.5 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-medium"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy Address"}
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md"
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation size={14} /> Get Directions
            </a>
          </Button>
        </div>
      </div>

      {/* Embedded Map Container */}
      <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl min-h-[280px] sm:min-h-[340px]">
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={`Google Map for ${eventTitle}`}
          className={`w-full h-[280px] sm:h-[340px] transition-all duration-300 ${
            isInteractive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-90 group-hover:opacity-100"
          }`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInteractive(!isInteractive)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md border border-white/10 shadow-lg hover:bg-slate-900 transition-all"
          >
            <Compass size={14} className={isInteractive ? "text-emerald-400" : "text-slate-400"} />
            {isInteractive ? "Map Interactivity Active" : "Click to Interact with Map"}
          </button>
        </div>

        <div className="absolute bottom-3 right-3">
          <a
            href={mapsTargetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-slate-950/90 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/20 shadow-xl hover:scale-105 hover:bg-slate-900 transition-all"
          >
            <MapPin size={14} className="text-red-400" />
            Open in Google Maps
            <ExternalLink size={12} className="opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return mapContent;
  }

  return (
    <Card className="border-border/80 shadow-xl overflow-hidden bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
            <MapPin size={12} className="mr-1" /> Venue Location
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          Event Venue & Google Map Visualizer
        </CardTitle>
        <CardDescription>
          Explore the event venue location on Google Maps, copy the address, or get turn-by-turn directions.
        </CardDescription>
      </CardHeader>
      <CardContent>{mapContent}</CardContent>
    </Card>
  );
};

export default EventLocationVisualizer;
