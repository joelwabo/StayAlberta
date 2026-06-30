"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockProperties } from "@/lib/sanity";
import Footer from "@/components/Footer";

function InquiryFormContent() {
  const searchParams = useSearchParams();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("calgary");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("2-4weeks");
  const [guests, setGuests] = useState(1);
  const [requirements, setRequirements] = useState("");

  // Status states
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Check URL params for pre-fill data
  useEffect(() => {
    const propertyId = searchParams.get("property");
    if (propertyId) {
      const property = mockProperties.find((p) => p.id === propertyId);
      if (property) {
        setCity(property.city.toLowerCase());
        setRequirements(`Interested in: ${property.title} (${property.neighborhood})`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/inquiry/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          city,
          startDate,
          duration,
          guests,
          requirements,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("success");
        // Reset form fields
        setName("");
        setEmail("");
        setCompany("");
        setStartDate("");
        setRequirements("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "An error occurred. Please try again.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "A network error occurred. Please check your connection.");
    }
  };

  return (
    <main className="flex-grow font-sans bg-surface">
      {/* Hero Section */}
      <section className="bg-surface-container-low py-16 md:py-24 border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed font-sans font-semibold text-label-md rounded-sm mb-6">
              For Corporate Clients
            </span>
            <h1 className="font-serif text-display-lg text-primary mb-6 leading-tight">
              Request a Corporate Stay
            </h1>
            <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed">
              Secure high-end residential accommodations for your professional team. Our corporate housing specialists provide seamless booking, consolidated billing, and vetted properties across Alberta's key business hubs.
            </p>
          </div>
        </div>
      </section>

      {/* Form & Sidebar Layout */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-8 md:p-12 rounded-sm shadow-sm border border-outline-variant">
            {status === "success" ? (
              <div className="text-center py-12 space-y-6">
                <span className="material-symbols-outlined text-primary text-6xl animate-bounce">
                  check_circle
                </span>
                <h2 className="font-serif text-headline-lg text-primary">Inquiry Submitted Successfully</h2>
                <p className="font-sans text-body-lg text-on-surface-variant max-w-md mx-auto">
                  Thank you for your request. A StayAlberta corporate housing specialist will review your requirements and respond within 4 business hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-sm font-sans font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                {status === "error" && (
                  <div className="p-4 bg-error-container text-on-error-container text-sm font-sans rounded-sm border border-error/20 flex gap-2 items-center">
                    <span className="material-symbols-outlined">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section: Contact Details */}
                <div>
                  <h2 className="font-serif text-headline-md text-primary mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">badge</span>
                    Contact Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Full Name
                      </label>
                      <input
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        placeholder="e.g. Sarah Jenkins"
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Work Email
                      </label>
                      <input
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        placeholder="sarah@company.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Company Name
                      </label>
                      <input
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        placeholder="Organization Name"
                        required
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Stay Requirements */}
                <div className="pt-8 border-t border-outline-variant">
                  <h2 className="font-serif text-headline-md text-primary mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    Stay Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Target City
                      </label>
                      <select
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="calgary">Calgary</option>
                        <option value="edmonton">Edmonton</option>
                        <option value="red_deer">Red Deer</option>
                        <option value="penhold">Penhold</option>
                        <option value="sylvan_lake">Sylvan Lake</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Estimated Start Date
                      </label>
                      <input
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Estimated Duration
                      </label>
                      <select
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      >
                        <option value="2-4weeks">2 to 4 weeks</option>
                        <option value="1-2months">1 to 2 months</option>
                        <option value="2months+">2 months +</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Number of Guests/Units
                      </label>
                      <input
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm rounded-sm"
                        min="1"
                        placeholder="1"
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase">
                        Additional Requirements
                      </label>
                      <textarea
                        className="w-full bg-[#F0F2F0] border-b border-outline p-3 focus:outline-none focus:border-primary transition-colors font-sans text-sm resize-none rounded-sm"
                        placeholder="Mention specific needs like accessibility, parking, or proximity to job sites..."
                        rows={4}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Trust Signal & Submit */}
                <div className="pt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary-container select-none">
                        schedule
                      </span>
                      <span className="font-sans font-semibold text-xs uppercase tracking-wider text-on-surface-variant">
                        Response within 4 business hours
                      </span>
                    </div>
                    <button
                      className="bg-primary text-on-primary px-12 py-4 rounded-sm font-sans font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-98 transition-all shadow-lg flex items-center justify-center cursor-pointer"
                      type="submit"
                      disabled={status === "submitting"}
                    >
                      {status === "submitting" ? (
                        <>
                          <span className="material-symbols-outlined animate-spin mr-2 select-none">
                            progress_activity
                          </span>
                          Processing...
                        </>
                      ) : (
                        "Submit Inquiry"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-gutter font-sans">
            {/* Why Book Direct */}
            <div className="bg-primary-container p-8 rounded-sm text-white">
              <h3 className="font-serif text-headline-md text-white mb-8">
                Why Book Direct with StayAlberta
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary-fixed select-none">
                    payments
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-sm text-primary-fixed mb-1">
                      No platform fees (0%)
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Avoid the 15-20% service fees typical of major booking platforms.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary-fixed select-none">
                    verified
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-sm text-primary-fixed mb-1">
                      Professional, vetted units
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Every property meets institutional standards for cleanliness and connectivity.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary-fixed select-none">
                    receipt_long
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-sm text-primary-fixed mb-1">
                      Corporate Billing &amp; POs
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Simplified procurement with direct invoicing and multiple payment options.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-primary-fixed select-none">
                    support_agent
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-sm text-primary-fixed mb-1">
                      Dedicated Local Support
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      A local representative assigned to your account for 24/7 assistance.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual Callout Card */}
            <div className="relative h-64 rounded-sm overflow-hidden group border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Professional corporate environment"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6UOhAqnn73UKH1zJ5Mi3uXY96UgKy7NEL3NhX2gC3jN2zAdWr2WMYsYnAfXbqAFJV9iRx5tRvCaDwMU99qW4-HCDCZ1JEBSuiHokYXEUwi324FRPGggXMbLcLkS_I3q5BdHYUc0p8X6vKw9s1-mpdzSNL1bl4N36OfN_3v3WPofk3-omcEQnMYP0xYkPpCOApWUORBATI4ccRx0_xICpdCUy4pMlmdfglx3zD6s3ZS_3FOcKdSSU3qK8EtXT6-4xJwwx5ZUFcAg"
              />
              <div className="absolute inset-0 bg-primary/40 flex items-end p-6">
                <p className="text-white font-serif italic text-sm leading-relaxed drop-shadow-md">
                  "The gold standard for workforce housing in Western Canada."
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Newsletter / Contact desk banner */}
      <section className="bg-surface-container-high py-12 font-sans border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-desktop text-center">
          <h3 className="font-serif text-headline-md text-primary mb-4">Prefer to talk?</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Call our corporate desk at +1 (403) 971-9188 for immediate assistance.
          </p>
          <div className="flex justify-center gap-4">
            <button className="border border-primary-container text-primary-container px-6 py-2 rounded-sm font-sans font-semibold text-xs uppercase hover:bg-primary-container hover:text-white transition-all cursor-pointer">
              Download Brochure
            </button>
            <button className="border border-primary-container text-primary-container px-6 py-2 rounded-sm font-sans font-semibold text-xs uppercase hover:bg-primary-container hover:text-white transition-all cursor-pointer">
              Browse Properties
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function InquiryFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center font-sans">
          <div className="animate-pulse text-primary font-semibold">Loading inquiry desk...</div>
        </div>
      }
    >
      <InquiryFormContent />
    </Suspense>
  );
}
