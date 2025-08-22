// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    port: 3000,
    host: "0.0.0.0",
    https: false,
  },
  ssr: false,
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui-pro",
    "@nuxtjs/supabase",
  ],
  supabase: {
    redirectOptions: {
      login: "sign-in",
      callback: "/confirm",
      exclude: ["/sign-in", "/sign-up", "/"],
    },
  },
  fonts: {
    families: [
      {
        name: "Montserrat",
        provider: "google",
        weights: ["300", "400", "500", "600", "700"],
        styles: ["normal", "italic"],
      },
    ],
  },
  css: ["~/assets/css/main.css"],
});
