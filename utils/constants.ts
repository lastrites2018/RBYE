const siteMeta = require("./siteMeta");

export type SitePageType = "job" | "stats" | "skillset" | "settings";
export type SpecialPageType = Exclude<SitePageType, "job">;

export interface CategoryMeta {
  key: string;
  label: string;
  route: string;
  pageTitle: string;
  heading: string;
  description: string;
  breadcrumbLabel: string;
  sitemap: {
    changefreq: string;
    priority: number;
  };
}

export interface CategoryOption {
  key: string;
  label: string;
  route: string;
}

export interface PageMeta {
  route: string;
  pageTitle: string;
  heading: string;
  description: string;
  sectionLabel: string;
  breadcrumbLabel: string;
  searchTargetPath: string;
  sitemap?: {
    changefreq: string;
    priority: number;
  };
  categoryMeta?: CategoryMeta;
}

export interface SitemapEntry {
  loc: string;
  changefreq: string;
  priority: number;
}

export const VALID_TYPES: string[] = siteMeta.VALID_TYPES;
export const CATEGORY_META: Record<string, CategoryMeta> = siteMeta.CATEGORY_META;
export const CATEGORY_OPTIONS: CategoryOption[] = siteMeta.CATEGORY_OPTIONS;
export const CATEGORY_LABELS: Record<string, string> = siteMeta.CATEGORY_LABELS;
export const PAGE_META: Record<SpecialPageType, PageMeta> = siteMeta.PAGE_META;

export const getCategoryMeta = (type?: string): CategoryMeta => siteMeta.getCategoryMeta(type);
export const getPageMeta = (pageType: SitePageType, type?: string): PageMeta => siteMeta.getPageMeta(pageType, type);
export const getCategorySitemapEntries = (): SitemapEntry[] => siteMeta.getCategorySitemapEntries();
export const getSitemapMeta = (loc: string): { changefreq: string; priority: number } => siteMeta.getSitemapMeta(loc);
