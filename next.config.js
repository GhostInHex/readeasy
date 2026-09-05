/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Ship the fixture bundle with the transform route.
   *
   * `lib/cached-transform.ts` reads `fixtures/<slug>/<level>.json` and `cleaned.txt` off disk at
   * request time, so a Demo trio page can answer with no model call and no key. Next traces only the
   * files it can see being imported, and those are read through a computed path — so without this they
   * are absent from the deployed function, every cached read misses, and the "works offline, no key"
   * promise silently becomes a live model call. Verified in the trace: before this, `fixtures/` was
   * represented by `index.json` alone, which is a real import.
   */
  outputFileTracingIncludes: {
    "/api/transform": ["./fixtures/*/*.json", "./fixtures/*/cleaned.txt"]
  }
};

module.exports = nextConfig;
