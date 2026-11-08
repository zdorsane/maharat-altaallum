"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { contactAction } from "./actions";
import { Field, FormMessage, SubmitButton, TextArea } from "@/components/form";
import type { Dict } from "@/lib/i18n/dictionaries/ar";

export function ContactForm({ t }: { t: Dict["contactPage"] }) {
  const [state, action] = useActionState(contactAction, null);

  if (state?.ok) {
    return (
      <div role="status" className="animate-fade-up flex flex-col items-center gap-4 py-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-mint-soft text-mint">
          <CheckCircle2 className="size-8" />
        </span>
        <p className="max-w-sm text-lg font-bold">{state.message}</p>
      </div>
    );
  }

  const kept = (k: string) => String(state?.data?.[k] ?? "");
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label={t.name} autoComplete="name" required state={state} defaultValue={kept("name")} />
        <Field name="email" label={t.email} type="email" autoComplete="email" dir="ltr" required state={state} defaultValue={kept("email")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="phone" label={t.phone} type="tel" autoComplete="tel" dir="ltr" placeholder="0550123456" state={state} defaultValue={kept("phone")} />
        <Field name="subject" label={t.subject} required state={state} defaultValue={kept("subject")} />
      </div>
      <TextArea name="message" label={t.message} rows={6} required state={state} defaultValue={kept("message")} />
      <p className="text-xs text-muted">{t.privacyNote}</p>
      <SubmitButton className="btn-lg w-full sm:w-auto" pendingText={t.pending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
