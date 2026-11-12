// map skill, SessionStart hook: surface the project's MAP.md on startup, resume and compaction.
// If the working directory has a MAP.md, inject it. If not, list any MAP.md one level down.
// Prints nothing (and changes nothing) in folders without a MAP.md.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const out = (text) =>
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text } }));

try {
  const here = join(cwd, "MAP.md");
  if (existsSync(here)) {
    const body = readFileSync(here, "utf8").slice(0, 6000);
    out(`map skill: MAP.md exists in this working directory. Before any work, post the Where-we-are card from it (verify cheap status claims live). Contents:\n${body}`);
  } else {
    const subs = readdirSync(cwd).filter((n) => {
      try {
        return statSync(join(cwd, n)).isDirectory() && existsSync(join(cwd, n, "MAP.md"));
      } catch {
        return false;
      }
    });
    if (subs.length) {
      out(`map skill: project maps exist at ${subs.map((s) => s + "/MAP.md").join(", ")}. Read the one for this session's project and post the Where-we-are card before any work.`);
    }
  }
} catch {}
