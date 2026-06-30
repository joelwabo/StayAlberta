"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProperties, Property, mockProperties } from "@/lib/sanity";

interface FooterProps {
  minimal?: boolean;
}

export default function Footer({ minimal = false }: FooterProps) {
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  useEffect(() => {
    if (minimal) return;
    let isMounted = true;
    getProperties().then((data) => {
      if (isMounted) {
        setProperties(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [minimal]);

  if (minimal) {
    return (
      <footer className="bg-surface-container-highest border-t border-outline-variant py-6 px-margin-desktop text-caption flex flex-col items-center justify-center gap-3 text-on-surface-variant font-sans text-xs text-center">
        <div>© 2024 StayAlberta. Corporate Housing Excellence.</div>
        <div className="flex gap-4">
          <Link href="#" className="hover:underline">
            Privacy
          </Link>
          <Link href="#" className="hover:underline">
            Terms
          </Link>
        </div>
      </footer>
    );
  }

  // Calculate counts dynamically based on active listings
  const activeProperties = properties.filter((p) => p.isActive !== false);
  const calgaryCount = activeProperties.filter((p) => p.city?.toLowerCase() === "calgary").length;
  const edmontonCount = activeProperties.filter((p) => p.city?.toLowerCase() === "edmonton").length;
  const redDeerCount = activeProperties.filter((p) => p.city?.toLowerCase() === "red deer").length;
  const penholdCount = activeProperties.filter((p) => p.city?.toLowerCase() === "penhold").length;
  const sylvanLakeCount = activeProperties.filter((p) => p.city?.toLowerCase() === "sylvan lake").length;

  return (
    <footer className="bg-surface-container-lowest border-t-[0.5px] border-outline-variant font-sans mt-auto text-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-gutter px-margin-page py-section-gap max-w-container-max mx-auto justify-items-center">
        <div className="space-y-4 flex flex-col items-center max-w-sm text-center">
          <div className="font-serif text-headline-md text-primary">
            StayAlberta{" "}
            <span className="text-body-md font-sans font-normal block opacity-70">
              by HrodricEstate
            </span>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Professional housing for institutional reliability in Alberta.
          </p>
        </div>
        <div className="flex flex-col items-center text-center gap-4">
          <h4 className="font-sans font-label-md uppercase tracking-widest text-primary font-semibold">
            Portfolio
          </h4>
          <nav className="flex flex-col items-center gap-2 text-on-surface-variant text-body-md">
            <span>Calgary ({calgaryCount})</span>
            <span>Edmonton ({edmontonCount})</span>
            <span>Red Deer ({redDeerCount})</span>
            <span>Penhold ({penholdCount})</span>
            <span>Sylvan Lake ({sylvanLakeCount})</span>
          </nav>
        </div>
        <div className="flex flex-col items-center text-center gap-4">
          <h4 className="font-sans font-label-md uppercase tracking-widest text-primary font-semibold">
            Legal
          </h4>
          <nav className="flex flex-col items-center gap-2">
            <Link href="#" className="text-body-md text-on-surface-variant hover:text-primary-container underline transition-all">
              Privacy Policy
            </Link>
            <Link href="#" className="text-body-md text-on-surface-variant hover:text-primary-container underline transition-all">
              Terms of Service
            </Link>
            <Link href="#" className="text-body-md text-on-surface-variant hover:text-primary-container underline transition-all">
              Compliance
            </Link>
          </nav>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-page py-8 border-t-[0.5px] border-outline-variant flex flex-col items-center justify-center gap-4">
        <p className="text-body-md text-on-surface-variant text-center">
          © 2024 StayAlberta by HrodricEstate. All rights reserved. Professional housing for institutional reliability.
        </p>
        <div className="flex gap-4 justify-center">
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary-container">
            language
          </span>
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary-container">
            shield
          </span>
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary-container">
            verified
          </span>
        </div>
      </div>
    </footer>
  );
}
