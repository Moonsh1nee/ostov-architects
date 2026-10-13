import { projectPage } from "@/lib/pages";

const page = projectPage("ru");

// Static export: only slugs known at build time exist.
export const dynamicParams = false;
export default page.Page;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
