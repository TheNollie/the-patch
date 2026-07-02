const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  // ---- Plugins ----
  eleventyConfig.addPlugin(pluginRss);

  // ---- Static passthrough ----
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/ads.txt": "ads.txt" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  // ---- Markdown ----
  eleventyConfig.setLibrary(
    "md",
    markdownIt({ html: true, breaks: false, linkify: true }).use(markdownItAnchor)
  );

  // ---- Filters ----
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat("LLL dd, yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("versionTag", (dateObj) => {
    // Turns a date into a fun "patch version" number, e.g. 2026.7.2
    const d = DateTime.fromJSDate(new Date(dateObj), { zone: "utc" });
    return `v${d.toFormat("yy")}.${d.month}.${d.day}`;
  });

  eleventyConfig.addFilter("excerpt", (content, length = 160) => {
    if (!content) return "";
    const stripped = content.replace(/(<([^>]+)>)/gi, "").replace(/[#*_`>]/g, "");
    return stripped.length > length ? stripped.slice(0, length).trim() + "…" : stripped;
  });

  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // ---- Collections ----
  const byDateDesc = (a, b) => b.date - a.date;

  eleventyConfig.addCollection("news", (api) =>
    api.getFilteredByGlob("src/posts/*.md").filter((p) => p.data.category === "news").sort(byDateDesc)
  );

  eleventyConfig.addCollection("reviews", (api) =>
    api.getFilteredByGlob("src/posts/*.md").filter((p) => p.data.category === "reviews").sort(byDateDesc)
  );

  eleventyConfig.addCollection("opinions", (api) =>
    api.getFilteredByGlob("src/posts/*.md").filter((p) => p.data.category === "opinions").sort(byDateDesc)
  );

  eleventyConfig.addCollection("allPosts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort(byDateDesc)
  );

  eleventyConfig.addCollection("featured", (api) =>
    api.getFilteredByGlob("src/posts/*.md").filter((p) => p.data.featured === true).sort(byDateDesc)
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
