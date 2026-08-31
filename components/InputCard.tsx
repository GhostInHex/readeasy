"use client";

import { useState } from "react";
import type { TransformRequest } from "@/lib/types";

type Tab = "url" | "raw";

interface InputCardProps {
  onTransform: (request: TransformRequest) => void;
  busy: boolean;
}

export default function InputCard({ onTransform, busy }: InputCardProps) {
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");

  function submit() {
    if (tab === "url") {
      onTransform({ url: url.trim() });
    } else {
      onTransform({ rawText: rawText.trim() });
    }
  }

  const canSubmit = tab === "url" ? url.trim().length > 0 : rawText.trim().length > 0;

  return (
    <section className="card input-card" aria-labelledby="input-card-heading">
      <h2 id="input-card-heading" className="sr-only">
        Choose what to transform
      </h2>

      <div className="tabs" role="tablist" aria-label="Input type">
        <button
          type="button"
          role="tab"
          id="tab-url"
          aria-selected={tab === "url"}
          aria-controls="panel-url"
          className={tab === "url" ? "tab tab-active" : "tab"}
          onClick={() => setTab("url")}
        >
          URL
        </button>
        <button
          type="button"
          role="tab"
          id="tab-raw"
          aria-selected={tab === "raw"}
          aria-controls="panel-raw"
          className={tab === "raw" ? "tab tab-active" : "tab"}
          onClick={() => setTab("raw")}
        >
          Raw text
        </button>
      </div>

      {tab === "url" ? (
        <div role="tabpanel" id="panel-url" aria-labelledby="tab-url">
          <label htmlFor="url-input">Page URL</label>
          <input
            id="url-input"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc"
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSubmit && !busy) submit();
            }}
          />
          <p className="hint">
            Some sites block automated fetching. If a page will not load, switch to Raw text and paste it.
          </p>
        </div>
      ) : (
        <div role="tabpanel" id="panel-raw" aria-labelledby="tab-raw">
          <label htmlFor="raw-input">Page text</label>
          <textarea
            id="raw-input"
            rows={8}
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder="Paste the text of the page here."
          />
          <p className="hint">Pasted text skips fetching and goes straight to ReadEasy.</p>
        </div>
      )}

      <button type="button" className="primary" onClick={submit} disabled={busy || !canSubmit}>
        {busy ? "Transforming…" : "Transform"}
      </button>
    </section>
  );
}
