/**
 * Seam 3 — the karaoke Listen wiring: real boundary events moving a real highlight.
 *
 * `speech.test.ts` covers the mapping as a pure function. This file covers what the mapping is for:
 * ListenMode mounted in jsdom against a scripted speech engine whose `boundary` events are fired by
 * hand, one word at a time. Only rendered output is asserted — the word that is lit, the passage
 * marked, the status line, the notice — never the component's internals.
 *
 * The engine is scripted rather than real because no headless browser has a voice, and because the
 * point of the ticket is that the highlight follows the events and nothing else: no event, no mark.
 * The last test runs the same component against an engine with no boundary event at all, which is
 * the browser-support fallback.
 */
import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";
import { toSpokenPassages } from "@/lib/speech";
import type { Restructured } from "@/lib/types";

interface SpeechEvent {
  name?: string;
  charIndex: number;
}

type Handler = ((event: SpeechEvent) => void) | null;

/** An utterance that keeps the handlers ListenMode hangs on it, so a test can fire them. */
class FakeUtterance {
  text: string;
  rate = 1;
  onstart: Handler = null;
  onend: Handler = null;
  onboundary: Handler = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Feature detection looks for `onboundary` on the prototype, which is where a browser puts it.
Object.assign(FakeUtterance.prototype, { onboundary: null });

/** An engine with no word boundaries at all — Listen's fallback case. */
class QuietUtterance {
  text: string;
  rate = 1;
  onstart: Handler = null;
  onend: Handler = null;

  constructor(text: string) {
    this.text = text;
  }
}

/** A voice that only queues: the test decides when each word is spoken. */
class FakeSynthesis {
  queue: FakeUtterance[] = [];
  cancelled = 0;

  speak(utterance: FakeUtterance): void {
    this.queue.push(utterance);
  }

  cancel(): void {
    this.queue = [];
    this.cancelled += 1;
  }
}

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: "http://localhost/"
});
const synthesis = new FakeSynthesis();
let scrolled = 0;

dom.window.Element.prototype.scrollIntoView = function scrollIntoView() {
  scrolled += 1;
};

/** Node defines some of these itself, and `navigator` only as a getter, so assignment is not enough. */
function defineGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

/** Which engine the next mount finds on `window`. */
function installEngine(utterance: typeof FakeUtterance | typeof QuietUtterance): void {
  defineGlobal("SpeechSynthesisUtterance", utterance);
  Object.assign(dom.window, { SpeechSynthesisUtterance: utterance });
}

// React reads the DOM from globals, so they are in place before react-dom is loaded.
for (const [name, value] of Object.entries({
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  IS_REACT_ACT_ENVIRONMENT: true
})) {
  defineGlobal(name, value);
}

Object.assign(dom.window, { speechSynthesis: synthesis });
installEngine(FakeUtterance);

// React and the Mode are loaded after those globals exist, not before, so react-dom binds to this
// document. That is also why they are imported here rather than at the top of the file.
let act: typeof import("react").act;
let createElement: typeof import("react").createElement;
let createRoot: typeof import("react-dom/client").createRoot;
let ListenMode: typeof import("@/components/modes/ListenMode").default;

before(async () => {
  const react = await import("react");
  // The test runner compiles this repo's JSX with the classic runtime, because tsconfig keeps
  // `jsx: "preserve"` for Next's own build. Classic output calls a free `React`, so the Mode needs
  // one in scope; Next never does, since it compiles the same file with the automatic runtime.
  defineGlobal("React", react.default ?? react);
  ({ act, createElement } = react);
  ({ createRoot } = await import("react-dom/client"));
  ({ default: ListenMode } = await import("@/components/modes/ListenMode"));
});

const PAGE: Restructured = {
  title: "Work rules for students",
  summary: "Never read aloud: the summary repeats the sections.",
  readingTimeMinutes: 2,
  actionItems: [],
  sections: [
    { heading: "On campus", simplifiedText: "You may work 20 hours a week.", keyTakeaway: "Ask first." },
    { heading: "Off campus", simplifiedText: "Ask your school before you start.", keyTakeaway: "" }
  ]
};

const PASSAGES = toSpokenPassages(PAGE);

/** ListenMode on a fresh root, plus the handful of things a reader can see or do. */
function listen(page: Restructured = PAGE) {
  const container = dom.window.document.createElement("div");
  dom.window.document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(createElement(ListenMode, { restructured: page, source: null })));

  return {
    /** The word highlighted right now, or null when none is. */
    get word(): string | null {
      const marks = container.querySelectorAll("mark.listen-word");
      assert.ok(marks.length <= 1, `${marks.length} words highlighted at once`);
      return marks[0]?.textContent ?? null;
    },
    /** The passage being read, as marked on the page. */
    get reading(): string | null {
      return container.querySelector(".listen-outline li.listen-now")?.textContent ?? null;
    },
    get status(): string {
      return container.querySelector(".listen-status")?.textContent ?? "";
    },
    get passages(): string[] {
      return [...container.querySelectorAll(".listen-outline li")].map((item) => item.textContent ?? "");
    },
    get text(): string {
      return container.textContent ?? "";
    },
    click(label: string): void {
      const button = [...container.querySelectorAll("button")].find((element) =>
        (element.textContent ?? "").includes(label)
      );
      assert.ok(button, `no ${label} button on the page`);
      act(() => button.click());
    },
    /** Speak a passage: what a browser does when it reaches that utterance. */
    start(index: number): void {
      act(() => synthesis.queue[index]?.onstart?.({ charIndex: 0 }));
    },
    boundary(index: number, charIndex: number, name = "word"): void {
      const utterance = synthesis.queue[index];
      assert.ok(utterance, `no utterance ${index} queued`);
      act(() => utterance.onboundary?.({ name, charIndex }));
    },
    finish(): void {
      act(() => synthesis.queue[synthesis.queue.length - 1]?.onend?.({ charIndex: 0 }));
    },
    rerender(next: Restructured): void {
      act(() => root.render(createElement(ListenMode, { restructured: next, source: null })));
    },
    close(): void {
      act(() => root.unmount());
      container.remove();
    }
  };
}

beforeEach(() => {
  installEngine(FakeUtterance);
  synthesis.cancel();
  scrolled = 0;
});

test("before Play the whole page is on screen, in reading order, with nothing highlighted", () => {
  const view = listen();

  assert.deepEqual(view.passages, PASSAGES, "the page is shown as the passages it will be read as");
  assert.equal(view.word, null);
  assert.equal(view.reading, null);
  assert.match(view.status, /Ready to read/);
  assert.doesNotMatch(view.text, /cannot mark each word/, "a browser with boundaries needs no notice");
  view.close();
});

test("the highlight is styled at runtime, so the marked word is never a bare browser default", () => {
  const view = listen();
  const rules = [...dom.window.document.querySelectorAll("style")].map((element) => element.textContent ?? "");

  const rule = rules.find((text) => text.includes(".listen-word"));
  assert.ok(rule, "no stylesheet carries the .listen-word rule");
  assert.match(rule, /--accent-soft/, "the highlight must take its colour from the design tokens");
  view.close();
});

test("Play queues one utterance per passage and lights nothing until the voice reports a word", () => {
  const view = listen();
  view.click("Play");

  assert.deepEqual(
    synthesis.queue.map((utterance) => utterance.text),
    PASSAGES,
    "the utterances are the passages, in reading order"
  );
  assert.equal(view.word, null, "the highlight waits for a boundary event, never a timer");
  view.close();
});

test("the highlight moves word by word as the voice reports boundaries, and follows the view", () => {
  const view = listen();
  view.click("Play");
  view.start(0);

  const lit: string[] = [];
  for (let charIndex = 0; charIndex <= PASSAGES[0].length; charIndex += 1) {
    view.boundary(0, charIndex);
    if (view.word && view.word !== lit[lit.length - 1]) lit.push(view.word);
  }

  assert.deepEqual(lit, ["Work", "rules", "for", "students"]);
  assert.equal(view.reading, PASSAGES[0]);
  assert.match(view.status, /part 1 of/);
  assert.ok(scrolled > 0, "the moving word is scrolled into view");
  view.close();
});

test("a sentence boundary never drags the highlight backwards", () => {
  const view = listen();
  view.click("Play");
  view.start(0);
  view.boundary(0, 5);
  assert.equal(view.word, "rules");

  view.boundary(0, 0, "sentence");
  assert.equal(view.word, "rules", "only word boundaries move the mark");
  view.close();
});

test("crossing into the next passage moves the highlight, the marked passage and the status", () => {
  const view = listen();
  view.click("Play");
  view.start(0);
  view.boundary(0, 0);
  view.start(2);

  assert.equal(view.word, null, "a new passage starts clean");
  view.boundary(2, 4);
  assert.equal(view.word, "may");
  assert.equal(view.reading, PASSAGES[2]);
  assert.match(view.status, /part 3 of/);
  view.close();
});

test("Stop cancels the voice and clears the highlight", () => {
  const view = listen();
  view.click("Play");
  view.start(0);
  view.boundary(0, 0);
  assert.equal(view.word, "Work");

  const cancelled = synthesis.cancelled;
  view.click("Stop");

  assert.ok(synthesis.cancelled > cancelled, "Stop must cancel the voice");
  assert.equal(view.word, null, "the page must not be left looking mid-sentence");
  assert.equal(view.reading, null);
  assert.match(view.status, /Ready to read/);
  view.close();
});

test("the highlight clears when speech ends on its own", () => {
  const view = listen();
  view.click("Play");
  view.start(0);
  view.boundary(0, 2);
  assert.equal(view.word, "Work");

  view.finish();

  assert.equal(view.word, null);
  assert.equal(view.reading, null);
  assert.match(view.status, /Ready to read/);
  view.close();
});

test("a new page stops the voice and clears the highlight, so it never speaks over the next one", () => {
  const view = listen();
  view.click("Play");
  view.start(0);
  view.boundary(0, 0);

  const cancelled = synthesis.cancelled;
  view.rerender({ ...PAGE, title: "A different page" });

  assert.ok(synthesis.cancelled > cancelled, "the old page's voice must be cancelled");
  assert.equal(view.word, null);
  assert.match(view.status, /Ready to read/);
  assert.equal(view.passages[0], "A different page");
  view.close();
});

test("a browser with no boundary events still reads the page aloud, with no highlight and no error", () => {
  installEngine(QuietUtterance);
  const view = listen();

  assert.match(view.text, /cannot mark each word/, "the reader is told why no word is marked");
  view.click("Play");

  assert.deepEqual(
    synthesis.queue.map((utterance) => utterance.text),
    PASSAGES,
    "the page is still read aloud, passage by passage"
  );
  view.start(0);
  assert.equal(view.word, null, "no boundary events means no highlight");
  assert.equal(view.reading, PASSAGES[0], "the passage being read is still marked, as it was before karaoke");
  view.close();
});
