/** @type {import('next-sitemap').IConfig} */
const fs = require("fs");
const path = require("path");

const lastModifiedFromStats = () => {
  try {
    const filePath = path.join(__dirname, "public", "stats.json");
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const lastmod = lastModifiedFromStats();

module.exports = {
  siteUrl: "https://rbye.vercel.app",
  sourceDir: ".next",
  outDir: "./public",
  generateRobotsTxt: false,
  exclude: ["/_next/*", "/api/*"],
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
