export const CONTACT_FIELDS = ["name", "email", "phone", "type", "message", "consent"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
  consent: boolean;
}

export type ContactErrorCode =
  | "nameRequired"
  | "emailRequired"
  | "emailInvalid"
  | "phoneInvalid"
  | "typeRequired"
  | "messageShort"
  | "consentRequired";

export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

export const MESSAGE_MIN_LENGTH = 20;
// Deliberately loose: one @, a dot in the domain, no spaces. Real validation is a confirmation email.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(values: ContactValues, allowedTypes: readonly string[]): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = "nameRequired";

  const email = values.email.trim();
  if (!email) errors.email = "emailRequired";
  else if (!EMAIL.test(email)) errors.email = "emailInvalid";

  const digits = values.phone.replace(/\D/g, "");
  if (values.phone.trim() && (digits.length < 10 || digits.length > 15)) errors.phone = "phoneInvalid";

  if (!allowedTypes.includes(values.type)) errors.type = "typeRequired";
  if (values.message.trim().length < MESSAGE_MIN_LENGTH) errors.message = "messageShort";
  if (!values.consent) errors.consent = "consentRequired";
  return errors;
}
