// @ts-expect-error defineAppConfig is auto-imported by Nuxt
export default defineAppConfig({
  ui: {
    primary: "amber",
    neutral: "zinc",

    notifications: {
      position: "top-0 bottom-auto",
    },

    button: {
      base: "font-bold",
      default: {
        color: "primary",
      },
    },
  },
});
