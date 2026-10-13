// Page factories: app/(ru)/** and app/en/** are thin locale bindings of these,
// so each route is defined once and the two locale trees cannot drift apart.
import type { Metadata } from "next";
import { AboutView } from "@/components/views/AboutView";
import { ContactsView } from "@/components/views/ContactsView";
import { HomeView } from "@/components/views/HomeView";
import { ProjectView } from "@/components/views/ProjectView";
import { ProjectsView } from "@/components/views/ProjectsView";
import { getAboutPage, getHomePage, getProject, getProjects } from "./content";
import { getDictionary } from "./i18n";
import { routes } from "./paths";
import { pageMetadata } from "./seo";
import type { Locale } from "./types";

type SlugProps = { params: Promise<{ slug: string }> };

export function homePage(locale: Locale) {
  const t = getDictionary(locale);
  return {
    Page: () => <HomeView locale={locale} />,
    generateMetadata: async (): Promise<Metadata> =>
      pageMetadata({
        locale,
        path: routes.home,
        description: t.meta.homeDescription,
        image: (await getHomePage(locale)).heroImage,
      }),
  };
}

export function projectsPage(locale: Locale) {
  const t = getDictionary(locale);
  return {
    Page: () => <ProjectsView locale={locale} />,
    generateMetadata: async (): Promise<Metadata> => {
      const [first] = await getProjects(locale);
      return pageMetadata({
        locale,
        path: routes.projects,
        title: t.projects.title,
        description: t.meta.projectsDescription,
        image: first?.cover ?? (await getHomePage(locale)).heroImage,
      });
    },
  };
}

export function projectPage(locale: Locale) {
  return {
    Page: async ({ params }: SlugProps) => <ProjectView locale={locale} slug={(await params).slug} />,
    generateStaticParams: async () => (await getProjects(locale)).map(({ slug }) => ({ slug })),
    generateMetadata: async ({ params }: SlugProps): Promise<Metadata> => {
      const project = await getProject(locale, (await params).slug);
      if (!project) return {};
      return pageMetadata({
        locale,
        path: routes.project(project.slug),
        title: project.title,
        description: project.description[0]!,
        image: project.cover,
      });
    },
  };
}

export function aboutPage(locale: Locale) {
  const t = getDictionary(locale);
  return {
    Page: () => <AboutView locale={locale} />,
    generateMetadata: async (): Promise<Metadata> =>
      pageMetadata({
        locale,
        path: routes.about,
        title: t.about.title,
        description: t.meta.aboutDescription,
        image: (await getAboutPage(locale)).image,
      }),
  };
}

export function contactsPage(locale: Locale) {
  const t = getDictionary(locale);
  return {
    Page: () => <ContactsView locale={locale} />,
    generateMetadata: async (): Promise<Metadata> =>
      pageMetadata({
        locale,
        path: routes.contacts,
        title: t.contacts.title,
        description: t.meta.contactsDescription,
        image: (await getHomePage(locale)).heroImage,
      }),
  };
}
