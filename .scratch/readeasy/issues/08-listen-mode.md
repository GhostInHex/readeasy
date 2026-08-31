# 08: Listen mode

**What to build:** The Listen Mode renderer — deliberately simple. A play/stop control; the browser's built-in `speechSynthesis` reads the title, then each section's simplified text in order. No sentence-highlight sync (explicitly out of scope). Target size: small.

**Blocked by:** 05 (mode framework; un-stub Listen).

**Files you touch:** the Listen renderer file + its registry line.

**Status:** ready-for-agent

- [ ] Play reads content aloud; Stop halts it; no ghost speech after unmounting
- [ ] Reads in order: title, then sections
- [ ] No highlight sync attempted
- [ ] Graceful no-op with a visible message on browsers without speech support
- [ ] All tests green
