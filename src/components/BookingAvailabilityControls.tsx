"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AvailabilityState = "idle" | "checking" | "error" | "success";

interface BookingAvailabilityControlsProps {
  listingId: string;
  maxGuests: number;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingAvailabilityControls({
  listingId,
  maxGuests,
}: BookingAvailabilityControlsProps) {
  const today = useMemo(() => new Date(), []);
  const initialCheckIn = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return toIsoDate(date);
  }, [today]);
  const initialCheckOut = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 8);
    return toIsoDate(date);
  }, [today]);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(1);
  const [state, setState] = useState<AvailabilityState>("idle");
  const [message, setMessage] = useState("");

  const safeMaxGuests = Math.max(1, maxGuests || 1);

  useEffect(() => {
    setGuests((value) => Math.min(Math.max(1, value), safeMaxGuests));
  }, [safeMaxGuests]);

  const canDecrease = guests > 1;
  const canIncrease = guests < safeMaxGuests;

  useEffect(() => {
    setState("idle");
    setMessage("");
    // Clear stale validation feedback when the user edits booking fields.
  }, [checkIn, checkOut, guests]);

  async function handleRequestClick() {
    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      setState("error");
      setMessage(`Invalid date range: check-out (${checkOut}) must be after check-in (${checkIn}).`);
      return;
    }

    try {
      setState("checking");
      setMessage("");

      const response = await fetch("/api/guesty/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const payload = (await response.json()) as {
        confirmed?: boolean;
        reservationId?: string;
        error?: string;
        message?: string;
        reservedInterval?: { checkIn: string; checkOut: string };
      };

      if (!payload.confirmed) {
        const reservedFrom = payload.reservedInterval?.checkIn || checkIn;
        const reservedTo = payload.reservedInterval?.checkOut || checkOut;
        const conflictMessage =
          response.status === 409
            ? `These dates are no longer available. An existing reservation already covers ${reservedFrom} to ${reservedTo}.`
            : null;

        setState("error");
        setMessage(
          conflictMessage ||
            `Unable to confirm reservation for your selected stay (${checkIn} to ${checkOut}).`
        );
        return;
      }

      setState("success");
      setMessage(
        payload.reservationId
          ? `Reservation confirmed in Guesty for ${checkIn} to ${checkOut}. Reservation ID: ${payload.reservationId}.`
          : `Reservation confirmed in Guesty for ${checkIn} to ${checkOut}.`
      );
    } catch {
      setState("error");
      setMessage(
        `Unable to confirm reservation for your selected stay (${checkIn} to ${checkOut}) right now. Please try again in a moment.`
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase mb-1">
            Check-in
          </label>
          <input
            className="bg-[#F0F2F0] border-none border-b border-outline px-3 py-2.5 font-sans text-sm text-on-surface rounded-sm focus:outline-none focus:border-primary"
            type="date"
            min={toIsoDate(today)}
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase mb-1">
            Check-out
          </label>
          <input
            className="bg-[#F0F2F0] border-none border-b border-outline px-3 py-2.5 font-sans text-sm text-on-surface rounded-sm focus:outline-none focus:border-primary"
            type="date"
            min={checkIn || toIsoDate(today)}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase mb-1">
          Guests
        </label>
        <div className="bg-[#F0F2F0] border-none border-b border-outline px-3 py-2.5 rounded-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setGuests((value) => Math.max(1, value - 1))}
              disabled={!canDecrease}
              aria-label="Decrease guests"
              className="w-8 h-8 rounded-full border border-outline-variant text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              -
            </button>

            <div className="text-center min-w-[140px]">
              <div className="font-sans text-sm text-on-surface">
                {guests} {guests === 1 ? "professional" : "professionals"}
              </div>
              <div className="font-sans text-[10px] text-on-surface-variant">Max {safeMaxGuests} guests</div>
            </div>

            <button
              type="button"
              onClick={() => setGuests((value) => Math.min(safeMaxGuests, value + 1))}
              disabled={!canIncrease}
              aria-label="Increase guests"
              className="w-8 h-8 rounded-full border border-outline-variant text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRequestClick}
        disabled={state === "checking"}
        className="w-full bg-primary-container text-white px-8 py-4 font-sans font-semibold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95 flex justify-center items-center gap-2 rounded-sm text-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "checking" ? "Confirming reservation..." : "Request this property"}
        <span className="material-symbols-outlined text-[18px] select-none">north_east</span>
      </button>

      {message ? (
        <p className={`font-sans text-xs ${state === "success" ? "text-primary-container" : "text-error"}`}>
          {message}
        </p>
      ) : null}

      <Link
        href={`/inquiry?property=${listingId}&question=true`}
        className="w-full bg-white text-primary-container border-[0.5px] border-primary-container font-sans font-semibold text-xs uppercase tracking-widest py-4 hover:bg-surface-container transition-colors rounded-sm text-center block"
      >
        Ask a question
      </Link>
    </div>
  );
}
