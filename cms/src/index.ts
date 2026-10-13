import type { Core } from '@strapi/strapi';
import { seedFromSnapshot } from './bootstrap/seed';
import { ensureLocales, ensurePublicPermissions } from './bootstrap/setup';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales(strapi);
    await ensurePublicPermissions(strapi);
    if (process.env.SEED_FROM_SNAPSHOT !== 'false') await seedFromSnapshot(strapi);
  },
};
