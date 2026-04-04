# ZeroOne Hosting — Lore Reference

## Company Overview

**ZeroOne Hosting** is a one-man hosting operation run out of a garage in Kelso, WA, approximately 50 miles north of Portland and within sight (on clear days) of Mt. St. Helens. It should not work. It mostly does.

**Tagline:** "If you have a problem, if no one else will host your shit..."

**Slogan:** "Lowering expectations since our court date"

---

## Location

- Kelso, WA — not Seattle, not Portland, not anywhere with a proper datacenter presence
- Garage facility adjacent to residential property
- Mt. St. Helens visible on clear days (has erupted once since the servers were installed; servers survived)
- Primary food supply: Jorge at the Kelso Taco Bell, 1.2 miles away
- Primary network dependency: whichever 3 of idpromnut's 7 neighbor WiFi SSIDs are currently reachable

---

## Infrastructure

### Power
- **Primary UPS:** Hyundai Kona (electric vehicle; parked in garage; provides meaningful runtime)
- **Secondary UPS:** Extension cord daisy-chain to the house panel
- **Cooling:** Garage door (open = cold aisle; closed = warm aisle; wind direction matters)
- **Emergency cooling:** The Kona's AC, pointed at the rack

### Network
- 3 of 7 neighbor WiFi connections in active rotation
- idpromnut (the neighbor) changes SSIDs periodically without warning; this is a recurring incident
- No fiber. No dedicated circuit. This is intentional in the sense that it hasn't been fixed yet.
- `/dev/garage0` — the logical interface for garage door operations, also doubles as a network diagnostic tool ("is the door open?" correlates with "is the cooling working?")

### Servers
- Vendor pens used to label servers (Sharpie ran out in Q2; pens were free at a conference)
- Masking tape labels on hardware that arrived without asset tags
- Mix of thrifted gear and one legitimately purchased server (the receipt is lost)
- OpenStack running alongside everything else because Randy started that migration and it's not done

### The Rack
- Not a proper rack
- Described internally as "rack-adjacent"
- Rails scrape knuckles; this is considered normal

---

## Software Systems

### ZORK v2.1
**Zero One Recovery Kernel**

The recovery and bootstrap system. Named because the first version had the same energy as typing `XYZZY` and hoping. v2.1 is more stable than v1.x in the ways that matter and less stable in ways that haven't caused problems yet.

- Handles boot recovery, service restart sequencing, and "the thing that happens when the Kona's charge drops below 15%"
- Documentation exists; it is in Randy's head and a Google Doc that hasn't been updated since v1.4
- Known issue: ZORK v2.1 does not handle simultaneous garage door open + network failover gracefully

### TACO v0.3
**Taco Automated Curro Ordering**

Automates Taco Bell orders to Jorge during extended maintenance windows. Integrated with the ZeroOne monitoring stack: when uptime SLA breach is imminent, TACO queues an order so Randy has food for the long haul.

- v0.3 added support for the Crunchwrap Supreme
- v0.2 had an incident where it ordered 14 bean burritos; root cause was a loop condition; Jorge has forgiven this
- Considered business-critical infrastructure

### SparkStation One
The primary operator terminal. Physical hardware. Named with the same energy as a Sun workstation but with none of the budget. Where Randy does most of his work, runs diagnostics, watches logs, and occasionally sleeps.

---

## Key Personnel

### Randy
Owner, operator, primary engineer, secondary engineer, billing department when Helen is unavailable, cooling system manager (opens/closes garage door), and the person who knows where all the cables actually go.

- Available hours: unpredictable
- Response time: faster than the SLA says; slower than the situation requires
- Primary nutrition source: Jorge's Taco Bell
- Does not take vacations (see: Dirk)

### Helen
Billing. Helen handles billing. Helen is the reason ZeroOne has been paid for services rendered. Helen's relationship to the technical infrastructure is: she doesn't touch it, it doesn't touch her, and this works.

- Invoices go out
- Invoices get paid (eventually)
- Helen has opinions about the TACO system's expense categorization

### Cosworth
The garage door. Named after a Ford engine family. Cosworth is `/dev/garage0` — the physical interface between the outside world and the ZeroOne facility. Cosworth has a personality in the sense that it sometimes opens when not asked and sometimes doesn't open when asked. Firmware update pending since 2022.

### mr.pink
The disco ball. Mounted above the rack in 2019 during a moment of optimism. Now serves as a passive indicator of ambient light levels and power stability (wobbles slightly when the Kona switches to discharge mode). Named after the Reservoir Dogs character because Randy was watching it during the installation.

### Dirk
Head of Documentation and API Relations. Always on vacation. The API docs exist because Dirk wrote them before his last vacation and has not returned to update them. The docs are accurate for the version of the API that existed when Dirk left. What version that was is unclear.

- Vacation status: ongoing
- Contact method: unavailable
- Documentation quality: surprisingly good for someone who is never here

### Jorge
Works at the Kelso Taco Bell. Not an employee of ZeroOne. Has nonetheless become load-bearing infrastructure. Jorge knows Randy's usual order, has accepted automated orders from TACO v0.3 without complaint (except for the 14-burrito incident), and represents the single most reliable supply chain ZeroOne has.

### idpromnut
The neighbor. Changes their WiFi SSID without warning or pattern. ZeroOne depends on 3 of idpromnut's 7 networks for redundancy. idpromnut is unaware of this dependency. This is a known risk that has been documented and not mitigated.

---

## Service Tiers

| Tier | Name | Description |
|------|------|-------------|
| Tier 1 | **Oops** | Basic hosting. Things run. Sometimes they stop. Randy will notice eventually. |
| Tier 2 | **At Least We Tried** | Monitoring enabled. Randy gets an alert. Randy may be asleep. |
| Tier 3 | **Garage Premium** | Randy's personal attention. Reserved for customers who have been here long enough to have Randy's cell number. |

SLA language in all tiers contains the phrase "subject to Kona charge levels and garage door availability."

---

## Homelab User Community

ZeroOne's customer and community base. These are the people who find ZeroOne acceptable or even preferable to alternatives.

`wendell` / `salem` / `craft` / `coffee` / `hacker` / `geerling` / `technotim` / `networkchuck` / `wolfgangs` / `lawrence` / `spacerex` / `dbtech` / `raidowl` / `lempa` / `ychto` / `lickity`

These are people who understand that "it works" is the primary metric and "how it works" is secondary.

---

## The $0.75 Mystery

The inciting incident. An accounting anomaly of 75 cents — too small to matter, too consistent to be noise. First noticed in the ZeroOne billing system. Helen flagged it. Randy couldn't explain it. The investigation that followed became something else entirely.

The $0.75 is the thread. Everything unravels from there.

---

## Relationship to Yolo Colo

Yolo Colo is the "serious" datacenter. Raised floors. Cable maps. Labeled everything. Cold/hot aisle discipline. The kind of place that has a change management process and follows it.

ZeroOne is not that.

| Yolo Colo | ZeroOne |
|-----------|---------|
| Raised floor tiles | Concrete garage floor |
| Cable maps match reality | Cables go where they reach |
| Label-maker tape | Vendor pens on masking tape |
| Cold/hot aisle | Open garage door / closed garage door |
| ZFS scrubs on schedule | Kona battery as primary UPS |
| Restore drills | "We have backups" |
| Change management process | Randy decides |
| Calm telemetry | TACO v0.3 fires when things get bad |

Ychto, who is associated with Yolo Colo, regards ZeroOne with the specific respect reserved for things that shouldn't work but do. The professionalism gap is real. The uptime gap is smaller than it should be. This fact quietly bothers Ychto.

ZeroOne doesn't aspire to be Yolo Colo. Yolo Colo, privately, is slightly impressed by ZeroOne's persistence.

---

## Operational Philosophy

ZeroOne does not have a formal operational philosophy. If it did, it would be:

- "It's up, isn't it?"
- "The Kona has 40% charge. We're fine."
- "Jorge opens at 6. We can fix this by 7."
- "Dirk wrote docs for that. They might still be accurate."

---

## Narrative Uses

- ZeroOne is the chaotic counterpoint to Yolo Colo's order
- Randy is the protagonist-adjacent figure who solves problems with ingenuity and Taco Bell
- The $0.75 mystery threads through ZeroOne's story as the inciting incident
- Infrastructure failures are comedic but not trivial — the Kona dying is a real problem
- The homelab community provides a chorus of voices who find ZeroOne's situation relatable
- TACO and ZORK are both load-bearing and funny; don't make them reliable in a boring way
- idpromnut is a recurring environmental hazard, never a villain
- Dirk's absence is a running joke with a documentation punchline
