import Link from "next/link";
import { Property, getNeighborhoodFromAddress } from "@/lib/guesty";

interface PropertyCardProps {
  property: Property;
}

function getAmenityIcon(amenity: string): string {
  const lower = amenity.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return "wifi";
  if (lower.includes("workspace") || lower.includes("desk")) return "laptop_mac";
  if (lower.includes("laundry") || lower.includes("washer") || lower.includes("dryer")) return "local_laundry_service";
  if (lower.includes("parking") || lower.includes("garage")) return "local_parking";
  if (lower.includes("a/c") || lower.includes("ac ") || lower.includes("air cond") || lower.includes("hvac")) return "ac_unit";
  if (lower.includes("tv") || lower.includes("netflix") || lower.includes("display")) return "smart_display";
  if (lower.includes("kitchen") || lower.includes("cook")) return "skillet";
  if (lower.includes("gym") || lower.includes("fitness")) return "fitness_center";
  if (lower.includes("charger") || lower.includes("ev ")) return "ev_station";
  if (lower.includes("patio") || lower.includes("balcony") || lower.includes("terrace")) return "deck";
  return "check_circle";
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isMonthly = property.pricePeriod === "month";
  const formattedPrice = isMonthly
    ? `$${property.price.toLocaleString()}/mo`
    : `$${property.price}/night`;

  // Find up to 2 amenities to display dynamically
  const displayAmenities: { text: string; icon: string }[] = [];

  const amenitiesList = property.amenities || [];

  // 1. Try to find a WiFi amenity
  const wifiAmenity = amenitiesList.find(
    (a) => a.toLowerCase().includes("wifi") || a.toLowerCase().includes("internet")
  );
  if (wifiAmenity) {
    displayAmenities.push({ text: wifiAmenity, icon: "wifi" });
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
      icon: parkingAmenity.toLowerCase().includes("charger") ? "ev_station" : "local_parking",
    });
  }

  // 3. If we don't have 2 amenities yet, fill in with others
  for (const amenity of amenitiesList) {
    if (displayAmenities.length >= 2) break;
    if (displayAmenities.some((d) => d.text === amenity)) continue;
    displayAmenities.push({ text: amenity, icon: getAmenityIcon(amenity) });
  }

  // 4. Fallbacks
  while (displayAmenities.length < 2) {
    displayAmenities.push({ text: "Not specified", icon: "info" });
  }

  return (
    <div className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-md overflow-hidden hover:shadow-ambient hover:scale-[1.01] transition-all duration-300 group cursor-pointer flex flex-col h-full">
      <Link href={`/properties/${property.id}`} className="relative h-64 overflow-hidden block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={property.images[0]}
        />
        <div className="absolute top-4 left-4 bg-primary-container text-white px-3 py-1 font-sans font-semibold text-xs tracking-wider uppercase rounded-sm">
          {property.tag}
        </div>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="font-serif text-title-lg text-primary group-hover:text-primary-container transition-colors duration-200">
            {property.title}
          </h3>
          <span className="font-sans font-semibold text-md text-primary-container whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>
        <p className="font-sans text-sm text-on-surface-variant mb-6">
          {getNeighborhoodFromAddress(property)}
        </p>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4 mt-auto">
          <div className="flex items-center gap-2 text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">bed</span>
            <span className="font-sans text-sm truncate" title={`${property.bedrooms} Bedrooms`}>
              {property.bedrooms} Bedrooms
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">bathtub</span>
            <span className="font-sans text-sm truncate" title={`${property.bathrooms} Baths`}>
              {property.bathrooms} Baths
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">
              {displayAmenities[0].icon}
            </span>
            <span className="font-sans text-sm truncate" title={displayAmenities[0].text}>
              {displayAmenities[0].text}
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant min-w-0">
            <span className="material-symbols-outlined text-[18px] shrink-0">
              {displayAmenities[1].icon}
            </span>
            <span className="font-sans text-sm truncate" title={displayAmenities[1].text}>
              {displayAmenities[1].text}
            </span>
          </div>
        </div>

        <Link
          href={`/properties/${property.id}`}
          className="mt-6 w-full text-center border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white font-sans font-bold py-3 rounded-sm transition-all duration-300 block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
