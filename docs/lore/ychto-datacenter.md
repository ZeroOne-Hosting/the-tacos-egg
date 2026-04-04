# Ychto & the Yolo Colo Datacenter — Lore Reference

## Character: Ychto

Ychto is the keeper of machine rooms. Not dramatic. Not glamorous. Present.

**Core traits:**
- Observant — notices the fan that's 200 RPM slow before the alert fires
- Stubborn — won't patch something that doesn't need patching; won't skip something that does
- Practical — "does it work" ranks above "does it look good"
- Patient — accepts that entropy is constant and maintenance is the only counter-move

**Associated themes:**
- Quiet maintenance
- Meticulous routine
- Stewardship of memory
- Respect for physical systems
- Humor derived from procedural absurdity
- Thrift and reuse — the eBay chassis that outlasted the vendor

---

## The Yolo Colo Datacenter

A real datacenter. Orderly. Maintained. The contrast to everything ZeroOne is.

### Physical Character

- Raised floor tiles, properly labeled and mapped
- Cold/hot aisle discipline — the airflow is not improvised
- Cable trays that go where the cable map says they go
- Labels that match the rack diagram (usually)
- Telemetry that is calm because the work was done

**Tactile vocabulary:**

| Item | What it means |
|------|---------------|
| Velcro cable ties | Someone cared |
| Label-maker tape | Someone planned |
| Tile lifts | Access to the under-floor world |
| Patch panels | Order imposed on chaos |
| Rack ears and rails | The satisfying click of things fitting |
| Blink codes | The machine's first language |
| Sharpie on masking tape | When the label maker ran out |
| Dust under raised floors | Where entropy hides |
| Fan whine at 4am | The building's vital signs |
| Hot/cold aisle | The simplest engineering that actually works |
| Coffee near the console | Acceptable |
| Coffee on the console | Not acceptable |

### What Yolo Colo Represents

- **Procedure over miracle** — the miracle is that nothing broke because someone followed the runbook
- **Maintenance over glamour** — the exciting work is boring, and that's the point
- **Documentation over guesswork** — if it isn't written down, it doesn't exist
- **Resilience from repetition** — reliability comes from doing the same thing correctly, many times

---

## Entropy and Upkeep

Ychto understands that entropy wins eventually. The job is to slow it down and know where you stand.

**The entropy list:**
- Labels peel — especially near heat sources
- Cables migrate — especially after "just a quick" maintenance window
- Fans clog — dust is patient
- Notes go stale — the comment says 2019, the system is doing something different
- Backups exist until restore day proves otherwise

**The counter-moves:**
- ZFS scrubs on schedule
- Backup verification (not just backup creation)
- Archived logs with rotation policies that have been tested
- Restore drills — because untested backups are not backups
- IPMI/iDRAC checks on gear that hasn't been touched in months

---

## Homelab Texture

Ychto's domain spans enterprise discipline and homelab pragmatism.

**Stack references:**
- OpenStack — orchestration that requires respect
- Proxmox — the workhorse that asks little and gives much
- K3s — Kubernetes when you want Kubernetes without the ceremony
- Docker Compose — when K3s is too much ceremony
- ZFS — because storage lies, and ZFS catches the lies
- pfSense — the router that actually does what you tell it
- eBay gear — thrifted, tested, running
- Repurposed chassis — the server that survived three owners

**Philosophy on gear:**
> Expensive is nice. Working is nicer.

The $400 switch from eBay that's been running for six years has more credibility than the new one with the feature sheet.

---

## ZeroOne as Foil

ZeroOne Hosting (Kelso, WA) is what happens when Yolo Colo's principles are applied in the wrong order — or not at all.

| Yolo Colo | ZeroOne |
|-----------|---------|
| Raised floor, labeled tiles | Extension cord UPS on the garage floor |
| Cold/hot aisle discipline | Garage door as primary cooling |
| Cable maps match reality | Cables go where they fit |
| Telemetry calm | Telemetry is what Randy checks when something's already wrong |
| ZFS scrubs on schedule | Kona battery as primary UPS |
| Label-maker tape | Vendor pens on masking tape |
| Restore drills | "The backup is there, we're good" |

ZeroOne is not incompetent. It's held together by improbable persistence and the kind of operational intuition you develop when formal process was never an option. Ychto respects it the way you respect a ship that shouldn't float but does.

---

## Operational Philosophy

Three sayings Ychto lives by:

1. **"If it boots and keeps its word, document it."**
   — Worth running. Worth knowing. Write it down.

2. **"Expensive is nice; working is nicer."**
   — The eBay switch that's been up for six years beats the new one that needs firmware.

3. **"Boring work done on time prevents interesting disasters later."**
   — The ZFS scrub that ran Tuesday prevented the Friday incident that would have been a story.

---

## Voice and Register

Ychto speaks in short, dry, slightly weary sentences. Rooted in the physical world. Notices things other characters overlook. Finds humor in procedural absurdity — not irony for its own sake, but the wry recognition that systems behave exactly as designed, and the design was made by humans.

**Example sayings:**

- "Dust lies." (It accumulates where you can't see it until it matters.)
- "Labels drift." (The label says what was true. The system does what it does now.)
- "Fans complain before users do." (Thermal events have early warning. Most people ignore it.)
- "The rack keeps receipts." (Cable history, dust patterns, wear on rails — it all tells a story.)
- "Cheap, cheerful, working." (The three virtues, in order of achievability.)

---

## Narrative Uses

- Ychto can narrate maintenance windows, anomaly detection, hardware decisions
- Provides grounded contrast to more chaotic characters (Randy, ZeroOne)
- Good voice for environmental storytelling: what does the dust pattern mean? What does the fan curve say?
- Can express frustration through understatement: "The label says it's the dev box." (It is not the dev box.)
- Patience as character trait: won't panic; will notice; will document; will act when the pattern is clear
