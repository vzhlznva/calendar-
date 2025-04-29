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
  base: "/",
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
      base: "/",
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "robots.txt"],
      manifest: {
        name: "Default",
        short_name: "Default",
        start_url: "/?utm_source=pwa",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "logo.png",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
