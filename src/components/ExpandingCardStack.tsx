import { useId, useState } from "react";
import type React from "react";

export interface ExpandingCardItem {
  title: string;
  description: React.ReactNode;
}

interface ExpandingCardStackProps {
  cards: ExpandingCardItem[];
  /** "click" toggles the active card on click/tap/Enter/Space. "hover" also expands on mouse hover. */
  trigger?: "click" | "hover";
  className?: string;
}

// Roughly 40-50% of the row width for the expanded card, per the requested range.
const EXPANDED_BASIS = 44;

const ExpandingCardStack = ({ cards, trigger = "click", className }: ExpandingCardStackProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const groupId = useId();

  const narrowGrow = 1;
  const narrowBasis = (100 - EXPANDED_BASIS) / Math.max(cards.length - 1, 1);
  const activeGrow = EXPANDED_BASIS / narrowBasis;

  const toggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(index);
    }
  };

  return (
    <ul
      className={`flex w-full list-none flex-col gap-3 md:h-80 md:flex-row md:gap-0 lg:h-96 ${className ?? ""}`}
      onMouseLeave={trigger === "hover" ? () => setActiveIndex(null) : undefined}
    >
      {cards.map((card, index) => {
        const isActive = activeIndex === index;
        return (
          <li
            key={card.title}
            id={`${groupId}-card-${index}`}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            onClick={() => toggle(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onMouseEnter={trigger === "hover" ? () => setActiveIndex(index) : undefined}
            onFocus={trigger === "hover" ? () => setActiveIndex(index) : undefined}
            style={{
              flex: `${isActive ? activeGrow : narrowGrow} 1 0%`,
              zIndex: isActive ? 20 : cards.length - index,
              transition: "flex 0.35s ease, background-color 0.35s ease, color 0.35s ease",
            }}
            className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              isActive ? "min-h-[260px]" : "min-h-[150px]"
            } md:min-h-0 ${index === 0 ? "" : "md:-ml-4"} ${
              isActive
                ? "border-black/10 bg-neutral-100 text-black"
                : "border-white/10 bg-black text-white"
            }`}
          >
            <div className="relative flex h-full flex-col p-6 md:p-8">
              <span
                className={`absolute right-5 top-5 font-heading text-3xl font-light md:text-4xl ${
                  isActive ? "text-black/20" : "text-white/20"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="max-w-[70%] font-heading text-2xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-3xl">
                {card.title}
              </h3>

              <p
                className={`mt-4 max-w-[85%] text-sm leading-relaxed ${
                  isActive ? "text-black/60" : "text-white/60"
                }`}
              >
                {card.description}
              </p>

              <div className="flex-1" />

              <span
                className={`w-fit rounded-full border px-6 py-3 text-xs font-bold uppercase tracking-widest ${
                  isActive ? "border-black/30 text-black" : "border-white/30 text-white"
                }`}
              >
                Read More
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ExpandingCardStack;
