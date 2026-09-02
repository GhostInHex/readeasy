import ThemeSwitch from "@/components/ThemeSwitch";

/**
 * The app header: the wordmark, and the theme switch a light-sensitive reader needs before they read
 * anything. Deliberately thin — this product's first viewport belongs to the demonstration below it,
 * not to chrome.
 */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="/">
        <span className="wordmark-read">Read</span>
        <span className="wordmark-easy">Easy</span>
      </a>
      <ThemeSwitch />
    </header>
  );
}
