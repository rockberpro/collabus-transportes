// @ts-expect-error defineAppConfig is auto-imported by Nuxt
export default defineAppConfig({
  ui: {
    primary: "amber",
    neutral: "zinc",

    button: {
      base: "font-bold",
      default: {
        color: "primary",
      },
    },
  },
});
