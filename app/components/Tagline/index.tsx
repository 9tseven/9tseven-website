import Link from "next/link";
import type { ReactNode } from "react";

type TaglineTone = "ink" | "ink-muted" | "ink-subtle" | "ink-faint" | "fg" | "fg-muted" | "fg-subtle" | "fg-faint";

const TONE_CLASS: Record<TaglineTone, string> = {
  ink: "text-ink",
  "ink-muted": "text-ink-muted",
  "ink-subtle": "text-ink-subtle",
  "ink-faint": "text-ink-faint",
  fg: "text-fg",
  "fg-muted": "text-fg-muted",
  "fg-subtle": "text-fg-subtle",
  "fg-faint": "text-fg-faint",
};

interface TaglineProps {
  children: ReactNode;
  /** Optional URL — when provided, the tagline renders as a Next.js Link. */
  href?: string;
  /** Wrap the label in `(   ... )` like the marquee/story eyebrows. */
  bracketed?: boolean;
  /** Foreground color token. Defaults to `ink-subtle` for light surfaces. */
  tone?: TaglineTone;
  /** Override or extend the default classes (size, tracking, etc). */
  className?: string;
}

export default function Tagline({ children, href, bracketed = false, tone = "ink-subtle", className = "" }: TaglineProps) {
  const base = `font-mono text-[11px] font-medium tracking-eyebrow uppercase ${TONE_CLASS[tone]}`;
  const interactive = href ? "transition-opacity duration-base hover:opacity-50" : "";
  const classes = `${base} ${interactive} ${className}`.trim();

  const content = bracketed ? <>(&nbsp;&nbsp;&nbsp;{children}&nbsp;&nbsp;&nbsp;)</> : children;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
