import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TaskOn Embed SDK",
  description:
    "White-label TaskOn service SDK - Simple integration of TaskOn into your website",
  lang: "en-US",
  base: "/taskon-embed/", // GitHub repository name

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/guide/getting-started" },
      { text: "API Reference", link: "/api/" },
      {
        text: "Examples",
        link: "https://github.com/Taskon-xyz/whitelabel-demo-rainbowkit",
      },
      { text: "GitHub", link: "https://github.com/Taskon-xyz/taskon-embed" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            {
              text: "What is TaskOn Embed",
              link: "/guide/what-is-taskon-embed",
            },
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Configuration", link: "/guide/configuration" },
            { text: "Authentication", link: "/guide/authentication" },
            { text: "Event Handling", link: "/guide/events" },
            { text: "Error Handling", link: "/guide/error-handling" },
            { text: "Best Practices", link: "/guide/best-practices" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Overview", link: "/api/" },
            { text: "TaskOnEmbed Class", link: "/api/taskon-embed" },
            { text: "Type Definitions", link: "/api/types" },
            { text: "Utility Functions", link: "/api/utils" },
            { text: "Conversion Analytics", link: "/api/analytics" },
            { text: "Error Types", link: "/api/errors" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Taskon-xyz/taskon-embed" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024 TaskOn",
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern:
        "https://github.com/Taskon-xyz/taskon-embed/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },

    lastUpdated: {
      text: "Last updated",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
  },

  markdown: {
    theme: "github-dark",
    lineNumbers: true,
  },

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#646cff" }],
  ],

  ignoreDeadLinks: true,
});
