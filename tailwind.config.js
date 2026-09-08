/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // Chart / UI chrome (see dataviz palette reference)
        surface: "#fcfcfb",
        plane: "#f9f9f7",
        ink: {
          primary: "#0b0b0b",
          secondary: "#52514e",
          muted: "#898781",
        },
        hairline: "#e1e0d9",
        baseline: "#c3c2b7",
        // Categorical series slots (fixed order, never cycled)
        series: {
          1: "#2a78d6", // blue
          2: "#eb6834", // orange
          3: "#1baf7a", // aqua
          4: "#eda100", // yellow
          5: "#e87ba4", // magenta
          6: "#008300", // green
          7: "#4a3aa7", // violet
          8: "#e34948", // red
        },
        // Status (fixed, never themed)
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
      },
    },
  },
  plugins: [],
};
