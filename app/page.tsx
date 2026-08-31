import Workspace from "@/components/Workspace";

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <h1>ReadEasy</h1>
        <p className="tagline">ReadEasy — the web, made readable for every reader.</p>
        <p className="lede">
          Paste a page link, or the page text itself. ReadEasy clears away the clutter and rewrites what is
          left in plain language, with deadlines pulled out into a simple checklist.
        </p>
      </header>
      <Workspace />
    </main>
  );
}
