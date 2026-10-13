import { getProjects } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { PageHeader } from "../PageHeader";
import { ProjectsExplorer } from "../ProjectsExplorer";

export async function ProjectsView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const projects = await getProjects(locale);
  return (
    <div className="container-x pb-32 md:pb-48">
      <PageHeader title={t.projects.title} lead={t.projects.lead} meta={String(projects.length).padStart(2, "0")} />
      <ProjectsExplorer projects={projects} locale={locale} />
    </div>
  );
}
