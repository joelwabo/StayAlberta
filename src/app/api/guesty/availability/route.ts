import { NextResponse } from "next/server";
import { checkGuestyListingAvailability } from "@/lib/guesty";

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const listingId = (searchParams.get("listingId") || "").trim();
  const checkIn = (searchParams.get("checkIn") || "").trim();
  const checkOut = (searchParams.get("checkOut") || "").trim();
  const guests = Number(searchParams.get("guests") || "1");

  if (!listingId || !isValidIsoDate(checkIn) || !isValidIsoDate(checkOut)) {
    return NextResponse.json(
      {
        available: false,
        error: "Invalid availability query parameters.",
      },
      { status: 400 }
    );
  }

  if (!Number.isFinite(guests) || guests < 1) {
    return NextResponse.json(
      {
        available: false,
        error: "Invalid guests value.",
      },
      { status: 400 }
    );
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    return NextResponse.json(
      {
        available: false,
        error: "Check-out must be after check-in.",
      },
      { status: 400 }
    );
  }

  try {
    const availability = await checkGuestyListingAvailability({
      listingId,
      checkIn,
      checkOut,
      guests,
    });

    return NextResponse.json({
      available: availability.available,
      reservedInterval: availability.reservedInterval,
      message: availability.available
        ? "This property is available for your selected dates."
        : "This property is not available for the selected dates.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        error:
          error instanceof Error
            ? error.message
            : "Availability check failed.",
      },
      { status: 500 }
    );
  }
}
