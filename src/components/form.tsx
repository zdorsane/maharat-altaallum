"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action";

export function SubmitButton({ children, className, pendingText }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary", className)}>
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="field-error animate-fade-in">
      {error}
    </p>
  );
}

type FieldProps = {
  name: string;
  label: string;
  state: ActionState;
  hint?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ name, label, state, hint, className, ...rest }: FieldProps) {
  const error = state?.errors?.[name];
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input id={name} name={name} className="field" aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined} {...rest} />
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <ErrorText id={`${name}-err`} error={error} />
    </div>
  );
}

export function PasswordField({ showLabel, hideLabel, ...props }: FieldProps & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false);
  const { name, label, state, hint, className, ...rest } = props;
  const error = state?.errors?.[name];
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          dir="ltr"
          className="field pe-11"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-err` : undefined}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          title={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 end-0 grid w-11 cursor-pointer place-items-center text-muted transition hover:text-ink"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <ErrorText id={`${name}-err`} error={error} />
    </div>
  );
}

export function TextArea({
  name,
  label,
  state,
  hint,
  className,
  ...rest
}: { name: string; label: string; state: ActionState; hint?: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const error = state?.errors?.[name];
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <textarea id={name} name={name} rows={4} className="field" aria-invalid={!!error} {...rest} />
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <ErrorText id={`${name}-err`} error={error} />
    </div>
  );
}

export function Select({
  name,
  label,
  state,
  options,
  placeholder,
  className,
  ...rest
}: { name: string; label: string; state: ActionState; options: [string, string][]; placeholder?: string; className?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const error = state?.errors?.[name];
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <select id={name} name={name} className="field" aria-invalid={!!error} defaultValue="" {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <ErrorText id={`${name}-err`} error={error} />
    </div>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <p role="alert" className={cn("animate-fade-up rounded-xl px-4 py-3 text-sm font-medium", state.ok ? "bg-mint-soft text-mint" : "bg-coral-soft text-coral")}>
      {state.message}
    </p>
  );
}
