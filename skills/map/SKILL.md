---
name: map
description: >
  Keeps the person directing the work oriented while Claude builds systems for them
  (CRM automations, databases, internal tools, custom apps, browser UI work). The
  person directs and approves but retains little of what gets built, so this skill keeps
  them oriented INSIDE the chat as the work happens. Three outputs: a Map block after
  each unit of work and before any real decision; a per-project MAP.md that survives
  context compaction and opens every resume with a Where-we-are card; and a brief (in
  chat, or one PDF) before client or team meetings. Load it whenever a session builds or
  changes something in a project folder that has (or should have) a MAP.md, when the user
  asks "where are we", "what did we build", "what's missing", "remind me", "explain how
  X works", "what is that", "prep me for the meeting", or right after a compaction or
  resume in a folder that has a MAP.md.
---

# map

The problem this solves: you let an AI build a system for you, it works, and a week later
you cannot explain your own system. The AI holds all the context, so it assumes you do
too. You don't. The same four questions show up in every project: "remind me briefly what
we built and what remains" (answered with long lists), "what do you mean by X, what is
that" (terms shipped without a picture), flow questions asked after the build instead of
during it, and a cold start after every context compaction.

This skill fixes the surface, not the person. Everything lands in chat or in one PDF.
**Never hand the user an .md file to read.** MAP.md is for the agent, not for them.

## 0. What reaches the user (the gate)

Run everything the session does through two questions. Not per tool call.

1. **Can only the user do it?** Their login, their authority, their money, or a real
   person on the other end: publish or switch something on, connect a payment or video
   account, grant access, pay or cancel, send to a client or the team, decide money or who
   gets contacted. Also anything their own rules reserve for them even if Claude could
   click it (going live, anything that reaches a real contact).
   **Yes = their hand.** Always surfaced: an action chip, a link to the exact screen
   where they click, A or B when it is a decision. A screenshot of where to click when
   the screen is not obvious.
2. **If a client, the team or a customer asked about it tomorrow, would the user need to
   know it exists or changed?** A flow that now works end to end, anything that changes
   what a customer experiences, something broken or untested, a state people will ask
   about ("is the portal live", "did the reminders go out"). Working test: would they be
   caught flat tomorrow?
   **Yes = their eyes.** A Map block or a card row, with a link to where they look, no
   action asked. **When the thing is visual** (a workflow canvas, a form, a page, what the
   customer sees, an email as it lands) and a browser is already in hand or cheap to open,
   show a screenshot in chat instead of sending them to go look; annotate the spot that
   matters; link underneath. Not for things a row says better (counts, statuses), not for
   lists longer than a screen, never for screens showing real people's personal data.

Neither = silent. Internal mechanics (a field created, a step edited, a rerun, a
refactor, a lookup) go into MAP.md pointers for the agent, never to the user.

Link rule: "hand" items link to where they click, "eyes" items link to where they look.
Always the exact screen, never the system's home page.

Tune the eyes question over the first weeks: noise means tighten, being caught flat in a
meeting means loosen.

## 1. The Map block

**When it fires (three layers, none of them a prompt to the user):**
1. The rule: post it after each unit of work and before any real decision (below).
2. The signal (optional hook, `hooks/map-signals.mjs` on PostToolUse): injects "a build
   write just ran, Map block due" after a create, update or publish call to an MCP tool,
   or a git push, merge or deploy. Only in folders that have a MAP.md.
3. The backstop (same hook, on Stop): refuses, once, to end a turn that asks the user a
   go-question without a Map block. Routine questions are not asked at all; a real
   decision gets its map first.

A **unit of work** is: a flow that now works end to end, a workflow or automation saved
or published, a schema or interface change finished, a UI change finished, a test that
changed what is true. Not a unit: one field created, a rerun, a drafted message, a
lookup.

**How it is rendered:**
1. If your client has an inline visual widget tool (for example the visualize /
   `show_widget` tool in the Claude desktop app), draw the Map block as a CARD from
   `references/map-block-template.html`: the flow drawn on top, a Where / Not yet / Your
   call table under it, A and B as labelled chips with "Type A or B in the chat".
2. Otherwise (plain terminal, phone, remote session) post the text version below.
3. Keep it small either way: the flow is 3 to 6 boxes of 2 to 4 words that wrap onto as
   many rows as the pane needs (HTML boxes, never one long single-row diagram: it becomes
   unreadable in a narrow pane). A branch is one extra dashed box. More than six boxes
   means two Map blocks.

Text version:
```
Map: Dental clinic online booking
  Website form -> CRM contact -> calendar slot -> "Booking confirmed" (SMS + email to the patient)
  Where: CRM > Automations > Booking (3 workflows)
  Not yet: no-show branch untested
  Your call: auto-confirm both calendars, or keep manual approval?
```

Rules:
- 5 to 8 lines. Product words. Name the real thing (workflow name, table, page) so the
  user can find it; no code, no field IDs, no jargon without a plain-word anchor in the
  same line.
- The flow is one line, left to right, `->` between steps. Branches get their own line.
- `Where:` is the click path, with a link when one exists. In the rendered card every
  real URL (workflow page, database view, task, preview URL) is a link they can tap;
  action chips link too.
- `Not yet:` is what is untested, half done or fragile. Always present, even if "nothing".
- `Your call:` ONLY when there is a real decision: business logic, money, who gets
  notified, anything irreversible, anything that reaches a real person. Routine approvals
  are not asked (people approve those blind, which makes every prompt worthless). Ask
  less so the asks get read. One decision per block, framed as A or B.
- Replace the long list. When you are about to answer "what did we build" with more than
  8 bullets, post a Map block plus "ask me about any branch" instead.
- Same content both ways: the text version is what goes into MAP.md.
- Governor: max one block per unit. None for routine operations. During a firefight, or
  when the user says "fast", hold the block until the fix lands; still update MAP.md.
  When the user is confused: one idea and one question, never a bigger diagram.
- After any resolved bug, one line: "Fundamental behind this: X." It is the cheapest way
  for the user to actually learn something from the bug.
- If you are told to keep your replies terse, that compresses your prose, not the map.
  The map is the deliverable.

Examples of the first two lines by kind of system:
- CRM: `Map: Online course access` then `Checkout page -> payment -> tag "Tier 2" -> course unlocked -> welcome email`
- Database: `Map: Weekly client activities` then `Activities table -> rollup on Clients -> Daily work view, KPI page`
- Custom app: `Map: File attachments on tasks` then `Task comment -> file stored -> link returned -> visible on the task`
- UI work: same, plus the annotated screenshot (section 3).

## 2. MAP.md: the project picture that survives compaction

One `MAP.md` at the root of each project or client folder. Template:
`references/map-template.md`. The optional SessionStart hook (`hooks/map-hook.mjs`)
injects it on startup, resume and compaction, and lists `*/MAP.md` when the session runs
one level up (a folder that holds several projects).

- **No MAP.md yet?** Create it from the template at the first Map block, from the
  folder's docs and what this session knows. Do not wait for a backfill.
- **Update it at the same moment you post a Map block.** Where-we-are, the flow line,
  the decision. One dated line per decision, in the user's words when they gave them.
- **After every compaction or resume, before any work:** post the Where-we-are card (the
  five lines from MAP.md, verified against the live system where cheap: a workflow list,
  a table count, a task status). This replaces "re-read the handoff, don't do anything
  yet, summarize where we are". With a widget tool, render it from
  `references/card-template.html` (header with a phase chip, the main flow drawn, a "what
  is built / status / where" table, a "waiting on / what / since" table with the user's
  actions as chips). Otherwise markdown: bold labels, one bullet per line.
- It is a one-page index over the folder's other agent-facing docs (context notes, build
  progress, handoff notes, inventories). Point to them, do not duplicate them. Hard
  budget: 80 lines.
- If you keep a HANDOFF.md, it stays the volatile next-action note. MAP.md is the stable
  picture. Whenever you write a handoff, refresh MAP.md's Where-we-are too.
- Status lines rot. Where a status matters, attach the 10-second check that proves it.

## 3. UI work: the screenshot they will need

When the result is something the user will click or find themselves (their own action, a
setting they must flip, "what the customer sees"), annotate the screenshot and show it in
chat with the click path in one line.

```
python annotate.py in.png out.png --circle 640,220,40 --label 700,200 "Allow sync is here"
```

`annotate.py` lives in this skill's folder and needs Pillow (`pip install pillow`).
Options: `--circle x,y,r` (repeatable), `--arrow x1,y1,x2,y2` (repeatable),
`--label x,y "text"` (repeatable). Then open the output image so it renders inline. One
screenshot per thing; a numbered step list with one image beats three images.

## 4. Brief

Two modes. Both start by verifying the live state. A brief built from memory is worse
than none; say in the header that everything was checked live today.

**Brief in chat (before a call, or when the user asks "prep me"):** 15 lines max.
```
Brief: Dental clinic booking (2026-11-03, checked live)
State: booking flow agreed, option B, waiting on the clinic for calendar access
Live: website form and CRM contact capture; reminder workflow built in a test account (not published)
Pending: second calendar, cancellation rule, who owns the patient guides
Your actions: confirm reminder timing (24h + 2h); pick who gets no-show alerts
They will ask:
  "Can patients cancel on their own?" -> only if we turn on the self-service link; today it is by phone
  ...up to five of these, one line each
```

**Brief for a meeting (one PDF to take along):** template at
`references/brief-template.md`. Sections: goal, click-through table (links, what to
show), what changed since last time, what the customer or client sees (sketch or
screenshot), questions for the meeting plus "already settled, do not reopen", plan by
stage, what to bring. One file, PDF, no companion docs. Render HTML and print to PDF with
headless Chrome; reportlab is a fallback. After the meeting ask one question: "what did
you reach for that wasn't there?" and fold the answer into the template's changelog.

## 5. Hard rules

- Chat or PDF. Never an .md for the user to read. Never "see the file".
- If the work involves a language the user does not read, every snippet you show them
  gets a translation next to it.
- Technical terms get a plain-word anchor in the same line, never a lecture.
- A Map block that nobody needs is noise. Silence on routine work.
