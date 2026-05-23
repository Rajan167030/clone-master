import { useState, useEffect, useRef } from "react";

export const useCountingEffect = (value: string | number, duration: number = 2000) => {
  const [displayValue, setDisplayValue] = useState(value);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Extract numeric value from string (handles "1.5cr", "50", "₹315Cr", "1,000+")
    const extractNumber = (val: string | number) => {
      const str = String(val).toLowerCase();
      const match = str.match(/\d+\.?\d*/);
      return match ? parseFloat(match[0]) : 0;
    };

    // Get original format details
    const originalStr = String(value);
    const numericValue = extractNumber(originalStr);
    const hasComma = originalStr.includes(",");
    const hasCr = originalStr.includes("cr");
    const hasRupee = originalStr.includes("₹");
    const hasPlus = originalStr.includes("+");
    const hasDecimal = originalStr.includes(".");

    if (numericValue === 0 || hasStarted.current) return;

    hasStarted.current = true;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress); // Ease-out effect
      const currentValue = Math.floor(numericValue * easeOutQuad);

      let formatted = String(currentValue);

      if (hasDecimal) {
        formatted = (numericValue * easeOutQuad).toFixed(1);
      }

      if (hasComma && currentValue >= 1000) {
        formatted = currentValue.toLocaleString();
      }

      if (hasCr) {
        formatted += "cr";
      }
      if (hasRupee) {
        formatted = "₹" + formatted;
      }
      if (hasCr) {
        formatted += "";
      }
      if (hasPlus && progress === 1) {
        formatted += "+";
      }

      setDisplayValue(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
};
