import { useEffect, useRef, useState } from "react";

type GlowingEffectProps = {
  blur?: number;
  borderWidth?: number;
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
};

export function GlowingEffect({
  blur = 0,
  borderWidth = 2,
  spread = 80,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
}: GlowingEffectProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const element = ref.current;
    const parent = element?.parentElement;

    if (!element || !parent || disabled) {
      setActive(false);
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      const edgeDistance = Math.min(x, y, rect.width - x, rect.height - y);
      const centerX = Math.abs(xPercent - 50) / 50;
      const centerY = Math.abs(yPercent - 50) / 50;
      const centerDistance = Math.max(centerX, centerY);

      setPosition({ x: xPercent, y: yPercent });
      setActive(edgeDistance <= proximity || centerDistance > inactiveZone);
    };

    const handleLeave = () => {
      setActive(false);
    };

    parent.addEventListener("pointermove", handleMove);
    parent.addEventListener("pointerleave", handleLeave);

    return () => {
      parent.removeEventListener("pointermove", handleMove);
      parent.removeEventListener("pointerleave", handleLeave);
    };
  }, [disabled, inactiveZone, proximity]);

  const gradient = `radial-gradient(${spread}px circle at ${position.x}% ${position.y}%, rgba(56, 189, 248, 0.9), rgba(56, 189, 248, 0.35) 40%, transparent 70%)`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
    >
      <div
        className="glowing-effect-line absolute inset-0 rounded-[inherit]"
        style={{
          padding: `${borderWidth}px`,
        }}
      />

      {glow && (
        <div
          className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: active ? 0.75 : 0,
            background: gradient,
            filter: `blur(${blur}px)`,
          }}
        />
      )}
      <div
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          padding: `${borderWidth}px`,
          opacity: active ? 1 : 0.65,
          background: gradient,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
}

export default GlowingEffect;
