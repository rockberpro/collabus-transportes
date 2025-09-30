// @ts-expect-error defineAppConfig is auto-imported by Nuxt
export default defineAppConfig({
  ui: {
    colors: {
      primary: "amber",
      secondary: "teal",
      neutral: "zinc",
    },
    button: {
      base: "font-bold",
      default: {
        color: "primary",
      },
    },
  },
});
