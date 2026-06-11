import Link from "next/link";
import { Property } from "@/lib/sanity";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isMonthly = property.pricePeriod === "month";
  const formattedPrice = isMonthly
    ? `$${property.price.toLocaleString()}/mo`
    : `$${property.price}/night`;

  return (
    <div className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-md overflow-hidden hover:shadow-ambient hover:scale-[1.01] transition-all duration-300 group cursor-pointer flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={property.images[0]}
        />
        <div className="absolute top-4 left-4 bg-primary-container text-white px-3 py-1 font-sans font-semibold text-xs tracking-wider uppercase rounded-sm">
          {property.tag}
        </div>
      </div>
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
          {property.neighborhood}
        </p>
        
        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4 mt-auto">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">bed</span>
            <span className="font-sans text-sm">{property.bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">bathtub</span>
            <span className="font-sans text-sm">{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">wifi</span>
            <span className="font-sans text-sm">Fibre WiFi</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">
              {property.city === "Calgary" ? "local_parking" : "ev_station"}
            </span>
            <span className="font-sans text-sm">
              {property.city === "Calgary" ? "Heated Parking" : "EV Charger"}
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
