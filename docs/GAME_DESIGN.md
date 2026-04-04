# The Taco's Egg — Game Design Document

**Version:** 0.1 (Draft)
**Last Updated:** 2026-04-03

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Fantasy](#2-core-fantasy)
3. [Game Loop](#3-game-loop)
4. [Mechanics](#4-mechanics)
   - 4.1 [Terminal Interaction](#41-terminal-interaction)
   - 4.2 [Email System](#42-email-system)
   - 4.3 [Log Analysis](#43-log-analysis)
   - 4.4 [Trap-Setting & Honeypots](#44-trap-setting--honeypots)
   - 4.5 [Phone Trace Mini-Game](#45-phone-trace-mini-game)
   - 4.6 [Evidence Corkboard](#46-evidence-corkboard)
   - 4.7 [Taco Ordering System](#47-taco-ordering-system)
   - 4.8 [NPC Interactions](#48-npc-interactions)
   - 4.9 [Day/Night Cycle & Resource Meters](#49-daynight-cycle--resource-meters)
5. [UI/UX Design](#5-uiux-design)
6. [Narrative Structure](#6-narrative-structure)
7. [AI Integration](#7-ai-integration)
8. [Taco Ordering System (Extended)](#8-taco-ordering-system-extended)
9. [Tone & Style](#9-tone--style)
10. [MVP Scope](#10-mvp-scope)

---

## 1. Overview

**The Taco's Egg** is a single-player web-based mystery game set in 1988. The player is a systems administrator at **ZeroOne Hosting** — a hilariously under-resourced hosting operation run out of a garage in Longview, Washington, connected to the early ARPANET on a wing, a prayer, and a leased line that goes out whenever someone parks too close to the junction box. What begins as a routine $0.75 accounting discrepancy in the compute billing system slowly unravels into a full-blown cyber-espionage investigation.

ZeroOne's tagline is "Lowering expectations since our court date." Their backup power is an electric Hyundai Kona. The staff runs on Taco Bell. The datacenter is a literal garage. None of this stops the federal government from eventually caring very much about what is happening on their network.

The entire game is experienced through a simulated Unix terminal interface — typing commands, reading log files, sending and receiving mail, and setting traps for an unknown intruder. An LLM-powered backend (LangGraph JS) dynamically generates the investigation as it unfolds: NPC dialogue, terminal output, log anomalies, and clue responses all adapt to the player's actions and discovered evidence.

The game is not a shooter. It is not a puzzle-box. It is a mystery told through the mundane language of systems administration — and that mundanity is where the tension lives.

---

## 2. Core Fantasy

The player fantasy is **the accidental detective**: a competent but skeptical technical person who discovers something wrong, refuses to let it go, and ends up outwitting a sophisticated adversary using nothing but log files, patience, and the terminal.

This fantasy has three key components:

**Competence.** The player should feel like they actually know how to use a Unix system. Commands work. Reading logs surfaces real information. The game rewards careful, methodical thinking rather than click-to-win interactions.

**Escalation.** What starts as a bookkeeping annoyance becomes a national security matter. Each chapter widens the blast radius — from a departmental accounting error to an international espionage ring — while never losing the intimacy of one person at a terminal at 2am.

**Absurdity held straight.** The game knows it is funny that the fate of NATO defense contractor research is contingent on whether the player can keep a hacker on the line long enough to complete a phone trace — and that the sysadmin tracking them down works out of a garage in Longview, Washington. It plays this completely seriously. The comedy comes from commitment to the bit.

---

## 3. Game Loop

The core loop runs at three levels:

### Session Loop (minutes)

```
Receive information → Investigate → Act → Receive new information
```

The player reads mail, runs commands, reads logs, forms a hypothesis, takes an action (sets a trap, contacts an NPC, orders tacos), and receives feedback that generates new information. Every action produces a terminal response. Nothing happens in a cutscene.

### Chapter Loop (30–90 minutes per chapter)

Each chapter has:
- An **inciting event** — a new email, a suspicious log entry, a phone call rendered as text
- A **blocking problem** — the trace needs more time, the bureaucrat won't authorize the wiretap, the intruder changed tactics
- A **resolution condition** — a specific player action or discovered piece of evidence that advances the chapter
- **Optional side threads** — red herrings, departmental noise, NPC sub-plots that add texture without being required

### Campaign Loop (full playthrough)

The campaign builds toward assembling a complete evidentiary case. Evidence discovered in early chapters becomes relevant again in later chapters. The player's corkboard is the persistent artifact of the entire investigation — by Chapter 8, it should look overwhelming.

---

## 4. Mechanics

### 4.1 Terminal Interaction

The primary interface is a simulated Unix terminal circa 1988. The player types commands at a prompt. The game interprets them and returns output.

**Supported command categories:**

| Category | Example Commands | Purpose |
|----------|-----------------|---------|
| File navigation | `ls`, `cd`, `pwd`, `cat`, `more`, `find` | Explore filesystem, read files |
| Process & accounting | `ps`, `last`, `who`, `w`, `acct`, `sa` | Identify active and historical logins |
| Mail | `mail`, `rmail` | Send and receive messages |
| Network | `finger`, `rwhois`, `netstat`, `traceroute` | Identify remote connections |
| Trap tools | `cp`, `mkdir`, `chmod`, `ln` | Create honeypot files and directories |
| Logging | `tail -f`, `grep`, `awk` | Monitor and search log output |
| Meta | `help`, `man`, `history` | Tutorial and reference |

The terminal has intentional period-accurate limitations: no tab completion in early chapters (unlocked as a "skill"), no color output, no syntax highlighting. Commands that would require modern tools are absent or return "command not found."

**Parser behavior:**

The LLM backend interprets free-form command input. Typos, approximate commands, and creative variants are handled gracefully. The system returns period-plausible error messages for unrecognized commands rather than breaking immersion with modern error text.

**Command history** is persisted per session. The player can use the up arrow (or `!!` / `!n` syntax) to repeat prior commands. This is both a quality-of-life feature and a period-accurate detail.

**Slow output mode.** The terminal renders output character-by-character at a configurable speed, defaulting to ~80 chars/second. Large log files scroll. The player can interrupt with Ctrl-C.

### 4.2 Email System

The player receives and sends mail through a simulated `mail` client. Mail is the primary narrative delivery mechanism.

**Inbox management:**

Mail is stored in `/usr/spool/mail/sysadmin`. The player reads it with `mail`, navigates with `n` (next), `d` (delete), `r` (reply), and `s filename` (save to file). This is accurate to the period's mail UX.

**Mail categories:**

- **Plot mail** — Narrative-critical messages from NPCs, the billing contact, the FBI, ZeroOne management (such as it is). These are dynamically generated by the LLM based on current chapter state.
- **Operational noise** — Irrelevant-but-realistic mail from hosted clients complaining about uptime, a thread about whose turn it is to move the Kona so the generator can breathe, arguments about whether the garage door counts as a "security perimeter." Provides texture and plausible deniability for plot mail.
- **Red herrings** — Mail that looks suspicious but leads nowhere. A client hammering the server with cron jobs (it's a backup script). A login at 3am (the owner forgot to log out again). The player must learn to distinguish signal from noise.
- **Tip mail** — Occasional useful leads from other sysadmins at connected sites who noticed similar anomalies.

**Mail composition:**

The player can write and send mail. Replies from NPCs are generated dynamically. Sending mail to the FBI, the phone company, military liaisons, or other hosting operators is a valid gameplay action with real consequences — some contacts are responsive, some are bureaucratic dead ends, and some generate unexpected plot branches.

**Mail timestamps** reflect the in-game day/night cycle. Mail sent late at night may not receive a reply until the next in-game morning.

### 4.3 Log Analysis

Log analysis is the core investigative mechanic. The game's primary skill expression lives here.

**Log types available:**

| Log File | Location | Contents |
|----------|----------|----------|
| Login log | `/var/log/wtmp` (read via `last`) | Historical login records: user, terminal, source host, duration |
| Accounting log | `/var/log/acct` (read via `sa`, `lastcomm`) | Per-process CPU/memory usage, billed to user accounts |
| System log | `/var/log/syslog` | Daemon messages, connection events, errors |
| Access log | `/var/log/access` | Network connection attempts and completions |
| Mail log | `/var/log/maillog` | Sent/received mail metadata |

**Log mechanics:**

Logs are dynamically generated by the LLM at chapter initialization and updated in near-real-time as the investigation progresses. The intruder's activity leaves traces that are accurate to what a 1988 Unix intruder would actually leave — but the logs are voluminous, and finding the relevant entries requires the player to use the right tools.

`grep` is the player's primary weapon. Using `grep` with a username, IP address, or timestamp narrows output to relevant entries. Chaining `grep | grep` is supported and encouraged.

**Pattern recognition challenges:**

- Identifying which account the intruder used (often a dormant account belonging to a client who stopped paying and was never fully deprovisioned)
- Noticing that the intruder logs in at consistent hours (a time-zone tell)
- Correlating billing anomalies with specific login sessions
- Distinguishing the intruder's commands from legitimate user activity in the accounting logs

**Log anomaly detection:**

The LLM tracks what evidence the player has found. Some anomalies are only visible if the player runs the right combination of commands, or re-examines a log after finding a new piece of evidence that recontextualizes it. The game rewards going back to re-read logs with new knowledge.

**The $0.75 anchor:** The opening discrepancy — 75 cents of unaccounted compute time — is always traceable back to a specific log entry in the accounting file. This entry is the first domino. The tutorial teaches the player to find it.

### 4.4 Trap-Setting & Honeypots

Once the player confirms an intrusion, they can begin setting traps to gather intelligence on the intruder's behavior and objectives.

**Honeypot file creation:**

The player creates bait files using standard Unix commands. The game provides a vocabulary of effective trap types:

| Trap Type | How to Set | What It Reveals |
|-----------|-----------|-----------------|
| Fake military directory | `mkdir /usr/sdc/mil-research; touch SDI_TARGETING.dat` | Whether intruder accesses military-adjacent filenames |
| Bogus password file | `cp /etc/passwd /tmp/passwd.bak` | Whether intruder attempts to crack password files |
| Fake research data | Create plausible-looking `.dat` files in a research directory | What topics the intruder is looking for |
| Tripwire script | Simple shell script that mails the sysadmin when accessed | Real-time notification of intruder activity |
| False network map | A file containing fabricated but plausible network topology | Whether intruder is mapping the connected network |

**Trap feedback:**

When the intruder accesses a honeypot file, the player receives an alert (via mail or a `tail -f` on a log file they're monitoring). The alert is a real event — the intruder's session is currently active, which transitions the game into the Phone Trace mini-game context.

**Trap design as investigation:**

What the intruder ignores is as informative as what they access. If the fake SDI files are ignored but the network topology file is downloaded, that's a clue about the intruder's objectives. The LLM tracks honeypot access patterns and surfaces them as evidence.

**Risk:** Setting traps too aggressively or too early can spook the intruder. Some traps, if obviously fabricated, may cause the intruder to change tactics. The player must balance the desire for intelligence against the risk of losing access to the intruder's session.

### 4.5 Phone Trace Mini-Game

The trace mini-game is the game's primary real-time tension mechanic. It triggers when the intruder is actively connected to the system.

**Setup:**

By mid-game, the player has coordinated with the phone company to attempt a trace on incoming connections. Traces in 1988 required manual intervention at each switching station along the call path. A trace takes time — and the call must stay active for the trace to complete.

**The mini-game:**

When the intruder connects, the player receives an alert. A trace timer begins (displayed as a progress bar at the bottom of the terminal). The player must keep the intruder engaged long enough for the trace to complete.

Keeping the intruder online means not triggering their suspicion. The player can:
- Leave honeypot files accessible (the intruder will spend time exploring them)
- Not log the intruder out or alter permissions during the session
- Not send alarming system messages
- Optionally, introduce new bait content to extend the session

**The tension:**

The timer counts up toward completion. The intruder's session activity scrolls in a secondary pane — the player can watch what the intruder is doing in near-real-time. If the intruder finds nothing interesting, they disconnect. If they find something too interesting (like an obvious fake), they may also disconnect.

The player cannot intervene directly without risking early termination. The tension is in watching, waiting, and resisting the urge to act.

**Trace outcomes:**

- **Complete trace:** Reveals the full call path — which switching stations the call routed through, and potentially a geographic origin. Major evidence unlock.
- **Partial trace:** Reveals one hop in the call chain. Useful, but requires additional traces to complete the picture.
- **Failed trace:** Intruder disconnected before completion. No new geographic information. The honeypot may need to be refreshed before the next attempt.

Multiple trace attempts across multiple chapters progressively narrow the intruder's location from "somewhere in the US" to "overseas connection via satellite relay" to a specific country.

### 4.6 Evidence Corkboard

The corkboard is the player's persistent investigation artifact. It lives at the command `corkboard` or can be toggled with a keyboard shortcut.

**Visual design:**

The corkboard renders as ASCII art within the terminal — a grid of pinned notes, connected by ASCII lines (dashes, pipes, slashes). The aesthetic is consistent with the rest of the terminal UI.

**Evidence types:**

| Evidence Type | How Acquired | Display Format |
|--------------|-------------|----------------|
| Log entry | Saved from a log file with `save` command | Monospace text block with timestamp |
| Mail message | Saved from mail client | Quoted mail with headers |
| NPC statement | Recorded during a phone call or chat session | Quoted text with attribution |
| Honeypot access record | Auto-logged when a trap is triggered | Event record with timestamp and filename |
| Trace result | Generated by phone trace mini-game | Call path diagram in ASCII |
| Hypothesis | Player-written note | Freeform text, distinguished by `[THEORY]` tag |

**Connection system:**

The player can draw connections between evidence items using `connect A B "reason"`. Connections are displayed as lines on the corkboard. The LLM evaluates connections and can surface observations — "These two login times are separated by exactly 8 hours — consistent with a single time zone difference."

**Case summary:**

At any point, `corkboard summary` generates a plain-English summary of the current state of the investigation — what is known, what is suspected, and what gaps remain. This is LLM-generated and adapts to the actual evidence the player has collected.

**Evidence quality:**

Not all evidence is equal. The game distinguishes between:
- **Hard evidence** — Log entries, trace results, honeypot records. Factual, timestamped, attributable.
- **Circumstantial evidence** — Correlations, timing patterns, NPC testimony.
- **Theories** — Player-written hypotheses.

The final chapter's case-assembly mechanic requires a minimum threshold of hard evidence. Circumstantial evidence fills in narrative gaps. Theories that turned out to be correct are retroactively validated.

### 4.7 Taco Ordering System

See Section 8 for the extended design. The short version: the player can order tacos from **TacoNet**, a fictional dial-up taco ordering service, at any time. It is absurd. It is deliberate. It is good.

### 4.8 NPC Interactions

NPCs communicate with the player through the terminal. All NPC interactions are mediated through the interface — no voice acting, no cutscenes, no portrait art.

**NPC communication channels:**

| Channel | In-Game Mechanism | NPC Examples |
|---------|------------------|-------------|
| Mail | `mail` client | ZeroOne staff, clients, management |
| Talk | `talk username@host` | Real-time text chat (period-accurate Unix `talk` protocol) |
| Phone call (text) | Rendered as a dialog pane in the terminal | FBI contact, phone company liaison, ZeroOne owner |
| System broadcast | `wall` messages | ZeroOne owner escalations (usually about the Kona's charge level) |

**NPC roster:**

- **Billing Contact (Helen)** — The one who noticed the $0.75 discrepancy while reconciling the monthly compute invoices. Runs the books for ZeroOne out of the same garage. Helpful but skeptical. The player's first ally.
- **ZeroOne Owner (Randy)** — Technically the boss. Mostly concerned with not getting a second court date. Wants the problem to disappear quietly. Recurring obstacle who occasionally stumbles into being useful.
- **FBI Contact (Agent Paulson)** — Initially dismissive — ZeroOne is not the kind of operation the FBI imagines when it thinks "critical infrastructure." Becomes more engaged as evidence accumulates. Has access to resources the player does not.
- **Phone Company Liaison (Dave, then Sherry)** — Dave is unhelpful. Sherry is competent and eventually crucial to the trace.
- **CERT Contact (unnamed)** — The emerging Computer Emergency Response Team. Can provide intelligence on whether similar intrusions have been reported elsewhere.
- **The Intruder (never named)** — Only known through their actions in the logs. Never directly communicated with. The player knows them only by their habits.

**NPC dialogue generation:**

All NPC responses are LLM-generated at runtime, grounded in:
- The NPC's established personality and role
- The current chapter state and evidence the player has shared
- The player's specific message or question
- Period-accurate communication norms (no one says "the internet" — it's "the network")

NPCs have persistent memory within a session. Mentioning something you told Agent Paulson two chapters ago will produce a response that references it. NPCs can be surprised, convinced, dismissive, or alarmed depending on what the player brings to them.

### 4.9 Day/Night Cycle & Resource Meters

The game tracks in-game time, which advances at an accelerated rate during active investigation and slows during real-time events like the phone trace.

**In-game clock:**

Displayed in the terminal status bar. Time advances roughly 1 in-game hour per 2–3 minutes of real time during normal investigation. The clock affects:
- NPC availability (the FBI contact is not reachable at 3am in-game)
- Log activity patterns (the intruder tends to appear during specific hours)
- Mail delivery times
- The player character's mood-flavor text

**The Coffee Meter:**

A five-segment meter displayed in the terminal status bar, represented as `☕☕☕☕☕`. Each segment represents a cup of coffee. Coffee is consumed at a rate tied to in-game time. When the meter hits zero, commands begin returning slightly slower (flavor text only — no actual gameplay penalty in MVP).

Coffee is refilled by:
- The `coffee` command (simulates walking to the gas station two blocks away — costs 10 in-game minutes)
- Certain NPC interactions (Randy sometimes remembers to start a pot before he goes back to sleep in the folding chair)
- Ordering specific Taco Bell combos from TacoNet that include a Baja Blast

**The Patience Meter:**

A 10-segment meter. Patience represents the player character's tolerance for bureaucratic delay and investigative dead-ends. It decreases when:
- NPCs dismiss the investigation
- The phone company fails to deliver a trace result
- A chapter's blocking problem persists without progress
- The intruder cleans up their tracks after a session

Patience recovers when:
- New evidence is found
- An NPC is convinced to help
- A trace succeeds
- Tacos are ordered (or consumed, if that mechanic is implemented)
- Progress is made on the corkboard

When Patience hits zero, the game does not end. Instead, it unlocks a "Fed Up" mode — the player character writes increasingly exasperated emails to bureaucrats, which occasionally work better than polite ones.

---

## 5. UI/UX Design

### Terminal Aesthetic

The entire game renders in a single browser window styled as a CRT terminal. No menus, no HUD overlays in the modern sense, no mouse interaction during terminal use.

**Visual specifications:**

- **Font:** Monospace, ideally a period-accurate bitmap font (VT100 or similar). Fallback: `Courier New` or `IBM Plex Mono`.
- **Color theme (default: green phosphor):** Foreground `#33ff33`, background `#0a0a0a`. Scanline overlay at 15% opacity. Slight bloom effect on bright characters.
- **Color theme (amber phosphor):** Foreground `#ffb000`, background `#0a0500`. Player-selectable via `setterm amber`.
- **Screen curvature:** Subtle barrel distortion to simulate CRT glass. Intensity configurable or disableable for accessibility.
- **Flicker:** Occasional single-frame flicker on the cursor. Not on the content — only on the cursor.
- **Cursor:** Block cursor, blinking at ~530ms interval.

**Screen layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│ ZEROONE HOSTING  —  "Lowering expectations since our court date" │
│ [Terminal: VT100]  [Date: Fri Oct 14 1988]  [Time: 14:32]       │
│ [Coffee: ☕☕☕☕☕]  [Patience: ████████░░]                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  (main terminal output area — scrollable)                        │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ sysadmin@zeroone% _                                              │
└──────────────────────────────────────────────────────────────────┘
```

During the phone trace mini-game, the screen splits:

```
┌────────────────────────────┬─────────────────────────────────────┐
│  TRACE PROGRESS            │  INTRUDER SESSION (LIVE)            │
│  [████████░░░░░░░░░░] 40%  │  > ls -la /usr/sdc/                 │
│                            │  > cat SDI_TARGETING.dat            │
│  Hop 1: OK (local PBX)     │  > grep "missile" SDI_TARGETING.dat │
│  Hop 2: TRACING...         │                                     │
│  Hop 3: (pending)          │                                     │
│                            │                                     │
│  Estimated: 4:32 remain    │                                     │
└────────────────────────────┴─────────────────────────────────────┘
```

### Accessibility

- **Reduced motion mode:** Disables CRT scanline animation, flicker, and barrel distortion. Activated via `setterm plain`.
- **High contrast mode:** Increases foreground brightness. `setterm highcontrast`.
- **Font size:** `setterm fontsize [small|medium|large]`.
- **Screen reader support:** The terminal output area is an ARIA live region. Commands and their output are labeled appropriately.

### Keyboard-First Design

The game is 100% keyboard-driven during terminal interaction. Mouse interaction is limited to:
- Clicking the terminal window to focus it
- Scrolling through output history
- Corkboard node dragging (if implemented in a later milestone)

---

## 6. Narrative Structure

### Chapter Overview

**Chapter 1: The Missing 75 Cents**

*Tutorial chapter. Duration: 20–30 minutes.*

The player receives their first mail from Helen in billing. There's a $0.75 discrepancy in the monthly compute invoice. Probably a rounding error. Would the player mind taking a look?

The tutorial teaches: `mail`, `sa`, `last`, `who`, `grep`. By the end, the player has found the specific login session responsible for the discrepancy — a 75-second connection from an unrecognized source host that billed under the account of a client who stopped paying six months ago and whose account Randy never got around to closing.

Closing hook: The source host resolves to a gateway well outside the Longview, WA calling area.

**Chapter 2: Ghost in the Timesharing System**

*Investigation chapter. Duration: 30–45 minutes.*

The player begins tracing the intruder's activity in earnest. The intruder has been here before — much longer sessions, all covered up except for the 75-cent slip. The player learns the intruder's patterns: time of day, duration, which directories they explore, which accounts they use as pivots.

The blocking problem: the intruder is cautious and leaves sessions short. The player cannot get a trace authorized without more evidence of intent — the 75 cents is not enough for the phone company to care.

Resolution: The player finds a log entry showing the intruder accessing `/usr/clients/pacnw-defense-consulting/contracts/` — a directory belonging to one of ZeroOne's hosted clients, a small defense subcontractor, that should not have been accessible from outside their account. This is the first evidence of purpose beyond opportunistic snooping.

Introduces: `find`, `acct` correlation, the corkboard.

**Chapter 3: Honeypot**

*Setup chapter. Duration: 30–45 minutes.*

Armed with evidence of the intruder's interest in military-adjacent research, the player sets traps. This chapter is largely about preparation and patience. The player creates honeypot files, sets up monitoring, and waits.

The blocking problem: the intruder goes quiet for several in-game days after Chapter 2's activity. The player must resist the urge to conclude the intruder is gone.

Resolution: The intruder returns and accesses a honeypot file. First trace attempt — partial result. One hop identified.

Introduces: Trap-setting mechanics, `tail -f` monitoring, first trace mini-game.

**Chapter 4: The Long Distance Problem**

*Bureaucracy chapter. Duration: 30–45 minutes.*

The partial trace suggests the call is coming from outside the local calling area. Getting authorization for a long-distance trace requires a different level of phone company cooperation — and the phone company requires a law enforcement request. The FBI needs more evidence than a honey pot access and a suspicious login.

This chapter is about navigating bureaucratic obstruction. The player must assemble a convincing evidence package for Agent Paulson, who has a very high bar for "suspicious."

The blocking problem: bureaucracy. The player must be patient, persistent, and creative about what evidence they can surface without law enforcement authorization.

Resolution: The player finds evidence that the intruder accessed files related to Strategic Defense Initiative subcontractors — enough for Paulson to make a call.

Introduces: Mail composition as gameplay, evidence packaging, NPC persuasion mechanics.

**Chapter 5: Keep Him Online**

*Tension chapter. Duration: 20–30 minutes (real-time mechanic heavy).*

The FBI has authorized the trace. The phone company is ready. Now the player just needs the intruder to connect and stay connected long enough.

This chapter is the game's primary set piece. Multiple trace attempts across the chapter, each one getting closer to the source. The honeypot files are refreshed. The player manages the intruder's session activity in real-time.

Resolution: A complete trace to a US relay point. The call is coming from outside the country, routed through domestic infrastructure.

**Chapter 6: Nobody Cares**

*Frustration chapter. Duration: 30–45 minutes.*

The trace result is handed to Paulson. Paulson hands it up the chain. Nothing happens. The CIA says it's NSA's jurisdiction. NSA says it's not a national security issue. The military says they didn't lose anything. Randy wants the whole thing dropped because he's worried the publicity will scare off clients — both of them.

The player must continue the investigation essentially alone, with reduced institutional support.

The blocking problem: the Patience Meter is under sustained pressure. This chapter exists to make the final victory feel earned.

Resolution: The CERT contact reports that three other small hosting operators and a regional ISP have seen identical intrusion patterns. The player is not alone, and now there is a coordinated case.

**Chapter 7: The Case Gets Bigger**

*Escalation chapter. Duration: 45–60 minutes.*

The investigation expands. The intruder is not a lone hacker — there is a network of connected intrusions across ARPANET-connected hosts. The player correlates evidence from other sysadmins at small hosting operations and regional ISPs (via mail). The intruder's target pattern becomes clear: defense subcontractors, SDI-adjacent research firms, and the small hosting shops that unknowingly serve them.

Additional traces, cross-referenced with the other universities, narrow the geographic origin to a specific country in Eastern Europe. The FBI re-engages. The player builds the case from distributed evidence.

Resolution: The player has enough to identify the intruder's affiliation (a state-sponsored intelligence operation) but not their identity. The final chapter is about closing that last gap.

**Chapter 8: Proof**

*Resolution chapter. Duration: 30–45 minutes.*

The case assembly chapter. The player uses the corkboard to construct a formal evidence chain. This is not an action chapter — it is deliberate, methodical, and satisfying in the way that filing the last piece of a jigsaw puzzle is satisfying.

The case requires:
- Hard evidence of unauthorized access (log entries, traced connection)
- Evidence of intent (honeypot access records, military file access)
- Geographic attribution (trace results, corroborating data from other universities)
- Identity attribution (the final piece, obtained via a late-chapter revelation from Agent Paulson)

The chapter ends with the player submitting a formal incident report — typed out in the terminal, formatted as a proper Unix mail message, sent to the FBI, the NSA, the defense subcontractor whose files were accessed, and CERT. The sending animation is the game's climax: watching the `mail` client deliver the message to each recipient, one by one.

**Epilogue:**

A final mail from Helen: there's another accounting discrepancy. 12 cents this time. It is probably nothing.

---

## 7. AI Integration

### Architecture

The game uses **LangGraph JS** to orchestrate a stateful LLM-powered investigation engine. The LLM does not run the game — the game engine runs the game. The LLM generates content within defined parameters.

```
Player Input
    │
    ▼
Terminal Parser
    │
    ├─── Deterministic Handler (known commands, filesystem ops)
    │         │
    │         └─── Static game state update
    │
    └─── LLM Handler (NPC dialogue, log generation, clue responses)
              │
              ├─── Context assembly (chapter state, evidence, NPC memory)
              │
              └─── LangGraph agent invocation
                        │
                        └─── Generated content → Terminal renderer
```

### What the LLM Generates

**Log content:** Log files are seeded at chapter initialization with a mix of static (plot-critical) entries and LLM-generated (texture, noise, red herrings) entries. Static entries guarantee the core investigation path works. LLM-generated entries make the logs feel like real systems with real users.

**NPC dialogue:** All NPC responses are LLM-generated within a character system prompt that encodes their personality, current chapter knowledge, and relationship to the player. Characters maintain consistency because their system prompts are updated as the investigation progresses.

**Clue interpretation:** When the player runs certain commands on evidence-adjacent files, the LLM can generate contextually appropriate "reveal" text — additional detail in a log entry, a file that contains something unexpected, a comment in a config file that opens a new thread.

**Red herring generation:** The LLM generates plausible-but-false leads that fit the investigation context. A suspicious login that turns out to be a client legitimately accessing their own files at an odd hour. A military-sounding filename that is actually a hosted client's D&D campaign notes. These are seeded at chapter initialization so they are consistent within a session.

**Dynamic corkboard summary:** The `corkboard summary` command triggers an LLM synthesis of the current evidence state. The output is grounded in the actual evidence objects on the corkboard — the LLM cannot invent evidence, only interpret and connect what is there.

### What the LLM Does Not Control

- **Chapter progression:** Chapters advance on deterministic conditions checked by the game engine. The LLM cannot advance or stall a chapter.
- **Trace outcomes:** The phone trace mini-game is deterministic. Duration thresholds, partial vs. complete results, and geographic reveals are all defined in static game data.
- **The core evidence chain:** The minimum required evidence for each chapter's resolution condition is defined statically. The LLM adds texture but cannot remove or replace required plot items.
- **Game state:** The LLM reads game state via context injection; it does not write to it directly. All state changes go through the game engine.

### Failure Handling

LLM calls can fail or produce off-brand output. The system handles this via:
- **Fallback responses:** Every LLM-generated content slot has a static fallback. If the LLM fails, the fallback is used without exposing the failure to the player.
- **Output validation:** Generated content is checked against a simple schema (expected fields, maximum length, prohibited content) before rendering.
- **Rate limiting:** LLM calls are debounced. Rapid command sequences that would trigger multiple LLM calls are queued.

### LangGraph State Nodes

```
InvestigationState
  ├── chapter: number
  ├── evidence: Evidence[]
  ├── npcMemory: Record<NPCId, ConversationHistory>
  ├── honeypotsSet: HoneypotRecord[]
  ├── honeypotsTriggered: HoneypotRecord[]
  ├── traceAttempts: TraceResult[]
  ├── corkboardConnections: Connection[]
  ├── patienceMeter: number
  ├── coffeeMeter: number
  └── tacoOrderHistory: TacoOrder[]
```

---

## 8. Taco Ordering System (Extended)

### Premise

While waiting for the phone company to complete a trace, Cliff Stoll (the real sysadmin who inspired this game) was known for baking cookies and feeding people who helped him. At ZeroOne Hosting, the staff runs on Taco Bell. This is not a lifestyle choice — it is an operational reality. The nearest sit-down restaurant is forty minutes away. The nearest Taco Bell is six minutes.

In **The Taco's Egg**, the player's ordering mechanism is TacoNet — a dial-up Taco Bell ordering terminal that Randy jury-rigged into the company's network sometime in 1986, ostensibly as a "proof of concept for e-commerce." It connects to a dedicated line at the Longview Taco Bell, where a very patient employee named Jorge has been manually keying in orders for two years.

It is ridiculous. It is also the game's primary comedy mechanism and a pressure release valve between tense investigation segments.

### Accessing TacoNet

```
sysadmin@zeroone% taconet
```

The terminal clears and renders a new ASCII UI:

```
╔════════════════════════════════════════════════╗
║         T A C O N E T  v2.1                   ║
║   Computerized Ordering for the Modern Age    ║
║                                               ║
║  "When the hacker can wait, but you can't."   ║
╚════════════════════════════════════════════════╝

Welcome back, SYSADMIN. Your last order: Oct 12.
You have 847 TacoPoints.

[1] Browse Menu
[2] Quick Order (repeat last)
[3] View Order Status
[4] TacoPoints Balance
[5] Exit

Choice: _
```

### The Menu

The menu is organized by category: Tacos, Burritos, Sides, Drinks, and — crucially — the **Investigator's Special** section, which contains bundles themed to the game's current chapter.

**Investigator's Special examples:**

| Bundle | Contents | Chapter Unlock |
|--------|----------|----------------|
| "The Stake-Out" | 6 tacos + large coffee + side of chips | Chapter 2 |
| "The All-Nighter" | 12 tacos + 3 coffees + antacids | Chapter 5 |
| "The Bureau Buster" | 2 burritos + strongly worded napkin | Chapter 6 |
| "The Smoking Gun" | 1 deluxe taco + 1 grande coffee | Chapter 8 |

### Gameplay Integration

Taco ordering is optional but has real effects:

- **Coffee items** partially refill the Coffee Meter
- **Food items** partially restore the Patience Meter (eating is comforting)
- **Large orders** trigger a congratulatory message from TacoNet that is timed inconsistently with in-game time (implying the service is not actually real-time, which is the joke)
- **Ordering during an active trace** causes the delivery confirmation to arrive in the middle of the trace mini-game, which is an interruption the player must manage

### TacoPoints

TacoPoints are earned with every order. They serve no mechanical purpose except to be displayed. The running total grows throughout the game. In the epilogue, the final tally is reported in the incident summary, under "Other Investigative Expenses."

### NPC Taco Interactions

- Helen can be sent tacos via TacoNet's "gift order" feature (Randy added this at 2am one night and it mostly works). She will be confused and then touched.
- Agent Paulson will decline tacos on policy grounds, then order some anyway in a follow-up mail. He gets a Chalupa.
- Randy, if sent tacos, will eat them and then ask the player to expense them against the investigation budget. There is no investigation budget.

### The Taco Bell

TacoNet connects to the **Longview Taco Bell** on Minor Road. Jorge, the night-shift manager, has been fielding TacoNet orders since Randy cold-called the franchise in 1986 and convinced someone that this was the future of fast food ordering. Jorge has a laminated card explaining the procedure taped to the register. He is professionally skeptical but has never missed an order.

If the player investigates the TacoNet connection (entirely possible using in-game tools), they will find a single host: `tb-longview.taconet.uucp`. Its only service is a UUCP mail relay for order forms. This is not a plot point. It is just there for the player who wants to look.

---

## 9. Tone & Style

### The Central Tonal Commitment

**The game takes itself seriously so the player doesn't have to.**

The 75-cent discrepancy is treated with the gravity of a national security emergency. Not because the player is forced to care — but because the player character genuinely, earnestly cares. This sincerity is the source of the game's humor and its heart.

Every system — the trace, the corkboard, the FBI, the phone company — is presented as though it genuinely matters that a hacker got 75 seconds of free compute time. Because, as the investigation unfolds, it genuinely does. The absurdity is in the setup. The stakes are real.

### Writing Voice

**Terminal output:** Terse, functional, period-accurate. No modern idioms. No humor in system output — it is a 1988 Unix system and it will behave like one.

**NPC mail:** Ranges from collegial to bureaucratic. Helen writes in a warm, slightly nervous office-professional voice. Randy writes like someone dictating to himself while doing something else. Paulson writes in clipped, cautious federal-employee sentences. The CERT contact writes in the excited, slightly breathless style of someone who has been waiting for someone to take this seriously.

**TacoNet copy:** Enthusiastically overclaims its technical sophistication. "State-of-the-art computerized ordering." "Real-time delivery coordination." Jorge is a human being manually reading these orders off a dot-matrix printout. The Chalupas are still very good.

**Chapter titles and internal headings:** Matter-of-fact. The drama is not in the title — it's in what happens after you open the file.

### Period Authenticity

The game is set in 1988. This is not decoration — it is the game's mechanical backbone.

- No GUIs
- No real-time internet (ARPANET, UUCP, dial-up)
- Phone traces require human operators at switching stations
- The FBI does not have a computer crime division with significant resources
- There is no well-established framework for international computer crime
- The primary security credential is often just an account password, sometimes blank

The player is not fighting the system's limitations. The player is working within them — and finding that, even with 1988 tools, a careful observer can find a sophisticated intruder if they refuse to give up.

### What the Game Is Not

- Not a hacking game. The player is the defender.
- Not a puzzle game with a fixed solution path. The investigation has a canonical arc, but the player's specific log analysis and trap design can vary.
- Not a comedy. It is comedic, which is different.
- Not a moral lecture. The intruder's motivations become clear, and they are mundane — money, politics, the usual. The game does not editorialize.

---

## 10. MVP Scope

The MVP is Chapters 1 and 2, with partial Chapter 3 (honeypot setup but no trace mini-game).

### MVP Includes

**Gameplay:**
- Terminal interface with full command parsing
- File system navigation (simulated virtual filesystem)
- `mail` client (read, reply, compose, save)
- Log files: `wtmp` (via `last`), accounting log (via `sa`)
- `grep` and basic pipe support
- Corkboard (add evidence, view, basic connections)
- TacoNet (full ordering flow, Coffee Meter integration)

**Narrative:**
- Chapter 1 complete (tutorial through first discovery)
- Chapter 2 complete (pattern recognition, accounting correlation)
- Honeypot creation (Chapter 3 setup, no trace trigger)

**NPC:**
- Helen (mail only)
- Randy (mail only, one dismissive exchange)
- Agent Paulson (mail only, one exchange)
- One CERT contact mail (foreshadowing)

**UI:**
- CRT aesthetic (green phosphor, scanlines, cursor blink)
- Terminal status bar (date, time, Coffee Meter, Patience Meter)
- Amber mode (`setterm amber`)
- Reduced motion (`setterm plain`)

**AI:**
- LLM-generated NPC mail responses
- LLM-generated log texture entries
- `corkboard summary` command
- Static fallbacks for all LLM content slots

### MVP Explicitly Excludes

- Phone trace mini-game
- Split-screen trace view
- `talk` protocol NPC interaction
- Chapters 3–8
- Full NPC roster
- Corkboard ASCII rendering (text list format only in MVP)
- TacoPoints NPC integration (Helen, Paulson reactions)

### Success Criteria for MVP

A player who has never read "The Cuckoo's Egg" should be able to:
1. Understand what is happening and why it matters within the first 5 minutes
2. Feel genuine satisfaction at finding the suspicious login session
3. Want to know what happens next

A player who has read the book should:
1. Recognize the spirit and feel of the source material
2. Appreciate the terminal authenticity
3. Laugh at the tacos

---

*End of Document*
