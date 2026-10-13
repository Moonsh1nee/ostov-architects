# Ostov Architects

![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-0AE448?style=for-the-badge&logo=greensock&logoColor=black)
![Strapi](https://img.shields.io/badge/Strapi-5-4945FF?style=for-the-badge&logo=strapi&logoColor=white)

**Демо:** https://moonsh1nee.github.io/ostov-architects/ · [English version](https://moonsh1nee.github.io/ostov-architects/en/)

Имиджевый сайт архитектурного бюро «Остов» на двух языках. Жанровый ориентир — сайты премиальных студий вроде [YODEZEEN](https://yodezeen.com/): приёмы (интро, кинематографичный hero, экраны-заявления, раскрывающееся фото) взяты как жанровые, макет, тексты и бренд свои. **Это демо для портфолио:** бюро, проекты, люди, адрес и телефон вымышлены, фотографии взяты с Unsplash (авторы перечислены [ниже](#фото)). Ни одна реальная студия не копировалась: макет, тексты и бренд сделаны с нуля.

## Зачем

Хотелось сделать сайт в жанре премиальных архитектурных студий и проверить, сколько стоит «красиво» на мобильном. В этом жанре обычно крупная типографика, фото на весь экран, плавный скролл и анимации на каждом экране, а PageSpeed на телефоне при этом выдаёт оценку в 40–60. Задача была держать **90+ на мобильных** на каждой странице, не отказываясь ни от одной анимации из задания. Контент при этом должен жить в настоящей CMS, а не в коде.

## Что внутри

| | |
|---|---|
| **Интро** | При первом заходе за сессию: огромное «ОСТОВ» поверх hero, буквы поднимаются по одной, под ними прорисовывается осевая линия. Пилюля «Пропустить». При reduced motion не показывается. |
| **Главная** | Hero-слайдшоу из трёх проектов: кроссфейд с медленным zoom-out, подписи и пилюля «Смотреть проект» меняются синхронно. Экран-заявление капсом, который заливается по словам при скролле. Раскрывающееся фото: панель с манифестом уезжает, кадр занимает экран (ScrollTrigger pin). Избранные проекты полноэкранными слайдами, каждый следующий наезжает на предыдущий. Блок цифр. Футер с географией проектов. |
| **Проекты** | Асимметричная сетка, фильтр по категориям (жилые / общественные / интерьеры), раскрытие картинок через `clip-path`. |
| **Страница проекта** | Большая обложка, характеристики, текст, галерея с параллаксом, переход к следующему проекту. 6 страниц × 2 языка через `generateStaticParams`. |
| **О бюро** | Подход, команда (вместо фото — генеративные абстрактные портреты, детерминированные по имени), этапы работы. |
| **Контакты** | Форма только с клиентской валидацией. Это демо, поэтому форма ничего не отправляет. |
| **Переходы** | Шторка на GSAP timeline между страницами одной локали. Кнопка «назад» работает штатно. |
| **i18n** | RU без префикса, EN под `/en`. Переключатель языка сохраняет текущую страницу. У каждой страницы metadata на обоих языках, hreflang, Open Graph, `sitemap.xml`, `robots.txt`. |
| **Reduced motion** | Без Lenis и без скролл-сцен, переход превращается в короткий fade. |

## Архитектура

```
Strapi v5 + PostgreSQL ──REST──▶ lib/strapi.ts ──▶ lib/content.ts ──▶ next build (output: export) ──▶ GitHub Pages
      (docker compose)               zod              ▲   │
                                                      │   └── STRAPI_URL не задан?
      npm run snapshot ─────▶ content/*.json ─────────┘        берём JSON-снапшот из репозитория
                              media/originals/*.jpg ──▶ scripts/build-images.ts (sharp) ──▶ public/img/*.avif|webp
```

- **Один источник формы данных.** `lib/types.ts` описывает домен на zod. Этой схеме подчиняются и JSON-снапшот, и ответ Strapi после маппинга. Битый снапшот или неожиданный ответ CMS роняет сборку с понятной ошибкой, а не превращается в полупустую страницу.
- **Fail fast, а не тихий fallback.** Если `STRAPI_URL` задан, а Strapi ответил 500, сборка падает. Тихо откатиться на снапшот значило бы задеплоить старый контент и не заметить этого.
- **Картинки по ключу, а не по URL.** В контенте лежит `key` + размеры. Пайплайн на sharp по ключу генерирует AVIF и WebP нескольких ширин и OG-кропы. Этот же модуль (`lib/images.ts`) читает `<Picture>`, поэтому srcset не может сослаться на несуществующий вариант.
- **Серверные компоненты по умолчанию.** Клиентские только там, где без состояния не обойтись: шапка (меню, тон, авто-скрытие), фильтр проектов, форма и корень анимаций.

## Технически интересное

**Pin из GSAP против React.** `ScrollTrigger` с `pin: true` оборачивает элемент в `pin-spacer`. При уходе со страницы React пытается удалить узел, который уже не его прямой потомок, получает `removeChild` и роняет всё дерево. Чинить пришлось в два слоя. Первый: закрепляется внутренний `div`, так что `pin-spacer` оказывается внутри узла, которым владеет React. Второй: GSAP-контекст откатывается до смены маршрута, пока экран закрыт шторкой. На back/forward есть своя тонкость: роутер коммитит новую страницу синхронно, *раньше* моего обработчика `popstate`. Поэтому откат там условный, только если контекст ещё построен для старого пути. Иначе анимации новой страницы сносились сразу после создания.

**Главный LCP оказался текстом.** Chrome не считает полноэкранное изображение кандидатом в LCP: такое фото для него фон. На главной LCP — первая строка заголовка, а её построчная анимация с задержкой отодвигала метрику. Вторая находка: `decoding="sync"` на hero-фото держал *всю* первую отрисовку до загрузки и декодирования AVIF (FCP совпадал с приходом картинки до миллисекунды). После правок наблюдаемый LCP равен FCP.

**Art direction для hero.** Горизонтальный кадр в рамке высотой с экран телефона заставлял браузер качать вариант 2400w ради высоты. Теперь для горизонтальных оригиналов отдельно генерируется кроп 9:16 (`position: attention`) с шириной под реальные экраны: 412 px × DPR 1.75 = 721 → вариант 750. Hero на мобильном весит 60 КБ вместо 340.

**Две корневые раскладки вместо `[lang]`.** `app/(ru)/` и `app/en/` — отдельные root layouts, поэтому `<html lang>` правильный уже в статическом HTML. Маршруты не дублируются: каждый файл страницы — однострочная привязка фабрики из `lib/pages.tsx` к локали.

**Интро без мигания на повторном визите.** Решение «показывать или нет» принимает парсер-блокирующий инлайн-скрипт в `<head>` (sessionStorage + prefers-reduced-motion) до первой отрисовки. Сама заставка и hero-слайдшоу на чистом CSS, с отрицательными `animation-delay` в общем 18-секундном цикле, поэтому крутятся с первого кадра без JS. Попутная ловушка: `z-index` на `<main>` создавал контекст наложения, и фиксированное интро с `z-70` оказывалось *под* шапкой с `z-50`.

**Анимации не на критическом пути.** GSAP, ScrollTrigger и Lenis подгружаются динамическим импортом в `requestIdleCallback` после первой отрисовки. Hero и заголовки страниц анимируются на чистом CSS, поэтому стартуют с первого кадра без JS. Элементы, которые уже видны в момент загрузки движка, не прячутся и не проигрываются заново, чтобы не было вспышки контента.

**Баг Next 16.4 на Windows.** При `output: 'export'` файлы prefetch сегментов собираются с `\` в путях, а экспортёр заменяет только `/`. В итоге вместо `__next.!X.__PAGE__.txt` получается вложенная папка, и клиент ловит 404. На Linux (CI) такого нет. Для честного локального превью есть postbuild-скрипт `scripts/fix-export-segments.ts`, на Linux он ничего не делает.

## Lighthouse (mobile)

Lighthouse 13.5, мобильный профиль по умолчанию (как в PageSpeed Insights: эмуляция Moto G Power, simulated slow 4G). Замер по живому сайту на GitHub Pages, 14.10.2026.

| Страница | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 94 | 100 | 100 | 100 | 2.7 s | 0 | 30 ms |
| `/en/` | 97 | 100 | 100 | 100 | 2.5 s | 0 | 70 ms |
| `/projects/` | 98 | 100 | 100 | 100 | 2.3 s | 0 | 40 ms |
| `/projects/grove-house/` | 96 | 100 | 100 | 100 | 2.6 s | 0 | 40 ms |
| `/about/` | 97 | 100 | 100 | 100 | 2.5 s | 0 | 40 ms |
| `/contacts/` | 98 | 100 | 100 | 100 | 2.3 s | 0 | 40 ms |

Оценка Performance на GitHub Pages плавает на ±3 пункта от прогона к прогону: это задержка CDN, а не сайт.

## Запуск

Нужен Node.js 22+ (CI собирает на 24).

```bash
npm install
npm run dev          # http://localhost:3004, контент из content/*.json
npm test             # Vitest: маппинг Strapi, fallback на снапшот, инварианты контента, валидация формы
npm run build        # статический экспорт в out/
npm start            # раздать out/ локально
```

### CMS локально

Нужен Docker.

```bash
npm run cms:up       # сгенерирует cms/.env со случайными секретами, поднимет PostgreSQL + Strapi
```

При первом старте пустая база заполняется из `content/*.json` и `media/originals` (`cms/src/bootstrap/seed.ts`), а публичная роль получает права только на чтение. Админка откроется на http://localhost:1337/admin, при первом входе нужно создать администратора.

Контент-модель:
- `Project` (коллекция): `title`, `location`, `description`, `cover`, `gallery` локализованы. `slug`, `year`, `area`, `category` общие для языков, на этом держится переключатель языка.
- `Home page` и `About page` (single types).
- Компонент `shared.figure` — картинка плюс локализованный `alt`, потому что `alternativeText` у загрузки в Strapi на все языки один.

После правок в админке:

```bash
STRAPI_URL=http://localhost:1337 npm run snapshot   # content/*.json + новые картинки в media/originals
STRAPI_URL=http://localhost:1337 npm run build      # или собрать прямо из CMS
npm run cms:down
```

Снапшот проходит через те же zod-схемы, что и сборка, поэтому JSON, который сломает сайт, не будет записан. Проверено, что круг JSON → сид в Strapi → REST → snapshot возвращает данные, идентичные исходным.

## Деплой

`.github/workflows/deploy.yml` запускается на push в `main`: `npm ci` → lint → typecheck → тесты → `npm run build` (из JSON-снапшота, Strapi в CI не нужен) → `actions/deploy-pages`.

- `NEXT_PUBLIC_BASE_PATH=/<имя репозитория>` задаёт `basePath` и `assetPrefix`. Пути к картинкам в `<picture>` получают его через `lib/paths.ts`, потому что обычный `<img>` Next не префиксует.
- Сгенерированные AVIF/WebP кешируются между прогонами по хэшу оригиналов и пайплайна.
- В `public/` лежит `.nojekyll`, иначе Pages выкинет папку `_next`.
- `robots.txt` на project-сайте (`/ostov-architects/robots.txt`) поисковики не читают, им нужен корень домена. Файл всё равно генерируется, чтобы с собственным доменом всё работало сразу.

Чтобы задеплоить свою копию, включите в репозитории Settings → Pages → Source: GitHub Actions и запушьте в `main`.

## Структура

```
app/(ru)/, app/en/     две корневые раскладки и однострочные страницы
components/views/      страницы целиком (серверные)
components/motion/     движок анимаций (грузится лениво) и события для связи с ним
lib/content.ts         выбор источника: Strapi или снапшот
lib/strapi.ts          REST-клиент Strapi v5, populate, маппинг, zod
lib/types.ts           доменные схемы
lib/images.ts          ширины/форматы, общие для пайплайна и <Picture>
scripts/               build-images, snapshot, fix-export-segments
content/, media/       JSON-снапшот и оригиналы фото
cms/                   Strapi v5: схемы, компоненты, bootstrap (локали, права, сид)
```

## Фото

Все фотографии с [Unsplash](https://unsplash.com) и используются по [лицензии Unsplash](https://unsplash.com/license). Оригиналы лежат в `media/originals`, полный список с идентификаторами — в `media/credits.json`. Здания на снимках к вымышленному бюро отношения не имеют.

| Автор | Снимки |
|---|---|
| [Declan Sun](https://unsplash.com/@declansun) | [hero-grove-house](https://unsplash.com/photos/a-couple-of-buildings-sitting-on-top-of-a-lush-green-field-GPsoLgDYnzI), [grove-house-cover](https://unsplash.com/photos/a-house-with-a-curved-roof-and-a-red-door-ijIZSAqC4Q8), [grove-house-01](https://unsplash.com/photos/a-concrete-structure-sitting-in-the-middle-of-a-forest-6TOjFoZQs_E), [grove-house-02](https://unsplash.com/photos/a-building-that-has-a-door-on-the-outside-of-it-E1V_SFxmh1E), [grove-house-03](https://unsplash.com/photos/a-walkway-leading-to-a-building-with-a-pond-in-front-of-it-cZVpLNvo4Rc), [grove-house-04](https://unsplash.com/photos/a-building-that-has-a-clock-on-the-side-of-it-OzBTIBGlLGs) |
| [Clay Banks](https://unsplash.com/@claybanks) | [valdai-aframe-cover](https://unsplash.com/photos/modern-a-frame-living-room-with-forest-view-oIx5RmkC9Ow), [valdai-aframe-01](https://unsplash.com/photos/modern-a-frame-interior-with-living-area-and-kitchen--YpK33yZ3gQ), [valdai-aframe-02](https://unsplash.com/photos/modern-living-room-with-geometric-window-and-forest-view-SBFfV6cNe-Y), [valdai-aframe-03](https://unsplash.com/photos/modern-kitchen-with-a-view-of-a-forest-C86plNQ9wLk), [valdai-aframe-04](https://unsplash.com/photos/cozy-dining-nook-with-window-view-of-forest-6V-ytvmYMtI) |
| [George Dagerotip](https://unsplash.com/@dagerotip) | [embankment-library-cover](https://unsplash.com/photos/a-room-with-a-lot-of-tables-and-chairs-mIH5oVXEFxc) |
| [Omair Parvez](https://unsplash.com/@omair_parvez) | [embankment-library-01](https://unsplash.com/photos/brown-wooden-book-shelves-in-library-o6ka1Lpk81U) |
| [Alexei Maridashvili](https://unsplash.com/@lexoge) | [embankment-library-02](https://unsplash.com/photos/man-in-black-jacket-standing-near-brown-wooden-book-shelves-VeNJNwCux6Y) |
| [zero take](https://unsplash.com/@zerotake) | [embankment-library-03](https://unsplash.com/photos/a-large-book-shelf-filled-with-lots-of-books-ZEzO1kaaYrY) |
| [Stefan Spassov](https://unsplash.com/@stefanspassov) | [light-pavilion-cover](https://unsplash.com/photos/interior-view-of-white-building-k87dHceae1w) |
| [Emma Raphael](https://unsplash.com/@bavariansojourn) | [light-pavilion-01](https://unsplash.com/photos/empty-stairway-inside-building-ttS--i2y9Bo) |
| [untldshots](https://unsplash.com/@rajabbarack) | [light-pavilion-02](https://unsplash.com/photos/a-person-sitting-on-a-bench-in-front-of-paintings-yOA8wavQ9Ac) |
| [bady abbas](https://unsplash.com/@bady) | [light-pavilion-03](https://unsplash.com/photos/white-concrete-building-facade-pattern-hxi_yRxODNc) |
| [Simone Hutsch](https://unsplash.com/@heysupersimi) | [light-pavilion-04](https://unsplash.com/photos/gray-concrete-monolith-ItvVUpgac0o) |
| [Deconovo](https://unsplash.com/@deconovo) | [arch-apartment-cover](https://unsplash.com/photos/white-sofa-near-round-table-eNHZC6dEi0Y), [arch-apartment-01](https://unsplash.com/photos/white-and-brown-spiral-staircase-5l6PTBM2smI), [arch-apartment-02](https://unsplash.com/photos/white-and-brown-wooden-staircase-JlHYZil96lQ) |
| [Alesia Kazantceva](https://unsplash.com/@alesiaskaz) | [arch-apartment-03](https://unsplash.com/photos/minimalist-concrete-staircase-with-vase-0B7ijYKaKcE) |
| [Prydumano Design](https://unsplash.com/@prydumanodesign) | [presnya-apartment-cover](https://unsplash.com/photos/a-modern-living-room-with-a-large-window-vIbxvHj9m9g), [presnya-apartment-01](https://unsplash.com/photos/a-living-room-with-a-couch-and-a-table-4Q9aOJF-6vI), [presnya-apartment-02](https://unsplash.com/photos/a-modern-living-room-with-a-large-window-6ybDmGNE2Yg) |
| [Alina Bondar](https://unsplash.com/@alinabondar_ph) | [presnya-apartment-03](https://unsplash.com/photos/wicker-chair-with-metal-legs-on-a-wooden-floor-DJ3dx5MoUIw) |
| [Mathilde Langevin](https://unsplash.com/@mathildelangevin) | [presnya-apartment-04](https://unsplash.com/photos/white-and-brown-window-curtain-LdPzzJcrPLM) |
| [uve sanchez](https://unsplash.com/@uvesanchez) | [about-concrete](https://unsplash.com/photos/grayscale-photography-of-concrete-blocks-9DRX_cW48RQ) |
