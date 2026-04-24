import type { ReactNode } from "react";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export default function renderWithEmails(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(EMAIL_REGEX)) {
    const email = match[0];
    const index = match.index ?? 0;

    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }

    nodes.push(
      <a
        key={key++}
        href={`mailto:${email}`}
        className="inline-block bg-black/5 hover:bg-black/10 text-black rounded-full px-2 py-0.5 no-underline transition-colors duration-150"
      >
        {email}
      </a>
    );

    cursor = index + email.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}
