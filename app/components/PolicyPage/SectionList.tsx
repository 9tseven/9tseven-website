import renderWithEmails from "./renderWithEmails";
import type { PolicySection } from "./types";

interface SectionListProps {
  sections: PolicySection[];
}

export default function SectionList({ sections }: SectionListProps) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((section, index) => (
        <section key={index} className="flex flex-col gap-4">
          <h2 className="text-sm uppercase tracking-label font-semibold">
            {section.heading}
          </h2>

          {section.paragraphs?.map((paragraph, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="text-sm leading-relaxed text-ink-muted"
            >
              {renderWithEmails(paragraph)}
            </p>
          ))}

          {section.note && (
            <p className="text-[0.7rem] tracking-label uppercase text-ink-subtle">
              {section.note}
            </p>
          )}

          {section.rates && (
            <div className="mt-2 border-t border-ink/10">
              <div className="grid grid-cols-3 gap-4 py-3 border-b border-ink/10 text-[0.6rem] tracking-label uppercase text-ink-subtle">
                <span>Region</span>
                <span>Estimated Delivery</span>
                <span>Standard Shipping</span>
              </div>
              {section.rates.map((rate, rateIndex) => (
                <div
                  key={rateIndex}
                  className="grid grid-cols-3 gap-4 py-3 border-b border-ink/10 last:border-b-0 text-xs text-ink-muted"
                >
                  <span className="font-semibold text-ink">{rate.region}</span>
                  <span>{rate.estimatedDelivery}</span>
                  <span>{rate.standardShipping}</span>
                </div>
              ))}
            </div>
          )}

          {section.contact && (
            <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-xs text-ink-muted">
              {Object.entries(section.contact).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="uppercase tracking-label text-[0.6rem] text-ink-subtle self-center">
                    {key}
                  </dt>
                  <dd>{renderWithEmails(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
