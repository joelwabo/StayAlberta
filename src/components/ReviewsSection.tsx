"use client";

import { useMemo, useState } from "react";
import ReviewCard from "@/components/ReviewCard";

type Review = {
  name: string;
  date: string;
  rating: number;
  body: string;
};

type ReviewsSectionProps = {
  initialReviews: Review[];
};

function getTodayLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export default function ReviewsSection({ initialReviews }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const roundedStars = Math.round(averageRating);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !body.trim()) return;

    const newReview: Review = {
      name: name.trim(),
      date: getTodayLabel(),
      rating,
      body: body.trim(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setName("");
    setRating(5);
    setBody("");
    setIsFormOpen(false);
  };

  return (
    <section className="bg-surface-container-low pt-0 pb-section-gap">
      <div className="max-w-container-max mx-auto px-margin-page pt-24 border-t border-outline-variant/30">
        <div className="mb-8">
          <div className="text-center mb-6">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-container mb-2">
              Testimonials
            </p>
            <h2 className="font-serif text-headline-lg text-primary mb-3">
              Guest Experiences That Speak for Themselves.
            </h2>
            <p className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              See why travellers choose our corporate housing when visiting Alberta.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="bg-primary-container text-white px-6 py-3 rounded-sm font-sans font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
            >
              Add a Review
            </button>
          </div>
        </div>

        <div className="mb-10 rounded-md border border-outline-variant bg-surface-container-lowest px-6 py-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-container text-white flex items-center justify-center font-serif text-title-lg">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-on-surface-variant">Overall Rating</p>
              <div className="flex items-center gap-1 text-tertiary mt-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isFilled = i < roundedStars;
                  return (
                    <span
                      key={i}
                      className="material-symbols-outlined select-none text-[20px]"
                      style={{ fontVariationSettings: isFilled ? '"FILL" 1' : '"FILL" 0' }}
                    >
                      star
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="font-sans text-sm text-on-surface-variant">
            Based on <span className="font-semibold text-primary">{reviews.length}</span> verified reviews
          </p>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close review form"
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/35"
            />
            <form
              onSubmit={handleSubmitReview}
              className="relative z-10 w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-md p-6 md:p-8 shadow-xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-headline-sm text-primary">Share Your Experience</h3>
                  <p className="font-sans text-sm text-on-surface-variant mt-1">
                    Your feedback helps future guests choose the right stay.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="h-9 w-9 rounded-sm border border-outline-variant text-on-surface-variant hover:bg-surface transition-colors"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-surface border border-outline-variant p-3 rounded-sm font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                    Rating
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const isFilled = value <= rating;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className="h-9 w-9 rounded-sm border border-outline-variant bg-surface hover:border-primary-container hover:bg-surface-container-low transition-colors"
                          aria-label={`Set rating to ${value} star${value > 1 ? "s" : ""}`}
                        >
                          <span
                            className="material-symbols-outlined text-[18px] leading-none"
                            style={{
                              fontVariationSettings: isFilled ? '"FILL" 1' : '"FILL" 0',
                              color: isFilled ? "#cc8b18" : "#7a7e85",
                            }}
                          >
                            star
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                  Your Review
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your experience..."
                  rows={5}
                  className="w-full bg-surface border border-outline-variant p-3 rounded-sm font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
                  required
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="border border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-sm font-sans font-semibold text-xs uppercase tracking-wider hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-white px-6 py-2.5 rounded-sm font-sans font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
          {reviews.map((review, index) => (
            <ReviewCard
              key={`${review.name}-${review.date}-${index}`}
              name={review.name}
              date={review.date}
              rating={review.rating}
              body={review.body}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
