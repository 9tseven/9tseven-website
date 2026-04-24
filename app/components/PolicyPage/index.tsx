import FaqList from "./FaqList";
import SectionList from "./SectionList";
import renderWithEmails from "./renderWithEmails";
import type { PolicyPageData } from "./types";

interface PolicyPageProps {
  data: PolicyPageData;
}

export default function PolicyPage({ data }: PolicyPageProps) {
  return (
    <main
      data-nav-theme="light"
      className="bg-white min-h-screen pt-24 pb-24 text-black"
    >
      <div className="max-w-3xl mx-auto px-8">
        <header className="mb-12">
          <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold">
            {data.title}
          </h1>
          {data.lastUpdated && (
            <p className="mt-3 text-[0.6rem] tracking-widest uppercase text-black/45">
              Last updated: {data.lastUpdated}
            </p>
          )}
        </header>

        {data.intro && data.intro.length > 0 && (
          <div className="flex flex-col gap-4 mb-12">
            {data.intro.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-black/70">
                {renderWithEmails(paragraph)}
              </p>
            ))}
          </div>
        )}

        {data.accordion
          ? data.items && <FaqList items={data.items} />
          : data.sections && <SectionList sections={data.sections} />}
      </div>
    </main>
  );
}
