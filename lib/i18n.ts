import type { Category, Locale } from "./types";

const ru = {
  brand: "Ostov Architects",
  brandShort: "Остов",
  tagline: "Архитектурное бюро",
  city: "Москва",
  since: "с 2011",
  nav: { projects: "Проекты", about: "О бюро", contacts: "Контакты" },
  menu: { open: "Меню", close: "Закрыть" },
  skipLink: "Перейти к содержанию",
  switchTo: "English version",
  categories: { residential: "Жилые", public: "Общественные", interior: "Интерьеры" } satisfies Record<Category, string>,
  categorySingular: { residential: "Жилой дом", public: "Общественное здание", interior: "Интерьер" } satisfies Record<
    Category,
    string
  >,
  all: "Все",
  home: {
    scroll: "Листайте вниз",
    featured: "Избранные проекты",
    allProjects: "Все проекты",
    manifestoLabel: "Манифест",
    statsLabel: "Бюро в цифрах",
  },
  projects: {
    title: "Проекты",
    lead: "Дома, общественные здания и интерьеры, которые мы спроектировали и довели до стройки.",
    filterLabel: "Категория",
    empty: "В этой категории пока нет проектов.",
  },
  project: {
    specs: { location: "Локация", year: "Год", area: "Площадь", category: "Тип" },
    sqm: "м²",
    gallery: "Галерея",
    next: "Следующий проект",
    back: "Все проекты",
  },
  about: {
    title: "О бюро",
    approach: "Подход",
    team: "Команда",
    stages: "Как мы работаем",
    stage: "Этап",
  },
  contacts: {
    title: "Контакты",
    lead: "Расскажите о задаче — мы ответим в течение двух рабочих дней.",
    address: "Адрес",
    addressValue: "Москва, Хохловский переулок, 7, стр. 2",
    email: "Почта",
    phone: "Телефон",
    hours: "Часы работы",
    hoursValue: "Пн–Пт, 10:00–19:00",
    form: {
      title: "Обсудить проект",
      name: "Имя",
      email: "Почта",
      phone: "Телефон",
      phoneHint: "Необязательно",
      type: "Тип проекта",
      typePlaceholder: "Выберите",
      message: "Задача",
      messageHint: "Участок или объект, площадь, сроки",
      consent: "Согласен на обработку персональных данных",
      submit: "Отправить",
      demoNote: "Это демо-сайт: форма проверяет поля, но ничего не отправляет.",
      success: "Спасибо! Форма заполнена верно. В демо-версии письмо никуда не уходит.",
      reset: "Заполнить снова",
      errors: {
        nameRequired: "Как к вам обращаться?",
        emailRequired: "Укажите почту",
        emailInvalid: "Похоже, в адресе опечатка",
        phoneInvalid: "Номер должен содержать от 10 до 15 цифр",
        typeRequired: "Выберите тип проекта",
        messageShort: "Опишите задачу хотя бы в 20 символах",
        consentRequired: "Нужно согласие, чтобы мы могли ответить",
      },
    },
  },
  footer: {
    cta: "Есть участок или помещение?",
    ctaLink: "Обсудить проект",
    rights: "Демо-проект. Бюро и проекты вымышлены, фото — Unsplash.",
  },
  notFound: { title: "Страница не найдена", back: "На главную" },
  meta: {
    homeTitle: "Ostov Architects — архитектурное бюро",
    homeDescription:
      "Архитектурное бюро из Москвы: частные дома, общественные здания и интерьеры. Начинаем с конструкции и света.",
    projectsDescription: "Жилые дома, общественные здания и интерьеры бюро Ostov Architects.",
    aboutDescription: "Подход, команда и этапы работы архитектурного бюро Ostov Architects.",
    contactsDescription: "Адрес, телефон и форма для обсуждения проекта с бюро Ostov Architects.",
    ogLocale: "ru_RU",
  },
};

export type Dictionary = typeof ru;

const en: Dictionary = {
  brand: "Ostov Architects",
  brandShort: "Ostov",
  tagline: "Architecture practice",
  city: "Moscow",
  since: "since 2011",
  nav: { projects: "Projects", about: "Studio", contacts: "Contact" },
  menu: { open: "Menu", close: "Close" },
  skipLink: "Skip to content",
  switchTo: "Русская версия",
  categories: { residential: "Residential", public: "Public", interior: "Interiors" },
  categorySingular: { residential: "Residential", public: "Public building", interior: "Interior" },
  all: "All",
  home: {
    scroll: "Scroll down",
    featured: "Selected projects",
    allProjects: "All projects",
    manifestoLabel: "Manifesto",
    statsLabel: "The studio in numbers",
  },
  projects: {
    title: "Projects",
    lead: "Houses, public buildings and interiors we have designed and carried through to construction.",
    filterLabel: "Category",
    empty: "No projects in this category yet.",
  },
  project: {
    specs: { location: "Location", year: "Year", area: "Area", category: "Type" },
    sqm: "m²",
    gallery: "Gallery",
    next: "Next project",
    back: "All projects",
  },
  about: {
    title: "Studio",
    approach: "Approach",
    team: "Team",
    stages: "How we work",
    stage: "Stage",
  },
  contacts: {
    title: "Contact",
    lead: "Tell us about your project and we will reply within two working days.",
    address: "Address",
    addressValue: "7 Khokhlovsky Lane, bldg. 2, Moscow",
    email: "Email",
    phone: "Phone",
    hours: "Office hours",
    hoursValue: "Mon–Fri, 10:00–19:00",
    form: {
      title: "Start a project",
      name: "Name",
      email: "Email",
      phone: "Phone",
      phoneHint: "Optional",
      type: "Project type",
      typePlaceholder: "Choose one",
      message: "Brief",
      messageHint: "Site or building, floor area, timeline",
      consent: "I agree to the processing of my personal data",
      submit: "Send",
      demoNote: "This is a demo site: the form validates its fields but sends nothing.",
      success: "Thank you! The form is valid. In this demo, nothing is actually sent.",
      reset: "Fill in again",
      errors: {
        nameRequired: "What should we call you?",
        emailRequired: "Please enter your email",
        emailInvalid: "That address looks mistyped",
        phoneInvalid: "The number should have 10 to 15 digits",
        typeRequired: "Please choose a project type",
        messageShort: "Please describe the project in at least 20 characters",
        consentRequired: "We need your consent to reply",
      },
    },
  },
  footer: {
    cta: "Have a site or a space?",
    ctaLink: "Start a project",
    rights: "Demo project. The studio and its projects are fictional; photos from Unsplash.",
  },
  notFound: { title: "Page not found", back: "Back home" },
  meta: {
    homeTitle: "Ostov Architects — architecture practice",
    homeDescription:
      "A Moscow architecture practice designing private houses, public buildings and interiors, starting from structure and light.",
    projectsDescription: "Residential, public and interior projects by Ostov Architects.",
    aboutDescription: "The approach, team and working process of Ostov Architects.",
    contactsDescription: "Address, phone and a form to discuss your project with Ostov Architects.",
    ogLocale: "en_US",
  },
};

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

export const contact = {
  email: "studio@ostov.example",
  phone: "+7 495 000-00-00",
  phoneHref: "tel:+74950000000",
} as const;

const PLURAL_FORMS: Record<Locale, Partial<Record<Intl.LDMLPluralRule, string>>> = {
  ru: { one: "проект", few: "проекта", many: "проектов", other: "проекта" },
  en: { one: "project", other: "projects" },
};

export function projectCount(n: number, locale: Locale): string {
  const rule = new Intl.PluralRules(locale).select(n);
  return `${n} ${PLURAL_FORMS[locale][rule] ?? PLURAL_FORMS[locale].other}`;
}

export function formatArea(area: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(area);
}
