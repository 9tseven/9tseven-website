import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";

const EMAIL = "info@9tseven.com";
const PHONE = "+4526188876";

const PILL_CLASS =
  "inline-flex items-center gap-1 bg-tint hover:bg-tint-hover text-ink rounded-full px-2 py-0.5 no-underline transition-colors duration-fast align-baseline";

const TARGETS = [
  { value: EMAIL, href: `mailto:${EMAIL}`, Icon: Mail },
  { value: PHONE, href: `tel:${PHONE}`, Icon: Phone },
];

export default function renderWithEmails(text: string): ReactNode[] {
  let parts: ReactNode[] = [text];
  let key = 0;

  for (const { value, href, Icon } of TARGETS) {
    const next: ReactNode[] = [];
    for (const part of parts) {
      if (typeof part !== "string") {
        next.push(part);
        continue;
      }
      const segments = part.split(value);
      segments.forEach((seg, i) => {
        if (seg) next.push(seg);
        if (i < segments.length - 1) {
          next.push(
            <a key={`c-${key++}`} href={href} className={PILL_CLASS}>
              <Icon className="w-3.5 h-3.5" aria-hidden />
              {value}
            </a>
          );
        }
      });
    }
    parts = next;
  }

  return parts;
}
