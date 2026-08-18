import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getNeighborhoodFromAddress, getProperties, STANDARD_AMENITIES } from "@/lib/guesty";

function formatPrice(price: number, period: "night" | "month"): string {
  if (period === "month") {
    return `$${price.toLocaleString()}/mo`;
  }
  return `$${price}/night`;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) {
        lines.push(current);
      }
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
}

async function embedPropertyImage(
  pdfDoc: PDFDocument,
  imageUrl?: string
): Promise<{
  image: Awaited<ReturnType<PDFDocument["embedJpg"]>> | Awaited<ReturnType<PDFDocument["embedPng"]>>;
  width: number;
  height: number;
} | null> {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
      const image = await pdfDoc.embedJpg(bytes);
      return { image, width: image.width, height: image.height };
    } catch {
      const image = await pdfDoc.embedPng(bytes);
      return { image, width: image.width, height: image.height };
    }
  } catch {
    return null;
  }
}

function drawPageHeader(
  page: Parameters<PDFDocument["addPage"]>[0] extends never ? never : ReturnType<PDFDocument["addPage"]>,
  title: string,
  subtitle: string,
  regularFont: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  boldFont: Awaited<ReturnType<PDFDocument["embedFont"]>>
) {
  const topY = page.getHeight() - 32;
  const contentX = 36;
  const maxTextWidth = page.getWidth() - 72;

  let titleSize = 19;
  while (boldFont.widthOfTextAtSize(title, titleSize) > maxTextWidth && titleSize > 14) {
    titleSize -= 0.5;
  }

  let subtitleSize = 9.5;
  while (regularFont.widthOfTextAtSize(subtitle, subtitleSize) > maxTextWidth && subtitleSize > 8) {
    subtitleSize -= 0.25;
  }

  page.drawText(title, {
    x: contentX,
    y: topY - 6,
    size: titleSize,
    font: boldFont,
    color: rgb(0.08, 0.14, 0.2),
  });

  page.drawText(subtitle, {
    x: contentX,
    y: topY - 26,
    size: subtitleSize,
    font: regularFont,
    color: rgb(0.36, 0.42, 0.48),
  });

  page.drawLine({
    start: { x: 24, y: topY - 42 },
    end: { x: page.getWidth() - 24, y: topY - 42 },
    thickness: 1.2,
    color: rgb(0.82, 0.85, 0.9),
  });
}

function drawCardShell(
  page: Parameters<PDFDocument["addPage"]>[0] extends never ? never : ReturnType<PDFDocument["addPage"]>,
  x: number,
  yBottom: number,
  width: number,
  height: number
) {
  page.drawRectangle({
    x: x + 2,
    y: yBottom - 2,
    width,
    height,
    color: rgb(0.92, 0.94, 0.97),
  });

  page.drawRectangle({
    x,
    y: yBottom,
    width,
    height,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.86, 0.88, 0.91),
    borderWidth: 1,
  });

  page.drawRectangle({
    x,
    y: yBottom + height - 4,
    width,
    height: 4,
    color: rgb(0.84, 0.22, 0.18),
  });
}

function getFeaturedAmenityDetails(propertyAmenities?: string[]) {
  const displayAmenities: string[] = [];
  const amenitiesList = [...STANDARD_AMENITIES, ...(propertyAmenities || [])];

  const wifiAmenity = amenitiesList.find(
    (a) => a.toLowerCase().includes("wifi") || a.toLowerCase().includes("internet")
  );
  if (wifiAmenity) {
    displayAmenities.push(wifiAmenity);
  }

  const parkingAmenity = amenitiesList.find(
    (a) =>
      a.toLowerCase().includes("parking") ||
      a.toLowerCase().includes("garage") ||
      a.toLowerCase().includes("charger") ||
      a.toLowerCase().includes("ev ")
  );
  if (parkingAmenity) {
    displayAmenities.push(parkingAmenity);
  }

  for (const amenity of amenitiesList) {
    if (displayAmenities.length >= 2) break;
    if (displayAmenities.includes(amenity)) continue;
    displayAmenities.push(amenity);
  }

  while (displayAmenities.length < 2) {
    if (displayAmenities.length === 0) {
      displayAmenities.push("Fibre WiFi");
    } else {
      displayAmenities.push("Heated Parking");
    }
  }

  return displayAmenities;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope !== "featured") {
    return NextResponse.json({ error: "Invalid brochure scope" }, { status: 400 });
  }

  const properties = await getProperties();
  const featured = properties.filter((p) => p.isActive !== false).slice(0, 6);

  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // A4 landscape in points (single page)
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  drawPageHeader(
    page,
    "StayAlberta Signature Collection",
    `Featured listings brochure | ${featured.length} properties`,
    regularFont,
    boldFont
  );

  const cols = 3;
  const rows = 2;
  const left = 32;
  const right = 32;
  const top = pageHeight - 78;
  const bottom = 28;
  const gapX = 10;
  const gapY = 10;
  const cardWidth = (pageWidth - left - right - gapX * (cols - 1)) / cols;
  const cardHeight = (top - bottom - gapY * (rows - 1)) / rows;

  for (let i = 0; i < featured.length; i += 1) {
    const property = featured[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    if (row >= rows) break;

    const cardX = left + col * (cardWidth + gapX);
    const cardTop = top - row * (cardHeight + gapY);
    const cardBottom = cardTop - cardHeight;

    drawCardShell(page, cardX, cardBottom, cardWidth, cardHeight);

    const title = truncateText(property.title, 32);
    const location = truncateText(getNeighborhoodFromAddress(property), 42);
    const featuredAmenities = getFeaturedAmenityDetails(property.amenities);

    page.drawText(title, {
      x: cardX + 8,
      y: cardTop - 18,
      size: 9.4,
      font: boldFont,
      color: rgb(0.1, 0.15, 0.2),
    });

    page.drawText(location, {
      x: cardX + 8,
      y: cardTop - 32,
      size: 7.2,
      font: regularFont,
      color: rgb(0.4, 0.45, 0.5),
    });

    const imageWidth = cardWidth - 24;
    const imageX = cardX + (cardWidth - imageWidth) / 2;
    const imageHeight = 102;
    const imageY = cardTop - 40 - imageHeight;
    const embeddedImage = await embedPropertyImage(pdfDoc, property.images?.[0]);

    if (embeddedImage) {
      page.drawImage(embeddedImage.image, {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
      });
    } else {
      page.drawRectangle({
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
        color: rgb(0.95, 0.96, 0.98),
        borderColor: rgb(0.86, 0.88, 0.91),
        borderWidth: 1,
      });
    }

    const detailY = imageY - 12;
    page.drawText(`Price: ${formatPrice(property.price, property.pricePeriod)}`, {
      x: cardX + 8,
      y: detailY,
      size: 7.1,
      font: regularFont,
      color: rgb(0.2, 0.23, 0.27),
    });
    page.drawText(`Bedrooms: ${property.bedrooms} | Baths: ${property.bathrooms}`, {
      x: cardX + 8,
      y: detailY - 10,
      size: 7.1,
      font: regularFont,
      color: rgb(0.2, 0.23, 0.27),
    });
    page.drawText(`Amenity 1: ${truncateText(featuredAmenities[0], 30)}`, {
      x: cardX + 8,
      y: detailY - 20,
      size: 6.8,
      font: regularFont,
      color: rgb(0.28, 0.32, 0.36),
    });
    page.drawText(`Amenity 2: ${truncateText(featuredAmenities[1], 30)}`, {
      x: cardX + 8,
      y: detailY - 29,
      size: 6.8,
      font: regularFont,
      color: rgb(0.28, 0.32, 0.36),
    });
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="stayalberta-featured-listings.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
