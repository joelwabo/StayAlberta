"use client";

import { useMemo, useState } from "react";

interface GuestCounterProps {
  maxGuests: number;
  minGuests?: number;
}

export default function GuestCounter({ maxGuests, minGuests = 1 }: GuestCounterProps) {
  const safeMax = Math.max(minGuests, maxGuests || minGuests);
  const [guests, setGuests] = useState(minGuests);

  const canDecrease = guests > minGuests;
  const canIncrease = guests < safeMax;

  const guestLabel = useMemo(() => {
    return guests === 1 ? "professional" : "professionals";
  }, [guests]);

  return (
    <div className="bg-[#F0F2F0] border-none border-b border-outline px-3 py-2.5 rounded-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setGuests((value) => Math.max(minGuests, value - 1))}
          disabled={!canDecrease}
          aria-label="Decrease guests"
          className="w-8 h-8 rounded-full border border-outline-variant text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
        >
          -
        </button>

        <div className="text-center min-w-[140px]">
          <div className="font-sans text-sm text-on-surface">
            {guests} {guestLabel}
          </div>
          <div className="font-sans text-[10px] text-on-surface-variant">Max {safeMax} guests</div>
        </div>

        <button
          type="button"
          onClick={() => setGuests((value) => Math.min(safeMax, value + 1))}
          disabled={!canIncrease}
          aria-label="Increase guests"
          className="w-8 h-8 rounded-full border border-outline-variant text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
