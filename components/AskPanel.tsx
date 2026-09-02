"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import styles from "@/components/AskPanel.module.css";
import { suggestedQuestionsFor } from "@/lib/ask-cache";
import type { AskRequest, AskResponse, AskSource, AskSuccess } from "@/lib/ask";

interface AskPanelProps {
  /** The page's cleaned text — the only material an answer may be built from. */
  cleanedOriginal: string;
  /** Present for URL transforms; how a Cached page is recognised. */
  sourceUrl?: string;
  /** The page's title, sent as context for the answer. */
  title?: string;
}

/** What each answering path is called in front of a reader: provenance, in one plain line. */
const SOURCE_NOTE: Record<AskSource, string> = {
  cache: "A saved answer for this cached page — no network needed.",
  model: "Answered from this page's text only.",
  page: "Quoted from this page, word for word."
};

/** The route enforces the same ceiling. Stopping here keeps a reader from typing into a rejection. */
const MAX_QUESTION_CHARS = 300;

/** Keeps the request small on very long pages; the route truncates again before any model sees it. */
const MAX_CONTEXT_CHARS = 24_000;

interface AnswerBlock {
  kind: "text" | "list";
  lines: string[];
}

/** An answer is short sentences, with "- " lines where the page's own answer was a list. */
function answerBlocks(answer: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];

  for (const line of answer.split("\n").map((entry) => entry.trim()).filter(Boolean)) {
    const item = line.startsWith("- ");
    const kind = item ? "list" : "text";
    const open = blocks[blocks.length - 1];

    if (open?.kind === kind) {
      open.lines.push(item ? line.slice(2) : line);
    } else {
      blocks.push({ kind, lines: [item ? line.slice(2) : line] });
    }
  }

  return blocks;
}

/**
 * The question box under the ReadEasy version. It sends the page's own cleaned text with every
 * question, so an answer can only ever be built from the page on screen — the route never fetches.
 * A Cached page's three suggested questions are answered from the bundle, with no key and no network.
 */
export default function AskPanel({ cleanedOriginal, sourceUrl, title }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [result, setResult] = useState<AskSuccess | null>(null);
  const [error, setError] = useState<{ message: string; hint: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const suggestions = useMemo(() => suggestedQuestionsFor({ url: sourceUrl }), [sourceUrl]);

  // A new page is a new conversation: the last page's answer must never linger over this one.
  useEffect(() => {
    setQuestion("");
    setAsked("");
    setResult(null);
    setError(null);
  }, [cleanedOriginal, sourceUrl]);

  async function ask(candidate: string): Promise<void> {
    const trimmed = candidate.trim();
    if (!trimmed || busy) {
      return;
    }

    setBusy(true);
    setAsked(trimmed);
    setResult(null);
    setError(null);

    const body: AskRequest = {
      question: trimmed,
      rawText: cleanedOriginal.slice(0, MAX_CONTEXT_CHARS),
      ...(sourceUrl ? { url: sourceUrl } : {}),
      ...(title ? { title } : {})
    };

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as AskResponse;

      if ("error" in payload) {
        setError({ message: payload.error.message, hint: payload.error.hint });
      } else {
        setResult(payload);
      }
    } catch {
      setError({
        message: "ReadEasy could not reach the answering step.",
        hint: "Check your connection and ask again."
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="ask-heading">
      <h3 id="ask-heading" className={styles.heading}>
        Ask this page
      </h3>
      <p className={styles.lede}>Answers come from this page&rsquo;s own words. Nothing is added.</p>

      <ul className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              className={styles.suggestion}
              disabled={busy}
              onClick={() => {
                setQuestion(suggestion);
                void ask(suggestion);
              }}
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor="ask-question">Your question</label>
        <div className={styles.row}>
          <input
            id="ask-question"
            className={styles.field}
            type="text"
            value={question}
            maxLength={MAX_QUESTION_CHARS}
            autoComplete="off"
            placeholder="What do I have to do?"
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button type="submit" className="primary" disabled={busy || !question.trim()}>
            {busy ? "Asking…" : "Ask"}
          </button>
        </div>
      </form>

      <div className={styles.result} aria-live="polite">
        {busy && <p className={styles.status}>Reading this page for an answer…</p>}

        {!busy && error && (
          <div className="notice notice-error" role="alert">
            <p className="notice-message">{error.message}</p>
            <p className="notice-hint">{error.hint}</p>
          </div>
        )}

        {!busy && !error && result && (
          <article className={styles.answer}>
            <p className={styles.asked}>{asked}</p>
            <div className={styles.body}>
              {answerBlocks(result.answer).map((block, index) =>
                block.kind === "list" ? (
                  <ul key={index}>
                    {block.lines.map((line, position) => (
                      <li key={position}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <Fragment key={index}>
                    {block.lines.map((line, position) => (
                      <p key={position}>{line}</p>
                    ))}
                  </Fragment>
                )
              )}
            </div>
            <p className={styles.note}>{SOURCE_NOTE[result.source]}</p>
          </article>
        )}
      </div>
    </section>
  );
}
