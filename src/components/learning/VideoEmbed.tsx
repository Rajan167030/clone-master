import { ExternalLink } from "lucide-react";
import { getEmbed } from "@/lib/lms";

const VideoEmbed = ({ url, title }: { url?: string; title: string }) => {
  const embed = getEmbed(url);
  if (embed.kind === "none") return null;
  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
        {embed.kind === "video" ? (
          <video src={embed.src} controls className="h-full w-full" preload="metadata" />
        ) : (
          <iframe
            src={embed.src}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-violet-700">
        <ExternalLink size={12} /> Open video in a new tab
      </a>
    </div>
  );
};

export default VideoEmbed;
