"use client";

import { useEffect, useState } from "react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

type State = { kind: "idle" | "loading" | "success" | "already" } | { kind: "error"; message: string };

const BUTTON_LABEL = {
  idle: "Sign up",
  loading: "Signing up",
  success: "Subscribed",
  already: "Already signed up",
  error: "Error signing up",
} as const;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ kind: "loading" });

    const result = await subscribeToNewsletter(email);
    if (result.ok) {
      setState({ kind: result.alreadySubscribed ? "already" : "success" });
      setEmail("");
    } else {
      setState({ kind: "error", message: result.error });
    }
  };

  useEffect(() => {
    if (state.kind !== "error") return;
    const id = setTimeout(() => setState({ kind: "idle" }), 5000);
    return () => clearTimeout(id);
  }, [state.kind]);

  return (
    <div id="newsletter" className="px-8 py-16 border-b border-black/10">
      <h2 className="text-sm font-bold tracking-[0.14em] uppercase mb-1.5">Join the Community</h2>
      <p className="text-[0.7rem] tracking-[0.08em] text-black/45 mb-5">Sign up to the newsletter and join the community</p>
      <form className="flex flex-col gap-2 md:flex-row md:gap-0" onSubmit={handleSubmit}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="font-mono flex-1 min-w-0 bg-white px-4 py-2 text-[16px] md:px-5 md:py-3 md:text-[0.75rem] tracking-[0.14em] uppercase placeholder:text-black/30 outline-none border border-black/8" />
        <button type="submit" disabled={state.kind === "loading"} className="bg-black text-white px-7 py-2 text-[16px] md:px-9 md:py-3 md:text-[0.75rem] tracking-[0.14em] uppercase font-semibold hover:bg-black/80 transition-colors duration-150 whitespace-nowrap w-full text-center md:w-auto md:min-w-57 border border-transparent">
          {BUTTON_LABEL[state.kind]}
        </button>
      </form>
      {state.kind === "error" && <p className="mt-3 text-[0.65rem] tracking-[0.14em] uppercase text-red-700">{state.message}</p>}
    </div>
  );
}
