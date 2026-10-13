import { contact, getDictionary } from "@/lib/i18n";
import { CATEGORIES, type Locale } from "@/lib/types";
import { ContactForm } from "../ContactForm";
import { PageHeader } from "../PageHeader";

export function ContactsView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const details = [
    { label: t.contacts.address, value: t.contacts.addressValue },
    { label: t.contacts.email, value: contact.email, href: `mailto:${contact.email}` },
    { label: t.contacts.phone, value: contact.phone, href: contact.phoneHref },
    { label: t.contacts.hours, value: t.contacts.hoursValue },
  ];

  return (
    <div className="container-x pb-32 md:pb-48">
      <PageHeader title={t.contacts.title} lead={t.contacts.lead} />
      <div className="grid gap-16 md:grid-cols-12">
        <dl data-stagger className="grid content-start gap-6 md:col-span-4">
          {details.map((d) => (
            <div key={d.label} className="border-t border-line pt-3">
              <dt className="caption text-ink-soft">{d.label}</dt>
              <dd className="mt-1.5 text-lg">
                {d.href ? (
                  <a href={d.href} className="link-underline">
                    {d.value}
                  </a>
                ) : (
                  d.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="md:col-span-7 md:col-start-6">
          <ContactForm
            labels={t.contacts.form}
            projectTypes={CATEGORIES.map((c) => ({ value: c, label: t.categorySingular[c] }))}
          />
        </div>
      </div>
    </div>
  );
}
