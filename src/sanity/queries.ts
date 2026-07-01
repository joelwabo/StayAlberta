import { defineQuery } from "next-sanity";

export const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property" && isActive != false] {
    "id": _id,
    title,
    "slug": slug.current,
    city,
    address,
    price,
    pricePeriod,
    bedrooms,
    bathrooms,
    sqft,
    guests,
    availableDate,
    availableNow,
    isActive,
    tag,
    description,
    "images": images[].asset->url,
    videoUrl,
    "videoPoster": videoPoster.asset->url,
    amenities,
    idealFor
  }
`);
