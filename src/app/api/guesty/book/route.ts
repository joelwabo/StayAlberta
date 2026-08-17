import { NextResponse } from "next/server";
import { bookGuestyReservation } from "@/lib/guesty";

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = (await request.json()) as unknown;
  } catch {
    return NextResponse.json(
      {
        confirmed: false,
        error: "Invalid JSON payload.",
      },
      { status: 400 }
    );
  }

  const payload = (body || {}) as Record<string, unknown>;
  const listingId = String(payload.listingId || "").trim();
  const checkIn = String(payload.checkIn || "").trim();
  const checkOut = String(payload.checkOut || "").trim();
  const guests = Number(payload.guests || "1");

  if (!listingId || !isValidIsoDate(checkIn) || !isValidIsoDate(checkOut)) {
    return NextResponse.json(
      {
        confirmed: false,
        error: "Invalid booking parameters.",
      },
      { status: 400 }
    );
  }

  if (!Number.isFinite(guests) || guests < 1) {
    return NextResponse.json(
      {
        confirmed: false,
        error: "Invalid guests value.",
      },
      { status: 400 }
    );
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    return NextResponse.json(
      {
        confirmed: false,
        error: "Check-out must be after check-in.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await bookGuestyReservation({
      listingId,
      checkIn,
      checkOut,
      guests,
    });

    if (!result.confirmed) {
      return NextResponse.json(
        {
          confirmed: false,
          reservedInterval: result.reservedInterval || { checkIn, checkOut },
          error: `The selected dates (${checkIn} to ${checkOut}) conflict with an existing reservation.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      confirmed: true,
      reservationId: result.reservationId,
      message: `Reservation confirmed for ${checkIn} to ${checkOut}.`,
    });
  } catch (error) {
    console.error("Guesty booking failed:", error);
    return NextResponse.json(
      {
        confirmed: false,
        error: "Reservation service temporarily unavailable. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
