import Link from "next/link";

interface FooterProps {
  minimal?: boolean;
}

export default function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer className="bg-surface-container-highest border-t border-outline-variant py-2 px-margin-desktop text-caption flex justify-between items-center text-on-surface-variant font-sans text-xs">
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

  return (
    <footer className="bg-surface-container-lowest border-t-[0.5px] border-outline-variant font-sans mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-grid-gutter px-margin-page py-section-gap max-w-container-max mx-auto">
        <div className="space-y-4">
          <div className="font-serif text-headline-md text-primary">
            StayAlberta{" "}
            <span className="text-body-md font-sans font-normal block opacity-70">
              by HrodricEstate
            </span>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant pr-4">
            Professional housing for institutional reliability in Alberta.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-label-md uppercase tracking-widest text-primary font-semibold">
            Company
          </h4>
          <nav className="flex flex-col gap-2">
            <Link href="#" className="text-body-md text-on-surface-variant hover:text-primary-container underline transition-all">
              About Us
            </Link>
            <Link href="#" className="text-body-md text-on-surface-variant hover:text-primary-container underline transition-all">
              Careers
            </Link>
            <Link href="#" className="text-body-md text-on-surface-variant hover:text-primary-container underline transition-all">
              Press Relations
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-label-md uppercase tracking-widest text-primary font-semibold">
            Portfolio
          </h4>
          <nav className="flex flex-col gap-2 text-on-surface-variant text-body-md">
            <span>Calgary (5)</span>
            <span>Edmonton (2)</span>
            <span>Red Deer (3)</span>
            <span>Penhold (3)</span>
            <span>Sylvan Lake (1)</span>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-label-md uppercase tracking-widest text-primary font-semibold">
            Legal
          </h4>
          <nav className="flex flex-col gap-2">
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
      <div className="max-w-container-max mx-auto px-margin-page py-8 border-t-[0.5px] border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-body-md text-on-surface-variant text-center md:text-left">
          © 2024 StayAlberta by HrodricEstate. All rights reserved. Professional housing for institutional reliability.
        </p>
        <div className="flex gap-4">
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
