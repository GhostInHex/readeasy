import ReadingPreferencesProvider from "@/components/ReadingPreferencesProvider";
import Workspace from "@/components/Workspace";

export default function Home() {
  return (
    <ReadingPreferencesProvider>
      {/* The workspace owns the masthead as well as the page, because the shape of both depends on
          whether a page is open. */}
      <Workspace />
      <footer className="site-footer">
        <p>
          ReadEasy never invents facts. Every sentence it shows you is a rewrite of something the original page
          already said.
        </p>
      </footer>
    </ReadingPreferencesProvider>
  );
}
