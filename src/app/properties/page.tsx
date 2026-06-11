"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { mockProperties, Property } from "@/lib/sanity";
import PropertyCard from "@/components/PropertyCard";
import Map from "@/components/Map";
import Footer from "@/components/Footer";

function BrowsePropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial states from URL params or defaults
  const [cityFilter, setCityFilter] = useState("All");
  const [bedsFilter, setBedsFilter] = useState("Any");
  const [priceFilter, setPriceFilter] = useState("All");
  const [checkinDate, setCheckinDate] = useState("");

  // Read URL query parameters on load
  useEffect(() => {
    const city = searchParams.get("city");
    const checkin = searchParams.get("checkin");
    
    if (city) {
      // Normalize city matching
      const foundCity = ["calgary", "edmonton", "red deer", "penhold", "sylvan lake"].find(
        (c) => c === city.toLowerCase()
      );
      if (foundCity) {
        // Capitalize for matching state
        setCityFilter(city.charAt(0).toUpperCase() + city.slice(1).toLowerCase());
      }
    }
    
    if (checkin) {
      setCheckinDate(checkin);
    }
  }, [searchParams]);

  // Filter listings
  const filteredProperties = mockProperties.filter((property) => {
    // City filter
    if (cityFilter !== "All" && property.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }

    // Bedrooms filter
    if (bedsFilter !== "Any") {
      const minBeds = parseInt(bedsFilter.replace("+", ""), 10);
      if (property.bedrooms < minBeds) return false;
    }

    // Price filter
    if (priceFilter !== "All") {
      if (priceFilter === "Under $150/nt") {
        if (property.pricePeriod !== "night" || property.price >= 150) return false;
      } else if (priceFilter === "$150 - $300/nt") {
        if (property.pricePeriod !== "night" || property.price < 150 || property.price > 300) return false;
      } else if (priceFilter === "$3,000+/mo") {
        if (property.pricePeriod !== "month" || property.price < 3000) return false;
      }
    }

    return true;
  });

  const handleCitySelectFromMap = (city: string) => {
    // If clicking same active city, toggle off back to "All"
    if (cityFilter.toLowerCase() === city.toLowerCase()) {
      setCityFilter("All");
    } else {
      setCityFilter(city);
    }
  };

  return (
    <main className="flex-grow flex overflow-hidden h-[calc(100vh-80px)]">
      {/* Left Column: Properties list & Filters */}
      <section className="w-full lg:w-[60%] flex flex-col h-full border-r border-outline-variant bg-surface-container-lowest">
        {/* Filter Bar */}
        <div className="p-6 bg-surface border-b border-outline-variant shadow-sm sticky top-0 z-20 font-sans">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                City
              </label>
              <select
                className="w-full bg-surface-container-low border-0 border-b border-outline text-on-surface p-2 focus:ring-0 focus:border-primary text-sm rounded-sm"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="All">All Cities</option>
                <option value="Calgary">Calgary</option>
                <option value="Edmonton">Edmonton</option>
                <option value="Red Deer">Red Deer</option>
                <option value="Penhold">Penhold</option>
                <option value="Sylvan Lake">Sylvan Lake</option>
              </select>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Bedrooms
              </label>
              <select
                className="w-full bg-surface-container-low border-0 border-b border-outline text-on-surface p-2 focus:ring-0 focus:border-primary text-sm rounded-sm"
                value={bedsFilter}
                onChange={(e) => setBedsFilter(e.target.value)}
              >
                <option value="Any">Any</option>
                <option value="1+">1+ Bed</option>
                <option value="2+">2+ Beds</option>
                <option value="3+">3+ Beds</option>
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Check-in
              </label>
              <input
                type="text"
                placeholder="Check-in Date"
                className="w-full bg-surface-container-low border-0 border-b border-outline text-on-surface p-2 focus:ring-0 focus:border-primary text-sm rounded-sm"
                value={checkinDate}
                onChange={(e) => setCheckinDate(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-2">
                Price Range
              </label>
              <select
                className="w-full bg-surface-container-low border-0 border-b border-outline text-on-surface p-2 focus:ring-0 focus:border-primary text-sm rounded-sm"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="All">All Prices</option>
                <option value="Under $150/nt">Under $150/nt</option>
                <option value="$150 - $300/nt">$150 - $300/nt</option>
                <option value="$3,000+/mo">$3,000+/mo</option>
              </select>
            </div>

            <button
              onClick={() => {
                setCityFilter("All");
                setBedsFilter("Any");
                setPriceFilter("All");
                setCheckinDate("");
              }}
              className="bg-primary-container text-white px-3 py-2 rounded hover:opacity-90 transition-opacity cursor-pointer font-sans text-xs uppercase tracking-wider font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Scrollable Property List */}
        <div className="flex-grow overflow-y-auto p-6 scroll-smooth">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-md p-12 max-w-md mx-auto my-12 opacity-50 font-sans">
              <span className="material-symbols-outlined text-6xl mb-4 text-primary-container select-none">
                apartment
              </span>
              <p className="font-serif text-headline-md text-center text-primary mb-2">
                No matching properties
              </p>
              <p className="text-sm text-on-surface-variant text-center">
                Try adjusting your city or bed filters, or look out for new properties coming soon.
              </p>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <Footer minimal />
      </section>

      {/* Right Column: Simulated Alberta Map */}
      <section className="hidden lg:block lg:w-[40%] relative bg-surface-container-high h-full">
        <Map selectedCity={cityFilter} onSelectCity={handleCitySelectFromMap} />
      </section>
    </main>
  );
}

export default function BrowseProperties() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center font-sans">
          <div className="animate-pulse text-primary font-semibold">Loading properties catalog...</div>
        </div>
      }
    >
      <BrowsePropertiesContent />
    </Suspense>
  );
}
