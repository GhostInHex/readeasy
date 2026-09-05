"use client";

import { useState } from "react";
import HistoryList from "@/components/HistoryList";
import { CACHED_PAGES } from "@/lib/fixtures";
import { recordVisit } from "@/lib/history";
import type { TransformRequest } from "@/lib/types";

type Tab = "url" | "raw";

interface InputCardProps {
  onTransform: (request: TransformRequest) => void;
  busy: boolean;
  /** True while a page is open and the reader has not asked for the box back. */
  folded: boolean;
}

/**
 * The saved pages, offered as a starting point. A first-time reader arriving at an empty field has to
 * invent a URL before they can see what the product does; three real pages remove that step, and they
 * are the same pages the demo is recorded on, so what a visitor tries is what the video shows.
 */
const STARTERS = CACHED_PAGES.filter((page) => page.role === "trio");

export default function InputCard({ onTransform, busy, folded }: InputCardProps) {
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [visits, setVisits] = useState(0);

  function run(request: TransformRequest) {
    // Recorded on the way out, not on the way back: the transformed page belongs to the workspace
    // above, and the address is all an entry needs. A pasted page has no address to return to, so
    // recordVisit ignores it; a page that fails to load still lists, because retrying it is a click
    // and a reader can remove the row.
    recordVisit(window.localStorage, request);
    setVisits((count) => count + 1);
    onTransform(request);
  }

  function submit() {
    run(tab === "url" ? { url: url.trim() } : { rawText: rawText.trim() });
  }

  const canSubmit = tab === "url" ? url.trim().length > 0 : rawText.trim().length > 0;

  return (
    <div className="transform-box" id="transform-box" hidden={folded}>
      <section className="card input-card" aria-labelledby="input-card-heading">
        <h2 id="input-card-heading" className="input-card-heading">
          Give ReadEasy a page
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
            A page link
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
          <div className="input-field" role="tabpanel" id="panel-url" aria-labelledby="tab-url">
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
          <div className="input-field" role="tabpanel" id="panel-raw" aria-labelledby="tab-raw">
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

        <div className="input-actions">
          <button type="button" className="primary" onClick={submit} disabled={busy || !canSubmit}>
            {busy ? "Transforming…" : "Transform this page"}
          </button>

          {STARTERS.length > 0 && (
            <div className="starters">
              <span className="starters-label" id="starters-label">
                Or open a page ReadEasy has already saved
              </span>
              <ul className="starters-list" aria-labelledby="starters-label">
                {STARTERS.map((page) => (
                  <li key={page.slug}>
                    <button
                      type="button"
                      className="chip"
                      title={page.label}
                      disabled={busy}
                      onClick={() => {
                        setTab("url");
                        setUrl(page.url);
                        run({ url: page.url });
                      }}
                    >
                      {page.label.split(" — ")[0]}
                      <span className="sr-only">: {page.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* The list records its own visits, so it gets the bare transform rather than `run`. */}
      <HistoryList onOpen={onTransform} busy={busy} changeCount={visits} />
    </div>
  );
}
