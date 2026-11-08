"use client";

import { useActionState, useEffect, useRef } from "react";
import { Paperclip, Send } from "lucide-react";
import { sendMessageAction, uploadCaseDocumentsAction, respondAppointmentAction } from "@/app/parent/actions";
import { FormMessage, SubmitButton } from "@/components/form";

/** Message composer; clears itself after a successful send. */
export function MessageForm({ caseId, placeholder, send, sending, label }: { caseId?: string; placeholder: string; send: string; sending: string; label: string }) {
  const [state, action] = useActionState(sendMessageAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      {caseId && <input type="hidden" name="caseId" value={caseId} />}
      <label htmlFor={`msg-${caseId ?? "general"}`} className="sr-only">
        {label}
      </label>
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <textarea
          id={`msg-${caseId ?? "general"}`}
          name="body"
          rows={2}
          required
          placeholder={placeholder}
          className="min-h-11 flex-1 resize-y bg-transparent px-2 py-1.5 text-sm focus:outline-none"
          aria-invalid={!!state?.errors?.body}
        />
        <SubmitButton className="shrink-0" pendingText={sending}>
          <Send className="size-4 rtl:-scale-x-100" />
          {send}
        </SubmitButton>
      </div>
      {state?.errors?.body && <p className="field-error">{state.errors.body}</p>}
      {state?.message && !state.ok && <FormMessage state={state} />}
    </form>
  );
}

/** Adds documents to an existing case. */
export function UploadForm({ caseId, label, hint, upload, uploading }: { caseId: string; label: string; hint: string; upload: string; uploading: string }) {
  const [state, action] = useActionState(uploadCaseDocumentsAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="caseId" value={caseId} />
      <label htmlFor={`up-${caseId}`} className="label flex items-center gap-2">
        <Paperclip className="size-4 text-primary" />
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={`up-${caseId}`}
          name="documents"
          type="file"
          multiple
          required
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="min-w-0 flex-1 text-sm file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-bold file:text-primary"
        />
        <SubmitButton pendingText={uploading}>{upload}</SubmitButton>
      </div>
      <p className="text-xs text-muted">{hint}</p>
      {state?.errors?.documents && <p className="field-error">{state.errors.documents}</p>}
      <FormMessage state={state?.message ? state : null} />
    </form>
  );
}

/** Confirm / cancel buttons for an appointment (cancel asks for confirmation). */
export function AppointmentActions({ id, canConfirm, labels }: { id: string; canConfirm: boolean; labels: { confirm: string; cancel: string; cancelConfirm: string } }) {
  return (
    <div className="flex flex-wrap gap-2">
      {canConfirm && (
        <form action={respondAppointmentAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="confirm" />
          <SubmitButton>{labels.confirm}</SubmitButton>
        </form>
      )}
      <form
        action={respondAppointmentAction}
        onSubmit={(e) => {
          if (!confirm(labels.cancelConfirm)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="decision" value="cancel" />
        <button className="btn-ghost text-coral">{labels.cancel}</button>
      </form>
    </div>
  );
}

/** Delete button with a native confirmation. */
export function ConfirmSubmit({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
