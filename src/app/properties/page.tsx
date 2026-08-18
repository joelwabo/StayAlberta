import BrowsePropertiesContent from "./BrowsePropertiesContent";
import { getProperties } from "@/lib/guesty";

export const dynamic = "force-dynamic";

export default async function BrowsePropertiesPage() {
  const properties = await getProperties();
  return <BrowsePropertiesContent initialProperties={properties} />;
}
