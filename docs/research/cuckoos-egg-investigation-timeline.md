# The Cuckoo's Egg: Investigation Timeline & Technical Reference

A comprehensive timeline of Cliff Stoll's investigation into Markus Hess's hacking operation at Lawrence Berkeley National Laboratory (1986-1987), compiled from the book *The Cuckoo's Egg: Tracking a Spy Through the Maze of Computer Espionage* (1989) and the technical paper *Stalking the Wily Hacker* (Communications of the ACM, 1988).

---

## 1. The Initial Discovery (August 1986)

### The 75-Cent Discrepancy

Clifford Stoll, an astronomer whose grant money had run out, was reassigned as a systems administrator at Lawrence Berkeley National Laboratory (LBL) in Berkeley, California. His supervisor, Dave Cleveland, asked him to resolve a 75-cent accounting discrepancy in the computer usage billing system.

**The accounting system:**
- LBL had approximately 1,000 user accounts across its dozen large computers
- Each account was tallied daily for computing time usage
- Computing time cost $300 per hour
- A separate computer gathered statistics and sent monthly bills to laboratory departments
- The accounting software was a patchwork of programs written in Assembler, Fortran, and COBOL by long-departed summer students

**How Stoll found the discrepancy:**
- He systematically checked each accounting program
- Ruled out rounding errors in the billing calculations
- Around 7 PM, his eye caught one user: "Hunter"
- Hunter had no valid billing address
- Hunter had used 75 cents worth of time (9 seconds of computing) in the past month, with no one to bill
- Stoll deleted the Hunter account

**The Dockmaster alert:**
- The next day, a computer named "Dockmaster" (the NSA's National Computer Security Center system) sent LBL an electronic message claiming someone from their lab had tried to break into it over the weekend
- Stoll traced the attempted breach back to the account of a local professor named Joe Sventek
- Sventek was out of town during the incident, meaning someone else was using his stolen credentials

### Connecting the Dots

Stoll realized the unauthorized "Hunter" account and the Sventek account hijacking were connected. Someone had broken into LBL's systems, created unauthorized accounts, and was using LBL as a launching pad to attack other systems.

---

## 2. Early Investigation Techniques (August-September 1986)

### Identifying the Intrusion Method

Stoll discovered the hacker had gained superuser (root) access by exploiting a vulnerability in the `movemail` function of GNU Emacs.

**The GNU Emacs movemail exploit (the "Cuckoo's Egg" itself):**
1. GNU Emacs included a utility called `movemail` that allowed users to change mail spool file ownership and move files
2. At LBL, `movemail` was installed with the SUID root bit set, meaning it ran with root privileges regardless of who invoked it
3. The hacker used `movemail` to overwrite the system's `atrun` utility (which runs queued jobs) with a script of his own creation
4. Since Unix automatically executes `atrun` every 5 minutes with system privileges, the hacker's replacement `atrun` elevated his stolen account to superuser status
5. Once he had root access, the first thing the hacker did was swap the legitimate `atrun` back into place to erase his tracks

### The Terminal Weekend (Physical Monitoring Setup)

Over a single weekend, Stoll built an improvised intrusion detection system:

- **Rounded up 50 terminals, teleprinters, and portable computers** by "borrowing" them from co-workers' desks ("there'd be hell to pay on Monday, but it's easier to give an apology than get permission")
- **Physically attached each device to one of LBL's 50 incoming phone lines**
- When the hacker dialed in that weekend, Stoll could identify exactly which phone line was being used
- The hacker's line traced to the **Tymnet routing service**

### Ongoing Monitoring Infrastructure

After returning the borrowed terminals on Monday, Stoll kept a more permanent setup:

- **Teletype printer:** Left a teleprinter permanently attached to the intrusion line, printing every command the hacker typed in real-time. Stoll slept next to it, waking to the chatter of the printer when the hacker connected
- **Pager/beeper system:** Programmed his computer to beep twice whenever someone logged onto the Tymnet lines. Wired a pager into the system so he could rush to the lab from anywhere when the hacker connected
- **Printer traps:** Set up printers that, when triggered by access to specific system areas, would both alert his pager and produce a printout of all activity
- **Process monitor:** A separate Unix system loosely coupled to their LAN periodically ran `ps` to examine every process. Since Stoll knew which accounts were compromised, the monitor watched for activity on those stolen accounts
- **Daily logbook:** Stoll kept a meticulous handwritten logbook of every hacker session -- timestamps, commands, targets. This was the first known daily logbook of hacker activities

### Key Early Forensic Clues

**The `ps -eafg` command:**
- The hacker ran `ps -eafg` to check running processes
- The `-f` flag was an AT&T Unix flag that did not exist in Berkeley Unix (BSD)
- This revealed the hacker was trained on AT&T Unix, not the BSD variant used at LBL
- Combined with timing analysis (active during Pacific midday = European evening), Stoll hypothesized the hacker was in Europe

**The Sventek account:**
- Stoll identified the hacker was using terminal port `tty23`
- Pinned it down to a 1200-baud modem connection
- The hacker logged in under the stolen account of professor Joe Sventek

---

## 3. The Intruder's Methods

### Initial Access

- Exploited the GNU Emacs `movemail` SUID vulnerability to gain root on LBL systems
- Used LBL as a pivot point to access ARPANET and MILNET

### Privilege Escalation Techniques

- **SUID bit exploitation:** Used the `movemail` SUID root program to overwrite `atrun` with a privilege-escalation script
- **Trojan horse programs:** Created fake login prompts and other programs to harvest credentials, though one Trojan failed because it used AT&T Unix syntax on a BSD system
- **Trust exploitation:** As superuser on LBL's main Unix computer, disguised himself under legitimate account names and connected to other networked machines that trusted LBL without requiring additional passwords
- **Dictionary attacks on /etc/passwd:** Downloaded entire password files, then encrypted every word in the dictionary using the same algorithm that encrypted passwords. Compared encrypted dictionary words against the stolen password hashes to crack weak passwords. (This brute-force dictionary attack technique was novel at the time.)
- **Default password guessing:** Tried common account names (root, guest, system, field) with default or empty passwords. Dismayingly successful about 5% of the time, even on military systems

### Reconnaissance Commands

The hacker used standard Unix commands to probe systems:

| Command | Purpose |
|---------|---------|
| `who` | List currently logged-in users on a target system |
| `finger` | Query user information on remote systems |
| `ps -eafg` | List running processes (AT&T Unix syntax) |
| `ls` | List files and directories |
| `cat` | Read file contents |
| `last` | Check recent login history |

### Search Targets (Keywords)

The hacker systematically searched for files and documents containing:

- **nuclear** / **nuclear bomb**
- **SDI** (Strategic Defense Initiative / "Star Wars")
- **stealth**
- **ICBM**
- **NORAD**
- Semiconductor technologies
- Satellite systems
- Aircraft technologies
- Space programs

### Post-Exploitation Behavior

Once gaining root access on a system, the hacker would:

1. Erase his tracks (swap legitimate `atrun` back, clean logs)
2. List files to survey the system
3. Read grant proposals, personnel files, system changes
4. Search for military/defense keywords
5. Copy password files for offline cracking
6. Install backdoor accounts for return access
7. Pivot to other connected systems via trust relationships

---

## 4. The Trail Across Networks

### Network Architecture (1986)

The interconnected networks Hess traversed:

```
Markus Hess (Hannover, Germany)
    |
    v
West German Datex-P Network (X.25 packet switching)
    |
    v
Satellite Link / Transatlantic Cable
    |
    v
ITT (International Telephone & Telegraph)
    |
    v
Tymnet International Gateway (US X.25 routing service)
    |
    v
MITRE Corporation (McLean, Virginia)
    |
    v
Lawrence Berkeley National Laboratory (Berkeley, California)
    |
    +---> ARPANET (civilian research network)
    +---> MILNET (military network, split from ARPANET in 1983)
    +---> SPAN (Space Physics Analysis Network)
```

### How the Path Was Traced

1. **LBL to Tymnet:** Stoll's terminal-on-every-phone-line weekend identified the incoming connection as a Tymnet circuit
2. **Tymnet to MITRE:** With Tymnet's cooperation, traced the routing to a call center at MITRE (defense contractor in McLean, Virginia). MITRE shut down the route, cutting the hacker off temporarily
3. **The hacker disappeared for nearly a month**, then returned via a different path
4. **Tymnet to International:** Further tracing with Tymnet revealed the connection was coming from West Germany via satellite
5. **German Datex-P to Bremen:** The Deutsche Bundespost (German post office, which had authority over telecommunications) traced calls to a VAX computer at the University of Bremen
6. **Bremen to Hannover:** Bremen was just a relay. Additional traces narrowed the origin to Hannover
7. **Hannover to Hess's apartment:** The final trace, enabled by the SDINET honeypot keeping Hess online long enough, pinpointed his home address

### Systems Targeted by Hess (Partial List)

| System/Location | Type |
|-----------------|------|
| Lawrence Berkeley National Laboratory | DOE research lab (primary pivot) |
| Anniston Army Depot, Alabama | U.S. Army |
| White Sands Missile Range, New Mexico | U.S. Army missile testing |
| Fort Buckner / Camp Foster, Okinawa, Japan | U.S. Army communications |
| Fort Stewart, Georgia | U.S. Army 24th Infantry |
| Ramstein Air Base, West Germany | U.S. Air Force |
| U.S. Air Force Systems Command, El Segundo, CA | USAF |
| U.S. Navy Coastal Systems Computer, Panama City, FL | U.S. Navy |
| Navy Regional Automated Data Center | U.S. Navy |
| OPTIMIS Database, The Pentagon | Department of Defense |
| NASA Jet Propulsion Laboratory (JPL) | NASA |
| SRI International, Menlo Park, CA | Defense research |
| MIT (MX Computer), Cambridge, MA | Research university |
| U.S. Army DARCOM, Seckenheim, West Germany | U.S. Army procurement |
| MITRE Corporation, McLean, VA | Defense contractor |
| Dockmaster (NCSC/NSA) | National Computer Security Center |
| CIA systems | Intelligence agency |

Hess is estimated to have broken into approximately **400 U.S. military computers** total.

---

## 5. The Honeypot / Stakeout (Early-Mid 1987)

### Operation Showerhead

**Origin of the name:** Stoll and his girlfriend Martha Matthews conceived the plan while showering together, giving it the unofficial name "Operation Showerhead."

**Martha's crucial contributions:**
- Provided early legal guidance: "You're not the government, so you don't need a search warrant. The worst it would be is invasion of privacy." This gave Stoll confidence to monitor the hacker
- Devised the honeypot concept itself: suggested creating fake files with official-sounding military filenames to keep the hacker interested long enough for a trace
- The honeypot is widely credited as one of the first (possibly THE first) in cybersecurity history

### The SDINET Trap

**Setup:**
- Created a new account on the LBL network called **SDINET**
- SDINET belonged to a fictional department recently formed to collaborate on the military's Strategic Defense Initiative (Star Wars)
- The fictional department had a fictional secretary named **Barbara Sherwin**
- Stoll filled the account with dozens of documents containing impressive-sounding but entirely fabricated bureaucratese about SDI contracts, weapons systems, and classified projects
- The documents were large files, and the key detail: additional information was listed as "available in hard copy" by mail, hoping the hacker would write in

**Why it worked:**
- When Hess discovered the SDINET account, he could not resist downloading the files
- At 1200 baud, downloading the large fake documents required Hess to stay connected for **hours** instead of his usual brief sessions
- This gave the Deutsche Bundespost technicians the time they needed to complete the physical phone trace from Bremen through to Hannover and finally to Hess's home address

### The Barbara Sherwin Letter (KGB Verification)

The most dramatic confirmation came when a letter arrived at LBL addressed to "Barbara Sherwin" (the fictional secretary):
- The letter was from a man calling himself **Laszlo Balogh** at a Pittsburgh, Pennsylvania address
- Balogh requested to join SDINET's mailing list and receive the hard-copy documents
- Investigation revealed this was a KGB verification operation: the Soviets wanted to confirm that the intelligence Hess was selling them was genuine
- The KGB had tasked the Hungarian Secret Service, and Balogh was an undercover Hungarian agent in Pittsburgh
- This letter proved the espionage connection beyond any doubt

### Martha Matthews

Martha was a law student at UC Berkeley and Stoll's girlfriend (they married at the end of the story). Beyond devising the honeypot:

- She and Stoll had known each other since childhood
- Described as an ex-hippie who detested anything associated with the government
- Despite this, she supported Stoll's work with FBI, CIA, and NSA throughout the investigation
- Their relationship was strained by the intensity of the investigation (Stoll sleeping under his desk, middle-of-the-night pager alerts)
- She provided emotional grounding throughout the story

### Stoll's Personal Details (Character Color)

- Baked chocolate chip cookies constantly throughout the investigation, often bringing them to meetings with federal agents
- Practiced yo-yo tricks
- Slept under his desk next to the monitoring equipment, waking to printer chatter
- Described himself as a "mixed-bag of new-left, harmless non-ideology"
- An ex-hippie turned reluctant collaborator with military and intelligence agencies

---

## 6. Bureaucratic Obstacles

### FBI

- **Initial dismissal:** The FBI was uninterested because no large sum of money was involved and no classified information host had been accessed. 75 cents was not enough for them to act.
- **Jurisdiction confusion:** There was early confusion about whose jurisdiction the case fell under
- **Eventually engaged:** After traces confirmed the German origin and military targets, the FBI became interested. They convinced LBL management to let the monitoring continue "for a few more weeks" rather than shutting the hacker out

### NSA

- **Interested but constrained:** The NSA noted it "can't engage in domestic monitoring, even if we're asked. That's prison term stuff."
- **Bob Morris Sr.:** Robert Morris Sr. (father of the future Morris Worm author) was Stoll's primary NSA contact during the investigation
- Willing to receive information but unable to legally assist with domestic surveillance

### CIA

- **Received Stoll's notes:** Stoll sent his investigation notes to the CIA
- **Information vacuum cleaners:** Eagerly took any information Stoll provided but were unwilling to share anything they knew in return
- Eventually became engaged once the international espionage angle was confirmed

### Air Force Office of Special Investigations (AFOSI/OSI)

- One of the more responsive agencies
- Took the military network intrusions seriously
- Helped coordinate with other agencies

### The Systemic Problem

- **No information sharing:** Agencies acted as "human-government vacuum cleaners" -- eager to take all of Stoll's information but unwilling to reciprocate
- **No agency wanted to take the lead:** Each agency pointed to the others' jurisdiction
- **Management resistance at every level:** Not just federal agencies, but LBL's own management, and international organizations all put up significant resistance
- **Stoll felt isolated:** He was personally invested while the institutions around him were indifferent or actively obstructing progress
- **German warrants required:** Even after tracing to Hannover, a German warrant was needed for the Deutsche Bundespost to identify the specific subscriber, adding more bureaucratic delay

---

## 7. Phone Trace Challenges

### How 1980s Phone Tracing Worked

Unlike modern digital systems where call origin is instantly available, 1980s analog phone tracing was a physical, manual process:

- **Required a human technician physically present at the telephone switching station** while the call was active
- **Each trace could take up to 2 hours** to complete
- The call had to remain active for the entire duration of the trace
- **Multi-hop traces** required coordination between multiple switching stations, each with their own technician
- International traces required cooperation between entirely separate national telecommunications organizations

### The Multi-Hop Challenge

The hacker's connection path required traces across:

1. **LBL's phone system** (local)
2. **Tymnet's routing network** (US nationwide X.25)
3. **International satellite/cable link** (US to Germany)
4. **Deutsche Bundespost switching** (German national telecom)
5. **University of Bremen network** (local relay)
6. **Hannover telephone exchange** (final mile to Hess)

Each hop required its own trace with its own technicians, and the hacker had to stay connected through ALL of them simultaneously.

### Why the Honeypot Was Essential

- The hacker's typical sessions were too short for a complete international trace
- At 1200 baud, downloading the large SDINET files forced Hess to stay connected for hours
- This gave the Bundespost technicians at the Hannover switching station time to physically trace the call
- It took multiple attempts (at least two more traces after Bremen was identified) before the Hannover technicians successfully traced to Hess's specific phone number
- The final successful trace caught Hess while he was simultaneously enumerating Stoll's files and breaking into a military base in Okinawa via LBL

### Deutsche Bundespost's Role

- The German post office had authority over telecommunications in West Germany (a historical arrangement)
- They were the organization that actually performed the final traces
- They had the legal authority and physical infrastructure to identify the subscriber at the end of the phone line
- Agents of the Bundespost ultimately arrested Hess at his home in Hannover

---

## 8. Key Turning Points

### Realization #1: This Is Not a Student Prank

- The hacker's systematic targeting of military systems, use of defense-related search keywords, and sophisticated exploitation techniques made clear this was not casual exploration
- The timing pattern (Pacific midday = European evening) pointed to a foreign actor

### Realization #2: This Is Espionage

- When the traces confirmed the hacker was operating from West Germany, the nature of the threat changed entirely
- The systematic harvesting of military information matched intelligence-gathering patterns
- The KGB connection was confirmed by the "Laszlo Balogh" letter requesting SDINET materials

### The Chaos Computer Club Connection

- Hess and his accomplices (Dirk Brzezinski, Peter Carl, Hans Hubner/"Pengo", Karl Koch/"Hagbard") were loosely associated with the **Chaos Computer Club** (CCC), founded in Hamburg in 1981
- The CCC was part of a "cyberpunk" counterculture in West Germany
- However, the espionage operation was not a CCC activity per se -- it was a small group within the broader hacker scene who had made contact with the KGB independently
- **Pengo (Hans Hubner)** was a CCC member who facilitated the KGB connection

### The KGB Connection Confirmed

- Hess sold stolen intelligence to a KGB agent codenamed **"Sergie"**
- The payment for the hacking ring's services: approximately **US $54,000** and cocaine
- The KGB used the Hungarian Secret Service to verify the intelligence (the Balogh letter)
- The stolen material included "sensitive semiconductor, satellite, space, and aircraft technologies"

### Karl Koch's Death

- Karl Koch (hacker handle "Hagbard"), a fourth member of the group, was found **burned to death** in a forest outside Celle, Germany
- Authorities ruled it a suicide
- The circumstances raised significant suspicion and speculation about foul play to conceal details about the espionage operation
- Koch had been a troubled individual with drug problems

### The MITRE Cutoff and Return

- When MITRE Corporation shut down the route the hacker was using, the hacker disappeared for nearly a month
- His return via a different path demonstrated persistence and motivation beyond casual hacking
- This was a key indicator that the intrusion was purposeful and organized

---

## 9. Technical Details

### Computer Systems at LBL

| System | Details |
|--------|---------|
| **Sun Workstations** | 100 MB disk, 128 KB memory, 8 MHz speed |
| **DEC VAX** | Running VMS; connected to SPAN network |
| **Local network** | Dozen large computers tied to ~100 lab computers via Ethernet, serial lines, and improvised connections |
| **Ethernet cabling** | Miles of orange Ethernet cable throughout the facility |
| **Modems** | 1200-baud telephone modem connections on 50 incoming phone lines |

### Operating Systems

- **Berkeley Unix (BSD):** Primary OS on LBL systems. Key difference from AT&T Unix: no `-f` flag for `ps` command
- **AT&T Unix (System V):** The hacker's native environment, revealed by his command syntax
- **VAX/VMS:** DEC's proprietary OS; hacker was also proficient with this
- **4.3BSD:** The specific BSD version; the movemail exploit targeted this release

### Network Protocols

| Protocol | Role in the Case |
|----------|-----------------|
| **X.25** | Packet-switched protocol used by Tymnet and German Datex-P; the hacker's primary transport layer |
| **TCP/IP** | Used on ARPANET and MILNET; the protocol connecting military/research systems |
| **Ethernet** | LBL's local area network protocol |
| **Serial/RS-232** | Connection between Stoll's monitoring terminals and phone lines |

### The Accounting System That Caught the Discrepancy

- Written in a mix of Assembler, Fortran, and COBOL
- Created by summer students who had long since departed
- Tracked computing time per account with $300/hour billing rate
- A separate computer aggregated statistics and generated monthly bills
- The system flagged the "Hunter" account because it had usage (75 cents / 9 seconds) but no billing address

### Unix Commands & Tools Reference (Investigation & Hacker Activity)

**Commands used by Stoll for investigation:**

| Command | Purpose |
|---------|---------|
| `ps` | Monitor running processes to detect hacker activity |
| `who` | Check who is currently logged into the system |
| `last` | Review login history for compromised accounts |
| `finger` | Query user information on local and remote systems |
| `acctcom` / accounting utilities | Review system accounting records |
| Custom monitoring scripts | Watch for activity on known-compromised accounts |

**Commands used by the hacker:**

| Command | Purpose |
|---------|---------|
| `ps -eafg` | List processes (AT&T syntax, betrayed his origin) |
| `who` / `finger` | Enumerate logged-in users on target systems |
| `cat /etc/passwd` | Read password file for offline cracking |
| `ls` | Survey file systems on compromised hosts |
| `emacs` (movemail) | Exploit SUID vulnerability for privilege escalation |
| `su` | Switch to superuser after escalation |
| Custom `atrun` replacement | Trojan that granted root privileges |
| Dictionary attack tool | Offline password cracker comparing encrypted dictionary words to password hashes |

### The Movemail Exploit (Technical Detail)

```
1. Hacker logs in with stolen credentials (e.g., Sventek's account)
2. Invokes GNU Emacs movemail utility (installed SUID root at LBL)
3. movemail runs as root, allowing file operations anywhere in the filesystem
4. Hacker uses movemail to overwrite /usr/lib/atrun with a custom script
5. The custom script adds superuser privileges to the hacker's account
6. Unix cron daemon executes atrun every 5 minutes as root
7. Hacker's script runs with root privileges, elevating his account
8. Hacker immediately restores the original atrun to cover tracks
9. Hacker now has persistent superuser access
```

A Metasploit module was later created recreating this exploit, targeting 4.3BSD's `/usr/lib/crontab.local`.

---

## 10. The Resolution

### The Arrest (June 29, 1987)

- Markus Hess was arrested at his home in Hannover on **June 29, 1987**
- Agents of the Deutsche Bundespost carried out the arrest
- Incriminating evidence was confiscated from his residence
- U.S. authorities had contacted German intelligence officials, who coordinated with the Bundespost

### The Accomplices

| Name | Handle | Role | Outcome |
|------|--------|------|---------|
| **Markus Hess** | -- | Lead hacker, primary system breaker | 20 months suspended |
| **Dirk Brzezinski** | DOB | Co-hacker, assisted in network intrusions | 20 months suspended |
| **Peter Carl** | -- | Middleman, sold information to KGB | 14 months suspended |
| **Hans Hubner** | Pengo | CCC member, KGB facilitator | Turned informant |
| **Karl Koch** | Hagbard | Hacker, CCC member | Found dead (ruled suicide) |

### The Trial (February 15, 1990)

- Held in **Verden an der Aller, West Germany**
- Hess, Brzezinski, and Carl were convicted of unauthorized computer access and espionage-related activities
- Stoll flew to West Germany to testify against Hess
- The presiding judge concluded: **"No serious damage to West Germany has arisen"**
- All three received **suspended sentences** (no prison time served)
- The lenient sentences drew criticism given the Cold War context and the aid provided to KGB intelligence gathering on NATO

### Why Sentences Were Light

- German law at the time had limited provisions for computer crime
- The judge viewed the damage as minimal to German interests specifically
- U.S. authorities did not pursue separate prosecutions, citing jurisdictional limitations
- Hess was ordered to stay away from the hacker community

### Aftermath

- **Stoll published** "Stalking the Wily Hacker" in Communications of the ACM (May 1988) and *The Cuckoo's Egg* (1989)
- **The book** was adapted into a 1990 PBS Nova episode: *"The KGB, The Computer, and Me"*
- **The Morris Worm:** On November 3, 1988, almost exactly a year after Stoll concluded his investigation, Robert Morris Jr. (son of Stoll's NSA contact Bob Morris Sr.) released the Morris Worm, bringing the Internet to its knees
- **Hess has remained silent** about his role in the decades since. Whether frightened by Koch's death or simply repentant, he has declined interview requests
- **The book sold over 1 million copies** and inspired an entire generation of cybersecurity professionals
- **Legacy concepts born from the case:**
  - The honeypot (first documented use)
  - Incident response playbooks
  - The importance of log monitoring
  - Network-level intrusion detection
  - The need for inter-agency cooperation on cyber threats

---

## Appendix A: Gameplay-Relevant Technical Actions

This section extracts specific technical actions from the investigation that could translate into game mechanics.

### Player Actions (As the Investigator)

| Action Category | Specific Actions | Game Mechanic Potential |
|----------------|-----------------|----------------------|
| **Log Analysis** | Read accounting logs, identify billing discrepancies, cross-reference user accounts with billing addresses | Puzzle: find the anomalous entry in a ledger |
| **Account Investigation** | Look up user "Hunter", check if billing address exists, check when account was created, delete unauthorized accounts | Terminal commands with discoverable results |
| **Process Monitoring** | Run `ps` to see running processes, notice unfamiliar processes, identify compromised accounts | Real-time monitoring mini-game |
| **Login Monitoring** | Run `who` to see active users, run `last` to check login history, notice logins at unusual hours | Pattern recognition puzzle |
| **Physical Setup** | Connect terminals to phone lines, wire up pager alerts, attach teleprinters for logging | Equipment crafting/placement mechanic |
| **Network Tracing** | Trace connection from LBL phone lines to Tymnet, coordinate with Tymnet operators, identify international routing | Multi-step trace puzzle with time pressure |
| **Honeypot Creation** | Create fake user account (SDINET), write convincing fake documents, set up fake department, monitor bait access | Document crafting / social engineering design |
| **Agency Coordination** | Call FBI (get rejected), call CIA (they take notes but share nothing), call NSA (legal constraints), call AFOSI (more receptive) | Dialog/persuasion system |
| **Phone Trace** | Request trace from Bundespost, keep hacker online long enough, coordinate across switching stations | Time-management mechanic -- keep connection alive |
| **Evidence Collection** | Maintain logbook, print session transcripts, save connection records, photograph evidence | Evidence board / case file management |

### Hacker Actions (To Simulate/Counter)

| Action | Technical Detail |
|--------|-----------------|
| **Exploit movemail** | Use SUID binary to overwrite system files |
| **Replace atrun** | Swap legitimate cron job with privilege escalation script |
| **Crack passwords** | Download /etc/passwd, run dictionary attack offline |
| **Guess defaults** | Try root/guest/system/field with blank or default passwords |
| **Keyword search** | Search filesystems for "nuclear", "SDI", "stealth", "ICBM" |
| **Pivot between systems** | Use trust relationships to hop from LBL to MILNET hosts |
| **Cover tracks** | Restore original atrun, clean log entries |
| **Deploy Trojans** | Create fake login prompts to harvest passwords |

### Key Logs & Files the Player Would Examine

| File/Log | What It Reveals |
|----------|----------------|
| Accounting system output | The 75-cent discrepancy, unauthorized accounts |
| `/etc/passwd` | User accounts, potential targets for dictionary attack |
| Login records (`wtmp`/`utmp`) | Who logged in, when, from where |
| Process table (`ps` output) | Running processes, which accounts are active |
| Teletype printouts | Complete session transcripts of hacker activity |
| Tymnet routing logs | Connection path through the X.25 network |
| System mail / `Dockmaster` alert | External notification of break-in attempt |
| `atrun` file (compare checksums) | Evidence of file replacement/Trojan |

### Key NPCs / Contacts

| Character | Role | Interaction Type |
|-----------|------|-----------------|
| **Dave Cleveland** | LBL supervisor, assigns the 75-cent task | Quest giver |
| **Martha Matthews** | Girlfriend/legal advisor, devises honeypot | Key ally, idea source |
| **Bob Morris Sr.** | NSA contact | Information broker (limited by law) |
| **Tymnet operators** | Network routing company staff | Trace assistance |
| **FBI agents** | Initially dismissive, later engaged | Escalation path |
| **CIA contacts** | Information vacuum cleaners | Frustration encounters |
| **AFOSI investigators** | Air Force investigators, most responsive | Military cooperation |
| **Bundespost technicians** | German telecom, perform final trace | Critical endgame ally |
| **"Laszlo Balogh"** | Hungarian agent, KGB verification | Evidence of espionage |
| **Barbara Sherwin** | Fictional SDINET secretary | Honeypot character |

---

## Appendix B: Investigation Duration Reference

| Phase | Approximate Period | Duration |
|-------|-------------------|----------|
| Discovery of 75-cent discrepancy | August 1986 | Day 1 |
| Terminal weekend / identify Tymnet | August 1986 | Days 2-4 |
| Set up permanent monitoring | August-September 1986 | Weeks 1-4 |
| Profile hacker, contact agencies | Fall 1986 | Months 2-4 |
| Trace to Germany confirmed | Late 1986 | Months 4-6 |
| MITRE cutoff, hacker disappears | Late 1986 | ~1 month gap |
| Narrow trace to Bremen, then Hannover | Early 1987 | Months 6-8 |
| Operation Showerhead (honeypot) | Early-Mid 1987 | Months 8-10 |
| Hess downloads SDINET bait | June 1987 | Month 10 |
| Final trace to Hess's home | June 1987 | Month 10 |
| Hess arrested | June 29, 1987 | Month 10 |
| Laszlo Balogh letter arrives | After arrest | Confirmation |
| Trial in Verden | February 15, 1990 | ~3 years later |

**Total active investigation: approximately 10 months (August 1986 - June 1987)**

---

## Sources

- Stoll, Clifford. *The Cuckoo's Egg: Tracking a Spy Through the Maze of Computer Espionage.* Doubleday, 1989.
- Stoll, Clifford. ["Stalking the Wily Hacker."](https://dl.acm.org/doi/10.1145/42411.42412) *Communications of the ACM*, Vol. 31, No. 5, May 1988, pp. 484-497.
- [The Cuckoo's Egg (book) - Wikipedia](https://en.wikipedia.org/wiki/The_Cuckoo's_Egg_(book))
- [Markus Hess - Wikipedia](https://en.wikipedia.org/wiki/Markus_Hess)
- [Cliff Stoll Role in Uncovering The Cuckoo's Egg Hacker - Chaintech](https://www.chaintech.network/blog/cliff-stoll-role-in-uncovering-the-cuckoos-egg-hacker/)
- [Cyber-Sleuth Cliff Stoll: How a Mad Genius Exposed Moscow's Hacker Spies - Spyscape](https://spyscape.com/article/how-an-astronomer-unraveled-the-worlds-first-cyber-attack)
- [The Cuckoo's Egg & How it Relates to Cybersecurity - exida](https://www.exida.com/blog/the-cuckoos-egg-how-it-relates-to-cybersecurity)
- [Real World Lessons From The Cuckoo's Egg - JBC Security](https://jbcsec.com/real-world-lessons-from-the-cuckoos-egg/)
- [Emacs movemail Privilege Escalation - Rapid7](https://www.rapid7.com/db/modules/exploit/unix/local/emacs_movemail/)
- [The Cuckoo's Egg: An Analysis of Digital Forensic Techniques - Medium](https://medium.com/@jcart657/the-cuckoos-egg-9b502442ea67)
- [Book Review & Summary: The Cuckoo's Egg - CyberSecFaith](https://cybersecfaith.com/2020/04/04/book-review-summary-the-cuckoos-egg/)
- [Cuckoo's Egg Week 7 Notes - Chris Sanders](https://chrissanders.org/2018/01/cuckoos-egg-week-7-notes/)
- [Great Rivalries in Cybersecurity: Cliff Stoll vs. Markus Hess](https://www.cybersecurityeducationguides.org/cliff-stoll-vs-markus-hess/)
- [COMPUTER HACKERS FACE SPY CHARGES - Washington Post, August 17, 1989](https://www.washingtonpost.com/archive/politics/1989/08/17/computer-hackers-face-spy-charges/cad42e6b-73db-48d4-814f-86eb1574ae68/)
- [Stalking the Wily Hacker (PDF) - textfiles.com](http://pdf.textfiles.com/academics/wilyhacker.pdf)
