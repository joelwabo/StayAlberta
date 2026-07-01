"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PropertyGalleryProps {
  images: string[];
  videoUrl?: string;
  videoPoster?: string;
  title: string;
}

type SlideItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string; poster?: string };

export default function PropertyGallery({
  images,
  videoUrl,
  videoPoster,
  title,
}: PropertyGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine images and video into a single slide array
  // We place the images first, and the video as the last slide (or vice versa).
  // Placing the video at the end is standard, let's do that.
  const slides: SlideItem[] = [
    ...images.map((img) => ({ type: "image" as const, url: img })),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl, poster: videoPoster }] : []),
  ];

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
  };

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Key event listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev]);

  // Touch Swipe Gesture support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartX.current = null;
  };

  const moreCount = images.length > 2 ? images.length - 2 : 0;

  return (
    <>
      {/* Hero Gallery Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[300px] md:h-[500px] mb-12 overflow-hidden">
        {/* Main large image */}
        <div
          onClick={() => handleOpen(0)}
          className="md:col-span-3 md:row-span-2 relative group cursor-pointer overflow-hidden rounded-md hairline-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${title} main view`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            src={images[0]}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
        </div>

        {/* Small image 1 */}
        <div
          onClick={() => handleOpen(1)}
          className="hidden md:block relative group cursor-pointer overflow-hidden bg-surface-container rounded-md hairline-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${title} detail view 1`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={images[1] || images[0]}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
        </div>

        {/* Small image 2 / More photos button */}
        <div
          onClick={() => handleOpen(2)}
          className="hidden md:block relative group cursor-pointer overflow-hidden bg-surface-container rounded-md hairline-border"
        >
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center z-10 group-hover:bg-black/40 transition-colors duration-300">
            <span className="text-white font-sans font-bold text-lg flex items-center gap-1">
              <span className="material-symbols-outlined text-[20px]">add</span>
              {moreCount} More Photos
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${title} detail view 2`}
            className="w-full h-full object-cover"
            src={images[2] || images[0]}
          />
        </div>
      </section>

      {/* Fullscreen Slideshow Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Controls */}
          <div className="flex justify-between items-center w-full text-white z-20">
            <div className="font-sans text-sm md:text-md font-medium tracking-wide">
              {title} &middot; Slide {currentIndex + 1} of {slides.length}
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:scale-105 active:scale-95"
              aria-label="Close slideshow"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Main Slides Area */}
          <div className="flex-grow flex items-center justify-center relative my-4 w-full h-[60vh] max-h-[70vh] md:h-[70vh]">
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-0 md:left-4 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/70 text-white transition-all duration-200 border border-white/5 hover:scale-105 active:scale-95"
              aria-label="Previous slide"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>

            {/* Slide Content wrapper */}
            <div className="w-full h-full max-w-5xl flex items-center justify-center p-2 md:p-6 select-none">
              {slides[currentIndex].type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(slides[currentIndex] as { url: string }).url}
                  alt={`${title} slide ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-md shadow-2xl transition-all duration-500 transform animate-scale-up"
                />
              ) : (
                <div className="w-full h-full max-w-4xl max-h-[85%] aspect-video flex items-center justify-center rounded-md overflow-hidden bg-black shadow-2xl animate-scale-up border border-white/10">
                  <video
                    controls
                    autoPlay
                    src={(slides[currentIndex] as { url: string }).url}
                    poster={(slides[currentIndex] as { poster?: string }).poster}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-0 md:right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/70 text-white transition-all duration-200 border border-white/5 hover:scale-105 active:scale-95"
              aria-label="Next slide"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          </div>

          {/* Footer Navigation / Thumbnails */}
          <div className="w-full max-w-4xl mx-auto z-20 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="flex gap-2 justify-center py-2 min-w-max mx-auto px-4">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-16 h-12 md:w-20 md:h-14 rounded-sm overflow-hidden border transition-all duration-200 focus:outline-none shrink-0 ${
                    idx === currentIndex
                      ? "border-primary-fixed scale-105 shadow-md shadow-primary-fixed/20 ring-1 ring-primary-fixed"
                      : "border-white/15 opacity-60 hover:opacity-100 hover:scale-103"
                  }`}
                >
                  {slide.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full relative bg-surface-container flex items-center justify-center">
                      {slide.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slide.poster}
                          alt={`Video Thumbnail`}
                          className="w-full h-full object-cover opacity-50"
                        />
                      ) : null}
                      <span className="material-symbols-outlined text-white absolute text-[24px] drop-shadow-md">
                        play_circle
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
