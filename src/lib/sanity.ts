import { createClient } from "@sanity/client";

export interface Property {
  id: string;
  title: string;
  slug: string;
  city: string;
  neighborhood: string;
  price: number;
  pricePeriod: "night" | "month";
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  guests: number;
  availableDate: string;
  availableNow: boolean;
  tag: string;
  description: string;
  images: string[];
  videoUrl?: string;
  videoPoster?: string;
  amenities: string[];
  idealFor: string[];
}

export const mockProperties: Property[] = [
  {
    id: "beltline-suite",
    title: "Beltline Executive Suite",
    slug: "beltline-executive-suite",
    city: "Calgary",
    neighborhood: "Calgary | Beltline District",
    price: 3200,
    pricePeriod: "month",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 920,
    guests: 2,
    availableDate: "Available Jul 1",
    availableNow: false,
    tag: "Available Jul 1",
    description: "A fully furnished executive suite in the heart of Calgary's Beltline, designed for professionals on extended assignments. High ceilings, in-suite laundry, and a dedicated workspace make it a practical home base for 2-week to 2-month stays. The building includes underground parking and a fitness centre. Direct billing to your company's accounts payable is available.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvVTvaybgPnT6QZqyD-Tuj4iqAYOyx4yEckXNFVONh1zEU0O7JxTk_jXBCxcd1qy6J1mzTncCklJwnBdqpdlRZCPe8LvKu-Ii-4T_yDWGa46QlTdSXXg-8erlrsejLJugZGJS2ceuo8YSqTO_FyOfTcvVEQ-mHet0L2FWcCT2wf3dmqR9S3079jogWlNKdNcPfm5E69Aqt8zNPYb1ARNF9OwmH2EPLWyI_s06KORDwPJS7SsMWkMrxZeUHsrklugNzQ5P3B1ZlMw",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgAgxwIIO9b_Nc2rtEUBrSm55znCjrlb224SbtvjryUOAbQrDM8sZwjswL2qjayf3BOJnsDBRBJdvSGZyOKEhtktHHubnx2oCM5qrZkcHC1G6LC1zIVtUsAe8dzWylrU0ifJ_EGvX9D2SsHiAXQFWPTcauDp2NWESC9pRJ3xALt3WetS4r_rFI-Hg-teEY4bBr599nH747lRkbqfCrVnwZ9ZdwPSk_rhdbttfh0iC14XDJFvoLbKRh4wtkdXy6LIKoY1Wa7EVzSQ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsDPbWI2E-W1myxJrJb7C-vmMeZLjZCOutPOcfzSw4PLQf4Sh54hefLORghjteMB-saoyBVw4bAXA1e1Z2XBUaVibgEv9hcIjjCsMyAZqrYkNudeHB8_YMPtHzx6O_BeKp0OEnG96uM9UF2yqS1hjHmQFeJX_I8Zt3oxTpKmcSFPdnvEwkuqiVrmHFTQZwyvEn8r2bEd-J_gb4qnB0vlecKe_Ya2zrYb_eQzlciS_9My__en7YIx30L5qqxcJT66M474_6POQ73A"
    ],
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoPoster: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvVTvaybgPnT6QZqyD-Tuj4iqAYOyx4yEckXNFVONh1zEU0O7JxTk_jXBCxcd1qy6J1mzTncCklJwnBdqpdlRZCPe8LvKu-Ii-4T_yDWGa46QlTdSXXg-8erlrsejLJugZGJS2ceuo8YSqTO_FyOfTcvVEQ-mHet0L2FWcCT2wf3dmqR9S3079jogWlNKdNcPfm5E69Aqt8zNPYb1ARNF9OwmH2EPLWyI_s06KORDwPJS7SsMWkMrxZeUHsrklugNzQ5P3B1ZlMw",
    amenities: [
      "1 Gbps fibre WiFi",
      "Dedicated workspace",
      "In-suite laundry",
      "Underground parking",
      "Central A/C + heat",
      "Smart TV / Netflix",
      "Fully stocked kitchen",
      "Building fitness centre"
    ],
    idealFor: [
      "Energy sector rotational staff",
      "Consulting projects",
      "Executive relocation",
      "Government contractors",
      "Corporate training cohorts"
    ]
  },
  {
    id: "jasper-executive",
    title: "The Jasper Executive",
    slug: "the-jasper-executive",
    city: "Edmonton",
    neighborhood: "Downtown Edmonton | Institutional Core",
    price: 145,
    pricePeriod: "night",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    availableDate: "Available Now",
    availableNow: true,
    tag: "Available Now",
    description: "A premium executive suite located in Edmonton's downtown institutional core. Perfect for corporate travelers and project teams requiring a turn-key, fully furnished residence with secure heated parking.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNx_X--Cc2SdAr2UbFXoJ72t4zNLJEHynqsVBOc4kIbT1LGohhos0ueVKATaAlrYJKDSYSI3YvHMTiK_O8dTJ_GP4R0uqOl79pc_oE2jogeK85b9p0I2BUD8ONgl2RW-6X0X4AePylUq_cMJ5QQ-spN1sFWuR9d5pXnKdLEFaLBOXnJ1mivp4HqQh1pGQ1fyUb7NSDhHHq2BvVVplJqDJaViBwKHsQ0GPKhXGpCih0AsEiMblt_o-I2m4sqks3JZmF8z70k0GgnA"
    ],
    amenities: [
      "2 Bedrooms",
      "2 Baths",
      "Fibre WiFi",
      "Heated Parking",
      "In-suite laundry",
      "Central A/C"
    ],
    idealFor: [
      "Rotational staff",
      "Project teams",
      "Executive relocation"
    ]
  },
  {
    id: "red-deer-terrace",
    title: "Red Deer Terrace",
    slug: "red-deer-terrace",
    city: "Red Deer",
    neighborhood: "Red Deer | Regional Hub",
    price: 125,
    pricePeriod: "night",
    bedrooms: 3,
    bathrooms: 2.5,
    guests: 6,
    availableDate: "Available Now",
    availableNow: true,
    tag: "Available Now",
    description: "Spacious residential terrace unit in Red Deer. Perfect for groups, work crews, or families relocating. Includes private patio, EV charger, and fully equipped kitchen.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6TIh68y1G6vbGyVvYTO7rmytM-OBS5MILg43XVg1BdtAMnD4nBSw-AOQLVX0BsZNCi7BeebBotWJxOZYMPXhWXP5WjZXJl2tmHS8MKO_mSW1wKvMDAXqvJ7vcv4ga7LItlXH2E3O04DC8V_DXusA5qpMIIhB5YL9s71dbXeD7Ch2nJz_efauZ6uXf_1h3c1LDUPfEgVfAQizIN-Q0aPb-OD5gLkvKiitCAJaUzfyStD7GMoYXrnWhLKfwJ6kKgk51_N6NS8VSJw"
    ],
    amenities: [
      "3 Bedrooms",
      "2.5 Baths",
      "Private Patio",
      "EV Charger",
      "Fibre WiFi",
      "Heated Parking"
    ],
    idealFor: [
      "Work crews",
      "Construction projects",
      "Family relocation"
    ]
  }
];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2026-06-10";

// Standard client for live fetches when credentials exist
export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

// Clean fetch wrapper supporting transparent local fallback
export async function getProperties(): Promise<Property[]> {
  if (sanityClient) {
    try {
      const query = `*[_type == "property"] {
        "id": _id,
        title,
        "slug": slug.current,
        city,
        neighborhood,
        price,
        pricePeriod,
        bedrooms,
        bathrooms,
        sqft,
        guests,
        availableDate,
        availableNow,
        tag,
        description,
        "images": images[].asset->url,
        videoUrl,
        "videoPoster": videoPoster.asset->url,
        amenities,
        idealFor
      }`;
      const data = await sanityClient.fetch(query);
      if (data && data.length > 0) return data;
    } catch (error) {
      console.warn("Sanity fetch failed, falling back to mock properties:", error);
    }
  }
  return mockProperties;
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const properties = await getProperties();
  return properties.find((p) => p.slug === slug || p.id === slug);
}
