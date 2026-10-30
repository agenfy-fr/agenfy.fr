import { OfferPage } from "@/components/layouts/OfferPage";
import { buildMetadata } from "@/lib/seo";
import { getOffer } from "@/lib/offers";

const offer = getOffer("data");

export const metadata = buildMetadata({
  title: offer.metaTitle,
  description: offer.metaDescription,
  path: offer.path,
  keywords: offer.keywords,
});

export default function DataPage() {
  return <OfferPage offer={offer} />;
}
