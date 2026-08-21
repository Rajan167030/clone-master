import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDriveEmbedUrl, isEmbeddablePdfUrl } from "@/lib/drive";
import type { ActivityStartupItem } from "@/lib/api";

type PitchDeckViewerModalProps = {
  startup: ActivityStartupItem | null;
  onClose: () => void;
};

const PitchDeckViewerModal = ({ startup, onClose }: PitchDeckViewerModalProps) => {
  if (!startup) return null;

  const driveEmbedUrl = getDriveEmbedUrl(startup.pitchDeckUrl);
  const embedUrl = driveEmbedUrl || (isEmbeddablePdfUrl(startup.pitchDeckUrl) ? startup.pitchDeckUrl : null);

  return (
    <Dialog open={!!startup} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex flex-wrap items-center justify-between gap-2">
            <span>Pitch Deck: {startup.startupName}</span>
            <span className="flex items-center gap-3">
              <a
                href={startup.pitchDeckUrl}
                download
                className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
              >
                Download <Download className="w-3.5 h-3.5" />
              </a>
              <a
                href={startup.pitchDeckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
              >
                Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Category: {startup.category} | Stage: {startup.stage}
          </DialogDescription>
        </DialogHeader>

        {embedUrl ? (
          <div className="border rounded-xl overflow-hidden bg-slate-100">
            <iframe
              src={embedUrl}
              title={`${startup.startupName} pitch deck`}
              className="w-full h-[70vh]"
              allow="autoplay"
            />
          </div>
        ) : (
          <div className="border rounded-xl bg-slate-900 h-96 flex flex-col items-center justify-center text-white space-y-4 p-6 text-center">
            <FileText className="w-16 h-16 text-purple-400 animate-pulse" />
            <div>
              <h4 className="text-lg font-bold">{startup.startupName} Pitch Presentation</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                This link can't be previewed inline. Open it directly to view the presentation.
              </p>
            </div>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
              <a href={startup.pitchDeckUrl} target="_blank" rel="noopener noreferrer">
                View Pitch Deck <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        )}

        {driveEmbedUrl && (
          <p className="text-[11px] text-slate-500">
            If the preview above shows an access error, make sure the Google Drive file is shared as "Anyone with the link can view".
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PitchDeckViewerModal;
