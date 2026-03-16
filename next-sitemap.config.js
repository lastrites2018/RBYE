/** @type {import('next-sitemap').IConfig} */
const fs = require("fs");
const path = require("path");

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
    return {
      loc,
      changefreq: loc === "/" ? "daily" : loc.startsWith("/t/") ? "daily" : "weekly",
      priority:
        loc === "/" ? 1.0 : loc === "/t/pm" ? 0.8 : loc === "/stats" || loc === "/skillset" ? 0.9 : 0.9,
      lastmod,
    };
  },
  additionalPaths: async () => [
    {
      loc: "/t/frontend",
      changefreq: "daily",
      priority: 0.9,
      lastmod,
    },
    {
      loc: "/t/nodejs",
      changefreq: "daily",
      priority: 0.9,
      lastmod,
    },
    {
      loc: "/t/server",
      changefreq: "daily",
      priority: 0.9,
      lastmod,
    },
    {
      loc: "/t/pm",
      changefreq: "weekly",
      priority: 0.8,
      lastmod,
    },
    {
      loc: "/stats",
      changefreq: "weekly",
      priority: 0.9,
      lastmod,
    },
    {
      loc: "/skillset",
      changefreq: "weekly",
      priority: 0.9,
      lastmod,
    },
  ],
};
