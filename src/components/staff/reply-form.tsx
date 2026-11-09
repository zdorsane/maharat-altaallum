"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { sendStaffMessageAction } from "@/app/staff-actions";
import { FormMessage, SubmitButton } from "@/components/form";

export function StaffReplyForm({ caseId, placeholder, send, sending }: { caseId: string; placeholder: string; send: string; sending: string }) {
  const [state, action] = useActionState(sendStaffMessageAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="caseId" value={caseId} />
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <textarea
          name="body"
          rows={2}
          required
          dir="auto"
          aria-label={placeholder}
          placeholder={placeholder}
          className="min-h-11 flex-1 resize-y bg-transparent px-2 py-1.5 text-sm focus:outline-none"
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
