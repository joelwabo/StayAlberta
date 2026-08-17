import { Property, STANDARD_AMENITIES, getNeighborhoodFromAddress } from '@/lib/sanity';

function proxyImageUrl(url: string): string {
  if (!url) return '';
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export async function generatePropertyBrochureHTML(property: Property): Promise<string> {
  const amenitiesList = property.amenities || [];
  const amenitiesHTML = amenitiesList
    .slice(0, 6)
    .map((a) => `<li style="margin: 8px 0;">${a}</li>`)
    .join('');

  const idealForList = property.idealFor || [];
  const idealForHTML = idealForList
    .map((i) => `<span style="display: inline-block; margin-right: 12px; margin-bottom: 8px; padding: 6px 12px; background-color: #f5f5f5; border-radius: 4px; font-size: 12px;">${i}</span>`)
    .join('');

  const priceText =
    property.pricePeriod === 'month'
      ? `$${property.price.toLocaleString()}/month`
      : `$${property.price}/night`;

  const imagesHTML = property.images
    .slice(0, 4)
    .map(
      (img, idx) => {
        const proxiedUrl = proxyImageUrl(img);
        return `<div style="margin-bottom: 16px; text-align: center;">
      <img
        src="${proxiedUrl}"
        style="width: 100%; max-width: 500px; height: ${
          idx === 0 ? '300px' : '150px'
        }; object-fit: cover; border-radius: 4px;"
      />
    </div>`;
      }
    )
    .join('');

  return `
      <style>
        .pdf-brochure {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          max-width: 850px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.6;
          color: #111827;
          background: #ffffff;
        }
        .pdf-brochure h1 {
          font-size: 32px;
          color: #1a1a1a;
          margin-bottom: 12px;
          text-align: center;
        }
        .pdf-brochure .location {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .pdf-brochure .price {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 24px;
        }
        .pdf-brochure .images {
          margin-bottom: 32px;
        }
        .pdf-brochure .section {
          margin-bottom: 32px;
        }
        .pdf-brochure .section h2 {
          font-size: 18px;
          color: #2c3e50;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .pdf-brochure .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .pdf-brochure .detail-item {
          padding: 12px;
          background-color: #f9f9f9;
          border-radius: 4px;
          border-left: 3px solid #2c3e50;
        }
        .pdf-brochure .detail-label {
          font-weight: bold;
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .pdf-brochure .detail-value {
          font-size: 16px;
          color: #1a1a1a;
          margin-top: 4px;
        }
        .pdf-brochure .description {
          color: #555;
          line-height: 1.8;
        }
        .pdf-brochure ul {
          padding-left: 20px;
        }
        .pdf-brochure .amenities-list {
          list-style-type: none;
          padding: 0;
        }
        .pdf-brochure .amenities-list li {
          padding-left: 24px;
          position: relative;
        }
        .pdf-brochure .amenities-list li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #2c3e50;
          font-weight: bold;
        }
        .pdf-brochure .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        .pdf-brochure .page-break {
          page-break-after: always;
        }
      </style>
      <div class="pdf-brochure">
        <h1>${property.title}</h1>
        <div class="location">${property.address || property.city}, ${property.city}</div>
        <div class="price">${priceText}</div>

        <div class="images">
          ${imagesHTML}
        </div>

        <div class="section">
          <h2>Property Details</h2>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Bedrooms</div>
              <div class="detail-value">${property.bedrooms}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Bathrooms</div>
              <div class="detail-value">${property.bathrooms}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Guests</div>
              <div class="detail-value">${property.guests}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Available</div>
              <div class="detail-value">${property.availableDate}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Description</h2>
          <p class="description">${property.description}</p>
        </div>

        ${
          amenitiesList.length > 0
            ? `
        <div class="section">
          <h2>Amenities</h2>
          <ul class="amenities-list">
            ${amenitiesHTML}
          </ul>
        </div>
        `
            : ''
        }

        ${
          idealForList.length > 0
            ? `
        <div class="section">
          <h2>Ideal For</h2>
          <div style="margin-top: 12px;">
            ${idealForHTML}
          </div>
        </div>
        `
            : ''
        }

        <div class="footer">
          <p>StayAlberta - Your trusted accommodation partner in Alberta</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
  `;
}

export async function generateAllPropertiesHTML(properties: Property[]): Promise<string> {
  const activeProperties = properties.filter((p) => p.isActive !== false);

  // Same logic as PropertyCard to get the 2 display amenities
  const getDisplayAmenities = (property: Property) => {
    const displayAmenities: { text: string }[] = [];
    
    const amenitiesList = [
      ...STANDARD_AMENITIES,
      ...(property.amenities || [])
    ];

    // 1. Try to find a WiFi amenity
    const wifiAmenity = amenitiesList.find(
      (a) => a.toLowerCase().includes("wifi") || a.toLowerCase().includes("internet")
    );
    if (wifiAmenity) {
      displayAmenities.push({ text: wifiAmenity });
    }

    // 2. Try to find a Parking / EV Charger amenity
    const parkingAmenity = amenitiesList.find(
      (a) =>
        a.toLowerCase().includes("parking") ||
        a.toLowerCase().includes("garage") ||
        a.toLowerCase().includes("charger") ||
        a.toLowerCase().includes("ev ")
    );
    if (parkingAmenity) {
      displayAmenities.push({
        text: parkingAmenity,
      });
    }

    // 3. If we don't have 2 amenities yet, fill in with others
    for (const amenity of amenitiesList) {
      if (displayAmenities.length >= 2) break;
      if (displayAmenities.some((d) => d.text === amenity)) continue;
      displayAmenities.push({ text: amenity });
    }

    // 4. Fallbacks
    while (displayAmenities.length < 2) {
      if (displayAmenities.length === 0) {
        displayAmenities.push({ text: "Fibre WiFi" });
      } else {
        displayAmenities.push({ text: "Heated Parking" });
      }
    }

    return displayAmenities;
  };

  const propertiesHTML = activeProperties
    .map((property) => {
      const isMonthly = property.pricePeriod === "month";
      const formattedPrice = isMonthly
        ? `$${property.price.toLocaleString()}/mo`
        : `$${property.price}/night`;

      const displayAmenities = getDisplayAmenities(property);
      const neighborhood = getNeighborhoodFromAddress(property);
      const imageUrl = property.images[0]
        ? proxyImageUrl(property.images[0])
        : '';

      return `
      <article class="property-card">
        <div class="image-frame">
          <img
            src="${imageUrl}"
            alt="${property.title}"
          />
          <span class="property-tag">${property.tag}</span>
        </div>

        <div class="property-content">
          <div class="property-header">
            <h2>${property.title}</h2>
            <span class="property-price">${formattedPrice}</span>
          </div>
          <p class="property-location">${neighborhood}</p>

          <div class="property-meta">
            <div><span class="icon">🛏️</span>${property.bedrooms} Bd</div>
            <div><span class="icon">🚿</span>${property.bathrooms} Ba</div>
            <div><span class="icon">👥</span>${property.guests} Guests</div>
            <div><span class="icon">📍</span>${property.city}</div>
          </div>

          <div class="property-amenities">
            <span>${displayAmenities[0].text}</span>
            <span>${displayAmenities[1].text}</span>
          </div>
        </div>
      </article>
      `;
    })
    .join('');

  return `
      <style>
        * {
          box-sizing: border-box;
        }
        .pdf-brochure-root {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          line-height: 1.6;
          background: #ffffff;
          color: #111827;
        }
        .pdf-brochure-root .header {
          text-align: center;
          margin-bottom: 48px;
        }
        .pdf-brochure-root .header h1 {
          font-size: 28px;
          color: #1f2937;
          margin: 0 0 12px 0;
          font-family: Georgia, serif;
        }
        .pdf-brochure-root .header p {
          color: #6b7280;
          margin: 4px 0;
          font-size: 14px;
        }
        .pdf-brochure-root .properties-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .pdf-brochure-root .property-card {
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          min-height: 520px;
        }
        .pdf-brochure-root .image-frame {
          position: relative;
          min-height: 240px;
          overflow: hidden;
        }
        .pdf-brochure-root .image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pdf-brochure-root .property-tag {
          position: absolute;
          top: 18px;
          left: 18px;
          background-color: #d84c40;
          color: white;
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .pdf-brochure-root .property-content {
          padding: 24px 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }
        .pdf-brochure-root .property-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .pdf-brochure-root .property-header h2 {
          margin: 0;
          font-size: 18px;
          line-height: 1.2;
          color: #111827;
          font-family: Georgia, serif;
          font-weight: 700;
        }
        .pdf-brochure-root .property-price {
          font-weight: 700;
          color: #d84c40;
          font-size: 15px;
          white-space: nowrap;
        }
        .pdf-brochure-root .property-location {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }
        .pdf-brochure-root .property-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          color: #4b5563;
          font-size: 12px;
          line-height: 1.4;
        }
        .pdf-brochure-root .property-meta div {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pdf-brochure-root .property-meta .icon {
          width: 18px;
          display: inline-flex;
          justify-content: center;
        }
        .pdf-brochure-root .property-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: #374151;
          margin-top: auto;
        }
        .pdf-brochure-root .property-amenities span {
          padding: 8px 10px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
        }
        @media (max-width: 1024px) {
          .pdf-brochure-root .properties-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="pdf-brochure-root">
        <div class="header">
          <h1>Available Suites at StayAlberta</h1>
          <p>${activeProperties.length} Premium Properties</p>
        </div>

        <div class="properties-grid">
          ${propertiesHTML}
        </div>
      </div>
  `;
}
