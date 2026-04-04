# The Taco's Egg — Game Flow Document

**Version:** 0.1
**Setting:** 1988. ZeroOne Hosting. Garage, Longview, WA.
**Platform:** Web-based CRT terminal (LangGraph JS backend)

---

## How to Use This Document

This document is an implementation reference. It specifies, chapter by chapter, what the player experiences, what systems fire, what commands matter, and what the AI agent should and should not know at each stage. A developer should be able to read any chapter section and build it without consulting additional documents.

The game design document (`GAME_DESIGN.md`) defines *what* exists. This document defines *how it flows*.

---

## Part I: Act Structure

The game has three acts containing eight chapters.

```
ACT I: The Itch (Chapters 1-2)
  Something is wrong. Nobody believes you.

ACT II: The Investigation (Chapters 3-6)
  You are right. Nobody helps you.

ACT III: The Proof (Chapters 7-8)
  You were right all along. Now prove it.
```

### Act-Level Narrative Arc (Mapped to the Real Investigation)

| Act | Real Stoll Equivalent | ZeroOne Equivalent |
|-----|----------------------|-------------------|
| I | 75-cent discrepancy; Dockmaster alert; early monitoring | $0.75 compute bill; suspicious login; Helen's email |
| II | Physical monitoring; Tymnet trace; FBI dismissal; SDINET setup | Log traps; phone company bureaucracy; Agent Paulson; Operation Taco Trap |
| III | Bremen/Hannover traces; KGB confirmation; arrest | Eastern relay confirmation; inter-agency case; formal incident submission |

### The Pivot Moment

Every act has one pivot — the moment the player's understanding of the situation transforms:

- **Act I pivot (end of Chapter 2):** The intruder didn't stumble in — they came back. Multiple times. This was never about a billing error.
- **Act II pivot (end of Chapter 5):** The trace exits US jurisdiction. This is not a local problem.
- **Act III pivot (Chapter 7, mid-chapter):** The CERT reports match. Someone else is running this operation. It is not one person.

---

## Part II: Tutorial Flow — Chapter 1 in Detail

### Chapter 1: The Missing 75 Cents

**Duration:** 20–30 minutes
**Tone:** Mundane frustration becoming curious unease

#### The Boot Sequence

The player first sees a POST screen, then a login prompt. The terminal is already logged in as `sysadmin`. No password prompt — they have a sticky note.

```
ZeroOne Hosting Systems
4.3 BSD UNIX (zeroone-main) (tty01)

login: sysadmin
Last login: Wed Oct 12 16:44:02 1988 from console

ZeroOne Hosting — "Lowering expectations since our court date"
You have mail.

sysadmin@zeroone%
```

The "You have mail" line is the entire tutorial prompt. The player has no instructions beyond this. The system behaves like a real 1988 Unix box.

#### The Post-It Note

Before the player types anything, a brief status bar message flashes: `[NOTE: sticky note on monitor reads "check helen's mail about billing - R"]`

This is the only meta-hint. Randy left a note. The note says to check mail. The player types `mail`.

#### The First Mail — Helen's Discovery

```
Mail version 2.18  8/31/88.  Type ? for help.
"/usr/spool/mail/sysadmin": 3 messages 3 new
>N  1 helen@zeroone      Thu Oct 13 08:11  "Billing discrepancy - need your help"
 N  2 randy@zeroone      Thu Oct 13 09:44  "re: billing thing helen mentioned"
 N  3 nobody@uucp        Thu Oct 13 11:00  "[AUTOBOT] Daily acct summary"
```

Reading message 1 (Helen):

```
From: helen@zeroone Thu Oct 13 08:11:09 1988
To: sysadmin@zeroone
Subject: Billing discrepancy - need your help

Hi,

I was reconciling the October compute invoices this morning and found
something I can't explain. The monthly totals from the accounting system
don't match what I can actually bill to client accounts. The gap is
only $0.75 but I can't find where it went.

I'd normally just write it off but Randy gets weird when the books
don't balance (long story involving the court thing). Could you
look at the accounting logs? The discrepancy would have appeared
sometime in the last 30 days.

Thanks,
Helen
```

Reading message 2 (Randy):

```
From: randy@zeroone Thu Oct 13 09:44:32 1988
To: sysadmin@zeroone
Subject: re: billing thing helen mentioned

Yeah just look at the accounting logs and figure out where the
75 cents went. Probably a rounding error. Dont spend more than
like an hour on it.

Thanks
Randy

P.S. the Kona needs to charge before 5pm or we lose power in
the east bay. dont let anyone park in front of the garage door.
```

#### What Helen's Email Teaches

Helen's email teaches the player that:
1. There is an accounting system (`acct`)
2. It can be read to see compute usage per user account
3. The discrepancy is traceable — it came from *something*

Randy's email teaches:
1. This is not considered a priority
2. The expected answer is "rounding error"
3. There is a garage door involved

Neither email tells the player what command to run. The player has to figure that out.

#### Natural Command Discovery Path

The intended discovery sequence:

1. **`who`** — player instinctively checks who's logged in. Output: just `sysadmin` on console, probably `randy` in another tty reading his RSS feed.

2. **`mail`** → reads Helen's email → thinks "accounting logs"

3. **`help`** or **`man sa`** — player either tries `help` to find commands or guesses `sa` (summary accounting). `man sa` returns a period-accurate man page with examples.

4. **`sa`** — summary of CPU usage by user for the billing period. Most accounts show 0. One account shows `0.75 cpu` for the period: `cosworth@zeroone`.

   ```
   $ sa
                        stoll        2.4re    1.2cp     0avio     4k
                       sysadmin      8.1re    3.8cp     0avio     6k
                       randy        12.3re    6.1cp     0avio     8k
                       helen         1.2re    0.4cp     0avio     2k
                       cosworth      0.1re    0.0cp     0avio     0k
   ```

   Wait. `cosworth` only has 0.1 real-time but there was $0.75 charged somewhere. The billing system charges by CPU time, not wall time.

5. **`lastcomm cosworth`** — shows every command the cosworth account ran this billing period:

   ```
   $ lastcomm cosworth
   sh              cosworth ttyp3    0.02 secs Thu Oct 6 02:17
   ls              cosworth ttyp3    0.04 secs Thu Oct 6 02:17
   cat          F  cosworth ttyp3    0.01 secs Thu Oct 6 02:17
   ```

   Nine seconds total. $0.75 at ZeroOne's billing rate. That's the discrepancy. But who is `cosworth`?

6. **`grep cosworth /etc/passwd`** — returns the account record. Created 14 months ago. No billing address. The comment field reads: `cosworth - test acct / remove when done`. Nobody removed it when done.

7. **`last cosworth`** — shows all logins for this account:

   ```
   $ last cosworth
   cosworth ttyp3  gateway-pdx.uucp  Thu Oct  6 02:17 - 02:17  (00:00)
   ```

   One login. 0 minutes duration. Nine seconds. From `gateway-pdx.uucp`.

8. **`finger cosworth`** — shows the account has no real user. Created by a previous sysadmin (not this one). `gateway-pdx.uucp` is a UUCP relay host in Portland. That's... odd. ZeroOne is in Longview. Why would someone dial in from Portland to use a test account for nine seconds?

#### The "Nobody Cares" Moment

The player has now found the discrepancy. They found it in less than 20 minutes. The correct instinct is to report it.

The player replies to Helen and Randy explaining what they found. Randy's response:

```
From: randy@zeroone Thu Oct 13 14:23:11 1988
To: sysadmin@zeroone
Subject: re: re: billing thing helen mentioned

Yeah thats just a leftover test account. I musta used it once
and forgot to log out properly or something. You can delete it.

Good catch. 75 cents richer lol.

R
```

Randy closes the loop. It's fine. It was him. Move on.

Except: the player can look at `/etc/passwd`. The cosworth account was created in August 1987. Randy has been at ZeroOne since 2003 — wait, no, since 1985. Did Randy create this account? When the player runs `finger randy` they see Randy's primary account is `randy@zeroone`, created in 1985. The cosworth account was created by someone with sudo access, but the creation log shows a timestamp at 2:30am on a Saturday. Randy's working hours are approximately 10am to 4pm.

**The player can dismiss this and close the chapter — or they can pull the thread.**

If the player runs `last cosworth` again and compares it to `last randy`, they'll notice Randy was logged in from console Thursday at 9am when he sent that email. The cosworth login was at 2:17am from Portland. Randy was here at 9am from the console. Randy didn't do this.

#### How Chapter 1 Ends

**Trigger condition:** The player either:
- (a) Examines the discrepancy between Randy's claimed ownership and the actual login source/time, OR
- (b) Runs `last cosworth` and then `last` for any other active accounts and notices the timing doesn't add up, OR
- (c) Tries to `finger gateway-pdx.uucp` and gets back partial information suggesting the relay host sees traffic from outside the normal calling area

Any of these triggers an automatic mail from the UUCP relay manager (a bot notification, period-accurate):

```
From: postmaster@gateway-pdx.uucp Fri Oct 14 01:02:07 1988
To: sysadmin@zeroone
Subject: [AUTONOTICE] Inbound connection log

Per our standard monthly summary: your host received 1 inbound
UUCP connection from an upstream relay this billing period.
Origin relay: tymnet-pdx.x25

This is informational only. Contact postmaster if questions.
```

`tymnet-pdx.x25`. Tymnet is a national packet-switching network. The call to ZeroOne came through Tymnet. Longview's calling area doesn't include Tymnet gateways. Someone dialed into Tymnet and routed to ZeroOne. This is a long-distance call at minimum.

The chapter ends with this mail in the inbox, unanswered. The Tymnet revelation is the closing hook — it won't be *processed* narratively until Chapter 2.

**Commands introduced in Chapter 1:** `mail`, `who`, `sa`, `lastcomm`, `last`, `finger`, `grep`, `cat /etc/passwd`

**New to corkboard:** The cosworth account entry. The Tymnet relay mail. A theory card: `[THEORY] Randy's explanation doesn't fit the timestamps`.

---

## Part III: Investigation Mechanics Per Chapter

### Chapter 2: Ghost in the Timesharing System

**Duration:** 30–45 minutes
**Tone:** Growing certainty that something is wrong, growing frustration that you can't prove it yet
**Narrative:** The player begins systematic investigation. The intruder has been here before. Multiple sessions, covered up better than the October session — except the 75-cent slip.

#### What Logs to Examine

The player should examine (in any order — all paths lead to the same evidence):

**`last -60`** — The last 60 logins. Most are `sysadmin`, `randy`, `helen`, `cosworth` (the October 6 session). But buried at position 43 in the list, there's another cosworth login: `cosworth ttyp3 tymnet-pdx.x25 Sat Sep 3 02:44 - 03:22 (00:38)`. Thirty-eight minutes. Why does a test account have a 38-minute session?

**`lastcomm cosworth`** — The September 3rd session shows a much more complete command history than the October stub:

```
$ lastcomm cosworth
csh             cosworth ttyp3    0:01.2  Sat Sep  3 02:44
ls              cosworth ttyp3    0:00.1  Sat Sep  3 02:44
ls              cosworth ttyp3    0:00.1  Sat Sep  3 02:45
cat             cosworth ttyp3    0:00.2  Sat Sep  3 02:46
grep         F  cosworth ttyp3    0:00.8  Sat Sep  3 02:47
ls              cosworth ttyp3    0:00.1  Sat Sep  3 02:50
cat             cosworth ttyp3    0:00.3  Sat Sep  3 02:50
rlogin          cosworth ttyp3    0:00.4  Sat Sep  3 02:51
cat             cosworth ttyp3    0:00.2  Sat Sep  3 02:58
ls              cosworth ttyp3    0:00.1  Sat Sep  3 03:01
find         F  cosworth ttyp3    0:12.4  Sat Sep  3 03:01
cat             cosworth ttyp3    0:00.6  Sat Sep  3 03:08
cat             cosworth ttyp3    0:00.6  Sat Sep  3 03:12
grep         F  cosworth ttyp3    0:01.1  Sat Sep  3 03:14
sh           SF root     ??       0:00.2  Sat Sep  3 03:16
chmod        SF root     ??       0:00.2  Sat Sep  3 03:16
csh             cosworth ttyp3    0:00.1  Sat Sep  3 03:17
ls              cosworth ttyp3    0:00.1  Sat Sep  3 03:19
rlogin          cosworth ttyp3    0:00.3  Sat Sep  3 03:20
```

This is the Emacs movemail exploit, mapped to ZeroOne's environment. The `S` and `F` flags on `sh` and `chmod` run as root. Something ran as root from cosworth's session with no corresponding `su` or login. **This is the first evidence of privilege escalation.**

**`/var/log/syslog`** for September 3rd:

```
$ grep "Sep  3" /var/log/syslog | grep -i "cron\|root\|cosworth"
Sep  3 03:14:01 zeroone-main cron[445]: (root) CMD (cp /bin/sh /tmp/.zeroone_tmp)
Sep  3 03:14:01 zeroone-main cron[445]: (root) CMD (chmod 4755 /tmp/.zeroone_tmp)
Sep  3 03:16:44 zeroone-main su: SUID on /tmp/.zeroone_tmp
Sep  3 03:17:00 zeroone-main cron[445]: (root) CMD (rm /tmp/.zeroone_tmp)
```

A SUID shell was created by cron, used, and deleted. This is not a cron error. This is the movemail exploit executed against ZeroOne's systems.

#### Pattern Recognition Challenges

The player must notice:
1. **Time-of-day pattern:** September 3rd was a Saturday. October 6th was a Thursday. Both sessions were at approximately 2am Pacific time. That's mid-morning in Western Europe.
2. **The `rlogin` calls:** During the September session, `rlogin` was called twice. To where? The player can check `/var/log/access` for September 3rd and find outbound rlogin attempts to `clients/pacnw-defense-consulting` — a ZeroOne-hosted client.
3. **The October session was short:** The intruder got in on October 6th, ran three commands, and left in nine seconds. Why so brief? They probably found what they were looking for (or realized they'd left a trace and cut the session short).

#### Key Evidence for the Corkboard

- September 3rd session log (38 minutes)
- SUID shell creation/deletion in syslog
- rlogin attempt to `pacnw-defense-consulting` client directory
- Two sessions, both arriving via `tymnet-pdx.x25`
- Both sessions at ~2am Pacific

#### The pacnw-defense-consulting Directory

The player can now do `ls /usr/clients/pacnw-defense-consulting/` and find:
- Several `.dat` files with names like `subcontract_sdi_1987.dat`, `procurement_q3_1988.txt`
- The September 3rd accounting log shows `cat` was run against these files during the session

This is the first evidence of **intent**: the intruder wasn't exploring randomly. They came for files related to defense contracting.

#### Red Herrings in Chapter 2

- A client login at 3am (the `wendell` account, used by a homelab customer who never sleeps and legitimately runs builds at odd hours)
- A large `find` command run by `randy@zeroone` at 11pm on a Sunday (Randy lost a file and panicked)
- Mail from a `mr.pink@uucp` account that claims to have noticed "odd activity" on their rented server space — turns out they're tracking disk usage because they run a BBS and think someone stole their Doom shareware files. This is a red herring. It's also very funny.

#### Eureka Moment

The eureka comes when the player puts together: same source host (Tymnet), same time of day (2am), privilege escalation on September 3rd, and then reads one of the accessed files in the defense contractor's directory. The file `subcontract_sdi_1987.dat` contains boilerplate about SDI procurement specifications. Not classified. But clearly of interest to someone.

The player can write a theory note: `[THEORY] Someone used Tymnet to log in from outside our calling area, escalated to root, and read defense contractor files. This was not Randy.`

#### How Chapter 2 Ends

**Trigger:** Player saves evidence of the rlogin to `pacnw-defense-consulting` on the corkboard AND has identified the privilege escalation in syslog.

Helen sends a follow-up mail: billing found another discrepancy. The September session had compute time billed to `cosworth` but she can't find where it was expensed. She's been checking the books going back six months and there are three more small discrepancies. She attaches a summary. The September session wasn't the first time.

There are now **five confirmed intrusion sessions**, going back to May.

**Commands introduced in Chapter 2:** `find`, `acct`, `tail -f /var/log/syslog`, `ls -la`, `more`, basic `grep` with flags

**New to corkboard:** September 3rd session, SUID evidence, pacnw-defense-consulting access, five-session timeline, Tymnet as consistent origin

---

### Chapter 3: Operation Taco Trap

**Duration:** 30–45 minutes
**Tone:** Deliberate, methodical preparation. Occasional boredom. The intruder goes quiet.
**Narrative:** The player sets traps and waits. The intruder doesn't show up for several in-game days. The player must resist concluding the investigation is over.

#### Pre-trap Setup Work

Before traps can be set, the player needs to:

1. **Configure monitoring:** The player writes (or installs from a template) a monitoring script that polls `who` every 60 seconds for the cosworth account. The game provides `monitor.sh` as a system utility that does this — the player runs `monitor.sh --watch cosworth --alert mail`.

2. **Review existing SUID files:** `find / -perm -4000 -print` — this shows all SUID binaries. One stands out: `/usr/local/lib/emacs/movemail`. The man page notes it runs as root. This is the vector the intruder used.

3. **Examine `.rhosts` files:** `find /home -name ".rhosts" -print` reveals that the cosworth account's home directory has a `.rhosts` file that was modified on September 3rd. Its current content: `+ +`. This is an open door to any host. The intruder left a backdoor.

#### What Traps to Set

The game doesn't tell the player which traps to set. The design intent is that a player who has read the previous chapter's evidence should be able to reason about what bait to use.

Available trap actions:

| Action | Command Sequence | Effect |
|--------|-----------------|--------|
| Create fake SDI directory | `mkdir /usr/sdc; mkdir /usr/sdc/mil-research` | Establishes believable bait location |
| Plant bait files | `touch /usr/sdc/mil-research/SDI_TARGETING_DATA.dat` | File with enticing name |
| Write bait content | `cat > /usr/sdc/mil-research/README` | Instructions to include believable content |
| Set up tripwire | `monitor.sh --watch-access /usr/sdc --alert mail` | Alert when directory is accessed |
| Fake passwd copy | `cp /etc/passwd /tmp/passwd.bak; chmod 644 /tmp/passwd.bak` | Baits password crackers |
| Plant false network map | `cat > /usr/sdc/network_topology.txt` | Misleading network information |

**Bait file quality matters.** If the player creates files with generic or obviously fake names, the LLM backend marks them as low-quality bait. If the names and content are plausible given the established intruder profile (SDI-adjacent, defense-adjacent keywords), the bait is high-quality.

High-quality bait keeps the intruder online longer during the trace mini-game. Low-quality bait may cause the intruder to disconnect early.

**The bait content design mechanic:** The player writes a few lines of content for the bait files using `cat >`. The LLM evaluates the content against the intruder's known keyword targets (`SDI`, `missile`, `procurement`, `satellite`, `nuclear`). A `bait quality` score (1–5) is displayed in the monitoring dashboard. This is the chapter's primary skill expression puzzle.

#### The Quiet Period

After traps are set, the intruder doesn't return for several in-game days. The player can:

- Keep investigating historical logs (there are still patterns to find in the May and June sessions)
- Talk to Helen via `talk helen@zeroone` — she has more context on the billing history
- Send mail to `postmaster@gateway-pdx.uucp` asking for more detail about the Tymnet relay origin
- Order tacos (see Part VI)

**This quiet period is intentional.** Players who have been conditioned to expect constant action will feel the tension of waiting. NPCs should reinforce that waiting is normal: Helen mentions she often doesn't hear back from vendors for days. Randy asks if it's over yet.

#### How Chapter 3 Ends

**Trigger:** The intruder returns and accesses at least one honeypot file.

The monitoring script fires. The player gets a mail alert: `[MONITOR ALERT] Access detected: /usr/sdc/mil-research/SDI_TARGETING_DATA.dat — cosworth@ttyp3 — Thu Oct 27 02:41:09 1988`

The intruder is currently online.

The game transitions to the trace mini-game context for the first time — but this is only a **partial trace**, because the player has not yet coordinated with the phone company. The mini-game in Chapter 3 is a preview: the player watches the session but cannot initiate a trace. They observe what the intruder does (accesses the bait file, does some `grep` for keywords, reads a few legitimate hosted client files, then logs out after 8 minutes).

The trace was not attempted. But now the player has a **session transcript** from the monitoring script. The intruder's command sequence during the October 27th session is logged verbatim. This transcript becomes critical evidence.

**Commands introduced in Chapter 3:** `mkdir`, `touch`, `chmod`, `cp`, `monitor.sh`, `find / -perm -4000`, `.rhosts` examination

**New to corkboard:** October 27th session transcript, high-quality bait access confirmed, `.rhosts` backdoor found, first confirmation of intruder's keyword interests

---

### Chapter 4: The Long Distance Problem

**Duration:** 30–45 minutes
**Tone:** Frustration. Bureaucratic inertia. Moral conviction being slowly eroded by process.
**Narrative:** The player has clear evidence of intrusion. Getting the phone company — and then Agent Paulson at the FBI — to authorize a trace requires assembling a formal evidence package. Neither is interested in 75 cents and a suspicious login.

#### The Bureaucracy Path

The player must navigate three NPCs in sequence, each with a different bar for "sufficient evidence":

**Step 1: The Phone Company**

The player sends a request to the phone company contact (initially Dave, who is unhelpful, then Sherry, who is competent but bound by process). To get Sherry to even discuss a trace, the player needs to submit a formal request with:
- Account number
- Description of the incident
- Why they believe a crime is occurring

The player assembles this in a mail. Sherry responds:

```
From: sherry.kowalski@pacbell.uucp Mon Oct 31 14:12:33 1988
To: sysadmin@zeroone
Subject: re: Trace Request ZeroOne-88-10-30

Thank you for your request. I've reviewed your materials.

We can authorize a trace on incoming connections to your line
under the Communications Act if we receive a confirming
request from a law enforcement agency. You'll need an agent
number from FBI, local PD, or equivalent.

Once you have that authorization, call me directly at the
number below. Traces require the connection to be active at
time of trace — we'll need advance coordination.

Sherry Kowalski
Pacific Bell Network Security
```

The phone company is willing. They just need law enforcement authorization.

**Step 2: Agent Paulson at the FBI**

The player contacts Agent Paulson. Paulson's initial response is dismissive:

```
From: r.paulson@fbi.gov Tue Nov 1 09:22:04 1988
To: sysadmin@zeroone
Subject: re: Reported Computer Intrusion

Thank you for contacting the FBI regarding this matter.

I've reviewed your description and while the activity you
describe is certainly unusual, I want to be straightforward
with you: the financial loss described ($0.75) is below our
threshold for resource allocation on computer cases.

If you have evidence of access to classified systems, theft
exceeding $5,000, or interstate wire fraud, we can discuss
further. As described, this may be a matter better suited
to local law enforcement.

Special Agent R. Paulson
FBI Portland Field Office
```

This is the "nobody cares" moment. The player needs to make a stronger case.

#### Evidence Packaging Mechanic

The corkboard's `package evidence` command lets the player formally assemble an evidence packet to send to a specific recipient. The player selects evidence items from the corkboard, arranges them into a narrative sequence, adds their own written analysis, and mails the package.

The LLM evaluates the package against what Paulson (or Sherry) needs to see, and generates a response proportional to how compelling the case is:

- **Weak package** (just the $0.75 and the Tymnet relay): dismissal
- **Medium package** (Tymnet relay + five sessions + September 3rd SUID evidence): "Interesting, but still not enough"
- **Strong package** (all of the above + the defense contractor file access + the October 27th transcript showing keyword searches for "SDI" and "missile"): Paulson agrees to a coordination call

The player has to figure out which evidence is most compelling. The LLM's feedback is in-character — Paulson never says "you need to include X" but his response will reference what he found convincing and what didn't persuade him.

#### How Chapter 4 Ends

**Trigger:** The player assembles a package that includes the defense contractor access evidence and the October 27th session transcript showing the intruder's keyword searches. Paulson responds with provisional authorization for the phone company to attempt a trace:

```
From: r.paulson@fbi.gov Thu Nov 3 16:45:18 1988
To: sysadmin@zeroone
Subject: re: Evidence Package ZeroOne-88-11-02

I've reviewed your updated materials. The access to
`pacnw-defense-consulting` client files and the documented
keyword search pattern are more significant than your initial
summary suggested.

I'm authorizing coordination with Pacific Bell for a trace
attempt. This is preliminary — we'll need the trace result
before we can proceed further.

Authorization number: FBI-88-11-03-PNW-0044
Send this to your Pacific Bell contact.

Agent Paulson
```

**Commands introduced in Chapter 4:** `mail` composition, `corkboard package`, evidence organization

**New to corkboard:** Paulson authorization, formal acknowledgment that this is being treated as an incident

---

### Chapter 5: Keep Him Online

**Duration:** 20–30 minutes (real-time mechanic)
**Tone:** Tension. Waiting. The clock is the enemy. The intruder's curiosity is the asset.
**Narrative:** The trace is authorized. The phone company is ready. Now the intruder has to show up and stay.

#### Pre-trace Coordination

The player mails Sherry with the FBI authorization number. She responds with the coordination protocol:

```
From: sherry.kowalski@pacbell.uucp Fri Nov 4 08:33:17 1988
To: sysadmin@zeroone
Subject: re: Trace Coordination FBI-88-11-03-PNW-0044

Authorization confirmed. We're ready on our end.

Here's how this works: when the suspect connection comes in,
you call the trace line (number attached). Stay on the line
with my technician. We start the trace. The connection has
to stay active for us to complete it — minimum 12 minutes
for a local trace, 45+ minutes if we're chasing it out of
state.

Don't do anything to make them disconnect. Don't modify
permissions, don't log them out, don't send system messages.
Just let them work.

I'll be on call Thursday and Friday nights this week.
Ready when you are.

Sherry
```

The mechanic is now established: wait for the intruder, call Sherry, keep the intruder online.

#### The Trace Mini-Game Flow

The monitoring script alerts the player. The split-screen view activates.

**Left pane: Trace Progress**

```
TRACE IN PROGRESS — Pacific Bell Network Security
Authorization: FBI-88-11-03-PNW-0044

Hop 1: ZeroOne PBX ............. [CONFIRMED — 0:43]
Hop 2: Pacific Bell local loop . [TRACING... 4:12]
Hop 3: Long-distance carrier ... [PENDING]
Hop 4: Unknown ................. [PENDING]

Elapsed: 6:44  |  Minimum needed: 12:00
Sherry: "Stay steady. Keep them on."
```

**Right pane: Intruder Session (Live)**

```
cosworth@ttyp3 — ACTIVE SESSION
Connected: Thu Nov 10 02:23:04 1988

> ls -la /usr/sdc/mil-research/
> cat SDI_TARGETING_DATA.dat
> grep "warhead" SDI_TARGETING_DATA.dat
> grep "NORAD" SDI_TARGETING_DATA.dat
> cat /tmp/passwd.bak
> grep -v "!" /tmp/passwd.bak
```

The player watches. The player must not intervene. The intruder is methodically reading the bait files and then trying to crack the password backup.

#### Tension Mechanics

**Session health indicators** — the system displays signals of the intruder's engagement level:
- `[SESSION ACTIVE — intruder reading file, ~3min estimated]` — healthy
- `[SESSION ACTIVE — idle 2 minutes]` — risky, they may disconnect soon
- `[SESSION ACTIVE — searching new directory]` — very healthy, they found something

If the session goes idle for more than 3 minutes, a warning appears: `[WARNING: Session idle. Intruder may disconnect.]` The player can take one action to refresh bait — add a new file to the monitored directory that will appear in the intruder's `ls` output. This resets the idle timer but risks looking artificial.

**Taco interruption:** If the player ordered tacos during Chapter 3 or 4 that have a delayed delivery window, the TacoNet confirmation mail may arrive during the trace mini-game. The mail notification appears as a status bar flash: `[NEW MAIL: Jorge@tb-longview.taconet.uucp]`. Opening it is optional but funny. It does not affect the trace.

#### Chapter 5 Outcomes

**First attempt (Chapter 5, Part A):**
The trace gets through Hops 1 and 2 but the intruder disconnects after 14 minutes — just before Hop 3 can complete. Partial result: the long-distance carrier is an AT&T interstate relay. The call is going somewhere outside the Pacific Northwest. This is partial evidence.

**Second attempt (Chapter 5, Part B):**
Triggered when the intruder returns three in-game days later. Better bait quality (the player should have improved the files based on what the intruder searched for). This time: the call traces through AT&T to a Tymnet international gateway. **The call is coming from outside the US.**

This is the Act II pivot. The investigation is now international.

**How Chapter 5 Ends:**

The second trace result lands on the corkboard. Sherry calls (rendered as text in the terminal):

```
[INCOMING CALL — Pacific Bell — Sherry Kowalski — Thu Nov 17 03:41]

Sherry: "I've got your trace result. Hop 4 went to an international
        Tymnet gateway — we're looking at a satellite relay. Whatever
        this is, it's not domestic. I'm flagging this to my supervisor.
        You should probably call your FBI contact."
```

**Commands introduced in Chapter 5:** Trace mini-game controls (observe only), bait refreshing during session, monitoring dashboard

**New to corkboard:** International relay confirmation, two partial traces, first full session transcript, call pattern map

---

### Chapter 6: Nobody Cares (The Frustration Chapter)

**Duration:** 30–45 minutes
**Tone:** Institutional indifference. Sustained pressure on the Patience Meter.
**Narrative:** The trace result is handed up the chain. Nothing moves. Every agency either defers to another or cites jurisdictional limitations. Randy wants to close the ticket.

#### The Bureaucratic Circle

The player's job in Chapter 6 is to keep the investigation alive despite no institutional support.

**Agent Paulson:** "This is significant but we're going to need to loop in NSA given the international angle. I've escalated. Don't expect to hear back quickly."

**NSA Contact (unsolicited response to Paulson's escalation):** "We appreciate your report. Our statutory authority limits our ability to engage in domestically-based monitoring activities. If this connects to a foreign intelligence operation targeting DOD assets, that's a matter for FBI's counterintelligence division. We've forwarded accordingly."

**Randy's response:** An in-person conversation rendered as a terminal broadcast:
```
[WALL MESSAGE from randy@console — Fri Nov 18 10:14]
randy: hey can you come talk to me about this fbi thing
```

The `talk randy@zeroone` dialog:
- Randy is worried about liability
- Randy is worried about losing clients
- Randy wants to know if this will "go away on its own"
- Randy's ultimate position: "I'm not saying stop, I'm saying be careful. And maybe don't CC the FBI on things without running them past me first."

**The patience meter** takes its sustained hit during this chapter. If it empties, "Fed Up Mode" activates and the player character's mail replies become increasingly pointed. This generates different NPC responses — including Paulson being slightly impressed by the directness.

#### The CERT Breakthrough

After several days of institutional silence, the CERT contact responds. This is the chapter's resolution event.

```
From: cert-admin@cert.sei.cmu.edu Tue Nov 22 11:44:23 1988
To: sysadmin@zeroone
Subject: re: Reported Intrusion Pattern

Thank you for your report. We've been tracking a similar
pattern across several sites.

Three small hosting operators in the PNW and one regional
ISP in Seattle have reported nearly identical intrusion
signatures: Tymnet origin, covert account creation, SDI-
adjacent keyword searches, defense contractor file access.

We believe these are connected incidents. We're compiling a
composite case and would like to share your evidence with
the coordinating agencies. Are you willing to participate
in a coordinated report?

The more sites we have documented, the harder it is for any
single agency to claim this isn't their problem.

— CERT Operations
```

The player is not alone. The investigation has a coalition now.

**How Chapter 6 Ends:**

Player accepts the CERT coordination request. This triggers FBI re-engagement:

```
From: r.paulson@fbi.gov Wed Nov 23 15:02:44 1988
To: sysadmin@zeroone
Subject: re: Coordinated Report (CERT-ZeroOne-SEA-PNW)

We've received the CERT compilation. You're one of seven
sites in this pattern. I've been authorized to reopen the
investigation under a counterintelligence framework.

We're going to need a complete evidence package from all
parties. Can you compile everything you have and send it
to the address below?

This is now a coordinated investigation. Stay the course.

Agent Paulson
```

**New to corkboard:** CERT coordination confirmation, seven-site pattern, Paulson re-engagement, interstate scope confirmed

---

### Chapter 7: The Case Gets Bigger

**Duration:** 45–60 minutes
**Tone:** Expansion. The investigation reaches beyond ZeroOne's systems.
**Narrative:** Cross-site evidence compilation. The intruder's pattern becomes visible at scale. Geographic origin narrows.

#### Cross-Site Evidence

The player now has access to evidence from other affected sites via CERT coordination. New mail threads arrive from other sysadmins:

```
From: sysadmin@pacnw-hosting.uucp Thu Nov 24 09:11:22 1988
To: sysadmin@zeroone
Subject: re: CERT coordination

Hi, I'm Jim at Pacific Northwest Hosting in Tacoma. Got
your name from CERT. We had the same thing — account
called "davistest" (never heard of it), logins at 2-3am,
accessed /usr/clients/boeing-subcontract/ files.

Our Tymnet relay traces to the same international gateway
yours does. Pacific Bell confirmed.

Something I noticed: the login duration pattern is always
38-42 minutes on active sessions. Very consistent.

```

The player can correlate this with their own records: `last cosworth | grep "Sep 3"` shows 38 minutes. The same session length. This is a signature — the intruder operates in predictable windows.

#### Narrowing the Geographic Origin

Three traces from three separate sites all hit the same Tymnet international gateway (INTL-GW-3). The player can run `finger @tymnet-intl-gw3.uucp` (a legitimate 1988 operation) and get back the gateway's geographic routing: it handles traffic from Europe and Pacific Asia.

Additional evidence from the CERT bundle:

```
From: cert-admin@cert.sei.cmu.edu Sat Nov 26 16:22:14 1988
To: sysadmin@zeroone
Subject: Trace Cross-Reference Results

Analysis of the seven site traces:

All seven converge on Tymnet INTL-GW-3.
INTL-GW-3 handles: UK PSS, German Datex-P, French TRANSPAC.

Based on session timing patterns (02:00-04:00 Pacific), the
originating timezone is UTC+9 to UTC+11 (Eastern Europe evening)
or UTC+1 (Western Europe mid-morning).

The keyword search patterns (SDI, procurement, satellite) are
consistent with state-sponsored intelligence gathering.

We've forwarded this to NSA liaison. Expect contact.
```

The narrowing is now established in the evidence: Europe, state-sponsored.

#### The SDINET Equivalent — Operation Taco Trap Phase 2

The player needs one more trace — a long one, capable of tracing through the international hops. For that, the intruder needs to stay online for at least 45 minutes.

The player's existing bait (SDI targeting data, password backup) has been partially depleted. The player needs to create a larger, more compelling honeypot that will keep the intruder engaged for 45+ minutes at 1200 baud (approximately 86,000 characters of content to read/download).

**The `construct-bait` command:** The player runs `construct-bait --type sdinet --size large --keywords SDI,NORAD,procurement,satellite`. The game generates a set of fake documents:

```
Creating Operation Taco Trap Phase 2 files...

/usr/sdc/mil-research/SDINET_OVERVIEW.doc      (48KB)
/usr/sdc/mil-research/CONTRACT_STATUS_Q4.doc   (32KB)
/usr/sdc/mil-research/SATTELITE_SPECS_v3.doc   (61KB)
/usr/sdc/mil-research/NORAD_VENDOR_LIST.txt    (29KB)
/usr/sdc/mil-research/README.sdinet           (2KB)

Total: 172KB at 1200 baud = ~24 minutes download time
Estimated session length if all files read: 35-50 minutes

Bait quality assessment: HIGH (keyword density: 94/100)
```

This is the ZeroOne equivalent of Operation Showerhead / SDINET. The fake documents keep the intruder busy long enough for a full international trace.

#### How Chapter 7 Ends

**Trigger:** Player deploys Phase 2 bait AND the next intruder session occurs.

The trace runs to completion. Through Tymnet INTL-GW-3, through the Datex-P satellite relay, to a host in Europe. Specific country: West Germany. Specific node: `univ-bremen.datex-p.de`.

The intruder is in West Germany.

This is the Act III pivot and the narrative climax of Act II. The case has officially escaped ZeroOne's jurisdiction entirely.

**New to corkboard:** West Germany origin confirmation, Datex-P routing, university relay node, 45-minute session transcript, Phase 2 bait access log

---

### Chapter 8: Proof

**Duration:** 30–45 minutes
**Tone:** Methodical satisfaction. The hard work paying off.
**Narrative:** Final evidence assembly and formal submission.

#### The Case Assembly Mechanic

The `corkboard package --final` command activates the case assembly interface. This is a structured evidence chain builder — the player arranges evidence items in a logical argument:

```
FORMAL INCIDENT REPORT — ZeroOne Hosting
Case Assembly Interface

Required sections:
[ ] Unauthorized Access (evidence of initial intrusion)
[ ] Method (how they got in — the exploit)
[ ] Pattern (recurring activity, not one-time error)
[ ] Intent (what they were after)
[ ] Origin (geographic attribution)
[ ] Scope (connection to other sites)

Add evidence to each section using: add <section> <evidence-id>
Preview with: preview
Submit with: submit --to [recipient list]
```

The player fills each section by selecting from their collected evidence. The LLM evaluates the completeness and quality of each section.

**The final trace:** One more connection from the West German node traces through Bremen to an endpoint in Hannover. The Bundespost (German telecommunications authority) has been contacted by the FBI's German liaison. A specific address is confirmed. **This evidence goes in "Origin" as the final piece.**

#### The Laszlo Balogh Equivalent

A physical mail notification (rendered as a scanned document in the terminal, ASCII-formatted): A letter arrived at ZeroOne addressed to "Barbara Sherwin, SDINET Project" — the fictional contact listed in the Phase 2 bait documents. The return address is from a city in Eastern Europe. The letter requests to join SDINET's mailing list.

```
[INCOMING PHYSICAL MAIL — ZeroOne Hosting — Nov 30 1988]

Scanned and digitized by Helen:

To: Barbara Sherwin, SDINET Project, ZeroOne Hosting
    Longview, WA

I am writing to express interest in your SDI research
coordination project. I would appreciate receiving any
published materials and being added to your mailing list.

I can be reached at the address below.

[Signature]
[Address: Prague, Czechoslovakia]
```

Someone in Czechoslovakia wants to join a fake SDI project. This is confirmation that the stolen fake intelligence is being treated as real by someone with an intelligence interest.

This letter goes into the "Intent" section of the case package. It is the most dramatic piece of evidence.

#### Submitting the Report

The player completes the case package and runs:

```
sysadmin@zeroone% submit --to r.paulson@fbi.gov,cert-admin@cert.sei.cmu.edu,nsa-liaison@nsa.gov,pacnw-defense-consulting@clients.zeroone
```

The terminal renders each delivery:

```
Sending to r.paulson@fbi.gov .................. delivered.
Sending to cert-admin@cert.sei.cmu.edu ........ delivered.
Sending to nsa-liaison@nsa.gov ................ delivered (no receipt requested).
Sending to pacnw-defense-consulting ........... delivered.
```

Paulson's acknowledgment arrives within minutes:

```
From: r.paulson@fbi.gov Thu Dec 1 23:44:18 1988

We have it. This is substantial.

German federal law enforcement is being briefed.
Your SDINET correspondence may be the most significant
piece of evidence in this file.

Good work. I mean that.

Agent Paulson
```

#### The Epilogue

One week later, Helen mails:

```
From: helen@zeroone Thu Dec 8 09:11:02 1988
To: sysadmin@zeroone
Subject: Another small discrepancy

Hi again,

I was doing the December reconciliation and found another
accounting discrepancy. This one's only $0.12.

I'm sure it's nothing.

Helen
```

The terminal sits. The cursor blinks.

The player can read Helen's mail and see that the $0.12 discrepancy is from the `davistest` account that Jim in Tacoma mentioned in Chapter 7. The account exists on ZeroOne's systems. The cosworth account was closed in Chapter 1 — but the intruder created another one.

Whether the player acts on it is their choice. The game ends here.

**Final status line:** `TacoPoints earned this investigation: [X]. See you next time.`

---

## Part IV: The TACO Ordering System Integration

TACO (Taco Automated Curro Ordering) — Randy named it — is a persistent system running throughout all chapters.

### Rest Beat Placement

TACO is designed to be used at specific natural pause points:

| Natural Pause | Taco Relevance |
|--------------|----------------|
| After Chapter 1's dismissal by Randy | "Fed Up? We have a Chalupa for that." |
| During Chapter 3's quiet period (intruder not connecting) | Nothing to do. Order something. |
| While waiting for Paulson to respond (Ch. 4) | Bureaucratic hold music. |
| During the trace mini-game idle warning | The worst time for tacos. Do it anyway. |
| After Chapter 6's agency runaround | "The Bureau Buster" bundle unlocks. |
| During Chapter 8's evidence assembly | The "Smoking Gun" special. |

### Timer Mechanics

During the trace mini-game, if the player has an active taco order in progress (orders take 20 in-game minutes to process and notify), the delivery confirmation arrives during the session. The notification format:

```
[STATUS BAR FLASH: NEW MAIL from jorge@tb-longview.taconet.uucp]
```

The player can open it (disrupting focus on the trace) or ignore it. Jorge's delivery confirmations are always extremely detailed and slightly wrong:

```
From: jorge@tb-longview.taconet.uucp Thu Nov 10 02:31:04 1988

Your order #0847 is ready for pickup!

- 3x Crunchy Taco (you ordered 2, but I made an extra, it's on me)
- 1x Baja Blast (large) (we were out of cups, it's in a bowl)
- Chips and nacho cheese

Total: $4.12
Drive thru closes in 8 minutes.

- Jorge
```

### NPC Taco Interactions (Full Design)

**Helen:** If the player gift-orders tacos to Helen (TacoNet's gift ordering is functional but the UI is confusing), she will be confused by the delivery notification, mildly touched, and reference it in a future mail: "Thanks for the tacos by the way, though I'm not sure how you did that."

**Randy:** If sent tacos, Randy eats them. Later that day, a `wall` message appears: `randy: those tacos werent on the company card right?`

**Agent Paulson:** Declines on policy grounds in the mail, then two days later: `r.paulson@fbi.gov: Out of curiosity, does that Taco Bell in Longview deliver? Asking for a colleague.` He gets a Chalupa in a follow-up order confirmation that the player didn't place. Jorge entered it manually. Jorge is doing his best.

**Jorge:** The player can `talk jorge@tb-longview.taconet.uucp` during business hours. Jorge is not on the ZeroOne network; this doesn't actually work. But the game returns: `talk: connection refused by remote host tb-longview.taconet.uucp`. The player can then mail `jorge@tb-longview.taconet.uucp` and Jorge will respond (slowly, because he types his responses on the same terminal he uses to enter orders). Jorge knows nothing about the investigation but has opinions about the new Chalupa and once saw a "weird van parked outside" that turned out to be a cable TV installer.

### Plot-Relevant Information Hidden in Taco Orders

One taco order in Chapter 5 or 6 (depending on timing) has an unusual note appended to Jorge's confirmation:

```
P.S. A guy came in last Tuesday asking about "the computer
order thing." He had an accent I didn't recognize. He
ordered a Nachos Bell Grande and left without saying much
else. Probably nothing. Good tacos though.
```

This is a loose thread the player can follow. Mailing Jorge about the man with the accent produces increasingly detailed descriptions that are clearly Jorge trying to be helpful without actually knowing anything useful. It goes nowhere. It is a red herring. It is also an excuse to mail Jorge several times, which is always entertaining.

---

## Part V: Phone Trace / Keep-Them-Online Sequences

### Design Principles

1. The trace mechanic is pure watching and waiting. The player cannot directly influence the intruder's behavior once the session is active.
2. The player's preparation (bait quality, variety) determines how long the intruder stays.
3. There are three distinct trace sequences across the campaign (Chapters 3 preview, Chapter 5, Chapter 7). Each is longer and more complex than the last.

### Session Monitoring Display

The right pane shows the intruder's session with a deliberate slow-scroll, as if it's being printed to a teleprinter:

```
[INTRUDER SESSION TRANSCRIPT — cosworth@ttyp3]
[Connected: Thu Nov 10 02:23:04 1988 from tymnet-intl-gw3]
[Session log: /var/log/sessions/88-11-10-cosworth.log]

02:23:11 > ls -la /usr/sdc/mil-research/
02:23:18 total 192
02:23:18 drwxr-xr-x  2 sysadmin staff  512 Nov  3 22:41 .
02:23:18 drwxr-xr-x 15 sysadmin staff  512 Nov  3 22:35 ..
02:23:18 -rw-r--r--  1 sysadmin staff 48824 Nov  3 22:38 SDINET_OVERVIEW.doc
02:23:18 -rw-r--r--  1 sysadmin staff 32108 Nov  3 22:39 CONTRACT_STATUS_Q4.doc
02:23:18 -rw-r--r--  1 sysadmin staff 61240 Nov  3 22:40 SATTELITE_SPECS_v3.doc
02:23:18 -rw-r--r--  1 sysadmin staff 29004 Nov  3 22:40 NORAD_VENDOR_LIST.txt
02:23:32 > cat SDINET_OVERVIEW.doc
```

The output scrolls at approximately 80 characters per second — realistic for a 1200 baud connection with processing overhead. The player watches real text scroll by slowly. The effect is hypnotic and tense.

### Player Actions During the Trace

The player is not locked out of the terminal. The left pane shows trace progress; the right pane shows the intruder. The player still has access to the command line, but should not:

- Run commands that generate visible system output visible to the intruder's session
- Modify permissions on files the intruder is accessing
- Attempt to log the intruder out
- Run `wall` (system broadcast)

The game does not prevent these actions. Taking them disrupts the intruder's session:
- Logging them out: immediate disconnect, trace fails
- Modifying their accessed files: the intruder sees a changed timestamp mid-session, which triggers suspicion
- Running `wall`: they see the broadcast, immediate disconnect

### Trace Progress Feedback

The trace progress bar is the core tension meter. It represents the manual telephone trace working through each hop:

```
TRACE PROGRESS — PBS Network Security (Sherry Kowalski)
Authorization: FBI-88-11-03-PNW-0044

Hop 1: ZeroOne PBX          [COMPLETE — 1:02]
Hop 2: Pacific Bell (local)  [COMPLETE — 6:44]
Hop 3: AT&T Long Distance    [TRACING... 14:22]   ← current
Hop 4: Tymnet Gateway        [PENDING]
Hop 5: International Relay   [PENDING — requires Hop 4]

Elapsed: 21:08 / Minimum needed: 45:00
Status: [GOOD — intruder downloading file, ~18min remaining]
```

Status messages from Sherry come in periodically as text in the left pane:
- At 10 minutes: "We're through Hop 2. Long distance carrier is AT&T. Keep them on."
- At 20 minutes: "AT&T is tracing their end. This is going farther than I expected."
- At 35 minutes: "This is international. I need to loop in our international liaison. Don't let them go."
- At 45 minutes: "We have it through to the gateway. Working on the other side now."

### Early Disconnect Consequences

If the intruder disconnects before the trace completes:

- **Before Hop 3:** No useful information. The trace was never going to catch them. Sherry: "Nothing. They were on too briefly."
- **During Hop 3:** Partial result — long-distance carrier identified. Not useful for location, but confirms it's not local.
- **During Hop 4:** Tymnet gateway identified. This is the same as the previous trace result.
- **During Hop 5:** International relay confirmed. This is meaningful evidence.
- **After Hop 5:** Full trace. Geographic region confirmed.

---

## Part VI: The Honeypot Chapter (Chapter 3 and Phase 2 in Chapter 7)

### What Fake Files to Create

The player creates the honeypot content using the terminal. There are two bait-creation approaches:

**Manual approach** (available from Chapter 3):

```bash
mkdir /usr/sdc
mkdir /usr/sdc/mil-research
echo "SDI TARGETING COORDINATION NOTES — Q4 1988
Project Status: ACTIVE
Classification: SENSITIVE
Contractor List: [see attachment]
Warhead positioning data: [file WPDATA.dat]" > /usr/sdc/mil-research/SDI_TARGETING_DATA.dat
```

**Assisted approach** (via `construct-bait`, available Chapter 7):

The `construct-bait` tool generates a set of convincing fake documents using the LLM backend, calibrated to the known intruder keyword profile. The tool asks the player to specify:
- Target keywords
- Desired session duration (which determines file size)
- Plausible organizational context

The generated files contain realistic-sounding but entirely fabricated procurement language, fictional personnel names, fictional system specifications, and references to fictional programs.

### Monitoring Intruder Activity

Once traps are set, the player sets up monitoring:

```bash
monitor.sh --watch-access /usr/sdc --alert mail --log /var/log/honeypot.log
```

When a trap file is accessed, the player receives mail and can review the access log:

```
$ cat /var/log/honeypot.log
Thu Oct 27 02:41:09 1988: ACCESS — cosworth@ttyp3 — /usr/sdc/mil-research/SDI_TARGETING_DATA.dat
Thu Oct 27 02:41:12 1988: READ — cosworth@ttyp3 — /usr/sdc/mil-research/SDI_TARGETING_DATA.dat (4884 bytes)
Thu Oct 27 02:41:44 1988: SEARCH — cosworth@ttyp3 — grep "warhead" /usr/sdc/mil-research/SDI_TARGETING_DATA.dat
Thu Oct 27 02:42:01 1988: SEARCH — cosworth@ttyp3 — grep "NORAD" /usr/sdc/mil-research/SDI_TARGETING_DATA.dat
```

The search terms the intruder uses on the bait files are logged. This is evidence. It goes on the corkboard.

### What the Bait Keeps the Hacker Returning For

Each iteration of the bait adds new content to keep the intruder engaged on return visits:

- **Visit 1 (Chapter 3):** Initial files. Intruder reads them, searches keywords, leaves.
- **Visit 2 (Chapter 5):** Player has added the fake password backup and a new doc referencing a "classified annex." Intruder downloads everything, stays longer.
- **Visit 3 (Chapter 7):** Phase 2 full document set. 172KB total. At 1200 baud, takes 24+ minutes to download. Intruder stays for the entire trace.

### The Barbara Sherwin Equivalent

In Chapter 8, the fake SDINET contact "Barbara Sherwin" (the player sets this name when creating the bait context) receives a physical letter. This is the twist that confirms state-sponsored interest — whoever the intruder is working for believed the fake SDINET materials were real intelligence, verified by an external contact attempting to join the mailing list.

The letter is the capstone evidence. The player did not know this mechanic existed when they created the bait. The discovery that the fake name they typed into `construct-bait` received real mail is genuinely surprising.

---

## Part VII: NPC Interaction Design

### NPC Communication Architecture

All NPCs communicate through the terminal interface only. No voice, no portraits, no cutscenes. The personality lives entirely in writing style.

### Helen (Billing, ZeroOne)

**Role:** Discovery NPC. Quest-giver for the initial discrepancy. Persistent ally.
**Communication style:** Warm, slightly anxious, precise about numbers, slightly apologetic for raising issues.
**Knowledge boundary:** Knows billing system, knows which accounts are active, does not know anything about network security.
**Arc:** Goes from "this is probably nothing" to quiet supporter who keeps surfacing new billing anomalies that advance the investigation.

**Sample dialogue (Chapter 6, after Paulson's dismissal):**

```
From: helen@zeroone Thu Nov 17 14:02:11 1988

I know you're dealing with a lot with the FBI thing.
For what it's worth, I've been keeping track of every
small billing anomaly since October and there are now
nine of them. Nine little discrepancies, each under $1.

If someone walked out of here with nine dollars over
two months, we'd notice. I don't know why this is
different just because it's computers.

Anyway. Thought you should know.

Helen

P.S. Thank you for the tacos. I still don't fully
understand how that worked.
```

### Randy (ZeroOne Owner)

**Role:** Comic obstacle. Occasional accidental helper. Wants everything to be fine.
**Communication style:** Incomplete sentences. Apparent distraction. Occasional shrewd observation buried in nonsense.
**Knowledge boundary:** Knows the business side, knows the garage is "kind of the nerve center of the whole thing," does not know how Unix works.
**Arc:** Obstruction → Reluctant acceptance → Unintentional help → Mild pride in outcome.

**Key interaction (Chapter 4, pressing Randy for the court date context):**

```
[talk session with randy@console]

you: Can you tell me more about "the court date" in the tagline?
randy: lol
randy: dont worry about it
randy: theres a sign at the county records office now because of
       something that happened in 2004 with some cooling water
randy: its fine its all fine
randy: why do you ask
you: Trying to understand ZeroOne's legal exposure if the intruder
     story goes public.
randy: oh that
randy: zero
randy: legally speaking
randy: absolutely nothing happened
randy: is what my attorney says
randy: you should keep doing what you're doing
```

### Cosworth (Garage Infrastructure)

**Role:** Background NPC / system indicator. Only appears via automated messages and `wall` broadcasts.
**Communication style:** Does not communicate. Cosworth is the garage's smart power system that Randy installed. It monitors power draw, the Kona's charge level, and the garage door.
**Narrative function:** Comic relief, occasional plot device (a Cosworth alert that "power draw is unusual" during a session when the intruder is downloading large files foreshadows the trace in Chapter 5).

Sample Cosworth messages:
```
[COSWORTH ALERT] Kona charge: 23%. Please move vehicle before 4pm.
[COSWORTH ALERT] Garage door status: open. (This has been open for 6 hours.)
[COSWORTH ALERT] Unusual network activity detected. Power draw elevated.
[COSWORTH ALERT] Someone is using the microwave and the server at the same time. This is not recommended.
```

### mr.pink (Hosted Client)

**Role:** Red herring NPC. BBS operator on ZeroOne's hosting service.
**Communication style:** All caps. Extremely certain about everything. Frequently wrong.
**Narrative function:** Provides a plausible-but-false alternative explanation for suspicious activity (he thinks someone is stealing his Doom shareware; the disk usage anomalies he notices are actually the intruder's file access patterns but for completely different reasons).
**Knowledge boundary:** Knows nothing about the actual investigation. His concerns are entirely self-referential.

mr.pink's mails arrive in the player's inbox as operational noise. They can be ignored. If the player investigates his complaints, they find his BBS in `/usr/clients/mrpink-bbs/` and can see that the disk access logs he's worried about match the intruder's activity timeline — but the intruder was reading defense contractor files, not Doom files. The overlap is coincidental.

### Dirk (ZeroOne Staff, Always Unavailable)

**Role:** Referenced NPC. Never directly interactable.
**Communication style:** Out-of-office replies.
**Narrative function:** Every attempt to get help from ZeroOne's "other sysadmin" (who technically exists) results in an auto-reply about Dirk being on vacation, at a conference, or "taking personal time." Dirk is never reachable.

```
From: dirk@zeroone (AUTORESPONSE)
Subject: Out of Office

I am currently on vacation through [next Monday] and will
have limited access to mail. For urgent matters please
contact Randy.

— Dirk
```

The joke: Dirk's out-of-office changes every time, with a new end date always just past the current moment. By Chapter 7, the dates stop being plausible and start being surreal: "I am on vacation through approximately the end of this decade."

### Agent Paulson (FBI Portland Field Office)

**Role:** Institutional ally, initially resistant. The player's primary external contact.
**Communication style:** Cautious, clipped, federal. Warms slightly by Chapter 8.
**Knowledge boundary:** Knows FBI procedure, knows counterintelligence frameworks exist, does not know Unix. Will reference "the computer stuff" generically.
**Arc:** Dismissal → Qualified interest → Provisional authorization → Full engagement → Genuine respect.

**The Paulson arc is the emotional throughline of Act II.** The player's relationship with him is the measure of how the investigation has grown. His Chapter 8 message — "Good work. I mean that." — lands because of how many chapters of diplomatic friction preceded it.

### Sherry Kowalski (Pacific Bell Network Security)

**Role:** Technical ally. The person who actually runs the traces.
**Communication style:** Efficient, professional, quietly competent. Warmer in person (phone calls) than in mail.
**Knowledge boundary:** Knows phone networks, knows X.25, knows how to trace connections. Does not know what the intruder is after.
**Narrative function:** The trace sequences. Her real-time status messages during the mini-game provide the emotional pulse of the trace.

### The Homelab User Community (Background Noise)

The homelab community (wendell, geerling, technotim, and others) are ZeroOne's typical hosted clients — enthusiasts running personal servers, BBSes, small hobbyist sites. They generate ambient noise:

- Complaints about uptime
- Requests for more disk space
- Mails about whether ZeroOne will ever offer "real" DNS
- Arguments in the client mailing list about the best text editor (emacs vs. vi — this is 1988 and this debate is already years old)

One of their mails is always topical: during Chapter 3's quiet period, someone hosts a discussion about a "Cuckoo's Egg" incident they read about at Berkeley. "Apparently some astronomer-turned-sysadmin found a hacker by checking billing discrepancies. Wild." This is the game acknowledging its source material.

### CERT Operations

**Role:** Coalition builder. External validation.
**Communication style:** Technical, measured, bureaucratically careful but genuinely helpful.
**Narrative function:** The Chapter 6 breakthrough. The multi-site pattern is only visible through CERT's coordination.

### Jorge (Longview Taco Bell)

**Role:** Comic anchor. Reliable presence throughout the game.
**Communication style:** Extremely earnest. Slightly confused by the technology. Never misses an order.
**Knowledge boundary:** Tacos. The drive-through. The closing procedure. Occasionally sees things.
**Narrative function:** Rest beat anchor. His consistency — always there, always filling orders, mildly baffled by the whole computerized ordering system — is grounding.

---

## Part VIII: Parallel Investigation Threads

At most points in Acts II and III, the player has access to 2–3 concurrent threads.

### Thread A: The Compute Discrepancy Trail
**Primary thread.** Log analysis, billing correlation, accounting audit.
- Drives: Chapter 1 opening, Chapter 2 pattern recognition, ongoing log monitoring
- Tools: `sa`, `lastcomm`, `last`, `acct`
- Reward: The five-session timeline, the session pattern, the keyword evidence

### Thread B: The People Trail
**Who has access. Who is behaving strangely.**
- Drives: The cosworth account investigation, the `.rhosts` backdoor discovery, the defense contractor client connection
- Tools: `finger`, `who`, `/etc/passwd`, `.rhosts` audit
- Reward: Understanding the attack vector, confirming the intruder isn't a ZeroOne employee

### Thread C: The Network Trail
**Where is the stolen information going. What's running on the network.**
- Drives: The Tymnet relay discovery, the international gateway identification, the multi-site correlation
- Tools: `netstat`, `finger @host`, `traceroute`, CERT coordination
- Reward: Geographic attribution, state-sponsored confirmation

### Thread Convergence

All three threads converge at Chapter 7. Thread A (billing pattern) + Thread B (account access method) + Thread C (network origin) together form the complete case: someone in West Germany used a backdoor test account to escalate privileges and steal defense contractor materials from a small hosting shop in Longview, Washington, as part of a coordinated multi-site operation.

### Thread Cross-Pollination

- Thread A evidence (session timing) feeds Thread C (timezone attribution)
- Thread B evidence (`.rhosts` backdoor) feeds Thread A (explains why the billing anomaly was so small — the intruder could have done more but was being conservative)
- Thread C evidence (multi-site pattern from CERT) feeds Thread B (confirms this isn't random — other sites have the same account creation pattern)

---

## Part IX: Evidence Board / Case File System

### The `corkboard` Command

The corkboard is the player's persistent investigation artifact. It stores evidence, supports connections between items, and generates summaries.

**Basic operations:**

```
corkboard                    — view current state (ASCII art display)
corkboard add <evidence-id>  — pin evidence to the board
corkboard connect A B "note" — draw a connection between two items
corkboard summary            — LLM-generated plain-English case status
corkboard package            — assemble evidence for formal submission
corkboard timeline           — chronological view of all evidence
```

### Evidence Types

| Type | Example | How Acquired | Display |
|------|---------|-------------|---------|
| Log entry | Sep 3 SUID shell creation | `save <filename>` while viewing a log | Monospace text with timestamp |
| Session transcript | Oct 27 honeypot session | Auto-generated by monitoring script | Command sequence log |
| Mail message | Sherry's trace result | `save` from mail client | Quoted mail with headers |
| Trace result | Int'l gateway identified | Auto-generated by trace mini-game | Call path diagram |
| Honeypot record | SDI file accessed | Auto-generated by monitor.sh | Event record |
| NPC testimony | CERT seven-site confirmation | `save` from talk/mail | Quoted statement |
| Theory | Player's hypothesis | `corkboard note "text"` | Marked `[THEORY]` |

### Terminal-Native Evidence Board Display

```
sysadmin@zeroone% corkboard

╔══════════════════════════════════════════════════════════════════════╗
║  ZEROONE INVESTIGATION BOARD                        [21 items, 14 connections]
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  [E01] 75-cent discrepancy (Helen's mail)                           ║
║         |                                                            ║
║         +---> [E02] cosworth account (created 1987, no owner)       ║
║                 |                                                    ║
║                 +---> [E03] Sep 3 session (38min, Tymnet-PDX)       ║
║                 |           |                                        ║
║                 |           +---> [E04] SUID shell in syslog        ║
║                 |           |                                        ║
║                 |           +---> [E05] rlogin to pacnw-defense     ║
║                 |                                                    ║
║                 +---> [E06] Oct 6 session (9sec, Tymnet-PDX)        ║
║                 |                                                    ║
║                 +---> [E07] .rhosts backdoor (+ +)                  ║
║                                                                      ║
║  [E08] Oct 27 honeypot access (SDI_TARGETING_DATA.dat)             ║
║         |                                                            ║
║         +---> [E09] Intruder keyword searches: "warhead", "NORAD"  ║
║                                                                      ║
║  [T01] THEORY: This is not Randy. Timestamps don't match.          ║
║  [T02] THEORY: 2am Pacific = mid-morning Europe. Timezone tell.    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
[i] items  [c] connections  [s] summary  [p] package  [t] timeline
```

### Case Summary Output (LLM-Generated)

```
sysadmin@zeroone% corkboard summary

CASE SUMMARY — ZeroOne Hosting Intrusion Investigation
Generated: Thu Nov 10 09:44:22 1988

WHAT WE KNOW:
An unauthorized account (cosworth) has been used for at least 5
intrusion sessions dating back to May 1988. All sessions originate
from tymnet-pdx.x25, a Tymnet relay that receives international
connections. Sessions consistently occur at approximately 2am Pacific
time, consistent with a European timezone.

On September 3rd, the intruder escalated privileges to root using
a SUID binary exploit, created and deleted a root shell within 2
minutes, and used rlogin to access files belonging to ZeroOne's
hosted client pacific-northwest-defense-consulting. The accessed
files related to Strategic Defense Initiative subcontracting.

The intruder accessed a honeypot file on October 27th and searched
for SDI and NORAD-related keywords, confirming their interest in
defense-related information.

WHAT WE SUSPECT:
The consistent time pattern and use of Tymnet's international
gateway suggests an origin in Europe. The keyword interests match
patterns consistent with intelligence gathering on US defense programs.

WHAT WE STILL NEED:
- Geographic attribution beyond "international via Tymnet"
- Evidence linking this to other sites (coordination in progress)
- Identity attribution
- Motive confirmation

INVESTIGATION STATUS: Active — Phase 2 tracing authorized
```

---

## Part X: AI Agent Boundaries Per Chapter

### What the AI Knows vs. Does Not Know

The AI (LangGraph backend) receives a phase-locked context that reveals information incrementally.

| Chapter | AI Can Reference | AI Cannot Reference |
|---------|-----------------|-------------------|
| 1 | $0.75 discrepancy, cosworth account, Tymnet relay | German origin, espionage, other sites |
| 2 | All of Ch1 + session pattern, SUID exploit, defense file access | International scope, intruder identity, KGB analog |
| 3 | All previous + honeypot concept, Oct 27 access | Trace results, multi-site scope |
| 4 | All previous + first partial trace, FBI authorization | International confirmation, other sites |
| 5 | All previous + international relay confirmed | German specific location, identity, Balogh letter |
| 6 | All previous + multi-site coordination, CERT | German city, specific address, identity |
| 7 | All previous + West Germany origin, Datex-P | Specific address, identity, Balogh letter |
| 8 | Full context | N/A — chapter is resolution |

### What the AI Should Never Reveal Prematurely

1. That the intruder is in West Germany (before Chapter 7's trace)
2. That this is state-sponsored intelligence gathering (before Chapter 7's CERT analysis)
3. The Balogh equivalent letter (before Chapter 8)
4. That there are other sites (before Chapter 6's CERT contact)
5. The identity of the intruder (never — this is intentionally left ambiguous)

### Scripted vs. Generated Content

| Content | Type | Rationale |
|---------|------|-----------|
| Helen's initial email | Scripted | Tutorial entry point — must be specific |
| Randy's dismissal | Scripted | The "nobody cares" moment — requires exact tone |
| Syslog entries with exploit evidence | Scripted (core) + Generated (noise) | Core clues cannot be hallucinated |
| Paulson's dismissal and recovery arc | Scripted (key beats) + Generated (responses to player messages) | Arc shape is fixed; conversational texture is generated |
| Jorge's delivery confirmations | Generated | Humor benefits from variety |
| Sherry's trace status messages | Mix — key milestones scripted, connective tissue generated | Milestones are plot beats; in-between messages are texture |
| Session transcripts from intruder | Scripted (command sequence) + Generated (content of file reads) | Commands are plot-determined; file content is flavor |
| Cosworth alerts | Generated from templates | Randomized from a set of plausible alerts |
| mr.pink's complaints | Generated within character | His concerns are never plot-critical |
| CERT coordination mails | Scripted | Key plot beats |
| TacoNet UX copy | Mix — structure scripted, specific menu items generated | Structure is consistent; specials are dynamic |

### AI Guardrail Implementation

**Phase-gated context injection:** The LangGraph state includes `chapter: number` and `unlocked_context: string[]`. Each NPC's system prompt is assembled by combining the static persona document with only the unlocked context items for the current chapter.

**Response validation:** All NPC responses pass through a classifier that checks for premature revelation. If any of the "never reveal prematurely" items are detected before their chapter unlock, the response is regenerated with an explicit negative constraint added to the prompt.

**Character knowledge isolation:** Helen's context does not include network topology. Randy's context does not include the intruder's methods. Sherry's context does not include the intelligence nature of the theft. Each character knows only what their role would give them access to.

---

## Part XI: Win/Fail Conditions

### Win Condition

**Primary win:** The player submits a complete formal incident report in Chapter 8 with evidence across all six required sections. The report is delivered to Paulson, CERT, and the affected client.

**What "complete" means:**
- Unauthorized Access: at least one confirmed session with source documented
- Method: the SUID exploit documented from syslog
- Pattern: at least three sessions documented in the timeline
- Intent: the defense file access + honeypot keyword evidence
- Origin: the international relay confirmation + West Germany attribution
- Scope: CERT multi-site coordination evidence

A report submitted with gaps produces a proportional response from Paulson — "This is a start, but we're missing [X]. Can you supplement?" The player can submit multiple times.

### There Is No Fail State

The investigation cannot be "lost." The intruder cannot be permanently scared off (they return after a quiet period). Evidence cannot be permanently destroyed (the logs are replicated to an archival system the player discovers in Chapter 3).

**Consequence states, not failure states:**
- Spooking the intruder extends the Chapter 5 quiet period
- Weak bait quality produces shorter trace sessions and partial results
- Assembling the final report with minimal evidence produces a weaker institutional response (the case gets less attention, Paulson's closing message is less warm)
- Not ordering tacos has no mechanical consequence but George the TacoNet assistant sends an increasingly concerned mail about the player's order history around Chapter 6

### Patience Meter Consequences

When the Patience Meter empties, "Fed Up Mode" activates. This is a story-visible change in the player character's communication style. It is not failure — it is characterization. Some Fed Up mode mails are more effective (Paulson is briefly impressed by the directness). None permanently damage NPC relationships.

---

## Part XII: Pacing Guide

### Per-Chapter Time Estimates and Rhythm

| Chapter | Target Duration | Intensity | Humor Level | Rest Beats |
|---------|----------------|-----------|-------------|------------|
| 1 | 20–30 min | Low → Medium | High (Randy's email) | Initial taco introduction |
| 2 | 30–45 min | Medium | Medium | mr.pink's BBS complaint |
| 3 | 30–45 min | Low (waiting) → High (spike) | High (taco ordering during wait) | Structured wait period |
| 4 | 30–45 min | Medium (frustration) | Medium (Paulson's formality vs. player's garage) | Bureau Buster unlocks |
| 5 | 20–30 min | HIGH (real-time) | Low during trace, Jorge delivery during trace | Taco interruption gag |
| 6 | 30–45 min | Medium (sustained low) | High (Dirk's out-of-office, Randy's wall messages) | Patience meter explainer |
| 7 | 45–60 min | High → Very High | Low–Medium | Phase 2 bait creation as satisfying work |
| 8 | 30–45 min | Medium (methodical) | Low → Warmth | The Smoking Gun special, epilogue |

### When to Inject Humor

Humor should appear:
1. **After every institutional dismissal** — Randy's dismissal email is funny. Paulson's formal rejection is funny. NSA's jurisdictional deflection is very funny.
2. **During the wait periods** — Chapter 3's quiet period and Chapter 6's bureaucratic paralysis are where taco ordering, Dirk's out-of-office, and Cosworth alerts do their best work.
3. **Jorge's delivery confirmations** — during Chapter 5's trace sequence, the taco delivery arriving at the worst moment is timed for maximum absurdity.
4. **Dirk's escalating out-of-office replies** — these can be checked at any time and get progressively stranger.
5. **Randy's wall broadcasts** — these fire on a schedule regardless of chapter, adding ambient comedy.

### When to Ramp Tension

- **Chapter 2 → 3 transition:** The revelation of five sessions. The investigation doubles in scope.
- **Chapter 5 real-time sequence:** Pure tension. No humor during the active trace (the Jorge delivery interruption is the one release, and it lands because everything else is so tense).
- **Chapter 7 Phase 2 reveal:** The bait is deployed. The trap is set. The moment the monitoring script alert fires is the game's most satisfying click.
- **Chapter 8 case assembly:** Not tension, but the satisfaction of completion. The evidence chain building up to the final submission has a cathedral-building quality.

### The Emotional Arc

```
Ch1: Mild curiosity → Dismissed → Thread-pulling itch
Ch2: Growing certainty → Nobody believes it → Isolation
Ch3: Methodical preparation → Quiet → First confirmation
Ch4: Frustration → Bureaucratic attrition → First ally
Ch5: Pure tension → Partial victory → International revelation
Ch6: Disillusionment → Solidarity (CERT) → Renewed purpose
Ch7: Expansion → The case is real → The case is solved
Ch8: Assembling proof → Submission → "Good work. I mean that."
Epilogue: Smile. Another 12 cents. Always another 12 cents.
```

---

## Appendix A: Command Reference Per Chapter

### Commands Introduced By Chapter

| Chapter | New Commands | New Concepts |
|---------|-------------|-------------|
| 1 | `mail`, `sa`, `lastcomm`, `last`, `who`, `finger`, `grep`, `cat` | Account investigation, billing correlation |
| 2 | `find`, `acct`, `tail -f`, `ls -la`, `more` | Log pattern recognition, SUID indicators |
| 3 | `mkdir`, `touch`, `chmod`, `cp`, `monitor.sh`, `find / -perm -4000` | Honeypot creation, SUID audit, monitoring |
| 4 | Mail composition, `corkboard package` | Evidence assembly, NPC persuasion |
| 5 | Trace mini-game controls | Real-time observation, bait management |
| 6 | `talk`, CERT coordination mail | Coalition building |
| 7 | `construct-bait`, `netstat`, `traceroute` | Large-scale bait, network topology |
| 8 | `corkboard package --final`, `submit` | Case assembly, formal reporting |

---

## Appendix B: Key Log Entries Reference

These are the plot-critical log entries that must exist in the deterministic game state. LLM-generated entries surround them as noise.

### Chapter 1 Required Entries

**`/var/log/acct` output (via `sa`):**
```
cosworth    0.1re    0.0cp     0avio     0k
```

**`lastcomm cosworth` output:**
```
sh       cosworth ttyp3    0:00.0  Thu Oct  6 02:17
ls       cosworth ttyp3    0:00.0  Thu Oct  6 02:17
cat    F cosworth ttyp3    0:00.0  Thu Oct  6 02:17
```

**`last cosworth` output:**
```
cosworth ttyp3  gateway-pdx.uucp  Thu Oct  6 02:17 - 02:17  (00:00)
```

### Chapter 2 Required Entries

**`last -60` buried entry:**
```
cosworth ttyp3  tymnet-pdx.x25  Sat Sep  3 02:44 - 03:22  (00:38)
```

**`lastcomm cosworth` for September 3rd:**
```
sh    SF root    ??   0:00.2  Sat Sep  3 03:16
chmod SF root    ??   0:00.2  Sat Sep  3 03:16
```

**`/var/log/syslog` for September 3rd:**
```
Sep  3 03:14:01 zeroone-main cron[445]: (root) CMD (cp /bin/sh /tmp/.zeroone_tmp)
Sep  3 03:14:01 zeroone-main cron[445]: (root) CMD (chmod 4755 /tmp/.zeroone_tmp)
Sep  3 03:16:44 zeroone-main su: SUID on /tmp/.zeroone_tmp
Sep  3 03:17:00 zeroone-main cron[445]: (root) CMD (rm /tmp/.zeroone_tmp)
```

### Chapter 5 Required Trace Result

After Hop 5 completes:
```
TRACE COMPLETE — Pacific Bell / AT&T / Tymnet International
Origin path: tymnet-pdx.x25 -> AT&T LD -> Tymnet INTL-GW-3
INTL-GW-3 handles: UK PSS, German Datex-P, French TRANSPAC
Geographic origin: Europe (timezone UTC+1 to UTC+9)
```

### Chapter 7 Required Trace Result

```
TRACE COMPLETE — Pacific Bell / Tymnet / Deutsche Bundespost
Origin path: INTL-GW-3 -> Datex-P -> univ-bremen.datex-p.de
Geographic origin: West Germany, Bremen relay node
```

### Chapter 8 Required Physical Mail Notation

```
[INCOMING PHYSICAL MAIL — ZeroOne Hosting — Nov 30 1988]
Addressee: Barbara Sherwin, SDINET Project, ZeroOne Hosting, Longview WA
Return address: Prague, Czechoslovakia
Content: Request to join SDINET mailing list and receive published materials
Status: No such person at this address — retained as evidence
```

---

*End of Document*
