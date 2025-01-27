import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        "thd-brand": "#F96302",
        "thd-brand-hover": "#C24E04",
      },
      minWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
      },
      rotate: {
        "card-1": "-20deg",
        "card-2": "-15deg",
        "card-3": "-10deg",
        "card-4": "-5deg",
        "card-5": "0deg",
        "card-6": "5deg",
        "card-7": "10deg",
        "card-8": "15deg",
        "card-9": "20deg",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }: { addUtilities: any }) => {
      addUtilities({
        ".scrollbar-none": {
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "scrollbar-width": "none",
        },
      });
    }),
  ],
} satisfies Config;
