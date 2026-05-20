"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface WheelPickerProps {
  items: { value: string | number; label: string }[];
  value: string | number;
  onChange: (value: string | number) => void;
  width?: string;
  visibleCount?: number;
}

const ITEM_HEIGHT = 40;

export default function WheelPicker({ items, value, onChange, width = "100%", visibleCount = 5 }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = items.findIndex((item) => item.value === value);
    return idx === -1 ? 0 : idx;
  });

  // Scroll to selected item on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = items.findIndex((item) => item.value === value);
    const safeIdx = idx === -1 ? 0 : idx;
    el.scrollTop = safeIdx * ITEM_HEIGHT;
    setCurrentIndex(safeIdx);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);

    scrollTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));

      // Snap to nearest item
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
      setCurrentIndex(clamped);

      if (items[clamped] && items[clamped].value !== value) {
        onChange(items[clamped].value);
      }
    }, 100);
  }, [items, value, onChange]);

  const handleItemClick = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
    setCurrentIndex(index);
    if (items[index]) {
      onChange(items[index].value);
    }
  }, [items, onChange]);

  const paddingTop = ITEM_HEIGHT * Math.floor(visibleCount / 2);

  return (
    <div className="relative" style={{ width, height: ITEM_HEIGHT * visibleCount }}>
      {/* Selection highlight */}
      <div
        className="absolute left-0 right-0 rounded-lg bg-white/10 border-y border-white/10 pointer-events-none z-10"
        style={{ top: paddingTop, height: ITEM_HEIGHT }}
      />
      {/* Fade top */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-20" />
      {/* Fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ height: paddingTop }} />
        {items.map((item, i) => {
          const isSelected = i === currentIndex;
          return (
            <div
              key={`${item.value}-${i}`}
              onClick={() => handleItemClick(i)}
              className={`flex items-center justify-center cursor-pointer select-none transition-colors ${
                isSelected ? "text-white font-semibold text-lg" : "text-white/35 text-base"
              }`}
              style={{ height: ITEM_HEIGHT }}
            >
              {item.label}
            </div>
          );
        })}
        <div style={{ height: paddingTop }} />
      </div>
    </div>
  );
}
