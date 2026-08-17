import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { getProperties } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export default async function Home() {
  const properties = await getProperties();
  const featuredProperties = properties.slice(0, 3); // Display top 3 listings

  const reviews = [
    {
      name: "Cheraina Yvounne",
      date: "May 31",
      rating: 5,
      body: "Amazing accommodations and amazing host. The place was clean and big. Exactly as described and even better.",
    },
    {
      name: "Kathleen",
      date: "May 30",
      rating: 5,
      body: "Great location and condo. Really enjoyed walking around the neighborhood and checking out the restaurants.",
    },
    {
      name: "Shawna",
      date: "May 30",
      rating: 5,
      body: "This location provided more amenities than we really needed, but it was wonderful to have a clean and inviting place.",
    },
    {
      name: "Aaron & Julia",
      date: "May 29",
      rating: 5,
      body: "We had a fabulous stay here! Bed was very comfortable. It had everything you need to cook a meal, location was great.",
    },
  ];

  return (
    <>
      <main className="flex-grow">
        {/* Hero Section: Split Layout with Image */}
        <section className="relative overflow-hidden min-h-[600px] flex items-center bg-surface-container-low">
          {/* Image Background Layer */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Calgary skyline"
              className="w-full h-full object-cover"
              src="/images/calgary_skyline.jpg"
            />
            {/* Fade Overlay for Content Legibility */}
            <div className="absolute inset-0 video-overlay" />
          </div>
          <div className="max-w-container-max mx-auto px-margin-page py-section-gap relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gutter items-center">
              <div className="space-y-6">
                <p className="font-sans font-semibold text-xs uppercase text-on-primary-container bg-primary-fixed px-3 py-1.5 inline-block tracking-wider rounded-sm">
                  Premier Institutional Lodging
                </p>
                <h1 className="font-serif text-display-lg text-primary max-w-lg leading-tight">
                  Reliable Housing for Albertan Professionals.
                </h1>
                <p className="font-sans text-body-lg text-on-surface-variant max-w-md">
                  Premium short-term accommodations across Alberta for professionals and teams on extended assignments. Direct booking, predictable pricing, no Airbnb markup.
                </p>
                
                {/* GET Search Bar */}
                <SearchBar />

                {/* Trust Factors */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-primary select-none"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      check_circle
                    </span>
                    <span className="font-sans font-semibold text-xs uppercase tracking-wider text-primary">
                      Move-in Ready
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-primary select-none"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      payments
                    </span>
                    <span className="font-sans font-semibold text-xs uppercase tracking-wider text-primary">
                      Direct Billing
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-primary select-none"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      wifi
                    </span>
                    <span className="font-sans font-semibold text-xs uppercase tracking-wider text-primary">
                      Fibre WiFi
                    </span>
                  </div>
                </div>
              </div>
              {/* Spacer on right for larger screens */}
              <div className="hidden lg:block" />
            </div>
          </div>
        </section>

        {/* Stats / Trust Banner */}
        <section className="bg-surface-container-low py-12 border-y-[0.5px] border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-page">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-center items-center">
              <div className="md:col-span-1 border-r border-outline-variant hidden md:block">
                <p className="font-serif text-headline-md text-primary font-bold">{properties.length}</p>
                <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Properties
                </p>
              </div>
              <div>
                <p className="font-serif text-headline-md text-primary font-bold">2-Week</p>
                <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Minimum Stay
                </p>
              </div>
              <div>
                <p className="font-serif text-headline-md text-primary font-bold">0%</p>
                <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Platform Fees
                </p>
              </div>
              <div>
                <p className="font-serif text-headline-md text-primary font-bold">24/7</p>
                <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Local Support
                </p>
              </div>
              <div>
                <p className="font-serif text-headline-md text-primary font-bold">Verified</p>
                <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  + Insured
                </p>
              </div>
              <div>
                <p className="font-serif text-headline-md text-primary font-bold">Direct</p>
                <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Institutional Billing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Property Grid */}
        <section className="max-w-container-max mx-auto px-margin-page py-section-gap">
          <div className="flex justify-between items-end mb-12 gap-4">
            <div>
              <p className="font-sans font-semibold text-xs uppercase text-on-primary-container bg-primary-fixed px-3 py-1 inline-block mb-3 tracking-wider rounded-sm">
                Featured Listings
              </p>
              <h2 className="font-serif text-headline-lg text-primary">
                Available Suites at StayAlberta
              </h2>
            </div>
            <Link
              href="/properties"
              className="font-sans font-semibold text-xs uppercase tracking-wider text-primary-container flex items-center gap-2 hover:underline shrink-0"
            >
              View All {properties.length} Properties{" "}
              <span className="material-symbols-outlined text-[16px] select-none">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid-gutter">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {/* Solutions Section */}
        <section id="why-us" className="scroll-mt-24 bg-surface-container-low py-section-gap border-t-[0.5px] border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-page">
            <div className="mb-16 text-center">
              <p className="font-sans font-semibold text-xs uppercase text-primary-container tracking-widest mb-4">
                WHY US
              </p>
              <h2 className="font-serif text-headline-lg text-primary mb-6">
                Better than Airbnb for extended stays
              </h2>
              <p className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Designed for professionals staying 2 weeks to 2 months — not tourists passing through.
              </p>
            </div>
            
            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
              {/* Airbnb Column */}
              <div className="bg-surface-container-lowest rounded-md p-12 shadow-sm border border-outline-variant/30">
                <h3 className="font-serif text-headline-md text-primary mb-10">
                  Booking platforms (Airbnb, VRBO)
                </h3>
                <ul className="space-y-8">
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-error text-[20px] select-none">
                      close
                    </span>
                    <span className="font-sans text-body-md text-on-surface-variant">
                      14–18% platform service fees
                    </span>
                  </li>
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-error text-[20px] select-none">
                      close
                    </span>
                    <span className="font-sans text-body-md text-on-surface-variant">
                      No corporate invoicing
                    </span>
                  </li>
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-error text-[20px] select-none">
                      close
                    </span>
                    <span className="font-sans text-body-md text-on-surface-variant">
                      Inconsistent quality, random hosts
                    </span>
                  </li>
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-error text-[20px] select-none">
                      close
                    </span>
                    <span className="font-sans text-body-md text-on-surface-variant">
                      Designed for 1–4 night stays
                    </span>
                  </li>
                </ul>
              </div>

              {/* StayAlberta Column */}
              <div className="bg-primary-container rounded-md p-12 shadow-sm relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[120px] select-none">
                    verified
                  </span>
                </div>
                <h3 className="font-serif text-headline-md text-white mb-10 relative z-10">
                  StayAlberta — direct booking
                </h3>
                <ul className="space-y-8 relative z-10">
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-primary-fixed text-[20px] select-none">
                      check_circle
                    </span>
                    <span className="font-sans text-body-md text-white/90">
                      No platform fees, transparent pricing
                    </span>
                  </li>
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-primary-fixed text-[20px] select-none">
                      check_circle
                    </span>
                    <span className="font-sans text-body-md text-white/90">
                      Corporate invoices & PO accepted
                    </span>
                  </li>
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-primary-fixed text-[20px] select-none">
                      check_circle
                    </span>
                    <span className="font-sans text-body-md text-white/90">
                      Consistent, vetted properties
                    </span>
                  </li>
                  <li className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-primary-fixed text-[20px] select-none">
                      check_circle
                    </span>
                    <span className="font-sans text-body-md text-white/90">
                      Minimum 2 weeks, up to 2 months
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-outline-variant/30" />

            {/* Process Steps */}
            <div id="how-it-works" className="scroll-mt-24 pt-24">
              <div className="mb-16 text-center">
                <p className="font-sans font-semibold text-xs uppercase text-primary-container tracking-widest mb-4">
                  PROCESS
                </p>
                <h2 className="font-serif text-headline-lg text-primary mb-4">
                  How it works
                </h2>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Three steps from inquiry to move-in.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Step 1 */}
                <div className="relative group">
                  <div className="absolute -top-10 left-0 font-serif text-[80px] text-primary-container/5 font-bold select-none">
                    01
                  </div>
                  <div className="pt-8">
                    <h4 className="font-serif text-headline-md text-primary mb-4">
                      Tell us your needs
                    </h4>
                    <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                      Submit a short form with your city, dates, headcount, and any special requirements. We respond within 4 hours.
                    </p>
                    <div className="mt-6 h-1 w-12 bg-primary-container/20 group-hover:w-full transition-all duration-500" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative group">
                  <div className="absolute -top-10 left-0 font-serif text-[80px] text-primary-container/5 font-bold select-none">
                    02
                  </div>
                  <div className="pt-8">
                    <h4 className="font-serif text-headline-md text-primary mb-4">
                      We propose a unit
                    </h4>
                    <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                      We match you to an available, fully furnished property and send photos, floor plan, and a clear all-in quote.
                    </p>
                    <div className="mt-6 h-1 w-12 bg-primary-container/20 group-hover:w-full transition-all duration-500" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative group">
                  <div className="absolute -top-10 left-0 font-serif text-[80px] text-primary-container/5 font-bold select-none">
                    03
                  </div>
                  <div className="pt-8">
                    <h4 className="font-serif text-headline-md text-primary mb-4">
                      Keys, no surprises
                    </h4>
                    <p className="font-sans text-body-md text-on-surface-variant leading-relaxed">
                      Contactless check-in, stocked essentials, WiFi ready. Direct billing to your company's accounts payable.
                    </p>
                    <div className="mt-6 h-1 w-12 bg-primary-container/20 group-hover:w-full transition-all duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection initialReviews={reviews} />

        {/* CTA Banner Section */}
        <section className="max-w-container-max mx-auto px-margin-page py-section-gap">
          <div className="bg-surface hairline-border p-12 text-center relative overflow-hidden rounded-md shadow-sm">
            <div className="relative z-10">
              <h2 className="font-serif text-headline-lg text-primary mb-4">
                Ready to simplify your corporate lodging?
              </h2>
              <p className="font-sans text-body-lg text-on-surface-variant mb-8 max-w-2xl mx-auto">
                Get a custom quote for your team's relocation or seasonal housing. No commitment to inquire. Response within 4 business hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/inquiry"
                  className="bg-primary-container text-white px-10 py-4 font-sans font-semibold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm text-center"
                >
                  Inquire Now
                </Link>
                <button
                  type="submit"
                  form="featured-brochure-form"
                  className="border-[0.5px] border-primary-container text-primary-container px-10 py-4 font-sans font-semibold text-sm uppercase tracking-widest hover:bg-primary-container hover:text-white transition-all rounded-sm cursor-pointer"
                >
                  Download Brochure
                </button>
              </div>
              <form
                id="featured-brochure-form"
                action="/api/brochure"
                method="get"
                className="hidden"
              >
                <input type="hidden" name="scope" value="featured" />
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
