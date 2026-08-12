/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./code-gigs/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(212 96% 40%)",
        background: "#0f172a",
        foreground: "#0b1120",
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#f9fafb"
        },
        muted: {
          DEFAULT: "#0b1220",
          foreground: "#9ca3af"
        },
        card: {
          DEFAULT: "#020617",
          foreground: "#e5e7eb"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      }
    }
  },
  plugins: []
};
