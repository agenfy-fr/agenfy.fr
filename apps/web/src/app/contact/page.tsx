import { Illustration } from "@/components/effects/Illustration";
import { ContactPageClient } from "./ContactPageClient";

export default function ContactPage() {
  return <ContactPageClient visual={<Illustration name="contact" priority className="mb-10" />} />;
}
