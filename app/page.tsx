import InputCard from "@/components/InputCard";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <h1>ReadEasy</h1>
        <p>The web, made readable for every reader.</p>
      </section>
      <InputCard />
      <section className="split">
        <div className="panel">
          <h2>Original</h2>
          <p>Cleaned source text will appear here.</p>
        </div>
        <div className="panel">
          <h2>ReadEasy</h2>
          <p>Accessible formats will appear here.</p>
        </div>
      </section>
    </main>
  );
}
