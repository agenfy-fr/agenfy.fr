"use client";

import { Reveal } from "@/components/effects";

const technologies = [
  "Snowflake",
  "Databricks",
  "AWS",
  "Azure",
  "GCP",
  "Kubernetes",
  "Terraform",
  "Python",
  "LangChain",
  "TensorFlow",
  "dbt",
  "Airflow",
];

export function Trust() {
  return (
    <section className="py-16 border-y border-border/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-8">
            Les technologies que nous maîtrisons
          </p>
        </Reveal>
      </div>

      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className={`flex shrink-0 items-center gap-12 pr-12 animate-marquee ${copy === 1 ? "marquee-clone" : ""}`}
          >
            {technologies.map((tech) => (
              <span
                key={tech}
                className="text-lg font-semibold text-muted-foreground/70 whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
