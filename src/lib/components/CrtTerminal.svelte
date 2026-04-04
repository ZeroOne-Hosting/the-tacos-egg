<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { initZork, type ZorkEngine } from '$lib/games/zork.js';

	type OutputLine = {
		text: string;
		instant?: boolean;
	};

	const PROMPT = 'zeroone> ';
	const TYPING_DELAY_MS = 18;
	const BOOT_LINE_DELAY_MS = 120;

	const BOOT_SEQUENCE: OutputLine[] = [
		{ text: 'Zero One Recovery Kernel — ZORK v2.1', instant: true },
		{ text: '"Lowering expectations since our court date"', instant: true },
		{ text: 'Kelso, WA - Garage Datacenter', instant: true },
		{ text: '', instant: true },
		{ text: 'Performing system checks...', instant: true },
		{ text: 'Memory: 640K (should be enough for anyone)', instant: true },
		{ text: 'Disk: /dev/garage0 mounted', instant: true },
		{ text: 'Network: 3 of 7 neighbor WiFi connections... ACTIVE', instant: true },
		{ text: '(idpromnut is trying to change his SSID to keep us out again...)', instant: true },
		{ text: 'UPS: Extension cord to neighbor\'s house... OK', instant: true },
		{ text: 'Cooling: Garage door open... CONFIRMED', instant: true },
		{ text: '', instant: true }
	];

	const EMAILS = [
		{
			id: 1,
			from: 'billing@zeroone.local',
			subject: '*** ALERT *** Accounting discrepancy - $0.75',
			date: 'Mon Aug 11 07:45:02 1986',
			body: `From: billing@zeroone.local
To: sysadmin@zeroone.local
Date: Mon Aug 11 07:45:02 1986
Subject: *** ALERT *** Accounting discrepancy - $0.75

Sysadmin,

The automated billing reconciliation script found a $0.75 discrepancy
in the Q3 accounts. This is NOT the taco fund. This is real money.

Ledger entry ref: INV-1986-0811-004
Expected: $142.25
Actual:   $141.50
Delta:    -$0.75

Please investigate and reply-all. Cosworth is already
upset and he controls the garage door opener. And mr.pink
controls the disco ball, so let's not get him involved.

-- ZeroOne Billing Daemon (cron job, mostly works)`
		},
		{
			id: 2,
			from: 'ops@zeroone.local',
			subject: 'Garage door left open AGAIN',
			date: 'Mon Aug 11 06:02:17 1986',
			body: `From: ops@zeroone.local
To: all@zeroone.local
Date: Mon Aug 11 06:02:17 1986
Subject: Garage door left open AGAIN

Whoever left the garage door open last night: the servers got wet.
Rack 1 (the card table) is fine. Rack 2 (the TV tray) has some
moisture on the power strip. It dried out. Probably fine.

Please close the door when you leave. We cannot afford another
incident. We literally cannot. The Kona's warranty doesn't cover this.

Also a raccoon got in. It did not touch the servers. Respect.

-- Ops (Dave)`
		},
		{
			id: 3,
			from: 'tacobell-order@zeroone.local',
			subject: 'GROUP TACO ORDER - respond by 11:30',
			date: 'Mon Aug 11 08:00:44 1986',
			body: `From: tacobell-order@zeroone.local
To: all@zeroone.local
Date: Mon Aug 11 08:00:44 1986
Subject: GROUP TACO ORDER - respond by 11:30

Doing a Taco Bell run at noon. Reply with your order.

Current orders:
  Dave    - 3x taco, 1x burrito
  Sandra  - 2x taco (no sour cream, she means it this time)
  Mike    - waiting to see what Dave gets and then getting the same

If you don't reply by 11:30 you get whatever's left over. Last week
that was a cinnamon twist and nobody was happy.

Cash only. The card reader is still "in transit" from Radio Shack.

-- Taco Automated Curro Ordering (TACO v0.3, use at own risk)`
		},
		{
			id: 4,
			from: 'kona-monitor@zeroone.local',
			subject: 'Kona battery: 23% - CHARGING REMINDER',
			date: 'Sun Aug 10 23:47:59 1986',
			body: `From: kona-monitor@zeroone.local
To: sysadmin@zeroone.local
Date: Sun Aug 10 23:47:59 1986
Subject: Kona battery: 23% - CHARGING REMINDER

AUTOMATED ALERT from the Hyundai Kona Datacenter Power Monitor

The Kona is at 23% battery. This is the backup power supply for
Rack 1 and the network switch. If it dies so does the internet.

Charging schedule:
  Sun night  - Mike's house (he said it's fine, don't ask again)
  Mon-Wed    - Neighbor's extension cord (see UPS config)
  Thu-Sat    - TBD / pray

Action required: plug in the car.

-- KonaWatch v1.0 (runs on the Kona's own battery, we know)`
		}
	];

	const WHO_ALWAYS = ['sysadmin', 'root'];
	const WHO_POOL = [
		'wendell', 'salem', 'craft', 'coffee', 'hacker',
		'cosworth', 'mr.pink', 'idpromnut', 'dirk', 'lickity',
		'geerling', 'technotim', 'networkchuck', 'wolfgangs',
		'lawrence', 'spacerex', 'dbtech', 'raidowl', 'lempa', 'ychto'
	];

	function generateWho(): string[] {
		const count = 3 + Math.floor(Math.random() * 4); // 3-6 random users
		const shuffled = WHO_POOL.slice().sort(() => Math.random() - 0.5);
		const picked = shuffled.slice(0, count);
		const users = [...WHO_ALWAYS, ...picked];

		const hours = ['06', '07', '08', '09', '10', '11', '23'];
		const minutes = () => String(Math.floor(Math.random() * 60)).padStart(2, '0');

		return users.map((user, i) => {
			const tty = user === 'root' ? 'console' : `tty${String(i + 1).padStart(2, '0')}`;
			const h = hours[Math.floor(Math.random() * hours.length)];
			return `${user.padEnd(12)}${tty.padEnd(10)}Aug 11 ${h}:${minutes()}`;
		});
	}

	function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

	const PS_COMMANDS: Array<() => string> = [
		// Classic insecure protocols
		() => `telnet ${pick(['bbs.zeroone.local', 'neighbor-pc', 'pentagon.mil', 'mainframe', 'tacobell.com', 'kremlin.su', 'bbs.mit.edu', 'compuserve.com'])} ${pick(['', '25', '23', '80', '110', '31337'])}`.trim(),
		() => `finger ${pick(['-l ', ''])}@${pick(['mit.edu', 'stanford.edu', 'kremlin.su', 'zeroone.local', 'neighbor-wifi-3', 'pentagon.mil', 'nsa.gov'])}`,
		() => `rlogin ${pick(['pentagon.mil', 'mainframe', 'neighbor-pc', 'norad.gov', 'wopr.mil', 'tacobell-hq'])}`,
		() => `rsh ${pick(['neighbor-pc', 'gateway', 'mainframe', 'kona-dashboard'])} "${pick(['cat /etc/shadow', 'rm -rf /', 'reboot', 'wall TACOS', 'shutdown -h now', 'cat /etc/passwd'])}"`,
		() => `rcp root@${pick(['gateway', 'neighbor-pc', 'mainframe'])}:${pick(['/etc/hosts', '/etc/passwd', '/etc/shadow', '/var/log/auth.log'])} .`,
		() => `rexec ${pick(['mainframe', 'neighbor-pc', 'gateway'])} ${pick(['uptime', 'whoami', 'cat /etc/passwd', 'reboot'])}`,
		() => `ftp ${pick(['warez.underground.net', 'files.tacobell.com', 'neighbor-nas', 'totally-legal-software.ru', 'bbs.homelabs.net'])}`,
		() => `tftp ${pick(['get', 'put'])} ${pick(['firmware.bin', 'config.bak', 'passwords.txt', 'taco-recipes.tar', 'router-backup.img'])}`,

		// Questionable file operations
		() => `chmod ${pick(['777', '666', '000', '444'])} ${pick(['/', '/etc/passwd', '/dev/garage0', '/var/log/auth.log', '/home/*/.*', '/usr/bin/sudo'])}`,
		() => `dd if=${pick(['/dev/zero', '/dev/urandom', '/dev/garage0', '/dev/kona'])} of=${pick(['/dev/garage0', '/dev/null', '/tmp/evidence', '/mnt/backup/tacos.img', '/dev/neighbor-wifi'])}`,
		() => `rm -rf ${pick(['/tmp/evidence', '/var/log/*', '~/.bash_history', '/home/hacker', '/opt/totally-not-stolen'])}`,
		() => `tar ${pick(['xvf', 'cvf', 'xzf'])} ${pick(['secrets.tar.gz', 'warez.tar', 'taco-recipes.bak', 'definitely-not-pirated.tar.xz', 'neighbor-wifi-passwords.tar', 'evidence-backup.tar.gz'])}`,
		() => `cat ${pick(['/etc/passwd', '/etc/shadow', '/var/log/auth.log', '/dev/urandom', '/proc/kcore', '~/.ssh/id_rsa'])}`,
		() => `mount ${pick(['/dev/kona', '/dev/garage0', '/dev/floppy0', '//neighbor-pc/share'])} ${pick(['/mnt/backup', '/mnt/tacos', '/mnt/evidence', '/mnt/warez'])}`,

		// Network shenanigans
		() => `nc -l ${pick(['31337', '1337', '4444', '8080', '6969', '12345'])}`,
		() => `traceroute ${pick(['kremlin.su', 'pentagon.mil', 'tacobell.com', 'neighbor-wifi-3', 'area51.gov', 'nsa.gov', 'whopper.net'])}`,
		() => `nslookup ${pick(['suspicious.host', 'totally-not-malware.ru', 'free-tacos.com', 'neighbor-wifi-password.txt', 'definitely-legit.cn'])}`,
		() => `ping ${pick(['127.0.0.1', 'neighbor-wifi-3', 'tacobell.com', 'kremlin.su', 'localhost', '255.255.255.255'])}`,
		() => `ssh ${pick(['neighbor-wifi-3', 'root@gateway', 'admin@kona-dashboard', 'guest@pentagon.mil'])}`,
		() => `curl ${pick(['tacobell.com/menu', 'free-ram-download.com', 'is-my-garage-door-open.zeroone.local', 'whatismyip.com', 'definitely-not-a-virus.ru/download'])}`,
		() => `wget ${pick(['ftp://warez.underground/utils.zip', 'http://free-tacos.com/coupon.exe', 'http://more-ram.com/download-ram.tar', 'http://tacobell.com/secret-menu.pdf'])}`,
		() => `wifi-scanner --${pick(['neighbors', 'all', 'passwords', 'deauth', 'sniff'])}`,
		() => `sendmail -t < ${pick(['newsletter.txt', 'ransom-note.txt', 'taco-order.msg', 'resignation-letter.txt', 'all-reply-oops.txt'])}`,

		// Editors and shells
		() => `${pick(['vi', 'emacs -nw', 'ed', 'nano'])} ${pick(['config.sys', '/etc/passwd', 'exploit.c', 'taco-order.txt', '.plan', 'resignation-letter.txt', 'todo.md'])}`,
		() => `${pick(['gcc -O2', 'cc'])} ${pick(['exploit.c', 'backdoor.c', 'taco-tracker.c', 'wifi-crack.c', 'kona-battery-monitor.c', 'garage-door-iot.c'])}`,
		() => `make ${pick(['world', 'clean', 'install', 'tacos', 'trouble', 'love-not-war', 'it-stop'])}`,

		// Surveillance and monitoring
		() => `tail -f ${pick(['/var/log/syslog', '/var/log/auth.log', '/var/log/taco-orders', '/dev/garage-door-sensor', '/var/log/neighbor-complaints'])}`,
		() => `tcpdump -i ${pick(['eth0', 'wlan0', 'neighbor-bridge', 'kona-hotspot'])} ${pick(['port 23', 'port 80', 'host kremlin.su', 'host tacobell.com', ''])}`.trim(),
		() => `${pick(['kona-monitor --battery-check', 'kona-monitor --range-anxiety', 'kona-monitor --is-plugged-in', 'kona-monitor --neighbor-outlet-status'])}`,
		() => `garage-door ${pick(['--status', '--open', '--close', '--ask-cosworth', '--raccoon-check'])}`,
		() => `disco-ball --${pick(['strobe', 'slow-rotate', 'mirror-check', 'party-mode', 'mr-pink-approved'])}`,

		// Games and time wasters
		() => pick(['nethack', 'rogue', 'adventure', 'zork', 'sl', 'fortune | cowsay', 'banner TACOS', 'worm', 'rain', 'fish']),

		// Taco operations
		() => `taco-order ${pick(['--extra-cheese', '--no-lettuce', '--baja-blast', '--party-pack', '--surprise-me', '--for-cosworth', '--bulk 50'])}`,
		() => `talk ${pick(['mr.pink', 'cosworth', 'dirk', 'wendell', 'idpromnut'])}`,
		() => `wall "${pick(['garage door is open', 'who took my tacos', 'kona is at 2%', 'disco ball is stuck', 'TACO ORDER IN 5 MIN', 'raccoon is back', 'idpromnut changed his SSID again'])}"`,

		// Kali / pentest tools
		() => `nmap ${pick(['-sS', '-sV', '-A', '-O', '--script vuln'])} ${pick(['neighbor-wifi-3', '192.168.1.0/24', 'pentagon.mil', 'tacobell.com', 'zeroone.local', '10.0.0.0/8'])}`,
		() => `aircrack-ng ${pick(['-w /usr/share/wordlists/rockyou.txt neighbor.cap', '--bssid DE:AD:BE:EF:CA:FE dump-01.cap', '-a2 -b 00:11:22:33:44:55 capture.cap'])}`,
		() => `hydra -l admin -P ${pick(['/usr/share/wordlists/rockyou.txt', 'taco-passwords.txt', 'neighbor-guesses.txt'])} ${pick(['neighbor-wifi-3', 'gateway', 'kona-dashboard', 'tacobell.com'])} ${pick(['ssh', 'ftp', 'telnet', 'http-post-form'])}`,
		() => `john ${pick(['--wordlist=/usr/share/wordlists/rockyou.txt', '--rules', '--incremental'])} ${pick(['hashes.txt', '/etc/shadow', 'neighbor-hashes.txt'])}`,
		() => `hashcat -m ${pick(['0', '1000', '2500', '5600'])} -a 0 ${pick(['hashes.txt', 'ntlm-dump.txt', 'wifi-handshake.hccapx'])} ${pick(['rockyou.txt', 'taco-menu-wordlist.txt'])}`,
		() => `metasploit ${pick(['exploit/multi/handler', 'auxiliary/scanner/ssh/ssh_login', 'exploit/unix/ftp/vsftpd_234_backdoor', 'auxiliary/scanner/portscan/tcp'])}`,
		() => `sqlmap -u "${pick(['http://tacobell.com/order?id=1', 'http://zeroone.local/billing?acct=1', 'http://neighbor-nas/login.php?user=admin'])}" ${pick(['--dbs', '--dump', '--os-shell', '--batch'])}`,
		() => `nikto -h ${pick(['http://zeroone.local', 'http://neighbor-nas', 'http://tacobell.com', 'http://kona-dashboard:8080'])}`,
		() => `burpsuite ${pick(['--project tacobell-audit', '--project neighbor-wifi-portal', '--project zeroone-billing'])}`,
		() => `responder -I ${pick(['eth0', 'wlan0', 'neighbor-bridge'])} ${pick(['-wrf', '-wrfv'])}`,
		() => `wireshark -i ${pick(['eth0', 'wlan0', 'neighbor-bridge', 'kona-hotspot'])} -k`,
		() => `airmon-ng ${pick(['start', 'check kill'])} ${pick(['wlan0', 'wlan1'])}`,
		() => `ettercap -T -q -i ${pick(['eth0', 'wlan0'])} -M arp:remote /${pick(['192.168.1.1', '10.0.0.1'])}/ /${pick(['192.168.1.0/24', '10.0.0.0/24'])}/`,
		() => `gobuster dir -u ${pick(['http://zeroone.local', 'http://neighbor-nas', 'http://tacobell.com'])} -w ${pick(['/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt', 'taco-dirs.txt'])}`,
		() => `enum4linux ${pick(['-a', '-U', '-S'])} ${pick(['neighbor-pc', 'gateway', 'mainframe'])}`,

		// Delightfully wrong
		() => `fsck ${pick(['/dev/garage0', '/dev/kona', '/dev/neighbor-wifi', '/dev/disco-ball'])}`,
		() => `crontab -e # ${pick(['schedule taco run', 'auto-reboot at 3am', 'steal wifi hourly', 'check garage door', 'rotate disco ball'])}`,
		() => `uudecode ${pick(['suspicious.uu', 'totally-a-pdf.uu', 'not-malware.uu', 'taco-coupon.uu'])}`,
		() => `${pick(['last', 'lastlog', 'w', 'uptime', 'who -a', 'users', 'top', 'htop', 'iotop', 'df -h', 'du -sh /*', 'free -m', 'vmstat'])}`,
		() => `awk '{print $${pick(['3', '1', 'NF'])}}'  ${pick(['access.log', '/etc/passwd', 'taco-receipts.csv', 'neighbor-ssid-history.log'])}`,
	];

	const SYSTEM_PROCS = [
		// init and kernel
		{ user: 'root', pid: 1, prog: 'init [3]' },
		{ user: 'root', pid: 2, prog: '[kthreadd]' },
		{ user: 'root', pid: 3, prog: '[ksoftirqd/0]' },
		{ user: 'root', pid: 7, prog: '[kworker/0:0H-garage-door-sensor]' },
		// system daemons
		{ user: 'root', pid: 42, prog: '/usr/sbin/sshd -D' },
		{ user: 'root', pid: 58, prog: '/usr/sbin/cron' },
		{ user: 'root', pid: 63, prog: 'syslogd -m 0' },
		{ user: 'root', pid: 71, prog: '/usr/sbin/inetd' },
		{ user: 'daemon', pid: 80, prog: '/usr/sbin/atd' },
		{ user: 'root', pid: 89, prog: 'dhclient neighbor-wifi-3' },
		{ user: 'root', pid: 94, prog: 'wpa_supplicant -i wlan0 -c /etc/neighbor-passwords.conf' },
	];

	const OPENSTACK_PROCS: Array<() => { user: string; prog: string }> = [
		() => ({ user: 'nova', prog: `nova-${pick(['compute', 'api', 'scheduler', 'conductor', 'novncproxy'])}` }),
		() => ({ user: 'neutron', prog: `neutron-${pick(['server', 'dhcp-agent', 'l3-agent', 'openvswitch-agent', 'metadata-agent'])}` }),
		() => ({ user: 'glance', prog: `glance-${pick(['api', 'registry'])}` }),
		() => ({ user: 'cinder', prog: `cinder-${pick(['api', 'scheduler', 'volume'])}` }),
		() => ({ user: 'keystone', prog: `keystone-${pick(['admin', 'public', 'wsgi'])}` }),
		() => ({ user: 'heat', prog: `heat-${pick(['api', 'engine', 'api-cfn'])}` }),
		() => ({ user: 'swift', prog: `swift-${pick(['proxy-server', 'object-server', 'container-server', 'account-server'])}` }),
		() => ({ user: 'horizon', prog: 'apache2 -k start -DFOREGROUND # horizon' }),
		() => ({ user: 'rabbitmq', prog: 'beam.smp -W w -K true -- -root /usr/lib/erlang' }),
		() => ({ user: 'mysql', prog: '/usr/sbin/mysqld --basedir=/usr' }),
		() => ({ user: 'memcache', prog: 'memcached -m 64 -p 11211 -u memcache' }),
	];

	function generatePs(): string[] {
		const header = 'USER         PID  %CPU %MEM    TIME COMMAND';

		// System processes (always shown, pick a random subset)
		const sysprocs = SYSTEM_PROCS.slice().sort(() => Math.random() - 0.5).slice(0, 5 + Math.floor(Math.random() * 4));
		const syslines = sysprocs
			.sort((a, b) => a.pid - b.pid)
			.map((p) => {
				const cpu = (Math.random() * 0.5).toFixed(1);
				const mem = (Math.random() * 2).toFixed(1);
				return `${p.user.padEnd(12)} ${String(p.pid).padStart(5)}  ${cpu.padStart(4)}  ${mem.padStart(4)}  ${`${Math.floor(Math.random() * 300)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`.padStart(6)} ${p.prog}`;
			});

		// OpenStack processes (pick 3-6)
		const osCount = 3 + Math.floor(Math.random() * 4);
		const osprocs = OPENSTACK_PROCS.slice().sort(() => Math.random() - 0.5).slice(0, osCount);
		const oslines = osprocs.map((gen) => {
			const p = gen();
			const pid = 200 + Math.floor(Math.random() * 300);
			const cpu = (Math.random() * 15).toFixed(1);
			const mem = (Math.random() * 8).toFixed(1);
			return `${p.user.padEnd(12)} ${String(pid).padStart(5)}  ${cpu.padStart(4)}  ${mem.padStart(4)}  ${`${Math.floor(Math.random() * 60)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`.padStart(6)} ${p.prog}`;
		});

		// User processes
		const users = WHO_POOL.slice().sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 4));
		const userlines = users.map((user) => {
			const prog = pick(PS_COMMANDS)();
			const pid = String(500 + Math.floor(Math.random() * 9500)).padStart(5, ' ');
			const cpu = (Math.random() * (prog.includes('make') || prog.includes('gcc') ? 80 : 12)).toFixed(1);
			const mem = (Math.random() * (prog.includes('emacs') ? 40 : 8)).toFixed(1);
			const mins = Math.floor(Math.random() * 59);
			const secs = Math.floor(Math.random() * 59);
			const time = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
			return `${user.padEnd(12)} ${pid}  ${cpu.padStart(4)}  ${mem.padStart(4)}  ${time.padStart(6)} ${prog}`;
		});

		return [header, ...syslines, ...oslines, ...userlines];
	}

	const HELP_TEXT = [
		'Available commands:',
		'',
		'  mail         Read your mail',
		'  read <n>     Read message number <n>',
		'  who          Show logged-in users',
		'  ps           Show running processes',
		'  date         Show current date and time',
		'  clear        Clear the terminal',
		'  tacos        Open taco ordering system',
		'  zork         Play Zork I',
		'  help         Show this help'
	];

	let outputLines = $state<string[]>([]);
	let inputValue = $state('');
	let commandHistory = $state<string[]>([]);
	let historyIndex = $state(-1);
	let isBooting = $state(true);
	let isTyping = $state(false);
	let loginPhase = $state<'username' | 'password' | 'done'>('username');
	let outputEl = $state<HTMLDivElement | undefined>();
	let inputEl = $state<HTMLInputElement | undefined>();
	let zorkActive = $state(false);
	let zorkEngine = $state<ZorkEngine | null>(null);

	async function sleep(ms: number): Promise<void> {
		return new Promise((r) => setTimeout(r, ms));
	}

	async function appendLine(text: string): Promise<void> {
		outputLines = [...outputLines, text];
		await tick();
		scrollToBottom();
	}

	async function typeLines(lines: string[]): Promise<void> {
		isTyping = true;
		for (const line of lines) {
			if (line === '') {
				await appendLine('');
				await sleep(TYPING_DELAY_MS * 2);
				continue;
			}
			let built = '';
			outputLines = [...outputLines, ''];
			for (const ch of line) {
				built += ch;
				outputLines = [...outputLines.slice(0, -1), built];
				await tick();
				scrollToBottom();
				await sleep(TYPING_DELAY_MS);
			}
		}
		isTyping = false;
	}

	async function runBootSequence(): Promise<void> {
		isBooting = true;
		for (const line of BOOT_SEQUENCE) {
			await appendLine(line.text);
			await sleep(BOOT_LINE_DELAY_MS);
		}
		await appendLine('');
		isBooting = false;
		loginPhase = 'username';
		inputEl?.focus();
	}

	async function handleLogin(value: string): Promise<void> {
		if (loginPhase === 'username') {
			await appendLine(`Login: ${value}`);
			loginPhase = 'password';
		} else if (loginPhase === 'password') {
			await appendLine(`Password: ${'*'.repeat(value.length)}`);
			loginPhase = 'done';
			await appendLine('');
			await appendLine('Last login: Mon Aug 11 08:23:14 1986');
			await appendLine('You have new mail.');
			await appendLine('');
		}
	}

	function scrollToBottom(): void {
		if (outputEl) {
			outputEl.scrollTop = outputEl.scrollHeight;
		}
	}

	async function handleCommand(raw: string): Promise<void> {
		const cmd = raw.trim();

		await appendLine(`${PROMPT}${cmd}`);

		if (cmd === '') return;

		commandHistory = [cmd, ...commandHistory];
		historyIndex = -1;

		const parts = cmd.toLowerCase().split(/\s+/);
		const verb = parts[0];

		if (verb === 'help') {
			await typeLines(HELP_TEXT);
		} else if (verb === 'clear') {
			outputLines = [];
		} else if (verb === 'date') {
			await typeLines(['Mon Aug 11 09:14:22 PDT 1986']);
		} else if (verb === 'who') {
			await typeLines(generateWho());
		} else if (verb === 'ps') {
			await typeLines(generatePs());
		} else if (verb === 'mail') {
			const header = [
				'Mail version 2.18 6/28/83.  Type ? for help.',
				`"/usr/spool/mail/sysadmin": ${EMAILS.length} messages, 1 new`,
				''
			];
			const inbox = EMAILS.map(
				(e) =>
					`${e.id === 1 ? 'N' : ' '} ${String(e.id).padEnd(2)} ${e.from.padEnd(30)} ${e.date.slice(0, 12)}  "${e.subject}"`
			);
			await typeLines([...header, ...inbox]);
		} else if (verb === 'read') {
			const n = parseInt(parts[1] ?? '', 10);
			const email = EMAILS.find((e) => e.id === n);
			if (isNaN(n) || !email) {
				await typeLines([`No message ${parts[1] ?? ''}.`]);
			} else {
				await typeLines(email.body.split('\n'));
			}
		} else if (verb === 'tacos') {
			await typeLines([
				'Taco Automated Curro Ordering (TACO) v0.3',
				'"If you have a problem with our tacos, call someone who cares."',
				'',
				'  [1] Taco         $0.25',
				'  [2] Burrito      $0.50',
				'  [3] Nachos       $0.35',
				'  [4] Cinnamon Twist $0.15  (last resort)',
				'',
				'Order integration pending. Dirk has the API docs.',
				'Dirk is on vacation. No ETA.'
			]);
		} else if (verb === 'zork') {
			await appendLine('Loading Zork I...');
			try {
				const engine = await initZork();
				zorkEngine = engine;
				zorkActive = true;
				const opening = engine.getInitialText();
				for (const line of opening) {
					await appendLine(line);
				}
			} catch (err) {
				await appendLine(`zork: failed to load: ${err instanceof Error ? err.message : String(err)}`);
			}
		} else {
			await typeLines([`${cmd}: command not found`]);
		}
	}

	async function handleZorkInput(raw: string): Promise<void> {
		const input = raw.trim();

		if (input.toLowerCase() === 'quit') {
			await appendLine('>quit');
			if (zorkEngine) {
				const lines = zorkEngine.sendCommand('quit');
				for (const line of lines) {
					await appendLine(line);
				}
			}
			zorkActive = false;
			zorkEngine = null;
			await appendLine('');
			await appendLine('[Returned to ZeroOne terminal]');
			return;
		}

		await appendLine(`>${input}`);
		if (zorkEngine) {
			const lines = zorkEngine.sendCommand(input);
			for (const line of lines) {
				await appendLine(line);
			}
		}
	}

	async function onKeyDown(e: KeyboardEvent): Promise<void> {
		if (isBooting || isTyping) return;

		if (e.key === 'Enter') {
			const val = inputValue;
			inputValue = '';
			if (loginPhase !== 'done') {
				await handleLogin(val);
				return;
			}
			if (zorkActive) {
				await handleZorkInput(val);
				return;
			}
			await handleCommand(val);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (historyIndex < commandHistory.length - 1) {
				historyIndex += 1;
				inputValue = commandHistory[historyIndex];
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex > 0) {
				historyIndex -= 1;
				inputValue = commandHistory[historyIndex];
			} else if (historyIndex === 0) {
				historyIndex = -1;
				inputValue = '';
			}
		}
	}

	onMount(() => {
		runBootSequence();

		function refocusInput() {
			inputEl?.focus();
		}
		window.addEventListener('click', refocusInput);
		return () => window.removeEventListener('click', refocusInput);
	});
</script>

<div class="crt-wrapper">
	<div class="monitor-body">
		<div class="monitor-top">
			<div class="vent-slots" aria-hidden="true">
				{#each Array(8) as _}
					<div class="vent"></div>
				{/each}
			</div>
		</div>
		<div class="crt-screen">
			<div class="screen-glass" aria-hidden="true"></div>
			<div class="scanlines" aria-hidden="true"></div>

			<div class="terminal" bind:this={outputEl}>
			{#each outputLines as line}
				<div class="line">{line || '\u00a0'}</div>
			{/each}

			{#if !isBooting}
				<div class="input-row">
					{#if loginPhase === 'done' && zorkActive}
						<span class="prompt">{'>'}</span>
						<span class="typed-text">{inputValue}</span>
					{:else if loginPhase === 'done'}
						<span class="prompt">{PROMPT}</span>
						<span class="typed-text">{inputValue}</span>
					{:else if loginPhase === 'password'}
						<span class="prompt">Password: </span>
						<span class="typed-text">{'*'.repeat(inputValue.length)}</span>
					{:else}
						<span class="prompt">Login: </span>
						<span class="typed-text">{inputValue}</span>
					{/if}
					<span class="cursor" aria-hidden="true"></span>
					<input
						bind:this={inputEl}
						bind:value={inputValue}
						onkeydown={onKeyDown}
						class="cmd-input"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck={false}
						aria-label="terminal input"
					/>
				</div>
			{/if}
		</div>
		</div>
		<div class="postit" aria-label="Post-it note with login credentials">
			<div class="postit-text">
				<span class="postit-title">LOGIN:</span>
				<span>user: sysadmin</span>
				<span>pass: tacos123</span>
			</div>
		</div>
		<div class="monitor-bottom">
			<div class="monitor-label">SparkStation One</div>
			<div class="monitor-controls" aria-hidden="true">
				<div class="knob"></div>
				<div class="knob"></div>
				<div class="power-led"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.crt-wrapper {
		position: fixed;
		inset: 0;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		cursor: text;
	}

	.monitor-body {
		position: relative;
		width: 100%;
		max-width: 960px;
		height: 100%;
		max-height: 760px;
		background: linear-gradient(180deg, #d4cfc0 0%, #c8c2b0 30%, #b8b2a0 100%);
		border-radius: 18px 18px 12px 12px;
		padding: 12px 28px 8px;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.15);
	}

	.monitor-top {
		display: flex;
		justify-content: center;
		padding-bottom: 8px;
	}

	.vent-slots {
		display: flex;
		gap: 6px;
	}

	.vent {
		width: 28px;
		height: 3px;
		background: linear-gradient(180deg, #9a9588 0%, #b0aa98 100%);
		border-radius: 1px;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.3);
	}

	.crt-screen {
		position: relative;
		width: 100%;
		flex: 1;
		background: #0a0a0a;
		border-radius: 20px / 18px;
		overflow: hidden;
		box-shadow:
			inset 0 0 60px rgba(0, 0, 0, 0.8),
			0 0 0 3px #2a2a2a,
			0 0 0 5px #1a1a1a,
			0 0 30px 4px rgba(0, 255, 70, 0.08);
	}

	.screen-glass {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at 30% 25%,
			rgba(255, 255, 255, 0.06) 0%,
			transparent 50%
		);
		border-radius: 20px / 18px;
		pointer-events: none;
		z-index: 12;
	}

	.crt-screen::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 55%,
			rgba(0, 0, 0, 0.5) 100%
		);
		border-radius: 20px / 18px;
		pointer-events: none;
		z-index: 10;
	}

	.crt-screen::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(0, 255, 70, 0.02);
		border-radius: 20px / 18px;
		pointer-events: none;
		z-index: 11;
		animation: flicker 0.15s infinite steps(1);
	}

	.monitor-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 8px 6px;
	}

	.monitor-label {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #7a7568;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.monitor-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.knob {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: linear-gradient(145deg, #8a8578, #6a6458);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.4),
			inset 0 1px 1px rgba(255, 255, 255, 0.15);
		border: 1px solid #5a5448;
	}

	.power-led {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #33ff57;
		box-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.postit {
		position: absolute;
		right: -40px;
		top: 15%;
		width: 120px;
		padding: 12px 10px 14px;
		background: linear-gradient(135deg, #ffef82 0%, #f8e45c 100%);
		box-shadow:
			2px 3px 8px rgba(0, 0, 0, 0.3),
			inset 0 -2px 3px rgba(0, 0, 0, 0.05);
		transform: rotate(4deg);
		z-index: 20;
		border-radius: 1px;
	}

	.postit::before {
		content: '';
		position: absolute;
		top: 0;
		left: 10%;
		right: 10%;
		height: 14px;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 0 0 2px 2px;
	}

	.postit-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-family: 'Comic Sans MS', 'Marker Felt', cursive;
		font-size: 12px;
		color: #333;
		line-height: 1.4;
	}

	.postit-title {
		font-weight: 700;
		font-size: 11px;
		text-transform: uppercase;
		color: #c00;
		text-decoration: underline;
	}

	@keyframes flicker {
		0%   { opacity: 1; }
		50%  { opacity: 0.97; }
		100% { opacity: 1; }
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0px,
			transparent 2px,
			rgba(0, 0, 0, 0.18) 2px,
			rgba(0, 0, 0, 0.18) 4px
		);
		pointer-events: none;
		z-index: 9;
		border-radius: 16px;
	}

	.terminal {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 20px 24px;
		overflow-y: auto;
		overflow-x: hidden;
		font-family: 'IBM Plex Mono', 'VT323', monospace;
		font-size: 14px;
		line-height: 1.55;
		color: #33ff57;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
		z-index: 1;
		scrollbar-width: none;
	}

	.terminal::-webkit-scrollbar {
		display: none;
	}

	.line {
		white-space: pre;
		display: block;
		min-height: 1.55em;
	}

	.input-row {
		display: flex;
		align-items: center;
		margin-top: 2px;
	}

	.prompt {
		white-space: pre;
		color: #33ff57;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.typed-text {
		white-space: pre;
		color: #33ff57;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.cmd-input {
		position: absolute;
		left: -9999px;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.cursor {
		display: inline-block;
		width: 9px;
		height: 1.1em;
		background: #33ff57;
		box-shadow: 0 0 6px rgba(51, 255, 87, 0.9);
		margin-left: 1px;
		animation: blink 1.1s step-end infinite;
		vertical-align: text-bottom;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0; }
	}
</style>
