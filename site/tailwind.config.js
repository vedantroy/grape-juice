module.exports = {
  mode: "jit",
  content: ["./app/**/*.{jsx,tsx}"],
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
