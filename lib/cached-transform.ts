import { readFileSync } from "node:fs";
import path from "node:path";
import { cachedCleanedTextPath, cachedVariantPath, matchCachedPage } from "@/lib/fixtures";
import { validateRestructured } from "@/lib/schema";
import type { ReadingLevel, TransformSuccess } from "@/lib/types";

/**
 * Bundled Restructures for the Demo trio, read off disk on the server.
 *
 * This is the half of the cached-demo rule that the reading level depends on: switching a trio page
 * to the simpler level must never call the model, because the recorded demo has to work with no
 * network and no API key. A captured variant plus the cleaned text ReadEasy already ships is a whole
 * `TransformSuccess`, so the route can answer from the bundle alone.
 *
 * Every failure here is a miss, not an error. The variants are captured by a human before the demo
 * (`tools/capture-simpler.mjs`), so a page with no variant yet — which is every page until that runs
 * — simply falls through to the live path. A page is never broken by a file that is not there.
 *
 * Server only: it reads the filesystem. Nothing a client component imports may reach this module.
 */

/** Repo root at runtime. Overridable so tests can point at a temporary bundle. */
let fixtureRoot = process.cwd();

/** Test seam: read bundled variants from `root` instead of the working directory. */
export function setFixtureRootForTests(root: string | null): void {
  fixtureRoot = root ?? process.cwd();
}

function readIfPresent(relativePath: string): string | null {
  try {
    return readFileSync(path.join(fixtureRoot, relativePath), "utf8");
  } catch {
    // Missing is the normal case, and an unreadable bundle is not worth failing a page over.
    return null;
  }
}

/**
 * The bundled transform for this URL at this level, or `null` when there is not a complete one.
 *
 * The slug never comes from the request — `matchCachedPage` maps the URL onto one of the fixtures
 * committed to the repo — so no caller can steer these reads at a path of their own.
 */
export function loadCachedTransform(
  url: string | null | undefined,
  level: ReadingLevel
): TransformSuccess | null {
  const page = matchCachedPage(url);
  if (!page) {
    return null;
  }

  const rawVariant = readIfPresent(cachedVariantPath(page.slug, level));
  const cleanedOriginal = readIfPresent(cachedCleanedTextPath(page.slug));
  if (!rawVariant || !cleanedOriginal?.trim()) {
    return null;
  }

  try {
    return {
      cleanedOriginal: cleanedOriginal.trim(),
      restructured: validateRestructured(JSON.parse(rawVariant)),
      sourceUrl: url?.trim(),
      level
    };
  } catch {
    // A half-written or stale capture behaves like no capture at all: restructure the page live.
    return null;
  }
}
