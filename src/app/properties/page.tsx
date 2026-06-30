import BrowsePropertiesContent from "./BrowsePropertiesContent";
import { getProperties } from "@/lib/sanity";

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function BrowsePropertiesPage() {
  const properties = await getProperties();
  return <BrowsePropertiesContent initialProperties={properties} />;
}
