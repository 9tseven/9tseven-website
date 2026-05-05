"use client";

import { useEffect, useState } from "react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

export type NewsletterState =
  | { kind: "idle" | "loading" | "success" | "already" }
  | { kind: "error"; message: string };

export const NEWSLETTER_BUTTON_LABEL = {
  idle: "Sign up",
  loading: "Signing up",
  success: "Subscribed",
  already: "Already signed up",
  error: "Error signing up",
} as const;

export function useNewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>({ kind: "idle" });

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

  return { email, setEmail, state, handleSubmit };
}
