import type { Property } from "@/lib/sanity";

interface GuestyTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

let cachedToken: { value: string; expiresAt: number } | null = null;
let tokenRequestPromise: Promise<string> | null = null;
let missingCredentialsWarned = false;

const GUESTY_TOKEN_URL = process.env.GUESTY_TOKEN_URL || "https://open-api.guesty.com/oauth2/token";
const GUESTY_API_BASE_URL = (process.env.GUESTY_API_BASE_URL || "https://open-api.guesty.com/v1").replace(/\/+$/, "");
const GUESTY_LISTINGS_LIMIT = Number(process.env.GUESTY_LISTINGS_LIMIT || "50");
const GUESTY_ACCESS_TOKEN = process.env.GUESTY_ACCESS_TOKEN;

function hasGuestyCredentials(): boolean {
  return Boolean(
    GUESTY_ACCESS_TOKEN || (process.env.GUESTY_CLIENT_ID && process.env.GUESTY_CLIENT_SECRET)
  );
}

async function requestToken(): Promise<string> {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET");
  }

  const response = await fetch(GUESTY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "open-api",
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    const hint = response.status === 429
      ? " Token quota hit. Reuse an existing token with GUESTY_ACCESS_TOKEN in .env.local."
      : "";
    throw new Error(`Guesty token request failed (${response.status}): ${body}.${hint}`);
  }

  const data = (await response.json()) as GuestyTokenResponse;
  if (!data.access_token) {
    throw new Error("Guesty token response missing access_token");
  }

  const ttl = Math.max(60, data.expires_in || 3600);
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + ttl * 1000,
  };

  return data.access_token;
}

async function getGuestyAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (clientId && clientSecret) {
    // Dedupe concurrent refresh calls so a burst of requests doesn't spam the token endpoint and trip rate limits.
    if (!tokenRequestPromise) {
      tokenRequestPromise = requestToken().finally(() => {
        tokenRequestPromise = null;
      });
    }

    try {
      return await tokenRequestPromise;
    } catch (error) {
      if (GUESTY_ACCESS_TOKEN) {
        console.warn("Guesty token refresh failed, falling back to static GUESTY_ACCESS_TOKEN:", error);
        return GUESTY_ACCESS_TOKEN;
      }
      throw error;
    }
  }

  if (GUESTY_ACCESS_TOKEN) {
    return GUESTY_ACCESS_TOKEN;
  }

  return requestToken();
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return undefined;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function sanitizeId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.$oid === "string" && record.$oid.trim()) {
      return record.$oid.trim();
    }
    if (typeof record.id === "string" && record.id.trim()) {
      return record.id.trim();
    }
  }
  return undefined;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayIsoInAlberta(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeAmenityName(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractAmenities(raw: unknown): string[] {
  const values: string[] = [];

  const collect = (source: unknown) => {
    if (Array.isArray(source)) {
      source.forEach((item) => collect(item));
      return;
    }

    if (typeof source === "string" && source.trim()) {
      values.push(source.trim());
      return;
    }

    if (!source || typeof source !== "object") {
      return;
    }

    const record = source as Record<string, unknown>;
    const named = pickString(record.name, record.title, record.label, record.key, record.value);
    if (named) {
      values.push(named);
    }

    for (const [key, value] of Object.entries(record)) {
      if (typeof value === "boolean" && value) {
        values.push(normalizeAmenityName(key));
      }
    }
  };

  collect(raw);

  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function extractImages(listing: Record<string, unknown>): string[] {
  const sources = [listing.pictures, listing.images, listing.photos];

  for (const source of sources) {
    if (!Array.isArray(source)) continue;

    const urls = source
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return pickString(
            record.original,
            record.regular,
            record.large,
            record.thumbnail,
            record.url,
            record.link
          );
        }
        return undefined;
      })
      .filter((value): value is string => Boolean(value));

    if (urls.length > 0) {
      return urls;
    }
  }

  return ["/images/calgary_skyline.jpg"];
}

function mapGuestyListingToProperty(listing: Record<string, unknown>): Property | null {
  const id = sanitizeId(listing._id) || sanitizeId(listing.id);
  if (!id) return null;

  const title =
    pickString(listing.nickname, listing.title, listing.name) || `Guesty Listing ${id.slice(0, 6)}`;

  const addressData = (listing.address || {}) as Record<string, unknown>;
  const city = pickString(addressData.city, listing.city) || "Alberta";
  const address =
    pickString(
      addressData.full,
      addressData.fullAddress,
      addressData.display,
      addressData.address1,
      listing.address as string
    ) || city;

  const monthlyPrice = pickNumber(
    (listing as Record<string, unknown>).monthlyRate,
    (listing as Record<string, unknown>).priceMonthly,
    ((listing.prices as Record<string, unknown> | undefined)?.monthly as unknown)
  );

  const nightlyPrice = pickNumber(
    (listing as Record<string, unknown>).defaultDailyPrice,
    (listing as Record<string, unknown>).baseRate,
    (listing as Record<string, unknown>).nightlyRate,
    ((listing.prices as Record<string, unknown> | undefined)?.basePrice as unknown),
    ((listing.prices as Record<string, unknown> | undefined)?.nightly as unknown)
  );

  const price = monthlyPrice || nightlyPrice || 0;
  const pricePeriod: "night" | "month" = monthlyPrice ? "month" : "night";

  const bedrooms = pickNumber(
    (listing as Record<string, unknown>).bedrooms,
    (listing as Record<string, unknown>).bedroomsCount,
    ((listing.accommodations as Record<string, unknown> | undefined)?.bedrooms as unknown)
  ) || 1;

  const bathrooms = pickNumber(
    (listing as Record<string, unknown>).bathrooms,
    (listing as Record<string, unknown>).bathroomsCount,
    ((listing.accommodations as Record<string, unknown> | undefined)?.bathrooms as unknown)
  ) || 1;

  const guests = pickNumber(
    (listing as Record<string, unknown>).accommodates,
    (listing as Record<string, unknown>).guests,
    (listing as Record<string, unknown>).maxGuests
  ) || Math.max(2, bedrooms * 2);

  const listed = listing.listed !== false;
  const active = listing.active !== false;
  const isAvailable = listed && active;

  const description =
    pickString(
      (listing.publicDescription as Record<string, unknown> | undefined)?.summary,
      (listing.description as Record<string, unknown> | undefined)?.summary,
      listing.summary,
      listing.description as string
    ) || "Fully furnished executive accommodation for extended professional stays.";

  return {
    id,
    slug: slugify(`${title}-${id.slice(-6)}`),
    title,
    city,
    address,
    neighborhood: pickString(addressData.neighborhood, listing.neighborhood),
    price,
    pricePeriod,
    bedrooms,
    bathrooms,
    guests,
    availableDate: isAvailable ? "Available Now" : "Not Available",
    availableNow: isAvailable,
    isActive: isAvailable,
    tag: isAvailable ? "Available Now" : "Not Available",
    description,
    images: extractImages(listing),
    amenities: extractAmenities(
      listing.amenities ||
      listing.amenitiesList ||
      listing.amenitiesMap ||
      (listing.publicDescription as Record<string, unknown> | undefined)?.amenities
    ),
    sqft: pickNumber(
      (listing as Record<string, unknown>).sqft,
      (listing as Record<string, unknown>).squareFeet,
      ((listing.space as Record<string, unknown> | undefined)?.squareFeet as unknown)
    ),
    idealFor: [
      "Project teams",
      "Corporate relocation",
      "Extended professional stays",
    ],
  };
}

function normalizeLocationText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(unit|suite|apt|apartment)\s*[a-z0-9-]*/g, " ")
    .replace(/\b(executive|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStreetSignature(value: string): string {
  const normalized = normalizeLocationText(value);

  const numberedStreet = normalized.match(
    /\b\d{3,6}\s+\d{1,4}\s*(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|way|pl|place|cres|crescent|trl|trail|gate|close|ct|court)\b/
  );
  if (numberedStreet) {
    return numberedStreet[0];
  }

  const namedStreet = normalized.match(
    /\b\d{3,6}\s+[a-z0-9]+(?:\s+[a-z0-9]+)?\s+(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|way|pl|place|cres|crescent|trl|trail|gate|close|ct|court)\b/
  );
  if (namedStreet) {
    return namedStreet[0];
  }

  const leadingNumberBlock = normalized.match(/\b\d{3,6}(?:\s+[a-z0-9]+){1,3}\b/);
  return leadingNumberBlock ? leadingNumberBlock[0] : "";
}

function toCanonicalPropertyKey(property: Property): string {
  const normalizedTitle = normalizeLocationText(property.title);

  const titleStem = normalizedTitle
    .split(" ")
    .filter((token) => token && !/^\d+$/.test(token))
    .slice(0, 3)
    .join(" ");

  const streetSignature = extractStreetSignature(property.address || property.title);
  if (streetSignature) {
    return `${property.city.toLowerCase()}|${streetSignature}`;
  }

  return `${property.city.toLowerCase()}|${normalizedTitle}|${titleStem}`;
}

interface DedupedPropertyGroup {
  property: Property;
  listingIds: string[];
}

function dedupePropertyGroups(properties: Property[]): DedupedPropertyGroup[] {
  const deduped = new Map<string, { property: Property; listingIds: Set<string> }>();

  for (const property of properties) {
    const key = toCanonicalPropertyKey(property);
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, { property, listingIds: new Set([property.id]) });
      continue;
    }

    existing.listingIds.add(property.id);

    // Keep the listing with richer content when duplicate candidates are found.
    const existingScore =
      existing.property.images.length +
      (existing.property.description ? 1 : 0) +
      (existing.property.amenities?.length || 0);
    const currentScore = property.images.length + (property.description ? 1 : 0) + (property.amenities?.length || 0);

    if (currentScore > existingScore) {
      existing.property = property;
    }
  }

  return Array.from(deduped.values()).map((entry) => ({
    property: entry.property,
    listingIds: Array.from(entry.listingIds),
  }));
}

function normalizeListingsResponse(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const buckets: unknown[] = [
    data.results,
    data.listings,
    data.items,
    data.data,
  ];

  for (const bucket of buckets) {
    if (Array.isArray(bucket)) {
      return bucket.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
    }
  }

  return [];
}

function normalizeReservationsResponse(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const buckets: unknown[] = [
    data.results,
    data.reservations,
    data.items,
    data.data,
  ];

  for (const bucket of buckets) {
    if (Array.isArray(bucket)) {
      return bucket.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
    }
  }

  return [];
}

function extractReservationListingId(reservation: Record<string, unknown>): string | undefined {
  const listingRef = reservation.listing as Record<string, unknown> | undefined;
  return (
    sanitizeId(reservation.listingId) ||
    sanitizeId(reservation.listingID) ||
    sanitizeId(reservation.listing_id) ||
    sanitizeId(reservation.listing) ||
    sanitizeId(listingRef?._id) ||
    sanitizeId(listingRef?.id)
  );
}

function extractDatePrefix(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : undefined;
}

function extractReservationInterval(reservation: Record<string, unknown>): { checkIn: string; checkOut: string } | null {
  const dateRange = reservation.dateRange as Record<string, unknown> | undefined;
  const stayDates = reservation.stayDates as Record<string, unknown> | undefined;

  const checkIn =
    extractDatePrefix(reservation.checkInDateLocalized) ||
    extractDatePrefix(reservation.checkInDate) ||
    extractDatePrefix(reservation.checkIn) ||
    extractDatePrefix(dateRange?.checkIn) ||
    extractDatePrefix(stayDates?.checkIn) ||
    extractDatePrefix(reservation.arrivalDate) ||
    extractDatePrefix(reservation.startDate);

  const checkOut =
    extractDatePrefix(reservation.checkOutDateLocalized) ||
    extractDatePrefix(reservation.checkOutDate) ||
    extractDatePrefix(reservation.checkOut) ||
    extractDatePrefix(dateRange?.checkOut) ||
    extractDatePrefix(stayDates?.checkOut) ||
    extractDatePrefix(reservation.departureDate) ||
    extractDatePrefix(reservation.endDate);

  if (!checkIn || !checkOut) {
    return null;
  }

  return { checkIn, checkOut };
}

function intervalsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
}

async function fetchReservedListingIdsForDate(
  token: string,
  date: string,
  listingIds: string[]
): Promise<Set<string>> {
  const nextDay = new Date(`${date}T00:00:00`);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayIso = toIsoDate(nextDay);

  const attempts = [
    `/reservations?limit=500`,
    `/reservations?status=confirmed&limit=500`,
    `/reservations?status=reserved&limit=500`,
    `/reservations?status=checkedin&limit=500`,
    `/reservations?status=inhouse&limit=500`,
  ];

  let lastError = "";
  const blocked = new Set<string>();
  const listingSet = new Set(listingIds);

  for (const path of attempts) {
    let sawSuccessfulPage = false;

    for (let skip = 0; skip <= 4500; skip += 500) {
      const pagedPath = `${path}&skip=${skip}`;
      const response = await fetch(`${GUESTY_API_BASE_URL}${pagedPath}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json; charset=utf-8",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (skip === 0) {
          lastError = `Guesty reservations request failed (${response.status}) on ${pagedPath}`;
        }
        break;
      }

      sawSuccessfulPage = true;
      const payload = (await response.json()) as unknown;
      const reservations = normalizeReservationsResponse(payload);

      for (const reservation of reservations) {
        const listingId = extractReservationListingId(reservation);
        if (!listingId || !listingSet.has(listingId)) {
          continue;
        }

        const interval = extractReservationInterval(reservation);
        if (!interval) {
          // Conservative fallback: reservation exists for the listing but dates are not parseable.
          blocked.add(listingId);
          continue;
        }

        if (intervalsOverlap(interval.checkIn, interval.checkOut, date, nextDayIso)) {
          blocked.add(listingId);
        }
      }

      if (reservations.length < 500) {
        break;
      }
    }

    if (sawSuccessfulPage) {
      return blocked;
    }
  }

  if (lastError) {
    throw new Error(lastError);
  }

  return blocked;
}

async function fetchGuestyListings(token: string): Promise<Record<string, unknown>[]> {
  const attempts: Array<{ method: "GET" | "POST"; path: string; body?: Record<string, unknown> }> = [
    { method: "POST", path: "/listings", body: { limit: GUESTY_LISTINGS_LIMIT } },
    { method: "POST", path: "/listings/search", body: { limit: GUESTY_LISTINGS_LIMIT } },
    { method: "GET", path: `/listings?limit=${GUESTY_LISTINGS_LIMIT}` },
  ];

  let lastError = "";

  for (const attempt of attempts) {
    const response = await fetch(`${GUESTY_API_BASE_URL}${attempt.path}`, {
      method: attempt.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: attempt.body ? JSON.stringify(attempt.body) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      lastError = `Guesty listings request failed (${response.status}) on ${attempt.path}`;
      continue;
    }

    const payload = (await response.json()) as unknown;
    const listings = normalizeListingsResponse(payload);
    if (listings.length > 0) {
      return listings;
    }
  }

  if (lastError) {
    throw new Error(lastError);
  }

  return [];
}

export async function getGuestyProperties(): Promise<Property[]> {
  if (!hasGuestyCredentials()) {
    if (!missingCredentialsWarned) {
      console.warn(
        "Guesty credentials missing. Define GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET in .env.local."
      );
      missingCredentialsWarned = true;
    }
    return [];
  }

  const token = await getGuestyAccessToken();
  const listings = await fetchGuestyListings(token);

  const mapped = listings
    .map(mapGuestyListingToProperty)
    .filter((property): property is Property => Boolean(property));

  const dedupedGroups = dedupePropertyGroups(mapped);

  try {
    const todayIso = getTodayIsoInAlberta();
    const tomorrow = new Date(`${todayIso}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = toIsoDate(tomorrow);

    const uniqueListingIds = Array.from(
      new Set(dedupedGroups.flatMap(({ listingIds }) => listingIds).filter(Boolean))
    );

    const availabilityEntries = await Promise.all(
      uniqueListingIds.map(async (listingId) => {
        try {
          const result = await checkGuestyListingAvailability({
            listingId,
            checkIn: todayIso,
            checkOut: tomorrowIso,
            guests: 1,
          });
          return [listingId, result.available] as const;
        } catch {
          // Fail closed: unknown listing availability should not be advertised as available now.
          return [listingId, false] as const;
        }
      })
    );

    const availabilityByListingId = new Map<string, boolean>(availabilityEntries);

    let reservedTodayListingIds = new Set<string>();
    try {
      reservedTodayListingIds = await fetchReservedListingIdsForDate(token, todayIso, uniqueListingIds);
    } catch (error) {
      console.warn("Guesty active reservation check failed, relying on availability endpoint:", error);
    }

    return dedupedGroups.map(({ property, listingIds }) => {
      const hasActiveReservationToday = listingIds.some((id) => reservedTodayListingIds.has(id));
      const availableNow =
        !hasActiveReservationToday &&
        listingIds.length > 0 &&
        listingIds.every((id) => availabilityByListingId.get(id) === true);
      return {
        ...property,
        availableNow,
        tag: availableNow ? "Available Now" : "Not Available",
        availableDate: availableNow ? "Available Now" : "Not Available",
      };
    });
  } catch (error) {
    console.warn("Guesty today availability check failed, keeping default availability tag:", error);
    return dedupedGroups.map(({ property }) => property);
  }
}

export interface GuestyAvailabilityInput {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface GuestyAvailabilityResult {
  available: boolean;
  reservedInterval?: {
    checkIn: string;
    checkOut: string;
  };
}

export interface GuestyBookReservationInput {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface GuestyBookReservationResult {
  confirmed: boolean;
  reservationId?: string;
  reservedInterval?: {
    checkIn: string;
    checkOut: string;
  };
}

function mapListingId(listing: Record<string, unknown>): string | undefined {
  return sanitizeId(listing._id) || sanitizeId(listing.id);
}

async function fetchAvailabilityCandidates(
  token: string,
  input: GuestyAvailabilityInput,
  includeListingFilter: boolean
): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({
    listed: "true",
    active: "true",
    "available.checkIn": input.checkIn,
    "available.checkOut": input.checkOut,
    "available.minOccupancy": String(Math.max(1, input.guests)),
    ignoreFlexibleBlocks: "false",
    limit: "200",
  });

  if (includeListingFilter) {
    params.set("_id", input.listingId);
  }

  const response = await fetch(`${GUESTY_API_BASE_URL}/listings?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json; charset=utf-8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Guesty availability request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as unknown;
  return normalizeListingsResponse(payload);
}

export async function checkGuestyListingAvailability(
  input: GuestyAvailabilityInput
): Promise<GuestyAvailabilityResult> {
  if (!hasGuestyCredentials()) {
    throw new Error("Guesty credentials are missing.");
  }

  const token = await getGuestyAccessToken();

  const attempts = [true, false];
  for (const includeListingFilter of attempts) {
    try {
      const candidates = await fetchAvailabilityCandidates(token, input, includeListingFilter);
      const hasMatch = candidates.some((listing) => mapListingId(listing) === input.listingId);
      if (hasMatch) {
        return { available: true };
      }
      if (includeListingFilter) {
        return {
          available: false,
          reservedInterval: {
            checkIn: input.checkIn,
            checkOut: input.checkOut,
          },
        };
      }
    } catch (error) {
      if (!includeListingFilter) {
        throw error;
      }
      // Some accounts reject _id filter; retry once without it.
    }
  }

  return {
    available: false,
    reservedInterval: {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    },
  };
}

function extractReservationId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  const nested = (record.reservation || record.data || record.result) as Record<string, unknown> | undefined;

  return (
    sanitizeId(record._id) ||
    sanitizeId(record.id) ||
    sanitizeId(record.reservationId) ||
    sanitizeId(nested?._id) ||
    sanitizeId(nested?.id) ||
    sanitizeId(nested?.reservationId)
  );
}

function isLikelyConflict(status: number, body: string): boolean {
  if (status === 409 || status === 422) {
    return true;
  }

  const normalized = body.toLowerCase();
  return (
    normalized.includes("overlap") ||
    normalized.includes("already booked") ||
    normalized.includes("not available") ||
    normalized.includes("conflict")
  );
}

export async function bookGuestyReservation(
  input: GuestyBookReservationInput
): Promise<GuestyBookReservationResult> {
  if (!hasGuestyCredentials()) {
    throw new Error("Guesty credentials are missing.");
  }

  const token = await getGuestyAccessToken();

  const requestBodies: Record<string, unknown>[] = [
    {
      listingId: input.listingId,
      checkInDateLocalized: input.checkIn,
      checkOutDateLocalized: input.checkOut,
      guestsCount: Math.max(1, input.guests),
      source: "stayalberta-web",
      status: "confirmed",
      guest: {
        firstName: "StayAlberta",
        lastName: "Guest",
        email: "bookings@stayalberta.ca",
      },
    },
    {
      listingId: input.listingId,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: {
        numberOfGuests: Math.max(1, input.guests),
      },
      source: "stayalberta-web",
      status: "confirmed",
      guest: {
        firstName: "StayAlberta",
        lastName: "Guest",
        email: "bookings@stayalberta.ca",
      },
    },
  ];

  let lastError = "";

  for (const body of requestBodies) {
    const response = await fetch(`${GUESTY_API_BASE_URL}/reservations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const raw = await response.text();
    let parsed: unknown = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        parsed = null;
      }
    }

    if (response.ok) {
      return {
        confirmed: true,
        reservationId: extractReservationId(parsed),
      };
    }

    if (isLikelyConflict(response.status, raw)) {
      return {
        confirmed: false,
        reservedInterval: {
          checkIn: input.checkIn,
          checkOut: input.checkOut,
        },
      };
    }

    lastError = `Guesty reservation request failed (${response.status}): ${raw}`;
  }

  throw new Error(lastError || "Guesty reservation request failed.");
}
