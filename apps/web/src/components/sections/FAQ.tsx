import { ChevronDown } from "lucide-react";
import { JsonLd, faqSchema, type FaqItem } from "@/components/schemas/JsonLd";

// Native <details> keeps answers in the HTML (crawlable, works without JS),
// and the FAQPage schema is always generated from the exact visible items.
export function FAQ({
  items,
  title = "Questions fréquentes",
  withSchema = true,
}: {
  items: FaqItem[];
  title?: string;
  withSchema?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="py-16 lg:py-24" aria-labelledby="faq-title">
      {withSchema && <JsonLd data={faqSchema(items)} />}
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h2 id="faq-title" className="text-h1 font-bold text-foreground mb-10 text-center">
          {title}
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                <h3 className="text-base sm:text-lg">{item.question}</h3>
                <ChevronDown
                  aria-hidden
                  className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
