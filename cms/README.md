# CMS (Strapi v5)

Источник контента для сайта Ostov Architects. Как всё связано, описано в [README в корне](../README.md#cms-локально). Здесь только то, что относится к этой папке.

- `src/api/*/content-types/*/schema.json` — `Project` (коллекция), `Home page`, `About page` (single types). Тексты и фигуры локализованы (`ru`, `en`), а `slug`, `year`, `area`, `category` общие для языков.
- `src/components/shared/` — `figure` (картинка + локализованный alt), `stat`, `titled-text`, `team-member`.
- `src/bootstrap/setup.ts` — создаёт локали (`ru` по умолчанию) и открывает публичной роли только `find`/`findOne`.
- `src/bootstrap/seed.ts` — при пустой базе импортирует `../content/*.json` и `../media/originals`. Отключается через `SEED_FROM_SNAPSHOT=false`.
- `scripts/init-env.mjs` — создаёт `.env` со случайными секретами из `.env.example`.

Запуск вне Docker (нужен PostgreSQL из `.env`):

```bash
npm install
node scripts/init-env.mjs
npm run develop
```

После изменения схем перегенерируйте типы: `npx strapi ts:generate-types`.
