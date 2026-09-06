// Probe: does driven Edge provide speech synthesis with word-boundary events?
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  channel: "msedge",
  headless: false,
  args: ["--window-size=1280,800"],
});
const page = await browser.newPage();
await page.goto("about:blank");

const result = await page.evaluate(
  () =>
    new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve({ voices: 0, boundaries: false });
        return;
      }
      const voices = window.speechSynthesis.getVoices();
      const u = new SpeechSynthesisUtterance("ReadEasy makes the web readable for every reader.");
      let boundaries = 0;
      u.onboundary = () => {
        boundaries += 1;
      };
      window.speechSynthesis.speak(u);
      setTimeout(() => {
        window.speechSynthesis.cancel();
        resolve({
          voices: voices.length,
          voiceNames: voices.slice(0, 6).map((v) => `${v.name} (${v.lang})`),
          defaultVoice: voices.find((v) => v.default)?.name ?? null,
          boundaries
        });
      }, 6000);
    })
);

console.log(JSON.stringify(result, null, 2));
await browser.close();
