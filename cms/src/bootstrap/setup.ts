import type { Core } from '@strapi/strapi';

const LOCALES = [
  { code: 'ru', name: 'Russian (ru)' },
  { code: 'en', name: 'English (en)' },
] as const;

/** The site reads published content anonymously; nothing else is exposed. */
const PUBLIC_ACTIONS = [
  'api::project.project.find',
  'api::project.project.findOne',
  'api::home-page.home-page.find',
  'api::about-page.about-page.find',
];

export async function ensureLocales(strapi: Core.Strapi): Promise<void> {
  const locales = strapi.plugin('i18n').service('locales');
  const existing: { code: string }[] = await locales.find();
  for (const { code, name } of LOCALES) {
    if (!existing.some((l) => l.code === code)) await locales.create({ code, name });
  }
  await locales.setDefaultLocale({ code: 'ru' });
}

export async function ensurePublicPermissions(strapi: Core.Strapi): Promise<void> {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!role) throw new Error('users-permissions public role is missing');

  const permissions = strapi.db.query('plugin::users-permissions.permission');
  for (const action of PUBLIC_ACTIONS) {
    const exists = await permissions.findOne({ where: { action, role: role.id } });
    if (!exists) await permissions.create({ data: { action, role: role.id } });
  }
}
