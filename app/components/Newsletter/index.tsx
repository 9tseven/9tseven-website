"use client";

import { NEWSLETTER_BUTTON_LABEL, useNewsletterForm } from "./useNewsletterForm";

export default function Newsletter() {
  const { email, setEmail, state, handleSubmit } = useNewsletterForm();

  return (
    <div id="newsletter" className="px-8 py-16 border-b border-ink/10">
      <h2 className="text-sm font-bold tracking-label uppercase mb-1.5">Join the Community</h2>
      <p className="text-[0.7rem] tracking-label text-ink-subtle mb-5">Sign up to the newsletter and join the community</p>
      <form className="flex flex-col gap-2 md:flex-row md:gap-0" onSubmit={handleSubmit}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="font-mono flex-1 min-w-0 bg-fg px-4 py-2 text-[16px] md:px-5 md:py-3 md:text-[0.75rem] tracking-label uppercase placeholder:text-ink-faint outline-none border border-ink/10" />
        <button type="submit" disabled={state.kind === "loading"} className="bg-bg text-fg px-7 py-2 text-[16px] md:px-9 md:py-3 md:text-[0.75rem] tracking-label uppercase font-semibold hover:bg-bg/80 transition-colors duration-fast whitespace-nowrap w-full text-center md:w-auto md:min-w-57 border border-transparent">
          {NEWSLETTER_BUTTON_LABEL[state.kind]}
        </button>
      </form>
      {state.kind === "error" && <p className="mt-3 text-[0.65rem] tracking-label uppercase text-red-700">{state.message}</p>}
    </div>
  );
}
