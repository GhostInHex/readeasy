import Hero from "@/components/Hero";
import SiteHeader from "@/components/SiteHeader";
import ReadingPreferencesProvider from "@/components/ReadingPreferencesProvider";
import Workspace from "@/components/Workspace";

export default function Home() {
  return (
    <ReadingPreferencesProvider>
      <SiteHeader />
      <main className="page">
        <Hero />
        <Workspace />
      </main>
      <footer className="site-footer">
        <p>
          ReadEasy never invents facts. Every sentence it shows you is a rewrite of something the original page
          already said.
        </p>
      </footer>
    </ReadingPreferencesProvider>
  );
}
