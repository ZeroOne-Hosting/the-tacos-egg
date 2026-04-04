# The Cuckoo's Egg — Game Lore Brief

Reference document for narrative and content consistency. Based on Cliff Stoll's 1989 account of the 1986–1987 intrusion investigation at Lawrence Berkeley Laboratory.

---

## Core Premise

A curious, under-supported, sleep-deprived lab computer wrangler in the late Cold War discovers a 75-cent accounting discrepancy and pulls a thread that unravels a foreign espionage operation — entirely through improvised, low-budget, institutional UNIX forensics.

The story is not about power. It's about noticing.

---

## Setting Tone

**This is not cyberpunk.**

| What it is | What it is not |
|------------|---------------|
| 1986 institutional UNIX realism | Cyberpunk aesthetic |
| Beige. Humming. Fluorescent. | Neon-lit hacker dens |
| Terminals, printouts, modems, coffee, manuals | Hollywood AI interfaces |
| Bureaucratic friction as a real obstacle | Hacker power fantasy |
| Improvised forensics with what's on hand | Modern zero-day jargon |
| Protagonist who gets tired and confused | Infallible technical genius |

The atmosphere is: fluorescent lights, fan hum, the smell of warm electronics and bad coffee, a terminal that's been running since 1982, a printout curling off the floor.

---

## Canon Anchors

These are fixed reference points. Content should not contradict them.

- **The 75-cent anomaly** — the inciting incident; a billing discrepancy so small it should have been ignored
- **Astronomer pulled into sysadmin** — protagonist is not a security professional; this matters
- **1200 baud dial-up intruder** — the connection is slow; the patience required on both sides is real
- **Gathering terminals and teleprinters** — physical, improvised monitoring setup to watch live activity
- **Authorities confused and uninterested** — FBI, CIA, NSA, and others are variously baffled, dismissive, or jurisdictionally paralyzed
- **Honeypot strategy** — feeding the intruder plausible bait (the SDI files) to extend the connection long enough for a trace
- **Long watch** — the final stakeout; waiting for the call; the anticlimax of success

---

## Protagonist Tone

The protagonist (astronomer-turned-admin) is:

- **Energetic** — throws themselves into problems with genuine enthusiasm
- **Stubborn** — won't let a 75-cent discrepancy go; won't accept "it's probably nothing"
- **Slightly chaotic** — improvises, builds rigs out of available parts, keeps odd hours
- **Scientifically observant** — approaches the problem like an astronomer: collect data, form hypotheses, test them
- **Amused by absurdity** — the gap between the scale of the threat and the pettiness of the symptoms is genuinely funny
- **Not infallible** — gets things wrong, misses things, gets tired, doubts themselves

---

## NPC Archetypes

| Role | Character type | Notes |
|------|---------------|-------|
| Protagonist | Astronomer-turned-admin | The player's lens; energetic, stubborn, improvisational |
| Skeptical boss | Institutional friction | Wants it resolved; doesn't want it to be a real problem |
| Helpful telecom contact | The one agency person who actually engages | Rare competence in a sea of bureaucracy |
| Useless agency contact | The other kind | Jurisdictional confusion, wrong forms, wrong office |
| Fellow lab admin | Grounding voice | Has seen weird things before; tempers enthusiasm with experience |
| Off-screen intruder | Never quite real | Presence felt through logs, timing, file access patterns |

---

## Recurring Motifs

- **Tiny anomalies that matter** — the 75 cents, the off-hours login, the file that shouldn't have been touched
- **The physicality of old computing** — terminals with their own personalities, printers as output devices, modems as physical objects with acoustic couplers
- **Time-zone deduction** — figuring out where someone is from when they log in
- **Bureaucratic disbelief** — the comedy of trying to explain a real security incident to people who have the wrong mental model of what computers are
- **Improvised forensics** — no SIEM, no EDR, no budget; just creativity, patience, and whatever is lying around

---

## UI Texture

Content and interfaces should feel like:

- Login prompts with institutional banners
- Shell transcripts (the raw output of commands)
- Spooler messages ("job 4217 queued")
- Accounting reports ("user svend, 0.00 hours billed, 2.7 hours actual")
- Network records and connection logs
- Local notes and annotations added by hand
- Confused memos from people who don't understand what they're being told
- Printer output — the physicality of paper as the medium of record

---

## Environmental Storytelling

The world communicates through objects, not exposition.

- **Sticky notes** — reminders, passwords that shouldn't be there, phone numbers without context
- **Coffee-stained printouts** — this problem has been worked on for a while
- **Reserved terminals** — "DO NOT REBOOT — watching something"
- **Deadpan memos** — bureaucratic language applied to genuinely alarming situations
- **Modem manual drawers** — the infrastructure of the era, physical and present
- **Whiteboard timelines** — someone has been correlating events by hand

---

## Suggested Login Names

For terminals, accounts, logs, and flavor text:

`astron` / `labmgr` / `sventek` / `guest` / `fieldsvc` / `ops` / `sdinet` / `bsherwin` / `daemon` / `uucp`

---

## Suggested File Names

For directory listings, log references, and environmental detail:

`acct.delta` / `usage.jun86` / `ttywatch.log` / `milnet.paths` / `sdi-overview.txt` / `star-catalog.tmp` / `why_is_this_happening.txt`

---

## Funny Internal Documents

Documents that exist in the world and can surface as flavor text or puzzle pieces:

- `memo_re_missing_terminal_12` — someone requisitioned it; no one knows where it went
- `expense_report_for_coffee_and_paranoia` — line items that don't fit standard accounting categories
- `how_to_explain_modems_to_federal_agents` — a genuine attempt at a briefing document; not condescending enough to work

---

## Puzzle Feel

Puzzles should feel like:

- **Noticing inconsistencies** — the log entry that doesn't match the timestamp
- **Correlating logs** — connecting two separate records to establish a pattern
- **Interpreting terminal output** — reading what the system is telling you, not what you expected it to say
- **Tracing connections** — following a network path one hop at a time, through nodes that may or may not cooperate
- **Building visibility from scraps** — the information exists; it just isn't organized yet

The player should feel like a scientist, not a hacker.

---

## Act Flavor

| Act | What it feels like |
|-----|--------------------|
| Act 1 — Penny Mystery | Bookkeeping anomaly. Too small to matter. Too weird to ignore. |
| Act 2 — Something Living in the System | The discrepancy has behavior. It moves. It's not random. |
| Act 3 — Maze of Lines | Following the connection outward. Every hop is a question. |
| Act 4 — Feed the Bird | The honeypot. Controlling the narrative. Playing bait. |
| Act 5 — Long Watch | Waiting. Stakeout energy. The anticlimax of being right. |

---

## Flavor Text Style

The voice is dry, observant, slightly tired, and precise.

- "The printout curls onto the floor like it knows something."
- "This account file is dull in the way only dangerous things can be."
- "The timestamp is wrong. Not by much. That's worse."
- "Three agencies have now told us it's not their problem. One of them might be right."
- "The modem connected at 1:17 AM. Someone is patient."
- "The file was accessed. Nothing was changed. That's the part that doesn't fit."

---

## Audio / Ambience

The soundscape of the setting:

- Fan hum — constant, variable, informative
- Printer chatter — mechanical, rhythmic, periodic
- Keyboard clack — Model M energy; the keys mean something
- Modem whine — negotiation tones, then carrier, then data
- Fluorescent buzz — the sound of institutional lighting aging
- Silence at 3am — the building doing its night behavior

---

## Things to Avoid

These break the tone or contradict the source material:

- Cyberpunk aesthetics (neon, rain, leather)
- Hacker power fantasy (protagonist is competent, not superhuman)
- Hollywood AI (no dramatic countdowns, no "I'm in")
- Modern zero-day jargon (no CVEs, no APT terminology)
- Making the protagonist infallible (they get tired, miss things, doubt themselves)
- Resolving bureaucratic friction quickly (it doesn't resolve quickly; that's the point)
- Making the intruder charismatic or present (they are an absence that leaves traces)

---

## Easter Egg Philosophy

Reward players who notice:

- Old UNIX culture (uucp, sendmail lore, finger protocol behavior)
- Billing weirdness (accounting systems that were never meant to detect intrusions)
- Modem-era networking (acoustic couplers, ARPANET hops, X.25)
- The mismatch between threat scale and petty symptoms
- References to real Berkeley UNIX culture of the era
