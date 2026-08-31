"use client";

import { useState } from "react";

export default function InputCard() {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function transform() {
    setStatus("loading");
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, rawText })
      });
      if (!response.ok) throw new Error("Transform failed");
      await response.json();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="card">
      <div className="tabs">
        <button type="button">URL</button>
        <button type="button">Raw text</button>
      </div>
      <input
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Paste a page URL"
        aria-label="Page URL"
      />
      <textarea
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        placeholder="Or paste page text here"
        aria-label="Raw page text"
      />
      <button type="button" onClick={transform} disabled={status === "loading"}>
        {status === "loading" ? "Transforming..." : "Transform"}
      </button>
      {status === "done" && <p role="status">Transform complete.</p>}
      {status === "error" && <p role="alert">Transform failed. Please try again.</p>}
    </section>
  );
}
