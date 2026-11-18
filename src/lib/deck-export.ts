import type { PitchDeck } from "@/lib/api";

const VIOLET = "6D28D9";
const INK = "1E1B2E";
const MUTED = "5B5670";

/** Builds a clean light-theme 16:9 PowerPoint from a generated deck and downloads it. */
export const exportDeckToPptx = async (deck: PitchDeck, fileName: string) => {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
  pptx.title = deck.deckTitle;

  deck.slides.forEach((slide, index) => {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.12, fill: { color: VIOLET }, line: { color: VIOLET } });

    if (slide.type === "title" || slide.type === "closing") {
      s.addText(slide.title || deck.deckTitle, { x: 0.8, y: 2.3, w: 11.7, h: 1.2, fontSize: 44, bold: true, color: INK, fontFace: "Arial" });
      if (slide.headline || deck.tagline) {
        s.addText(slide.headline || deck.tagline, { x: 0.8, y: 3.5, w: 11.7, h: 0.9, fontSize: 22, color: VIOLET, fontFace: "Arial" });
      }
      if (slide.bullets.length) {
        s.addText(slide.bullets.join("   ·   "), { x: 0.8, y: 4.6, w: 11.7, h: 0.6, fontSize: 14, color: MUTED, fontFace: "Arial" });
      }
    } else {
      s.addText(slide.title.toUpperCase(), { x: 0.8, y: 0.45, w: 11.7, h: 0.4, fontSize: 13, bold: true, color: VIOLET, charSpacing: 2, fontFace: "Arial" });
      s.addText(slide.headline || slide.title, { x: 0.8, y: 0.9, w: 11.7, h: 1.1, fontSize: 28, bold: true, color: INK, fontFace: "Arial", valign: "top" });
      if (slide.bullets.length) {
        s.addText(
          slide.bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 10 } })),
          { x: 0.9, y: 2.3, w: 11.5, h: 4.3, fontSize: 20, color: INK, fontFace: "Arial", valign: "top" },
        );
      }
    }

    s.addText(`${deck.deckTitle}  ·  ${index + 1}`, { x: 0.8, y: 6.95, w: 11.7, h: 0.3, fontSize: 10, color: "9A96AD", fontFace: "Arial" });
    if (slide.speakerNotes) s.addNotes(slide.speakerNotes);
  });

  const safe = fileName.replace(/[^a-z0-9-_ ]/gi, "").trim() || "pitch-deck";
  await pptx.writeFile({ fileName: `${safe}.pptx` });
};
