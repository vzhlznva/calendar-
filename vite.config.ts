import { PluginOption, defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";

import Pages from "vite-plugin-pages";
import Components from "unplugin-vue-components/vite";
import Layouts from "vite-plugin-vue-layouts";

import path from "path";

import { VitePWA } from "vite-plugin-pwa";

const SILENT = Boolean(process.env.SILENT) ?? false;

// https://vitejs.dev/config/
export default defineConfig({
  root: process.cwd(),
  base: "/calendar-/",
  publicDir: "public",
  logLevel: SILENT ? "error" : "info",

  optimizeDeps: {
    include: ["@vueuse/core", "@vueuse/head", "vue-i18n", "moment"],
  },
  resolve: {
    alias: [
      {
        find: "/~/",
        replacement: `/src/assets/`,
      },
      {
        find: "/@src/",
        replacement: `/src/`,
      },
    ],
  },
  plugins: [
    Vue({
      include: [/\.vue$/],
      template: {
        compilerOptions: {},
      },
    }),

    Pages({
      dirs: [
        {
          dir: "src/pages",
          baseRoute: "",
        },
      ],
    }),

    Layouts({
      layoutsDirs: "src/layouts",
      defaultLayout: "default",
    }),

    Components({
      dirs: ["src/components", "src/layouts"],
      extensions: ["vue", "md", "mjs.map"],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.js$/],
    }),

    VitePWA({
      base: process.env.NODE_ENV === "production" ? "/calendar-/" : "/",
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "robots.txt"],
      manifest: {
        name: "Calendar App",
        short_name: "Calendar",
        start_url: "/calendar-/?utm_source=pwa",
        scope: "/calendar-/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/calendar-/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
        ],
      },
      workbox: {
        swDest: "dist/sw.js",
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        globIgnores: [],
      },
    }),
  ],
});
