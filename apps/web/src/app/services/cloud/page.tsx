import { OfferPage } from "@/components/layouts/OfferPage";
import { buildMetadata } from "@/lib/seo";
import { getOffer } from "@/lib/offers";

const offer = getOffer("cloud");

export const metadata = buildMetadata({
  title: offer.metaTitle,
  description: offer.metaDescription,
  path: offer.path,
  keywords: offer.keywords,
});

export default function CloudPage() {
  return <OfferPage offer={offer} />;
}
