"use client";

import { useId, useRef, useState } from "react";
import {
  CONTACT_FIELDS,
  type ContactErrors,
  type ContactField,
  type ContactValues,
  validateContact,
} from "@/lib/contact-form";
import type { Dictionary } from "@/lib/i18n";

interface ContactFormProps {
  labels: Dictionary["contacts"]["form"];
  projectTypes: { value: string; label: string }[];
}

const EMPTY: ContactValues = { name: "", email: "", phone: "", type: "", message: "", consent: false };

const fieldClass =
  "mt-2 block w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 text-lg text-ink transition-colors placeholder:text-ink-soft/60 hover:border-ink/60 focus:border-ink focus:ring-0 focus:outline-none aria-invalid:border-accent";

export function ContactForm({ labels, projectTypes }: ContactFormProps) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  // Validate live only after the first submit attempt, so users aren't scolded mid-typing.
  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState(false);
  const allowed = projectTypes.map((t) => t.value);

  const update = <K extends keyof ContactValues>(key: K, value: ContactValues[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (attempted) setErrors(validateContact(next, allowed));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    const found = validateContact(values, allowed);
    setErrors(found);
    const first = CONTACT_FIELDS.find((f) => found[f]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // Demo: nothing leaves the browser.
    setSent(true);
  };

  const errorId = (field: ContactField) => `${id}-${field}-error`;
  const a11y = (field: ContactField, hintId?: string) => ({
    id: `${id}-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": [errors[field] && errorId(field), hintId].filter(Boolean).join(" ") || undefined,
  });
  const errorText = (field: ContactField) =>
    errors[field] ? (
      <p id={errorId(field)} className="mt-2 text-sm text-accent">
        {labels.errors[errors[field]]}
      </p>
    ) : null;

  if (sent) {
    return (
      <div role="status" className="border-t border-ink pt-8">
        <p className="text-[clamp(1.5rem,3vw,2.25rem)] leading-tight tracking-[-0.02em]">{labels.success}</p>
        <button
          type="button"
          className="caption link-underline mt-8"
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setAttempted(false);
            setSent(false);
          }}
        >
          {labels.reset}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="border-t border-ink pt-8">
      <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.03em]">{labels.title}</h2>
      <p className="caption mt-3 text-ink-soft normal-case">{labels.demoNote}</p>

      <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="caption text-ink-soft">
            {labels.name}
          </label>
          <input
            {...a11y("name")}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={fieldClass}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="caption text-ink-soft">
            {labels.email}
          </label>
          <input
            {...a11y("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={fieldClass}
          />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="caption text-ink-soft">
            {labels.phone} <span className="normal-case">· {labels.phoneHint}</span>
          </label>
          <input
            {...a11y("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={fieldClass}
          />
          {errorText("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-type`} className="caption text-ink-soft">
            {labels.type}
          </label>
          <select
            {...a11y("type")}
            value={values.type}
            onChange={(e) => update("type", e.target.value)}
            className={`${fieldClass} appearance-none rounded-none bg-[length:12px] bg-[right_center] bg-no-repeat`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23161614'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="" disabled>
              {labels.typePlaceholder}
            </option>
            {projectTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errorText("type")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="caption text-ink-soft">
            {labels.message}
          </label>
          <textarea
            {...a11y("message", `${id}-message-hint`)}
            rows={4}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            className={`${fieldClass} resize-y`}
          />
          <p id={`${id}-message-hint`} className="mt-2 text-sm text-ink-soft">
            {labels.messageHint}
          </p>
          {errorText("message")}
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              {...a11y("consent")}
              type="checkbox"
              checked={values.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-ink"
            />
            <span>{labels.consent}</span>
          </label>
          {errorText("consent")}
        </div>
      </div>

      <button
        type="submit"
        className="group mt-12 inline-flex items-center gap-4 bg-ink px-8 py-4 text-paper transition-transform duration-200 active:scale-[0.98]"
      >
        {labels.submit}
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </button>
    </form>
  );
}
