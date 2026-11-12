# Meeting brief template (v1)

A starting point, not final. After every meeting, ask the user: "what did you reach for
that wasn't there?" and change this file.

Output: ONE PDF, named `<project>-<topic>-meeting-<YYYY-MM-DD>.pdf`, saved in the project
folder. No companion docs. Everything checked live the same day; say so in the header.
Write in the user's language; if the other side of the meeting reads a different
language, put both side by side.
Render: write HTML, print to PDF with headless Chrome; reportlab as a fallback.

## Sections, in order

1. **Header.** Project, meeting, date, "everything here was checked live in <system> today".
   Goal of the meeting in one sentence (what gets decided).
2. **Click-through (in this order, about N min).** Table: #, what, link, what to show.
   4 to 8 rows. Real URLs that can be tapped on a phone or laptop. This is the part that
   gets used most.
3. **What changed since last time.** Dated. What it is, status (live / beta / planned),
   why it matters, risks. Plain words, one term anchored per line.
4. **What the customer (or client) sees.** A sketch (ASCII is fine in the PDF, a
   screenshot is better) plus a 2-column table: section, built with, kept up to date by.
5. **Questions for the meeting.** Numbered. Grouped (decisions / still open from the
   spec). Each with the default answer if nobody objects. Then **Already settled, do not
   reopen:** one line each with who decided and when.
6. **The plan, step by step.** Stages with estimated hands-on hours, what each stage
   needs decided first, and the test that closes it. Dates get set in the meeting, not
   in the doc.
7. **Bring.** What else to have open.

## Changelog
- v1: first version. Open question: should the "they will ask -> answer" list from the
  chat brief go inside the PDF too?
