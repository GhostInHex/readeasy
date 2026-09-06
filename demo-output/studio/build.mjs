import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, ".."); // demo-output/
const FFMPEG = "C:\\Users\\vinay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe";
const FFPROBE = "C:\\Users\\vinay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffprobe.exe";

const AUDIO = join(ROOT, "audio");
const TMP = join(ROOT, "tmp-build");
const OUT = join(ROOT, "scene-videos");
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

const BG = "0xFBF6EC"; // app paper color for fades

const scenes = [
  { id: "00", name: "hook",      kind: "card", frame: join(ROOT, "frames", "00-hook.png") },
  { id: "01", name: "problem",   kind: "card", frame: join(ROOT, "frames", "01-problem.png") },
  { id: "02", name: "transform", kind: "clip", dir: join(ROOT, "clips", "02-transform") },
  { id: "03", name: "simpler",   kind: "clip", dir: join(ROOT, "clips", "03-simpler") },
  { id: "04", name: "modes",     kind: "clip", dir: join(ROOT, "clips", "04-modes") },
  { id: "05", name: "listen",    kind: "clip", dir: join(ROOT, "clips", "05-listen") },
  { id: "06", name: "ask",       kind: "clip", dir: join(ROOT, "clips", "06-ask") },
  { id: "07", name: "comfort",   kind: "clip", dir: join(ROOT, "clips", "07-comfort") },
  { id: "08", name: "trust",     kind: "card", frame: join(ROOT, "frames", "08-trust.png") },
  { id: "09", name: "end",       kind: "card", frame: join(ROOT, "frames", "09-end.png") },
];

function run(args, opts = {}) {
  execFileSync(FFMPEG, args, { stdio: ["ignore", "pipe", "pipe"], ...opts });
}
function runFrom(args, cwd) {
  execFileSync(FFMPEG, args, { stdio: ["ignore", "pipe", "pipe"], cwd });
}
function durationOf(file) {
  const out = execFileSync(FFPROBE, [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", file,
  ]).toString().trim();
  return parseFloat(out);
}

const only = process.argv[2] ? process.argv[2].split(",") : null;
const results = [];

for (const sc of scenes) {
  if (only && !only.includes(sc.id)) continue;
  const audio = join(AUDIO, `${sc.id}.mp3`);
  if (!existsSync(audio) || statSync(audio).size === 0) {
    console.error(`[scene ${sc.id}] MISSING audio, skipping`);
    continue;
  }
  const audioDur = durationOf(audio);
  const outFile = join(OUT, `scene-${sc.id}.mp4`);
  console.log(`[scene ${sc.id}] audio ${audioDur.toFixed(2)}s`);

  let rawVideo = null;      // intermediate CFR video (clips only)
  let rawDur = 0;

  if (sc.kind === "clip") {
    rawVideo = join(TMP, `raw-${sc.id}.mp4`);
    runFrom([
      "-y", "-f", "concat", "-safe", "0", "-i", "ffmpeg-concat.txt",
      "-fps_mode", "vfr", "-an",
      "-c:v", "libx264", "-preset", "ultrafast", "-crf", "12",
      "-pix_fmt", "yuv420p", rawVideo,
    ], sc.dir);
    rawDur = durationOf(rawVideo);
    console.log(`[scene ${sc.id}] clip footage ${rawDur.toFixed(2)}s`);
  }

  // target duration: narration + breathing room, never shorter than footage
  const lead = 0.6;                                  // silence before narration
  const tail = sc.kind === "card" ? 1.2 : 0.8;       // hold after narration
  const target = Math.max(rawDur, audioDur + lead + tail);
  const pad = Math.max(0, target - rawDur);

  const fadeOutStart = Math.max(0, target - 0.7);
  const vf = [
    "fps=30",
    ...(pad > 0.01 ? [`tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}`] : []),
    `fade=t=in:st=0:d=0.5:color=${BG}`,
    `fade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.7:color=${BG}`,
    "format=yuv420p",
  ].join(",");

  const args = ["-y"];
  if (sc.kind === "card") {
    args.push("-loop", "1", "-framerate", "30", "-t", target.toFixed(3), "-i", sc.frame);
  } else {
    args.push("-i", rawVideo);
  }
  args.push(
    "-i", audio,
    "-filter_complex",
    `[1:a]adelay=${Math.round(lead * 1000)}|${Math.round(lead * 1000)},aresample=48000,` +
      `apad,atrim=0:${target.toFixed(3)},afade=t=out:st=${Math.max(0, target - 1.0).toFixed(3)}:d=1.0[a]`,
    "-map", "0:v", "-map", "[a]",
    "-vf", vf,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "17",
    "-c:a", "aac", "-b:a", "192k", "-ac", "2",
    "-movflags", "+faststart",
    "-r", "30",
    "-t", target.toFixed(3),
    outFile,
  );
  run(args);
  const finalDur = durationOf(outFile);
  console.log(`[scene ${sc.id}] done -> ${outFile} (${finalDur.toFixed(2)}s)`);
  results.push({ id: sc.id, name: sc.name, duration: finalDur, file: outFile });
}

// final concat
if (!only && results.length === scenes.length) {
  const listFile = join(TMP, "final-concat.txt");
  writeFileSync(listFile, results.map(r => `file '${r.file.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));
  const finalFile = join(ROOT, "readeasy-demo.mp4");
  run([
    "-y", "-f", "concat", "-safe", "0", "-i", listFile,
    "-c", "copy", "-movflags", "+faststart", finalFile,
  ]);
  console.log(`\nFINAL: ${finalFile} (${durationOf(finalFile).toFixed(2)}s)`);
}
