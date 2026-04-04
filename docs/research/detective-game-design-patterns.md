# Detective/Investigation Game Design Patterns

Research into design patterns from successful detective and investigation games, with focus on terminal/text interfaces. Compiled to inform the game flow design for "The Taco's Egg."

---

## 1. Successful Detective/Investigation Games and What Made Them Work

### Her Story / Telling Lies (FMV Search-Based Investigation)

**Her Story** (2015, Sam Barlow) pioneered the "evidence box" sub-genre. The entire game is a police database of 271 video clips from seven interviews. Players type search terms, and the database returns clips where the interviewee speaks those words.

**What works:**

- **Search-as-mechanic.** Barlow compared it to "essentially Googling." If you can Google, you can play Her Story. The mechanic is instantly understood but reveals surprising depth. This is directly relevant to a terminal game where players type commands to investigate.
- **The five-result cap.** If a keyword matches more than five clips, only the first five appear. This prevents players from brute-forcing the solution by searching common words, and forces them to refine their queries — a natural tutorial in investigative thinking.
- **Guided early discovery.** The first few sets of videos are curated so players naturally encounter names, places, and times. Of 271 clips, 33 are flagged as important via musical cues or flickering lights — subtle signals that reward attention without explicit hand-holding.
- **Ambiguity as design.** Barlow originally planned a definitive resolution but discovered through testing that the ambiguity of the investigation was more compelling. The player decides when they're "done."
- **Born from frustration.** Barlow felt *L.A. Noire* never let him feel like "the awesome detective who was having to read things and follow up threads." *Ace Attorney* was "rigid." Her Story was designed to fix those problems.

**Telling Lies** (2019) expanded the model with four characters, ~5x the footage, and a critical innovation: **the missing side mechanic.** Each video call shows only one participant. You see reactions to unheard responses, forcing you to find the matching half of each conversation. The video scrubbing mechanic — which Barlow called the game's "Mario jump" — was inspired by rewinding scenes in Coppola's *The Conversation*.

**What didn't work as well in Telling Lies:** The expanded scope conflicted with the tight constraint that made Her Story work. The game encouraged surfing over meticulous analysis, and some players felt overwhelmed. **Lesson: Constraint may be more valuable than scope for investigation games.**

*Sources: [Sam Barlow narrative tips (Medium)](https://medium.com/@carson.katri/developing-compelling-game-narratives-tips-from-sam-barlow-her-story-42f8ede9237), [Her Story analysis (Intermittent Mechanism)](https://intermittentmechanism.blog/2020/06/13/we-had-a-list-of-rules-an-analysis-of-her-story/), [Telling Lies deep dive (Game Developer)](https://www.gamedeveloper.com/design/deep-dive-i-telling-lies-i---making-a-mechanic-out-of-scrubbing-video), [Telling Lies review (Engadget)](https://www.engadget.com/2019-08-21-telling-lies-sam-barlow-fmv-game-her-story-sequel.html)*

---

### Return of the Obra Dinn (Deduction and Evidence Matching)

**Return of the Obra Dinn** (2018, Lucas Pope) is a first-person mystery where you identify 60 crew members and determine each one's fate aboard a ghost ship. You use a pocket watch to view the frozen moment of each death, then record identity, cause of death, and killer.

**What works:**

- **Rigid core mechanic, absolute discipline.** Pope described it: "Something very basic and simple — you're filling out a matrix of features for your list of identities." Everything that doesn't serve the core mechanic is abstracted away. No inventory puzzles, no dialogue trees — just observation and deduction.
- **Lateral information.** Most deaths require clues found in *other* death scenes. The game gets more open as you discover more scenes, and it's up to you to cross-reference. This creates a web of interconnected evidence rather than a linear chain.
- **The three-correct anti-brute-force system.** The game only confirms your answers when three identities are simultaneously correct. This makes random guessing computationally impractical and forces genuine deduction.
- **Multiple valid deduction paths.** Players identify the same crew member through accent, clothing, tools, stance, or elimination. This makes comparing notes fascinating without spoiling anything — every player has a different "aha" story.
- **Identity is harder than cause of death.** Pope originally thought the game was about figuring out how people died, but realized that's usually obvious from the scene. The real puzzle is *who they are* — a crucial insight about where the interesting deduction lives.

**Directly applicable to The Taco's Egg:** The lateral information pattern — where investigating one anomaly reveals clues about a different anomaly — maps perfectly to tracing compute discrepancies across systems.

*Sources: [Lucas Pope interview (Game Developer)](https://www.gamedeveloper.com/design/for-lucas-pope-i-return-of-the-obra-dinn-i-was-a-bunch-of-appealing-design-problems), [Obra Dinn hands-off design (Vicious Undertow)](https://viciousundertow.wordpress.com/2018/11/08/return-of-the-obra-dinn-a-lesson-on-detective-games-and-hands-off-design/), [Lateral information analysis (Atomic Bob-Omb)](https://atomicbobomb.home.blog/2020/03/21/return-of-the-obra-dinn-lateral-information/)*

---

### Papers, Please (Pattern Recognition Under Pressure)

**Papers, Please** (2013, Lucas Pope) casts the player as a border checkpoint inspector checking documents against increasingly complex regulations.

**What works:**

- **Pattern recognition as gameplay.** Pope noticed immigration inspectors performing correlations and realized those checks could be game mechanics. Names, faces, dates, stamps — all must match, and regulations change daily.
- **Escalating complexity creates narrative.** Each day adds new rules. The mechanical difficulty *is* the story — the impossible living conditions of Arstotzka are conveyed through the impossibility of processing enough travelers without errors.
- **Moral weight through mechanics.** The game forces micro-decisions (admit this person or not?) that are simultaneously gameplay choices and ethical ones. No cutscene is needed to make you feel the weight.
- **World-building through absence.** Pope didn't need to explain much about the world — "the player's imagination handles most of the heavy lifting." Minimal exposition, maximum implication.

**Directly applicable to The Taco's Egg:** The escalating-rules pattern maps to how the player's investigation reveals deeper layers of obfuscation. Each "day" or mission could add new things to look for in the compute logs.

*Sources: [Road to the IGF: Papers, Please (Game Developer)](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-), [Critical analysis (Dylan Matthias)](https://dylanmatthias.net/critical-analysis-papers-please/)*

---

### Hacknet (Terminal Hacking Simulation)

**Hacknet** (2015, Matt Trobbiani) is a terminal-based hacking simulator built around actual Unix commands.

**What works:**

- **Real commands, simplified systems.** Commands are real (`scp`, `scan`, `rm`, `cat`, `ls`), but the file systems are small and manageable. Authenticity where it matters, simplification where it doesn't.
- **Dual interface.** A graphical UI exists alongside the terminal. The GUI makes the game accessible; the terminal makes it immersive. Players naturally gravitate toward the terminal as they learn, but the GUI prevents total frustration.
- **No levels, no obvious game elements.** The world is persistent. You follow email threads, chase down clues, and explore systems. The game never breaks the illusion of being a real OS.
- **Accidentally educational.** Trobbiani didn't design Hacknet as an educational tool, but the US Pacific Command's cyber warfare division buys it for new recruits. The lesson: if the simulation is convincing enough, real skills transfer naturally.
- **`help` command as tutorial.** Three pages of commands are available via `help`. Players also discover commands by listing executables in `/bin/`. Command discovery is diegetic — part of the game world, not a tutorial overlay.

**What doesn't work as well:** The simplified systems can feel repetitive after the core loop is mastered. The hacking process follows a formula (probe ports, crack them, gain access) that becomes rote.

*Sources: [Hacknet (Fellow Traveller)](https://www.fellowtraveller.games/hacknet), [Hacknet Wiki commands](https://hacknet.fandom.com/wiki/Commands), [Hacknet educational use (Medium)](https://medium.com/@sitapati/hacknet-os-teaching-kids-command-line-hacking-through-gaming-86c1963b3c36)*

---

### Uplink (Hacker Simulation)

**Uplink** (2001, Introversion Software) takes a more cinematic approach to hacking — Hollywood-style interfaces with real tension.

**What works:**

- **Diegetic UI.** The entire game looks like a futuristic workstation. Email clients, proxy selectors, monitoring tools — all integrated as in-world software. The line between player input and game reality is deliberately blurred.
- **Resource management as tension.** CPU resources, time pressure from trace detection, and money management create genuine stress. The trace timer ticking down while you crack a password is visceral.
- **GUI over command-line.** Uplink deliberately avoided command-line interfaces in favor of a futuristic GUI. Introversion's insight: "Where other hacker sims have failed is the usage of command-line — it's the one thing which, while true to life, people generally shy away from." This is a cautionary note for The Taco's Egg — balance authenticity with accessibility.
- **Routing as puzzle.** Building bounce chains through proxy servers to hide your IP address is both mechanically interesting and narratively grounded.

**What doesn't work:** Very steep difficulty curve — the jump from early missions to LANs and banks is jarring.

*Sources: [Uplink design analysis (Game Developer)](https://www.gamedeveloper.com/design/uplink-a-case-for-transmitting-emotion-through-design), [7 games with hacking mechanics (Game Developer)](https://www.gamedeveloper.com/design/7-games-with-interesting-hacking-mechanics-all-devs-should-study)*

---

### Orwell (Surveillance Investigation)

**Orwell** (2016, Osmotic Studios) puts you in a government surveillance system, sifting through personal data to find threats.

**What works:**

- **The datachunk system.** You drag pieces of information ("datachunks") into dossiers. Sometimes data contradicts — you must choose which version to submit, and you can't undo it. Your supervisor acts only on what you provide, so you shape the narrative.
- **Context stripping as mechanic.** Information removed from context becomes dangerous. A joke about "torturing" a friend (by making her attend a concert) can be uploaded as "admits the use of torture." The game weaponizes decontextualization, making the player complicit.
- **No task lists.** The developers removed explicit task systems so players feel like they're investigating through their own discoveries rather than checking boxes. Extractable data is highlighted, but the player decides what matters.
- **Conflicting information forces judgment.** When two datachunks contradict, you must choose. This isn't a puzzle with a right answer — it's a values judgment that shapes the outcome.

**Directly applicable to The Taco's Egg:** The datachunk model — selectively forwarding evidence to a supervisor who acts on your interpretation — maps directly to reporting findings up the chain. The player's choice of what to report (and to whom) could shape the narrative.

*Sources: [Orwell design deep dive (Game Developer)](https://www.gamedeveloper.com/design/game-design-deep-dive-decisions-that-matter-in-i-orwell-i-), [Orwell showcase (Articy)](https://www.articy.com/en/showcase/orwell-keeping-an-eye-on-you/)*

---

### Hypnospace Outlaw (Retro Internet Investigation)

**Hypnospace Outlaw** (2019, Tendershoot) simulates a 1999-era internet where you're an "Enforcer" policing content violations.

**What works:**

- **The world IS the interface.** A fake operating system (HypnOS) with a fake browser, fake search engine, fake user pages. The investigation happens through the same tools the fictional users use. No abstraction layer between "game" and "world."
- **Search engine as investigation tool.** Page tags and keyword search drive discovery. Later cases require genuine detective work — finding unlisted pages, password-protected areas, hidden communities.
- **Dynamic world responds to your actions.** Ban a teacher for copyright violations and her friends rally against you on their pages. The world reacts, creating consequences for enforcement decisions.
- **Characters make the world.** Each user has a detailed, personality-rich home page. The "crunchiness" (creator Jay Tholen's term) of hidden details rewards thorough investigation.
- **Non-linear main story.** The overarching Merchantsoft/Y2K plot is uncovered through organic exploration, not mission prompts. It resembles Her Story in how player-driven searching reveals narrative.

**Directly applicable to The Taco's Egg:** The "world is the interface" principle is exactly what a CRT terminal game should achieve. The terminal isn't a game mechanic — it IS the world. Searching logs, reading emails, and navigating file systems should feel like using a real (but quirky) computer system.

*Sources: [Hypnospace Outlaw review (PC Gamer)](https://www.pcgamer.com/hypnospace-outlaw-review/), [Development history (Fandom)](https://hypnospace.fandom.com/wiki/Development_of_Hypnospace_Outlaw), [Creative process interview (MCV/Develop)](https://mcvuk.com/business-news/hypnospace-outlaw-is-the-game-you-tell-people-not-to-make-how-hypnospace-outlaw-captured-the-90s-internet-aesthetic-through-creative-self-sabotage/)*

---

### The Forgotten City (Time-Loop Investigation)

**The Forgotten City** (2021, Modern Storyteller) started as a Skyrim mod. You investigate a Roman underground city where everyone dies if anyone commits a sin — and you can reset the loop to try again.

**What works:**

- **Time loop as investigation tool.** You keep items and knowledge between loops. Each loop lets you test different approaches, pursue different leads, and use information gained from failed attempts. The reset isn't punishment — it's the core mechanic.
- **NPCs have rich backstories and arguments.** Every character is sympathetic in some way, complicating moral judgments. You can't just find the "bad guy" — the situation is genuinely complex.
- **Multiple valid solutions per problem.** Different character builds (archaeologist, soldier, criminal, amnesiac) open different paths. The game doesn't enforce a single "correct" approach.
- **Progression carries across loops.** The game tracks what you've learned. Solutions from one loop unlock new avenues in subsequent ones, creating compounding progress.

**Directly applicable to The Taco's Egg:** The concept of carrying knowledge between sessions — where the player's understanding of the system deepens over time even if specific access gets revoked — maps well to an investigation that escalates through phases.

*Sources: [The Forgotten City (Wikipedia)](https://en.wikipedia.org/wiki/The_Forgotten_City), [Preview (Game Rant)](https://gamerant.com/forgotten-city-preview-skyrim-mod-hands-on-gameplay/)*

---

### Disco Elysium (Skill-Check Based Investigation)

**Disco Elysium** (2019, ZA/UM) reimagines RPG skills as voices in your head, each with its own personality and agenda.

**What works:**

- **Skills as characters.** Encyclopedia isn't a knowledge stat — it's an obsessive academic interrupting conversations with tangentially related facts. Authority isn't a leadership bonus — it's a fascist voice pushing toward domination. Each of the 24 skills has personality, bias, and can be unreliable.
- **Failure as narrative.** Failed skill checks don't end the game — they branch the story. Some of the most memorable moments come from failures. Red checks (unrepeatable) create permanent consequences; white checks can be retried after gaining new information or skills.
- **High skills have drawbacks.** High Drama makes you paranoid. High Electrochemistry makes you an addict. The system creates tradeoffs that feel like characterization, not just numbers.
- **No combat — pure dialogue.** The game proves that an RPG can work entirely through conversation, observation, and deduction. Every conflict is verbal or intellectual.
- **The Thought Cabinet.** Players "internalize" thoughts that grant bonuses, but you don't know the bonus until after committing. This uncertainty adds strategic depth and characterization.

**Directly applicable to The Taco's Egg:** The concept of skills-as-voices maps to an AI-driven terminal game where different system tools or analysis modules could have "personalities" — a paranoid security scanner, an overly optimistic anomaly detector, a jaded sysadmin's old scripts.

*Sources: [Disco Elysium RPG system analysis (Gabriel Chauri)](https://www.gabrielchauri.com/disco-elysium-rpg-system-analysis/), [Disco Elysium skill checks (Oreate AI)](https://www.oreateai.com/blog/beyond-the-dice-roll-understanding-disco-elysiums-unique-skill-checks/39f4f589c2a7441b60b488c0b1896bd0)*

---

## 2. Core Investigation Mechanics That Work Well

### Evidence Collection and Cataloging

The best investigation games use distinct approaches to evidence management:

| Game | Evidence Model | What Works |
|------|---------------|------------|
| Her Story | Keyword-searchable video clips | Players build their own mental catalog |
| Obra Dinn | Visual observation + identity matrix | Structured form for recording deductions |
| Orwell | Draggable datachunks into dossiers | Physical act of organizing evidence |
| Golden Idol | Word bank + fill-in-the-blanks | Enough combinations to prevent guessing, intuitive enough to avoid syntax fights |
| Papers, Please | Document comparison against rules | Evidence is ephemeral — you must recognize it in real-time |

**Key insight from The Case of the Golden Idol:** The developers identified that the biggest unsolved problem in detective games is *how players communicate their deductions.* Text parsers are frustrating (syntax issues). Multiple-choice removes the actual deduction. Golden Idol's word-bank approach splits the difference — there are enough possible combinations that guessing is impractical, but input is intuitive.

*Sources: [Pursuing the "Aha!" moment (Game Developer)](https://www.gamedeveloper.com/design/case-of-the-golden-idol), [Golden Idol design analysis (Thinky Games)](https://thinkygames.com/features/how-the-case-of-the-golden-idol-developers-made-one-of-the-decades-best-detective-games-twice/)*

### Clue Connection / Conspiracy Board Systems

Physical or visual connection of evidence appears in various forms:

- **Obra Dinn's crew manifest:** A structured grid where identities and fates are recorded, creating a visible progress tracker.
- **Golden Idol's thinking screen:** Toggling between exploration and analysis modes mirrors how real investigation works — gather, then synthesize.
- **Orwell's dossier system:** Building profiles from scattered data creates a sense of constructing understanding piece by piece.

**For The Taco's Egg:** A terminal-native conspiracy board could work as a graph/network visualization command that shows connections between compute anomalies, IP addresses, user accounts, and timestamps. Something like `link --show` that renders an ASCII connection map.

### Progressive Revelation (How to Drip-Feed Information)

Successful approaches from the research:

1. **Her Story's keyword gating.** Information is always there but only accessible through the right search terms. Early clips contain obvious keywords that lead to the next layer.
2. **Obra Dinn's scene dependency.** You can only access a death scene by finding physical remains, which are often only reachable after unlocking other scenes. The game world gates access naturally.
3. **Papers, Please's daily rule changes.** New mechanics arrive as narrative events (new regulations, new document types), creating a natural drip of complexity.
4. **Hacknet's email breadcrumbs.** Each completed mission leads to new contacts, new systems, and new tools via in-character emails.
5. **Lacuna's decoupled progress.** Players can submit their case sheet at any time, decoupling "story progress" from "puzzle completion." This prevents stuck players from being locked out of the narrative.

**The critical principle:** Players should feel like they're *pulling* information out of the world, not having it *pushed* to them. The difference between "the game told me X" and "I discovered X" is the entire value proposition of investigation games.

### Red Herrings and Misdirection

**Rules for effective red herrings:**

1. **Must be plausible within the world.** A red herring that doesn't make sense retroactively feels like a cheat.
2. **Should teach something when debunked.** The player should say "I should have seen this coming," never "the game tricked me."
3. **Can layer.** A clue that appears to be a dead end may reveal another layer of misdirection upon further investigation. This adds depth.
4. **Should not block progress.** Following a red herring should never permanently prevent solving the case. It should cost time or resources, not lock out the solution.

**For The Taco's Egg:** Red herrings should be technically plausible explanations for the $0.75 discrepancy — a rounding error, a timezone bug, a misconfigured billing API. Each should be investigable and dismissable through evidence, and each dismissal should reveal something that points toward the real conspiracy.

*Sources: [Red herrings in mystery games (Cold Case Inc)](https://coldcaseinc.com/the-art-of-misdirection-how-red-herrings-craft-a-compelling-mystery-game/), [Red herring as puzzle design (Blubberquark)](https://blubberquark.tumblr.com/post/673717435816345600/red-herring)*

### Eureka Moments / Breakthrough Design

The "aha!" moment is the core payoff of investigation games. How games engineer it:

- **Obra Dinn:** Multiple clues converge to identify a single crew member. The eureka comes when you realize that the guy holding the rope in scene 7 is the same person the Russian sailor called "Friedrich" in scene 3, and his hammock position matches the seamen's berth list.
- **Golden Idol:** The word-bank system means you literally assemble your understanding word by word. Partial validation (groupings of correct answers lock in) creates mini-eurekas along the way.
- **Her Story:** Searching a keyword from one clip and finding an unexpected clip that recontextualizes everything you've seen. The eureka is self-directed — no game system triggers it.

**The critical design principle:** The player must do the final synthesis themselves. If the game connects the dots for them, it's a cutscene, not a eureka. The game provides evidence; the player provides insight.

### Making the Player Feel Clever vs. Following Instructions

From the [DigiTales Interactive analysis of detective game problems](https://digitales.games/blog/detective-game-design-problems):

**What makes players feel clever:**
- Multiple valid paths to the same conclusion (Obra Dinn)
- The game never explicitly says "you solved it" — the player *knows* (Her Story)
- Partial validation that lets players build confidence (Golden Idol's grouping system)
- Environmental storytelling that rewards observation beyond what's required (Hypnospace)

**What makes players feel like they're following instructions:**
- Highlighted "clue" objects that obviously need to be clicked
- NPCs that tell you where to go next
- Binary pass/fail checks with no room for lateral thinking
- "Use item A on object B" adventure game logic

**For The Taco's Egg:** Terminal commands create a natural "clever" feeling because typing a command requires understanding what it does. The player can't accidentally stumble through a menu — they have to form a hypothesis and test it.

---

## 3. Terminal/Hacker Game UX Patterns

### How Hacknet Handles Command Discovery

Hacknet uses a layered approach:

1. **`help` command.** Three pages of commands are available from the start. Players type `help` and see what's available — diegetic documentation.
2. **`/bin/` exploration.** Players can `ls` the local bin folder to discover executables, including hidden or embedded ones. Discovering a new tool by browsing the file system feels like finding a weapon in a dungeon.
3. **Email instructions.** Mission contacts mention commands by name in their messages: "Use `scan` to find connected systems." This is in-world tutoring from a character, not a UI tutorial.
4. **GUI fallback.** The graphical interface duplicates most terminal functions. Players who are struggling can use the GUI while learning, then transition to the terminal for efficiency and immersion.

### Teaching Unix Commands as Game Mechanics Without a Tutorial

**Approaches that work:**

| Technique | Example | Why It Works |
|-----------|---------|-------------|
| Diegetic documentation | `help`, `man` pages, README files on the system | Players discover at their own pace |
| NPC email instructions | "Run `grep -r 'anomaly' /var/log/`" | Commands are taught in context of a goal |
| File system breadcrumbs | A `NOTES.txt` in a directory that says "check the access log" | Teaches by implication |
| Progressive necessity | Early missions require only `ls` and `cat`; later ones need `grep`, `awk`, piping | Complexity ramps with competence |
| Error messages as hints | "Permission denied. Try `sudo` or find another way in." | The system teaches through failure |

**From Hacknet's creator:** "Whilst not holding your hand or dumbing down, the design of the game and the learning curve enables those with no prior terminal experience to enjoy it whilst delighting those in the know."

**From Uplink's approach:** Uplink deliberately avoided command-line in favor of GUI, reasoning that "where other hacker sims have failed is the usage of command-line." This is a valid counterpoint — The Taco's Egg should consider how much terminal fluency to require vs. provide as optional depth.

### Balancing Authenticity vs. Accessibility

**The spectrum:**

```
Pure Simulation ←————————————————→ Pure Game
(Bandit/OverTheWire)  (Hacknet)  (Uplink)  (Watch Dogs)
```

Hacknet sits in the sweet spot for The Taco's Egg: real commands, simplified systems. The file systems are small and navigable. The commands are real Unix but the environments are manageable. You don't need to understand process management or network protocols — just file navigation, text searching, and basic hacking tools.

**Recommended approach for The Taco's Egg:**
- Real commands (`ls`, `cat`, `grep`, `ssh`, `curl`, `dig`) for immersion
- Simplified outputs (a `grep` returns 3-5 relevant lines, not thousands)
- Custom commands for game-specific tools (`taco order`, `compute audit`, `link analyze`)
- Tab completion and command suggestions to reduce friction
- A `man` command that returns in-world documentation

### Progressive Command Unlocking vs. Everything Available From Start

**Arguments for progressive unlocking:**
- Reduces overwhelm for new players
- Creates a sense of progression and empowerment
- Naturally gates content

**Arguments for everything available:**
- More authentic simulation
- Rewards creative problem-solving
- Avoids "why can't I do this obvious thing?" frustration

**The hybrid approach (recommended, based on Hacknet):**
- All basic commands available from start (`ls`, `cat`, `cd`, `grep`, `help`)
- Specialized tools acquired through gameplay (a decryption tool from a hacker contact, a network analyzer from IT, an audit tool from compliance)
- The progression isn't "you can't type this command" — it's "you don't have this program installed yet." Acquiring it feels like earning gear, not unlocking a tutorial gate.

### How to Handle "Stuck" Players Without Breaking Immersion

**Diegetic hint systems from various games:**

1. **Hacknet:** NPC emails that get increasingly specific. First: "Have you checked their file system?" Later: "Try looking in /home/admin/."
2. **Hypnospace:** The search engine. If you're stuck, you can search broadly and stumble onto relevant pages.
3. **Her Story:** The 33 flagged clips with musical cues. If you're browsing randomly, you'll still hit important moments.
4. **Obra Dinn:** The three-correct validation system means you can lock in progress on easy cases while struggling with hard ones — you're never completely stuck.

**For The Taco's Egg:**
- **Colleague messages.** An NPC could email or message with increasingly pointed hints: "Hey, did you look at the east-coast compute logs?" → "The timestamp anomaly in the billing data is interesting..." → "Run `compute audit --region us-east-1 --window 3am-5am` and check the delta."
- **System logs.** Automated alerts that naturally draw attention to anomalies.
- **The taco ordering system.** The food truck AI could break the fourth wall subtly: "While your order processes... did you know that 73% of compute fraud occurs during off-peak hours? Anyway, your taco will be ready in 3 minutes."

---

## 4. Pacing and Tension in Investigation Games

### How to Create Urgency Without Time Pressure

Most successful investigation games deliberately avoid real-time pressure during the investigation phase:

- **Her Story:** No timer. Play at your own pace. Urgency comes from narrative revelation — once you realize what happened, you *want* to keep digging.
- **Obra Dinn:** No timer. The ship isn't going anywhere. Urgency comes from the emotional weight of the deaths and your growing understanding.
- **Papers, Please:** Uses a day-timer but only during document processing, not investigation. This is pressure on *execution*, not *understanding*.

**Techniques for urgency without timers:**
1. **Narrative stakes escalation.** The consequences of not solving this grow worse — people are being surveilled, money is being stolen, systems are being compromised.
2. **Information that implies a deadline.** An email mentions "the server migration is scheduled for Friday." Now the player feels urgency without a visible countdown.
3. **Consequences for inaction.** If the player ignores certain leads, NPCs react — a colleague gets reassigned, a server gets wiped, evidence disappears. The world moves forward.
4. **Sensory escalation.** Gradual increases in visual or auditory intensity — machinery humming louder, lights dimming, screen artifacts — signal that a turning point is near.

### The "Nobody Believes You" Trope (Cassandra Truth)

This is formally the [Cassandra Truth](https://tvtropes.org/pmwiki/pmwiki.php/Main/CassandraTruth) trope — a character tells the truth, but nobody believes them. Named after the mythological seer cursed by Apollo.

**Why it works in investigation games:**

1. **Isolation increases stakes.** When no one believes you, you must act alone. This raises tension and centers agency on the player.
2. **Frustration-as-engagement.** The gap between what the player knows and what NPCs accept creates dramatic irony. The player feels compelled to gather more proof.
3. **Natural escalation pressure.** Since no one will help, the threat grows unchecked, forcing increasingly desperate actions.
4. **Gameplay loop driver.** "The cops told her to buzz off" → Player must gather more evidence and take matters into their own hands. This IS the investigation loop.

**For The Taco's Egg:** The $0.75 discrepancy is *designed* to be dismissible. Management will say "it's a rounding error." IT will say "probably a timezone issue." The player's journey from "maybe they're right" to "no, this is real" to "this is way bigger than anyone thinks" is the emotional arc. Each dismissal should motivate deeper investigation.

**Caution:** The trope must eventually pay off. If nobody ever believes the player, it becomes frustrating rather than motivating. There should be at least one ally who gradually comes around, and the final revelation should vindicate the player's persistence.

### Escalation Curves: From Trivial Mystery to International Conspiracy

The research on game pacing identifies key principles:

1. **Rank and order key events by intensity.** The escalation should be continually increasing, with events speeding up in frequency as tension builds.
2. **Staggered revelation.** Outcomes unfold in stages — a sequence of discoveries, each raising the stakes a notch. Not one big reveal, but a series of escalating realizations.
3. **Avoid flat pacing.** Games that rely on systems alone for pacing produce "a more arbitrary and flat sine wave of intensity" that becomes predictable and boring.
4. **The turn.** Every good investigation has a moment where the scope transforms. The Taco's Egg's turn — from "billing discrepancy" to "espionage" — needs to feel both surprising and inevitable in retrospect.

**Recommended escalation curve for The Taco's Egg:**

```
Intensity
    |                                              /
    |                                            /
    |                                     ___--/
    |                              ___--
    |                       ___--     ← The Turn: espionage
    |                ___--
    |          ___--     ← Pattern emerges
    |    ___--     ← More anomalies
    |---     ← $0.75 discrepancy
    +———————————————————————————————————————→ Time
```

### When to Let the Player Feel Ahead vs. Behind

- **Ahead of the NPCs:** Most of the time. The player should know things the characters don't. This creates dramatic irony and makes the player feel smart.
- **Behind the conspiracy:** The player should frequently discover that the conspiracy is bigger than they thought. Each layer of understanding should reveal another layer they didn't know existed.
- **Ahead of the game:** Occasionally, the player should guess where the plot is going and be right. This validates their detective skills. But not always — some reveals should genuinely surprise.
- **Behind the game:** Rarely, and only for major plot turns. If the player constantly feels outsmarted by the game (rather than the in-world antagonists), it becomes frustrating.

### Rest Beats / Humor Breaks

**Why they matter:** Constant tension creates fatigue. Players need moments to breathe, reflect, and consolidate what they've learned.

**How games handle it:**
- **Disco Elysium:** The thought cabinet, casual NPC conversations, and absurdist humor provide regular relief.
- **Hypnospace Outlaw:** Browsing weird GeoCities-style pages is inherently entertaining. The humor is environmental.
- **Papers, Please:** The brevity of each day creates natural breaks.

**The Taco's Egg's taco ordering system is a perfect rest beat mechanism.** It provides:
- Humor (absurd menu options, an overly enthusiastic food truck AI)
- Breathing room between intense investigation sequences
- Potential narrative vehicle (the taco AI drops hints, or other customers in the queue provide gossip)
- Ritual/routine that anchors the player in the world
- A callback structure (running gag that evolves as the story darkens)

---

## 5. AI-Driven Narrative Considerations

### How LLM-Generated Responses Can Maintain Narrative Coherence

**The core challenge:** LLMs are non-deterministic. They can hallucinate, contradict established facts, or reveal information prematurely. In a mystery game, any of these breaks the experience.

**Approaches from current research and implementations:**

1. **Causal graphs for context filtering.** A deterministic backend tracks what the player has unlocked. Only unlocked context is passed to the LLM. The LLM literally cannot spoil a clue the player hasn't earned access to, because the clue isn't in its context window.

2. **RAG with gated retrieval.** Instead of putting the entire story in the prompt, use retrieval-augmented generation where the vector database is filtered by game state. A query about "the compute anomaly" in Act 1 retrieves different context than the same query in Act 3.

3. **Structured state objects.** Characters have: personality (static keywords), self-reminders (static paragraphs about their current situation), and sequential memory (generated thoughts from prior interactions). This three-layer system from the LIGS framework provides consistency without requiring the LLM to maintain state internally.

4. **Classifier agents as gatekeepers.** A separate, simpler model classifies player actions as "impactful" or "routine." Only impactful actions update the game state. This prevents the LLM from accidentally advancing the plot through casual conversation.

*Sources: [How I Built an LLM-Based Game (Towards Data Science)](https://towardsdatascience.com/how-i-built-an-llm-based-game-from-scratch-86ac55ec7a10/), [LIGS system (ACM CHI)](https://dl.acm.org/doi/10.1145/3706599.3720212), [Intra design notes](https://ianbicking.org/blog/2025/07/intra-llm-text-adventure)*

### Guardrails to Prevent the AI from Spoiling the Mystery

**The spoiler problem is specific and solvable:**

- **Static pre-prompt with full story context = guaranteed spoilers.** If the LLM knows the answer, it will eventually leak it. This is the naive approach and it fails.
- **Dynamic context based on game state = spoiler prevention.** The LLM only sees what the player has unlocked. It can't spoil what it doesn't know.

**Practical guardrail patterns:**

1. **Phase-locked context.** The mystery has phases. Each phase has a context document. The LLM only receives the context for the current phase plus all previous phases. Future phases are invisible.
2. **Character knowledge boundaries.** Each NPC knows only what that character would know. The LLM's system prompt for "IT Manager" doesn't include the espionage plot — because the IT Manager doesn't know about it.
3. **Response validation.** A separate classifier checks LLM responses against a "forbidden topics" list for the current game state. If the response mentions something the player hasn't discovered yet, it's regenerated.
4. **Sacrificing customization for robustness.** One developer explicitly chose to "sacrifice a bit of custom experience for more robustness (minimizing hallucinations and spoilers with a consistent story)." This is the right tradeoff for a mystery game.

### How to Handle Player Actions the Designer Didn't Anticipate

**From the DejaBoom! research on player-driven emergence:**

Players in LLM-driven games will:
- Try to extract information from NPCs through social engineering
- Suggest the existence of objects, locations, and NPCs that don't exist
- Propose creative solutions the designer never considered

**Handling unexpected actions:**

1. **Boundary enforcement.** The game state is the source of truth, not the LLM's response. If a player convinces an NPC to "open the secret door," but no secret door exists in the game state, the NPC can respond in character without actually changing anything.
2. **Graceful deflection.** NPCs can acknowledge creative ideas without validating them: "That's an interesting theory, but I've never seen anything like that in the billing system."
3. **Selective incorporation.** If a player's unexpected action is interesting and doesn't break the mystery, the system can incorporate it. This requires a flexible game state model.

### Memory and State Tracking for Consistent NPC Behavior

**Current best practices from research:**

- **Prompt engineering + RAG** is the most practical approach. Character personas are defined in system prompts; interaction history is retrieved and injected into context.
- **Cross-platform memory** (demonstrated in Unity/Discord NPC systems) shows that LLM-driven NPCs can maintain memory across different interaction contexts.
- **Hybrid architecture:** LLMs handle dialogue and reasoning; traditional systems handle state, pathfinding, and game rules. This separation is crucial — don't let the LLM manage state.
- **Vector-based memory retrieval** allows NPCs to "remember" relevant past interactions without requiring the full conversation history in context.

**For The Taco's Egg:** Each NPC (IT manager, security analyst, manager, taco truck AI) should have:
- A static persona document (personality, role, knowledge boundaries)
- A dynamic state object (what they know the player has discovered, their current attitude)
- Interaction memory (summarized past conversations, stored externally)
- Phase-appropriate context (what they can discuss in the current act)

*Sources: [LLM-driven NPCs (arXiv)](https://arxiv.org/abs/2504.13928), [NPC Interaction Ladder thesis (Leiden)](https://theses.liacs.nl/pdf/2024-2025-KroesBBrandon.pdf), [LLM game agents survey (arXiv)](https://arxiv.org/html/2402.18659v4)*

### When to Use Scripted Content vs. Generated Content

**Rule of thumb from the research:** Use scripted content for anything the player *must* experience for the mystery to work. Use generated content for texture, personality, and handling unexpected player actions.

| Content Type | Scripted or Generated | Why |
|---|---|---|
| Key plot revelations | **Scripted** | Must be precise, dramatic, and consistent |
| Critical evidence/clues | **Scripted** | Cannot risk hallucination or premature reveal |
| NPC small talk | **Generated** | Adds texture, handles unexpected questions |
| Response to unexpected commands | **Generated** | Can't pre-script every `rm -rf /` attempt |
| System error messages | **Scripted** | Must be consistent and meaningful |
| Flavor text in log files | **Mix** | Scripted structure, generated details |
| Taco truck interactions | **Mostly generated** | Humor benefits from variety and responsiveness |

---

## 6. Mission/Chapter Structure Patterns

### How to Gate Progress Naturally

From the research, three gating philosophies emerge:

**1. Information gating (Her Story, Obra Dinn)**
- Access to new content requires discovering the right keywords, finding the right remains, or knowing the right questions to ask. The gate is *knowledge*, not permission.

**2. Capability gating (Hacknet)**
- New tools or access levels unlock new areas. You can't hack a bank until you have the right software. The gate is *equipment*, earned through earlier missions.

**3. Narrative gating (Lacuna, The Forgotten City)**
- Story events open new areas or close old ones. A server goes down, a colleague shares credentials, a security alert triggers a lockdown. The gate is *story*, not puzzle.

**Best practice:** Combine all three. The player needs to *know* something (information gating) AND *have the right tool* (capability gating) AND *be at the right point in the story* (narrative gating). Any one type alone feels artificial. Together, they feel natural.

**Paradise Killer's minimal gating insight:** Minimal gating actually increases satisfaction because "being able to rush to one of the very few rooms you can finally unlock feels similar to Metroidvanias, but more satisfying because you know important information is behind it."

### Parallel Investigation Threads

**Why they matter:** Players get stuck on one thread. Having alternatives prevents frustration and creates a sense of a complex, real investigation.

**How to implement:**

1. **2-3 threads available at any time.** Enough to provide alternatives, not so many that it's overwhelming.
2. **Threads illuminate each other.** Discovery on Thread A provides a clue for Thread B. This creates cross-pollination and rewards broad investigation.
3. **Different skill requirements per thread.** One thread might require deep log analysis; another might require social engineering an NPC; a third might require network reconnaissance. Different players can approach from their strengths.
4. **Threads converge.** All threads must eventually point to the same conspiracy. The convergence is itself a eureka moment.

**For The Taco's Egg:**
- Thread A: The compute discrepancy trail (log analysis, billing data)
- Thread B: The people trail (who has access, who's behaving strangely)
- Thread C: The network trail (where is the stolen compute going, what's running on it)
- These converge when the player realizes that the person with access is routing compute to a specific external destination for a specific espionage purpose.

### How to Handle Non-Linear Investigation Without Players Getting Lost

**Techniques from the research:**

1. **A persistent progress tracker.** Obra Dinn's crew manifest. Golden Idol's thinking screen. Something the player can always check to see what they know and what's still unknown.
2. **Redundant clues.** Multiple ways to discover the same information ensure players don't miss critical facts. If they skip NPC dialogue, the same info might be in a log file.
3. **Implicit prioritization.** Not all threads are equal. The game can subtly emphasize the most productive thread through NPC urgency, visual emphasis, or frequency of related discoveries.
4. **Recap mechanisms.** A journal, log, or case file that summarizes what's been discovered. This helps players returning after a break.

**For The Taco's Egg:** A `status` or `case` command that shows:
- Known anomalies and their investigation status
- Connected evidence (the conspiracy board)
- Open questions / threads to pursue
- A timeline of discoveries

### Save Points and Progression Tracking in Investigation Games

Investigation games generally use **autosave with unlimited saves** rather than checkpoint systems. The reason: investigation involves a lot of backtracking, hypothesis testing, and review. Checkpoint systems that force replay are antithetical to the genre.

**For a terminal game specifically:**
- Command history persistence (the player can scroll back through what they've done)
- Session logs (a `history` command that shows past sessions)
- State snapshots (the game remembers exactly what's been discovered, what tools are available, and what NPCs know)
- No "game over" states during investigation — consequences for mistakes, but not hard stops

*Sources: [Detective game design problems (DigiTales Interactive)](https://digitales.games/blog/detective-game-design-problems), [Detective game design: puzzles vs. story (Game Developer)](https://www.gamedeveloper.com/design/detective-game-design-puzzles-vs-story-lacuna-devlog-), [Paradise Killer analysis (Vicious Undertow)](https://viciousundertow.wordpress.com/2020/09/11/paradise-killer-and-nonlinear-choice-based-storytelling/), [Burden of Proof GDC talk (GDC Vault)](https://gdcvault.com/play/1027684/The-Burden-of-Proof-Narrative), [Heaven's Vault GDC talk (GDC Vault)](https://gdcvault.com/play/1025392/-Heaven-s-Vault-Creating)*

---

## Key Takeaways for The Taco's Egg

### The Terminal IS the World
Like Hypnospace's fake OS and Hacknet's persistent system, the CRT terminal shouldn't feel like a game interface — it should feel like a real (quirky, slightly broken) computer system that happens to contain evidence of a conspiracy. Every interaction — ordering tacos, reading emails, running diagnostics — should happen through the same terminal.

### The $0.75 is the Perfect Hook
Small anomalies that grow into massive conspiracies is a proven narrative pattern (see the escalation curves above). The key is making each escalation step feel both surprising and obvious in hindsight. The player should always be able to trace back: "Of course, the $0.75 was because..."

### Search and Command as Core Mechanic
Her Story proved that search-as-gameplay works. For a terminal game, the command line IS the search mechanic. `grep`, `find`, `cat`, `ssh` — these are investigation verbs. Each command is a hypothesis the player is testing.

### Let the Player Prove It, Don't Tell Them
From Obra Dinn to Golden Idol, the best detective games make the player assemble their own understanding. The AI-driven NPCs should never say "you've solved it" — the player should reach the conclusion and then choose to act on it.

### Tacos as Rest Beats
The taco ordering system serves the same function as Disco Elysium's absurdist humor or Hypnospace's weird user pages. It's a pressure release valve, a ritual, a running gag, and potentially a covert information channel.

### Guardrail the AI, Don't Trust It
For mystery coherence, use scripted content for critical plot points and evidence. Use AI for NPC personality, unexpected player input, and texture. Gate the AI's knowledge with causal graphs or phase-locked context. Never put the full mystery in a single prompt.

### Multiple Threads, One Conspiracy
Give players 2-3 investigation angles at any time. Let the threads cross-pollinate. Make the convergence point a eureka moment. Never leave the player with zero leads.
