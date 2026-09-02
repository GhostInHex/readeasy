"use client";

import { useState } from "react";
import HistoryList from "@/components/HistoryList";
import { recordVisit } from "@/lib/history";
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
  const [visits, setVisits] = useState(0);

  function submit() {
    const request: TransformRequest = tab === "url" ? { url: url.trim() } : { rawText: rawText.trim() };

    // Recorded on the way out, not on the way back: the transformed page belongs to the workspace
    // above, and the address is all an entry needs. A pasted page has no address to return to, so
    // recordVisit ignores it; a page that fails to load still lists, because retrying it is a click
    // and a reader can remove the row.
    recordVisit(window.localStorage, request);
    setVisits((count) => count + 1);
    onTransform(request);
  }

  const canSubmit = tab === "url" ? url.trim().length > 0 : rawText.trim().length > 0;

  return (
    <>
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

      <HistoryList onOpen={onTransform} busy={busy} changeCount={visits} />
    </>
  );
}
