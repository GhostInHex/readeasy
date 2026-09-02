import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Literata } from "next/font/google";
import { PREFERENCES_STORAGE_KEY, THEME_ATTRIBUTE, DEFAULT_PREFERENCES } from "@/lib/preferences";
import "./globals.css";

/**
 * Both faces are downloaded at build time and served from our own origin, so the app makes no
 * runtime request to Google and the cached demo works with the network off.
 */
const body = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-atkinson"
});

const heading = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-literata"
});

export const metadata: Metadata = {
  title: "ReadEasy",
  description: "The web, made readable for every reader."
};

/**
 * Applies the stored theme before the first paint.
 *
 * A React effect cannot do this job: it runs after the browser has already painted, so a reader who
 * chose dark would get a bright cream flash on every page load — the exact thing someone with light
 * sensitivity picked dark to avoid. Reading one localStorage key synchronously costs under a
 * millisecond and removes the flash entirely. Anything unreadable falls through to the default.
 */
const themeBootScript = `
try {
  var stored = localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)});
  var theme = stored ? JSON.parse(stored).theme : null;
  document.documentElement.setAttribute(
    ${JSON.stringify(THEME_ATTRIBUTE)},
    theme === "dark" || theme === "light" ? theme : ${JSON.stringify(DEFAULT_PREFERENCES.theme)}
  );
} catch (e) {
  document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, ${JSON.stringify(DEFAULT_PREFERENCES.theme)});
}
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_PREFERENCES.theme}
      className={`${body.variable} ${heading.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
