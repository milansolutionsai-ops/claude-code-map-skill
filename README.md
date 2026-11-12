# map: a Claude Code skill that keeps you able to explain your own system

You let Claude build a system for you. A CRM automation, a database, an internal tool.
It works. A week later a client asks how the reminders work, and you can't explain your
own system.

That happens because the AI holds all the context and assumes you do too. You approved
every step, but you never got a picture of the whole. After a context compaction, even
Claude starts cold.

`map` fixes that inside the chat, while the work happens. No docs to read later.

## What it does

1. **A Map block after each piece of work.** When a flow starts working end to end, an
   automation gets saved, or a schema change is done, Claude posts a small map: the flow
   in one line, where it lives (with a link), what is not done yet, and, only when there
   is a real decision, one question framed as A or B.
2. **A MAP.md per project.** One page, kept up to date by Claude, written for Claude.
   After a compaction or a new session, Claude reads it and opens with a five-line
   "where we are" card before touching anything.
3. **A brief before meetings.** `/brief` gives you 15 lines in chat, checked against the
   live system first, including the questions the client will likely ask and the answers.
   `/brief meeting` produces one PDF to take into the call.

It also filters what reaches you. Things only you can do (go live, pay, message a real
person) always reach you, with a link to the exact screen. Things you'd be embarrassed
not to know tomorrow reach you as a map. Everything else stays quiet.

## Before and after

**Before.** You ask "remind me what we built and what's left" and get this:

```
- Created custom field appointment_type
- Added trigger on form submission
- Built workflow "New booking" with 7 steps
- Added SMS action with template v2
- Updated calendar settings (buffer 15 min)
- Created tag "booked"
- Fixed wait step timing
- Added email action
- Tested with test contact
- Still need to handle no-shows
- ... (14 more)
```

**After.** Claude posts this the moment the booking flow works:

```
Map: Dental clinic online booking
  Website form -> CRM contact -> calendar slot -> "Booking confirmed" (SMS + email to the patient)
  Where: CRM > Automations > Booking (3 workflows)
  Not yet: no-show branch untested
  Your call: auto-confirm both calendars, or keep manual approval?
```

Five lines. You know what exists, where to click, what's fragile, and the one thing you
need to decide. In the Claude desktop app it renders as a small visual card instead of
text.

## Install

You need [Claude Code](https://docs.claude.com/en/docs/claude-code). Node.js is needed
for the optional hooks, and Python with Pillow for the optional screenshot annotator.

**1. Copy the skill and the command.**

macOS / Linux:

```bash
git clone https://github.com/milansolutionsai-ops/claude-code-map-skill.git
mkdir -p ~/.claude/skills ~/.claude/commands
cp -r claude-code-map-skill/skills/map ~/.claude/skills/
cp claude-code-map-skill/commands/brief.md ~/.claude/commands/
```

Windows (PowerShell):

```powershell
git clone https://github.com/milansolutionsai-ops/claude-code-map-skill.git
New-Item -ItemType Directory -Force "$HOME\.claude\skills", "$HOME\.claude\commands"
Copy-Item -Recurse claude-code-map-skill\skills\map "$HOME\.claude\skills\"
Copy-Item claude-code-map-skill\commands\brief.md "$HOME\.claude\commands\"
```

That's enough to use it. Claude loads the skill when you ask "where are we" or when a
session builds something, and you can call it directly with `/map`.

**2. Optional: add the hooks.** They make the map automatic instead of something you
have to ask for:

- On session start, resume and compaction, if the folder has a MAP.md, Claude gets it
  and opens with the "where we are" card.
- After a tool call that changed something (an MCP create/update/publish, a git push or
  deploy), Claude is reminded that a Map block may be due.
- If Claude is about to ask you for a decision without showing a map first, it gets sent
  back once to add one.

All three do nothing in folders without a MAP.md. Merge the `hooks` section of
[`settings.example.json`](settings.example.json) into `~/.claude/settings.json`. If you
already have hooks for the same events, add these entries to your existing arrays. If
your hooks don't fire on Windows, replace `$HOME` with your full home path.

To tune what counts as "a change", edit the three patterns at the top of
`hooks/map-signals.mjs`.

**3. Start a project.** Nothing to set up. The first time Claude posts a Map block in a
project folder, it creates the MAP.md from the template.

## What's in the repo

```
skills/map/
  SKILL.md                         the method: the gate, the Map block, MAP.md, the brief
  annotate.py                      circles, arrows and labels on a screenshot (needs Pillow)
  references/map-template.md       the MAP.md template
  references/brief-template.md     the meeting PDF structure
  references/map-block-template.html   visual Map block card (for clients with inline widgets)
  references/card-template.html        visual "where we are" card
  hooks/map-hook.mjs               SessionStart hook
  hooks/map-signals.mjs            PostToolUse + Stop hook
commands/brief.md                  the /brief command
settings.example.json              hook wiring to merge into ~/.claude/settings.json
```

## License

MIT. Use it, change it, ship it.

Built by [Milan Veljkovikj](https://github.com/milansolutionsai-ops).
