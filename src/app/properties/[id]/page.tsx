import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { getPropertyBySlug, getNeighborhoodFromAddress } from "@/lib/guesty";
import PropertyGallery from "@/components/PropertyGallery";
import BookingAvailabilityControls from "@/components/BookingAvailabilityControls";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyBySlug(id);

  if (!property) {
    notFound();
  }

  const isMonthly = property.pricePeriod === "month";
  const rateLabel = isMonthly ? "/ month" : "/ night";
  const breakDownMultiplier = isMonthly ? "1 month" : "30 nights";
  const calculatedTotal = isMonthly ? property.price : property.price * 30;
  const guestyAmenities = property.amenities || [];
  const maxGuests = Math.max(1, property.guests || 1);

  return (
    <>
      <main className="flex-grow max-w-container-max mx-auto px-margin-page py-8 font-sans">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-on-surface-variant font-sans font-semibold text-label-md uppercase tracking-wider">
          <Link href="/properties" className="hover:text-primary-container transition-colors">
            Properties
          </Link>
          <span className="material-symbols-outlined text-[16px] select-none">chevron_right</span>
          <span className="hover:text-primary-container transition-colors">
            {property.city}
          </span>
          <span className="material-symbols-outlined text-[16px] select-none">chevron_right</span>
          <span className="text-primary font-bold">{property.title}</span>
        </nav>

        {/* Hero Gallery */}
        <PropertyGallery
          images={property.images}
          videoUrl={property.videoUrl}
          videoPoster={property.videoPoster}
          title={property.title}
        />

        {/* Content Details Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Main details */}
          <div className="lg:col-span-8 space-y-12">
            <header>
              <div className="flex gap-2 mb-4">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 font-sans font-semibold text-label-md uppercase tracking-wider rounded-sm">
                  {property.city} · {property.slug.includes("beltline") ? "Beltline" : "Core"}
                </span>
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 font-sans font-semibold text-label-md uppercase tracking-wider rounded-sm">
                  {property.tag}
                </span>
              </div>
              <h1 className="font-serif text-display-lg text-primary mb-4 leading-tight">
                {property.title} — {getNeighborhoodFromAddress(property)}
              </h1>
              <div className="flex items-center gap-2 text-on-surface-variant font-sans text-body-lg">
                <span className="material-symbols-outlined text-primary-container select-none">
                  location_on
                </span>
                <span>
                  {property.address || getNeighborhoodFromAddress(property)}, Alberta · Close to key business zones
                </span>
              </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-low p-6 text-center hairline-border rounded-md">
                <div className="text-headline-md font-serif text-primary font-bold">{property.bedrooms}</div>
                <div className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Bedrooms
                </div>
              </div>
              <div className="bg-surface-container-low p-6 text-center hairline-border rounded-md">
                <div className="text-headline-md font-serif text-primary font-bold">{property.bathrooms}</div>
                <div className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Bathrooms
                </div>
              </div>
              <div className="bg-surface-container-low p-6 text-center hairline-border rounded-md">
                <div className="text-headline-md font-serif text-primary font-bold">{property.sqft || 850}</div>
                <div className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Sq ft
                </div>
              </div>
              <div className="bg-surface-container-low p-6 text-center hairline-border rounded-md">
                <div className="text-headline-md font-serif text-primary font-bold">{property.guests}</div>
                <div className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Guests Max
                </div>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="font-serif text-headline-lg text-primary mb-6">About this property</h2>
              <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed max-w-3xl">
                {property.description}
              </p>
            </section>

            {/* Video Walkthrough Section */}
            {property.videoUrl && (
              <section className="space-y-6">
                <h2 className="font-serif text-headline-lg text-primary">Video Walkthrough</h2>
                <div className="relative aspect-video rounded-md overflow-hidden hairline-border group cursor-pointer shadow-sm">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster={property.videoPoster || property.images[0]}
                  >
                    <source src={property.videoUrl} type="video/mp4" />
                  </video>
                  <div className="absolute bottom-6 left-6 text-white z-10 pointer-events-none drop-shadow-md">
                    <p className="font-sans font-semibold uppercase tracking-widest text-[10px] opacity-90 mb-1">
                      StayAlberta Signature Tours
                    </p>
                    <p className="font-serif text-headline-md">{property.title} Cinema Walkthrough</p>
                  </div>
                </div>
              </section>
            )}

            {/* Amenities Grid */}
            <section>
              <h2 className="font-serif text-headline-lg text-primary mb-6 border-t border-outline-variant/30 pt-8">
                Amenities
              </h2>
              {guestyAmenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  {guestyAmenities.map((amenity, idx) => {
                  let iconName = "check_circle";
                  const lower = amenity.toLowerCase();
                  if (lower.includes("wifi") || lower.includes("internet")) iconName = "wifi";
                  else if (lower.includes("workspace") || lower.includes("desk")) iconName = "laptop_mac";
                  else if (lower.includes("laundry") || lower.includes("washer") || lower.includes("dryer")) iconName = "local_laundry_service";
                  else if (lower.includes("parking") || lower.includes("garage")) iconName = "local_parking";
                  else if (lower.includes("a/c") || lower.includes("ac ") || lower.includes("air cond") || lower.includes("hvac")) iconName = "ac_unit";
                  else if (lower.includes("tv") || lower.includes("netflix") || lower.includes("display")) iconName = "smart_display";
                  else if (lower.includes("kitchen") || lower.includes("cook")) iconName = "skillet";
                  else if (lower.includes("gym") || lower.includes("fitness")) iconName = "fitness_center";
                  else if (lower.includes("charger") || lower.includes("ev ")) iconName = "ev_station";
                  else if (lower.includes("patio") || lower.includes("balcony") || lower.includes("terrace")) iconName = "deck";

                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary-container select-none">
                        {iconName}
                      </span>
                      <span className="font-sans text-body-lg text-on-surface">{amenity}</span>
                    </div>
                  );
                  })}
                </div>
              ) : (
                <p className="font-sans text-body-md text-on-surface-variant">
                  No amenities were provided by Guesty for this property.
                </p>
              )}
            </section>

            {/* Use-Case Tags */}
            <section className="bg-surface-container-low p-8 hairline-border rounded-md">
              <h3 className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-widest mb-6">
                Ideal for
              </h3>
              <div className="flex flex-wrap gap-3">
                {property.idealFor.map((useCase, idx) => (
                  <span
                    key={idx}
                    className="bg-white hairline-border px-4 py-2 font-sans font-semibold text-xs text-primary-container uppercase tracking-wider rounded-sm shadow-sm"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Booking Inquiry Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 bg-white shadow-sm hairline-border p-8 rounded-md">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-serif text-headline-lg text-primary font-bold">
                  ${property.price.toLocaleString()}
                  <span className="font-sans text-sm text-on-surface-variant font-normal">
                    {rateLabel}
                  </span>
                </span>
              </div>
              <div className="text-on-surface-variant font-sans font-semibold text-xs mb-8 uppercase tracking-widest">
                All-inclusive · No platform fees
              </div>

              <BookingAvailabilityControls listingId={property.id} maxGuests={maxGuests} />

              {/* Price Breakdown */}
              <div className="space-y-3 pt-6 mt-8 border-t border-outline-variant/30 font-sans text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>${property.price.toLocaleString()} × {breakDownMultiplier}</span>
                  <span>${calculatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Weekly housekeeping</span>
                  <span className="text-primary-container font-semibold">Included</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Platform fee</span>
                  <span className="text-error font-bold">$0</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Utilities + WiFi</span>
                  <span className="text-primary-container font-semibold">Included</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-primary-container/10 font-serif text-headline-md text-primary font-bold">
                  <span>Total</span>
                  <span>${calculatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Host Info */}
              <div className="mt-8 flex items-center gap-4 pt-6 border-t border-outline-variant/30 font-sans">
                <div className="w-12 h-12 bg-primary-fixed text-primary-container rounded-sm flex items-center justify-center font-bold text-lg hairline-border shadow-sm">
                  JW
                </div>
                <div>
                  <div className="font-sans font-semibold text-xs text-primary-container uppercase tracking-wider">
                    Joel W. · StayAlberta
                  </div>
                  <div className="text-xs text-on-surface-variant italic mt-0.5">
                    Responds within 4 hours
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Policies Section */}
        <section className="mt-16 bg-surface-container-low p-12 hairline-border rounded-md font-sans">
          <h2 className="font-serif text-headline-lg text-primary mb-10">Stay details &amp; Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container select-none">
                  calendar_today
                </span>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-primary-container">
                  Stay Duration
                </h4>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Minimum 14 nights · maximum 60 nights for short-term executive stays.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container select-none">
                  description
                </span>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-primary-container">
                  Billing
                </h4>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Corporate invoicing and PO accepted. No credit card platform fees for businesses.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container select-none">
                  vpn_key
                </span>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-primary-container">
                  Access
                </h4>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Contactless check-in with self-managed smart access. 24/7 building security.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container select-none">
                  cleaning_services
                </span>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-primary-container">
                  Maintenance
                </h4>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Weekly housekeeping included. 24-hour maintenance dispatch available.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error select-none">smoke_free</span>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-error">
                  Strict Prohibitions
                </h4>
              </div>
              <p className="text-on-surface-variant font-semibold text-sm leading-relaxed">
                No smoking · No pets · No social gatherings or events.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
