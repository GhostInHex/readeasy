# 08: Listen mode

**What to build:** The Listen Mode renderer — deliberately simple. A play/stop control; the browser's built-in `speechSynthesis` reads the title, then each section's simplified text in order. No sentence-highlight sync (explicitly out of scope). Target size: small.

**Blocked by:** 05 (mode framework; un-stub Listen).

**Files you touch:** the Listen renderer file + its registry line.

**Status:** done

- [x] Play reads content aloud; Stop halts it; no ghost speech after unmounting
- [x] Reads in order: title, then sections
- [x] No highlight sync attempted
- [x] Graceful no-op with a visible message on browsers without speech support
- [x] All tests green

## Notes

- Play queues one `SpeechSynthesisUtterance` per passage — title, then each section's heading and
  simplified text — so the browser reads them in order. Stop calls `speechSynthesis.cancel()`.
- Support is detected by object (`window.speechSynthesis ?? null`), not by key. An early version
  checked `"speechSynthesis" in window` and threw "Cannot read properties of undefined (reading
  'cancel')" in an environment where the property exists but is undefined, which took the whole
  reading view down. Unsupported browsers now get a visible message naming Chrome/Edge/Safari and
  pointing at Focus mode, with no controls rendered.
- Two cleanups guarantee no ghost speech: an unmount cleanup cancels when the reader leaves the mode,
  and a `[restructured]` effect cancels when a new transform arrives.
- No highlight sync: no `boundary` events, no per-word or per-sentence marking of the text. The
  outline list does bold whichever passage is currently being read, driven by each utterance's
  `onstart` — coarse "where are we" progress rather than sentence sync.
- Verified live with real speech synthesis in Chrome (8 voices available, audio muted): status
  advanced "Reading part 1 → 2 → 3 → 5 of 5" while `speechSynthesis.speaking` was true, Stop left
  `speaking`/`pending` false and the status back to "Ready to read this page aloud", switching to
  another mode mid-sentence silenced it, and re-running Transform while speaking silenced it too.
  The unsupported path was checked separately with `speechSynthesis` removed. 31 tests green,
  typecheck and build clean.

## Deviations, noted per tracker rule 4

- The Listen registry line from ticket 05 was already correct, so no registry change was needed.
- Added a small `.listen-*` block to `app/globals.css` (controls row, status line, outline). The
  ticket listed only the renderer and its registry line; the mode needed some layout to be usable.

