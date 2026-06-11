"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-surface docked full-width top-0 z-50 border-b-[0.5px] border-outline-variant sticky">
      <div className="flex justify-between items-center px-margin-page h-20 w-full max-w-container-max mx-auto">
        <Link href="/" className="font-serif text-headline-md font-bold text-primary flex items-center gap-2">
          StayAlberta{" "}
          <span className="text-on-surface-variant font-sans font-normal text-body-md opacity-70">
            by HrodricEstate
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/properties"
            className={`font-sans font-label-md text-label-md uppercase tracking-wider transition-colors duration-200 ${
              pathname === "/properties"
                ? "text-primary font-bold border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary-container"
            }`}
          >
            Properties
          </Link>
          <Link
            href="/#why-us"
            className="font-sans font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-primary-container transition-colors duration-200"
          >
            Why Us
          </Link>
          <Link
            href="/#how-it-works"
            className="font-sans font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-primary-container transition-colors duration-200"
          >
            How it Works
          </Link>
          <Link
            href="/inquiry"
            className={`font-sans font-label-md text-label-md uppercase tracking-wider transition-colors duration-200 ${
              pathname === "/inquiry"
                ? "text-primary font-bold border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-primary-container"
            }`}
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/inquiry"
            className="bg-primary-container text-white px-6 py-2.5 rounded-none font-sans font-label-md text-label-md uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-95 text-center"
          >
            Request a stay
          </Link>
        </div>
      </div>
    </header>
  );
}
