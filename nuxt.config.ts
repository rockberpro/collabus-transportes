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
    '@nuxt/devtools',
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
    "nuxt-auth-utils",
  ],
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
  
  // Configure nuxt-auth-utils for development with LAN access
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'collabus-dev-secret-password-min-32-chars-long-for-secure',
      cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
