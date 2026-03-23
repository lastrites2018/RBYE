/** @type {import('next-sitemap').IConfig} */
const fs = require("fs");
const path = require("path");
const {
  getCategorySitemapEntries,
  getSitemapMeta,
} = require("./utils/siteMeta");

const getLatestContentModifiedAt = () => {
  const targets = ["stats.json", "timeline.json"];
  const mtimes = targets
    .map((fileName) => path.join(__dirname, "public", fileName))
    .filter((filePath) => fs.existsSync(filePath))
    .map((filePath) => fs.statSync(filePath).mtimeMs);

  if (mtimes.length === 0) {
    return new Date().toISOString();
  }

  return new Date(Math.max(...mtimes)).toISOString();
};

const lastmod = getLatestContentModifiedAt();
const categorySitemapEntries = getCategorySitemapEntries();

module.exports = {
  siteUrl: "https://rbye.vercel.app",
  sourceDir: ".next",
  outDir: "./public",
  generateRobotsTxt: false,
  generateIndexSitemap: false,
  exclude: ["/_next/*", "/api/*", "/settings"],
  changefreq: "weekly",
  priority: 0.8,
  autoLastmod: false,
  transform: async (config, loc) => {
    const sitemapMeta = getSitemapMeta(loc);
    return {
      loc,
      changefreq: sitemapMeta.changefreq,
      priority: sitemapMeta.priority,
      lastmod,
    };
  },
  additionalPaths: async () =>
    categorySitemapEntries.map((entry) => ({
      ...entry,
      lastmod,
    })),
};
