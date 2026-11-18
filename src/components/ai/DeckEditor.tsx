import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Download, Lightbulb, Loader2, MessageSquareText, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateAiArtifactApi, type AiArtifact, type DeckSlide, type PitchDeck } from "@/lib/api";
import { getToken } from "@/lib/session";
import { exportDeckToPptx } from "@/lib/deck-export";

const SlidePreview = ({ slide, deck, index }: { slide: DeckSlide; deck: PitchDeck; index: number }) => {
  const cover = slide.type === "title" || slide.type === "closing";
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-violet-600" />
      <div className={`flex h-full flex-col px-[6%] py-[5%] ${cover ? "justify-center" : ""}`}>
        {cover ? (
          <>
            <p className="text-[clamp(18px,3.6vw,40px)] font-extrabold leading-tight text-slate-900">{slide.title || deck.deckTitle}</p>
            <p className="mt-2 text-[clamp(11px,1.8vw,20px)] font-medium text-violet-700">{slide.headline || deck.tagline}</p>
            {slide.bullets.length > 0 && <p className="mt-4 text-[clamp(9px,1.1vw,13px)] text-slate-500">{slide.bullets.join("  ·  ")}</p>}
          </>
        ) : (
          <>
            <p className="text-[clamp(8px,1vw,12px)] font-bold uppercase tracking-[0.15em] text-violet-700">{slide.title}</p>
            <p className="mt-1 text-[clamp(13px,2.2vw,26px)] font-bold leading-snug text-slate-900">{slide.headline || slide.title}</p>
            <ul className="mt-[3%] space-y-[1.2%] text-[clamp(10px,1.45vw,18px)] text-slate-700">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[0.45em] h-[0.4em] w-[0.4em] shrink-0 rounded-full bg-violet-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="absolute bottom-[3%] left-[6%] text-[clamp(7px,0.8vw,10px)] text-slate-400">
          {deck.deckTitle} · {index + 1}
        </p>
      </div>
    </div>
  );
};

const DeckEditor = ({ artifact, onSaved }: { artifact: AiArtifact<PitchDeck>; onSaved: (a: AiArtifact<PitchDeck>) => void }) => {
  const { toast } = useToast();
  const [deck, setDeck] = useState<PitchDeck>(artifact.output);
  const [active, setActive] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setDeck(artifact.output);
    setActive(0);
    setDirty(false);
  }, [artifact._id, artifact.output]);

  const slide = deck.slides[Math.min(active, deck.slides.length - 1)];
  const update = (next: PitchDeck) => {
    setDeck(next);
    setDirty(true);
  };
  const setSlide = (patch: Partial<DeckSlide>) =>
    update({ ...deck, slides: deck.slides.map((s, i) => (i === active ? { ...s, ...patch } : s)) });
  const moveSlide = (to: number) => {
    if (to < 0 || to >= deck.slides.length) return;
    const slides = [...deck.slides];
    const [s] = slides.splice(active, 1);
    slides.splice(to, 0, s);
    update({ ...deck, slides });
    setActive(to);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateAiArtifactApi<PitchDeck>(getToken() || "", artifact._id, { output: deck, title: deck.deckTitle });
      onSaved(res.artifact);
      setDirty(false);
      toast({ title: "Deck saved" });
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const download = async () => {
    setExporting(true);
    try {
      await exportDeckToPptx(deck, deck.deckTitle);
    } catch (e) {
      toast({ title: "Export failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (!slide) return <p className="text-sm text-slate-500">This deck has no slides.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Input className="h-10 max-w-md text-lg font-bold" value={deck.deckTitle} onChange={(e) => update({ ...deck, deckTitle: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />} {dirty ? "Save changes" : "Saved"}
          </Button>
          <Button onClick={download} disabled={exporting} className="bg-violet-600 hover:bg-violet-700">
            {exporting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Download size={14} className="mr-1.5" />} Download .pptx
          </Button>
          <Button asChild variant="outline">
            <Link to={`/tools/pitch-review?deck=${artifact._id}`}>
              <MessageSquareText size={14} className="mr-1.5" /> Get AI review
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <ol className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible">
          {deck.slides.map((s, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`w-40 rounded-lg border px-3 py-2 text-left text-xs transition-colors lg:w-full ${
                  i === active ? "border-violet-500 bg-violet-50 text-violet-900" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
                }`}
              >
                <span className="font-bold">{i + 1}.</span> {s.title}
              </button>
            </li>
          ))}
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => {
                update({ ...deck, slides: [...deck.slides, { type: "product", title: "New slide", headline: "", bullets: [], speakerNotes: "", visualSuggestion: "" }] });
                setActive(deck.slides.length);
              }}
              className="flex w-40 items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-violet-300 lg:w-full"
            >
              <Plus size={12} /> Add slide
            </button>
          </li>
        </ol>

        <div className="space-y-5">
          <SlidePreview slide={slide} deck={deck} index={active} />

          <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Slide title</Label>
                <Input value={slide.title} onChange={(e) => setSlide({ title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Headline (the takeaway)</Label>
                <Textarea rows={2} value={slide.headline} onChange={(e) => setSlide({ headline: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bullets (one per line)</Label>
                <Textarea
                  rows={6}
                  value={slide.bullets.join("\n")}
                  onChange={(e) => setSlide({ bullets: e.target.value.split("\n").slice(0, 8) })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Speaker notes</Label>
                <Textarea rows={6} value={slide.speakerNotes} onChange={(e) => setSlide({ speakerNotes: e.target.value })} />
              </div>
              {slide.visualSuggestion && (
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <strong className="text-slate-800">Visual idea:</strong> {slide.visualSuggestion}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={active === 0} onClick={() => moveSlide(active - 1)}><ArrowUp size={13} className="mr-1" /> Move up</Button>
                <Button variant="outline" size="sm" disabled={active === deck.slides.length - 1} onClick={() => moveSlide(active + 1)}><ArrowDown size={13} className="mr-1" /> Move down</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  disabled={deck.slides.length <= 1}
                  onClick={() => {
                    update({ ...deck, slides: deck.slides.filter((_, i) => i !== active) });
                    setActive(Math.max(0, active - 1));
                  }}
                >
                  <Trash2 size={13} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deck.tips.length > 0 && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-violet-900"><Lightbulb size={15} /> Before you pitch</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {deck.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeckEditor;
