// map skill signals. One file, two events, both gated on a MAP.md being present
// (in the working directory or one level down). Never shows the user a prompt.
// PostToolUse: a build write happened -> remind Claude that a Map block is due.
// Stop: a go-question went out to the user with no Map block -> keep the turn going once.
// Reads the hook JSON on stdin.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// ---- config: what counts as a "build write" -------------------------------------
// Verbs in an MCP tool name (the part after the last "__") that mean it changed something.
// Matched as a whole word in snake_case, kebab-case or camelCase, so "get_address" is not a write.
const WRITE_VERB = /(^|[_-])(create|update|upsert|publish|delete|enable|activate|add|edit|send|merge)(?=$|s?[_-]|s?[A-Z])/;
// Generic MCP tools that take the real operation as an argument (e.g. execute_operation),
// and the looser check applied to that argument.
const GENERIC_TOOL = /(execute|run|call)_?(operation|action|tool)?$/i;
const WRITE_ARG = /(create|update|upsert|publish|delete|enable|activate|add-|edit)/;
// Shell commands that ship something.
const SHIP_CMD = /git (push|merge)|gh pr merge|vercel (deploy|promote)|npm publish/;
// ----------------------------------------------------------------------------------

const cwd = process.cwd();
const hasMap = () => {
  if (existsSync(join(cwd, "MAP.md"))) return true;
  try {
    return readdirSync(cwd).some((n) => {
      try { return statSync(join(cwd, n)).isDirectory() && existsSync(join(cwd, n, "MAP.md")); } catch { return false; }
    });
  } catch { return false; }
};

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input = {};
  try { input = JSON.parse(raw || "{}"); } catch {}
  if (!hasMap()) return;
  const ev = input.hook_event_name;

  if (ev === "PostToolUse") {
    const tool = String(input.tool_name || "");
    const arg = JSON.stringify(input.tool_input || {}).toLowerCase();
    const op = tool.split("__").pop();
    const isBuild =
      (tool.startsWith("mcp__") && (WRITE_VERB.test(op) || (GENERIC_TOOL.test(op) && WRITE_ARG.test(arg)))) ||
      (tool === "Bash" && SHIP_CMD.test(arg));
    if (!isBuild) return;
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext:
      `map skill: a build write just ran (${tool}). If this completes a unit of work (a flow end to end, an automation saved or published, a schema or interface change, a UI change), post the Map block before the next go-question and refresh MAP.md. Run it through the gate in section 0: the user's hand (always), the user's eyes (caught flat tomorrow), or silent.` } }));
    return;
  }

  if (ev === "Stop") {
    if (input.stop_hook_active) return; // loop guard: block at most once per turn
    const msg = String(input.last_assistant_message || "");
    const asksUser = /(\bA or B\b|\bA:\s|\bB:\s|your call|should I|want me to|shall I|\bgo\?|which (one|option)|do you want)/i.test(msg);
    const hasMapBlock = /(^|\n)[\s*#>_-]*(Map:|Map\b.*\n\s*[A-Za-z].*->|where we are|show_widget|Your call)/i.test(msg) || /Map block/i.test(msg);
    if (asksUser && !hasMapBlock) {
      console.log(JSON.stringify({ decision: "block", reason:
        "map skill: this turn asks the user for a decision without a Map block. Post the Map block first (flow in one line, where it lives, not yet, their call as A or B), then stop. If the question is routine and not a real decision per section 0, drop the question and just do it." }));
    }
  }
});
