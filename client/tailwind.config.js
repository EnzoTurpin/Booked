/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#ebf5ff",
          100: "#e1effe",
          200: "#c3ddfd",
          300: "#a4cafe",
          400: "#76a9fa",
          500: "#3f83f8",
          600: "#1c64f2",
          700: "#1a56db",
          800: "#1e429f",
          900: "#233876",
        },
        indigo: {
          50: "#f0f5ff",
          100: "#e5edff",
          200: "#cddbfe",
          300: "#b4c6fc",
          400: "#8da2fb",
          500: "#6875f5",
          600: "#5850ec",
          700: "#5145cd",
          800: "#42389d",
          900: "#362f78",
        },
        purple: {
          50: "#f6f5ff",
          100: "#edebfe",
          200: "#dcd7fe",
          300: "#cabffd",
          400: "#ac94fa",
          500: "#9061f9",
          600: "#7e3af2",
          700: "#6c2bd9",
          800: "#5521b5",
          900: "#4a1d96",
        },
      },
      boxShadow: {
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
