import { WHO_POOL } from './game-data.js';

export type FSFile = { type: 'file'; content: string };
export type FSDir = { type: 'dir'; children: Record<string, FSNode> };
export type FSNode = FSFile | FSDir;

function file(content: string): FSFile {
	return { type: 'file', content };
}

function dir(children: Record<string, FSNode>): FSDir {
	return { type: 'dir', children };
}

// GECOS fields for passwd file — one per WHO_POOL user
const GECOS: Record<string, string> = {
	wendell: 'Wendell Wilson,Rack 1,555-0101,Probably fine',
	salem: 'Salem,Card Table,555-0102,Knows too much',
	craft: 'Craft,Extension Cord,555-0103,Freelance',
	coffee: 'Coffee Machine Account,Break Room,555-0104,Sentient',
	hacker: 'Unknown,Unknown,555-0105,Do not ask',
	cosworth: 'Cosworth,Garage Door,555-0106,Controls the door opener',
	'mr.pink': 'Mr. Pink,Disco Ball,555-0107,Do not activate during business hours',
	idpromnut: 'idpromnut (neighbor),Next Door,555-0108,Currently angry about wifi',
	dirk: 'Dirk,On Vacation,555-0109,Has the API docs',
	lickity: 'Lickity Split,Undisclosed,555-0110,',
	geerling: 'Jeff Geerling,Remote,555-0111,Pi guy',
	technotim: 'TechnoTim,Remote,555-0112,Homelab famous',
	networkchuck: 'NetworkChuck,Remote,555-0113,Coffee and tacos',
	wolfgangs: 'Wolfgangs,Garage Corner,555-0114,Quiet',
	lawrence: 'Lawrence Systems,Remote,555-0115,Firewall guy',
	spacerex: 'SpaceRex,Remote,555-0116,Storage',
	dbtech: 'DBTech,Remote,555-0117,Databases',
	raidowl: 'RaidOwl,Remote,555-0118,Security',
	lempa: 'Lempa,Unknown,555-0119,',
	ychto: 'Ychto,Yolo Colo,555-0120,Not here right now',
	thefathacker: 'TheFatHacker,Australia,+61-555-0121,Ships A&W Root Beer by the pallet',
};

function buildPasswd(): string {
	const fixed = [
		'root:x:0:0:root:/root:/bin/bash',
		'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
		'nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin',
		'sysadmin:x:1000:1000:Sysadmin,Garage,555-0100,Investigations:/home/sysadmin:/bin/bash',
	];
	const pool = WHO_POOL.map((user, i) => {
		const uid = 1001 + i;
		const gecos = GECOS[user] ?? user;
		const home = user === 'idpromnut' ? '/tmp/neighbor' : `/home/${user}`;
		const shell = user === 'coffee' ? '/dev/null' : '/bin/bash';
		return `${user}:x:${uid}:${uid}:${gecos}:${home}:${shell}`;
	});
	return [...fixed, ...pool].join('\n');
}

const FILESYSTEM: FSDir = dir({
	bin: dir({
		ls: file(''),
		cat: file(''),
		cd: file(''),
		pwd: file(''),
		who: file(''),
		ps: file(''),
		mail: file(''),
		finger: file(''),
		last: file(''),
		lastcomm: file(''),
		sa: file(''),
		'taco-order': file(''),
	}),
	usr: dir({
		bin: dir({
			vi: file(''),
			emacs: file(''),
			gcc: file(''),
			make: file(''),
			telnet: file(''),
			ftp: file(''),
			finger: file(''),
			nslookup: file(''),
			traceroute: file(''),
			zork: file(''),
		}),
		local: dir({
			bin: dir({
				'kona-monitor': file(''),
				'garage-door': file(''),
				'disco-ball': file(''),
				'wifi-scanner': file(''),
				'taco-order': file(''),
			}),
		}),
		share: dir({
			man: dir({
				man1: dir({
					'taco-order.1': file(
						'TACO-ORDER(1) - Taco Automated Curro Ordering\n\nNAME\n    taco-order - place orders with the Kelso Taco Bell\n\nSYNOPSIS\n    taco-order [--extra-cheese] [--baja-blast] [--party-pack]\n\nDESCRIPTION\n    Interfaces with Jorge at the Kelso Taco Bell via UUCP.\n    Dirk has the API docs. Dirk is on vacation.\n\nBUGS\n    Yes.\n\nSEE ALSO\n    hunger(1), regret(1)',
					),
				}),
			}),
		}),
	}),
	dev: dir({
		null: file(''),
		zero: file(''),
		urandom: file(''),
		garage0: file(
			"DEVICE: Primary storage array (card table)\nSTATUS: Slightly damp\nLAST FSCK: Never. Don't ask.",
		),
		kona: file(
			"DEVICE: Hyundai Kona EV Battery Backup\nCHARGE: 23%\nSTATUS: Plugged into neighbor's extension cord\nWARNING: Neighbor has been giving us looks",
		),
		'disco-ball': file(
			"DEVICE: mr.pink's Disco Ball Controller\nMODE: Standby\nLAST ACTIVATED: Friday 11:47 PM\nNOTE: Do not activate during business hours. Cosworth will complain.",
		),
		'raccoon-sensor': file(
			'DEVICE: Garage Raccoon Proximity Detector v2.1\n' +
				'STATUS: MONITORING\n' +
				'CURRENT READING: No target detected\n' +
				'\n' +
				'RECENT ACTIVITY LOG:\n' +
				'  Aug 11 02:44 — ALERT: Target at 2m, heading RACK 2\n' +
				'  Aug 11 02:44 — ALERT: Target at 1m, stationary near power strip\n' +
				'  Aug 11 02:51 — Target departed via garage door\n' +
				'  Aug 10 03:17 — ALERT: Target at 3m, heading recycling bin\n' +
				'  Aug 10 03:22 — Target consumed leftover cinnamon twist. Departed.\n' +
				'  Aug 09 01:44 — ALERT: Two targets detected. Treaty Section 4 violation.\n' +
				'  Aug 09 01:45 — Second target identified as large cat. False alarm.\n' +
				'\n' +
				'LIFETIME STATS:\n' +
				'  Total detections: 247\n' +
				'  Taco Bell items consumed: 31\n' +
				'  Cable damage incidents: 0 (treaty holding)\n' +
				'  Times Gerald has stared directly at camera: 89',
		),
		tty01: file(''),
		tty02: file(''),
		tty03: file(''),
		tty04: file(''),
		console: file(''),
	}),
	etc: dir({
		passwd: file(buildPasswd()),
		hosts: file(
			'127.0.0.1       localhost\n' +
				'192.168.1.1     gateway router neighbor-router\n' +
				'192.168.1.10    zeroone.local sparkstation\n' +
				'192.168.1.11    kona-dashboard kona\n' +
				'192.168.1.12    garage-door-iot\n' +
				'192.168.1.20    neighbor-wifi-1\n' +
				'192.168.1.21    neighbor-wifi-2\n' +
				'192.168.1.22    neighbor-wifi-3\n' +
				'192.168.1.23    neighbor-wifi-4\n' +
				'192.168.1.24    neighbor-wifi-5\n' +
				'192.168.1.25    neighbor-wifi-6\n' +
				'192.168.1.26    neighbor-wifi-7\n' +
				'10.0.0.1        tacobell-hq tacobell.com\n' +
				'10.0.0.2        jorge-terminal\n' +
				'# mainframe: ask Dirk',
		),
		motd: file(
			'Zero One Recovery Kernel — ZORK v2.1\n"Lowering expectations since our court date"\nKelso, WA - Garage Datacenter',
		),
		'resolv.conf': file(
			"# DNS - using neighbor's router\nnameserver 192.168.1.1\n# backup: written on sticky note somewhere",
		),
		'neighbor-passwords.conf': file(
			'# DO NOT COMMIT THIS FILE\n# Updated whenever idpromnut changes his SSID\nwifi_ssid=GetOffMyLawn_v14\nwifi_pass=st0pSt34l1ng\n# Previous passwords:\n# iKnowItsYouZeroOne\n# NoReallyStopIt\n# FineIllCallThePolice\n# JustKidding\n# SeriouslyThough',
		),
	}),
	var: dir({
		log: dir({
			syslog: file(
				'Aug 11 00:01:02 zeroone kernel: eth0: link up 100Mbps full duplex\n' +
					'Aug 11 00:01:03 zeroone sshd[42]: Server listening on 0.0.0.0 port 22\n' +
					'Aug 11 00:01:07 zeroone cron[58]: (CRON) started\n' +
					'Aug 10 22:14:33 zeroone kona-monitor[91]: battery at 31% — charging via neighbor outlet\n' +
					'Aug 10 23:47:59 zeroone kona-monitor[91]: battery at 23% — WARNING: below threshold\n' +
					'Aug 11 01:33:07 zeroone kernel: wlan0: neighbor SSID changed: "GetOffMyLawn_v13" -> "GetOffMyLawn_v14"\n' +
					'Aug 11 01:33:09 zeroone wifi-scanner[188]: reconnecting to GetOffMyLawn_v14... OK\n' +
					'Aug 11 02:44:16 zeroone raccoon-sensor[77]: PROXIMITY ALERT — distance: 2m, heading: RACK 2\n' +
					'Aug 11 02:44:19 zeroone raccoon-sensor[77]: PROXIMITY ALERT — distance: 1m, heading: RACK 2\n' +
					'Aug 11 02:44:22 zeroone raccoon-sensor[77]: target stationary near power strip. no intervention taken.\n' +
					'Aug 11 02:51:08 zeroone raccoon-sensor[77]: target departed via garage door. all clear.\n' +
					'Aug 11 03:14:01 zeroone sshd[42]: Accepted password for guest from tty03\n' +
					'Aug 11 03:14:22 zeroone sshd[42]: session opened for user guest by (uid=0)\n' +
					'Aug 11 03:47:19 zeroone raccoon-sensor: ALERT: proximity event zone=SERVER_RACK\n' +
					'Aug 11 03:47:21 zeroone raccoon-sensor: INFO: entity departed, no damage detected\n' +
					'Aug 11 04:17:33 zeroone disco-ball[666]: UNAUTHORIZED ACTIVATION — user: mr.pink, mode: strobe\n' +
					'Aug 11 04:17:34 zeroone disco-ball[666]: override by cosworth: DENIED (garage door opener privilege required)\n' +
					'Aug 11 04:17:35 zeroone disco-ball[666]: mr.pink insists. activation continues.\n' +
					'Aug 11 04:22:01 zeroone disco-ball[666]: deactivated by timeout (5 min safety limit)\n' +
					'Aug 11 05:00:01 zeroone cron[58]: nova-compute health check: 3 instances, 2 responding, 1 "thinking about it"\n' +
					'Aug 11 05:00:02 zeroone cron[58]: neutron-dhcp-agent: restarted (again)\n' +
					'Aug 11 05:00:03 zeroone cron[58]: glance-api: OK (response time: 4.2s — "acceptable" by ZeroOne standards)\n' +
					'Aug 11 06:01:55 zeroone kernel: /dev/garage0: temperature 38C (ambient: 12C, delta explained by "server proximity")\n' +
					'Aug 11 06:02:17 zeroone ops[89]: garage-door: state=OPEN (unscheduled)\n' +
					'Aug 11 06:02:44 zeroone kernel: /dev/garage0: moisture detected, I/O continuing\n' +
					'Aug 11 07:45:02 zeroone billing[cron]: discrepancy detected: delta=-0.75 ref=INV-1986-0811-004\n' +
					'Aug 11 08:00:44 zeroone taco-order[420]: GROUP ORDER initiated by tacobell-order@zeroone.local\n' +
					'Aug 11 08:23:14 zeroone sshd[42]: Accepted password for sysadmin from console\n' +
					'Aug 11 08:23:15 zeroone motd: displayed to sysadmin — remember to check billing',
			),
			'auth.log': file(
				'Aug 11 00:00:58 zeroone login[211]: ROOT LOGIN on console\n' +
					'Aug 10 23:47:11 zeroone sshd[42]: Accepted password for sysadmin from tty01\n' +
					'Aug 11 03:14:01 zeroone sshd[42]: Accepted password for guest from tty03\n' +
					'Aug 11 03:14:02 zeroone su[499]: + tty03 guest:root\n' +
					'Aug 11 03:15:44 zeroone sshd[42]: session closed for user guest\n' +
					'Aug 11 06:58:00 zeroone login[314]: FAILED LOGIN (1) on tty02 FOR idpromnut\n' +
					'Aug 11 06:58:03 zeroone login[314]: FAILED LOGIN (2) on tty02 FOR idpromnut\n' +
					'Aug 11 06:58:07 zeroone login[314]: FAILED LOGIN (3) on tty02 FOR idpromnut\n' +
					'Aug 11 08:23:14 zeroone sshd[42]: Accepted password for sysadmin from console',
			),
			'taco-orders': file(
				'[1986-08-04 12:15] ORDER #0041 — dave: 3x taco, 1x burrito — STATUS: delivered (jorge confirms)\n' +
					'[1986-08-04 12:15] ORDER #0041 — sandra: 2x taco (NO sour cream) — STATUS: delivered (sour cream detected, sandra upset)\n' +
					'[1986-08-04 12:15] ORDER #0041 — mike: same as dave — STATUS: delivered\n' +
					'[1986-08-04 12:16] ORDER #0041 — randy: "whatever\'s cheapest" — STATUS: 1x cinnamon twist. randy complained.\n' +
					'[1986-08-05 12:22] ORDER #0042 — dave: 4x taco — STATUS: delivered\n' +
					'[1986-08-05 12:22] ORDER #0042 — sandra: 2x taco (NO SOUR CREAM THIS TIME I MEAN IT) — STATUS: delivered (clean this time)\n' +
					"[1986-08-05 12:22] ORDER #0042 — cosworth: 1x burrito — STATUS: delivered (who ordered for cosworth? cosworth wasn't here.)\n" +
					'[1986-08-06 12:08] ORDER #0043 — CANCELLED — jorge called in sick. backup plan: gas station burritos. morale critical.\n' +
					'[1986-08-07 12:30] ORDER #0044 — all: party pack — STATUS: delivered. mr.pink expensed it. randy furious.\n' +
					'[1986-08-08 12:19] ORDER #0045 — dave: 2x taco, 1x nachos — STATUS: delivered\n' +
					'[1986-08-08 12:19] ORDER #0045 — sysadmin: 1x burrito, 1x baja blast — STATUS: baja blast not invented yet. substituted mountain dew.\n' +
					'[1986-08-09 12:44] ORDER #0045b — thefathacker: REMOTE ORDER (Australia) — 3x taco, 1x nachos, 1x A&W root beer — STATUS: jorge confused by international UUCP relay. tacos undeliverable. root beer pallet in transit from US distributor. customs says 6-8 weeks.\n' +
					'[1986-08-11 08:00] ORDER #0046 — PENDING — orders due by 11:30. see mail.',
			),
			'neighbor-complaints': file(
				'[1986-06-12] SSID changed: "linksys" -> "StopStealingMyWifi"\n' +
					'[1986-06-15] Note found on garage door: "I know it\'s you. - Your Neighbor"\n' +
					'[1986-06-15] Randy response: moved antenna behind the Kona. problem solved (temporarily).\n' +
					'[1986-06-28] SSID changed: "StopStealingMyWifi" -> "ICalledComcast"\n' +
					'[1986-07-01] Comcast truck spotted. False alarm — was for neighbor on other side.\n' +
					'[1986-07-09] SSID changed: "ICalledComcast" -> "SeriouslyGuysStop"\n' +
					'[1986-07-14] idpromnut knocked on garage door. dave pretended nobody was home. servers were visibly running.\n' +
					'[1986-07-14] idpromnut left a plate of cookies with note: "Please stop. These are not a bribe. OK they are a bribe."\n' +
					'[1986-07-15] cookies consumed. wifi theft continued. cookies were good.\n' +
					'[1986-07-22] SSID changed: "SeriouslyGuysStop" -> "GetOffMyLawn_v1"\n' +
					'[1986-07-30] SSID changed: "GetOffMyLawn_v1" -> "GetOffMyLawn_v7" (versions 2-6 lasted less than a day each)\n' +
					'[1986-08-03] idpromnut changed WPA password. wifi-scanner cracked it in 4 minutes.\n' +
					'[1986-08-03] new password was "zeroone_sucks_2986". noted for reference.\n' +
					'[1986-08-08] SSID changed: "GetOffMyLawn_v7" -> "GetOffMyLawn_v14" (rapid iteration phase)\n' +
					'[1986-08-10] idpromnut seen purchasing a directional antenna. situation escalating.\n' +
					'[1986-08-11] current status: 3 of 7 neighbors still accessible. idpromnut is the holdout.',
			),
		}),
		spool: dir({
			mail: dir({
				sysadmin: file('You have 4 messages'),
			}),
		}),
		run: dir({
			'garage-door.pid': file('42'),
		}),
	}),
	home: dir({
		sysadmin: dir({
			'.bashrc': file(
				'# .bashrc\n' +
					'export PS1="sysadmin@zeroone:\\w> "\n' +
					'export PATH="$PATH:/usr/local/bin"\n' +
					'alias tacos="taco-order --party-pack"\n' +
					'alias ll="ls -la"\n' +
					'alias please="sudo"\n' +
					'alias yolo="echo \'Welcome to Yolo Colo... just kidding, this is ZeroOne.\'"\n' +
					'alias kona="cat /dev/kona"\n' +
					'alias raccoon="cat /dev/raccoon-sensor"',
			),
			'.plan': file(
				'Currently investigating a $0.75 billing discrepancy.\nRandy says its nothing. Checking anyway.',
			),
			'notes.txt': file(
				'Billing investigation notes\n\nHelen flagged a 75 cents gap in the October compute invoices.\nThe discrepancy traces to the cosworth account: 9 seconds of CPU on Oct 6.\nLogin from gateway-pdx.uucp at 02:17. Not a local terminal.\n\nRandy says he left the session open. Timestamps do not match.',
			),
		}),
		dirk: dir({
			'out_of_office.txt': file(
				"Hi! I'm currently out of the office.\n\nI will return on: [DATE NOT SET]\n\nFor API documentation, please contact: Dirk\nFor urgent matters, please contact: Dirk\n\nThank you for your patience.\n\n- Dirk\n\nP.S. The API docs are on my desk. The desk is locked. The key is with me.",
			),
		}),
		'mr.pink': dir({
			'.disco-schedule': file(
				"# mr.pink's disco ball crontab\n" +
					'# "the light must flow" - mr.pink\n' +
					'0 22 * * 5    disco-ball --mode party --duration 2h    # Friday night\n' +
					'0 23 * * 6    disco-ball --mode strobe --duration 1h   # Saturday late\n' +
					'30 4 * * *    disco-ball --mode ambient --duration 30m  # daily vibe check\n' +
					'# NOTE: cosworth has complained 14 times. cosworth can deal with it.\n' +
					'# NOTE: randy says "as long as it doesn\'t affect uptime". it doesn\'t. probably.',
			),
			'.plan': file('the light must flow'),
		}),
		randy: dir({
			'.bash_history': file(
				'google "how to run openstack"\n' +
					'google "openstack minimum requirements"\n' +
					'google "openstack on raspberry pi"\n' +
					'google "is 3 nines good enough"\n' +
					'google "what is a nine in uptime"\n' +
					'google "how to calculate uptime percentage"\n' +
					'uptime\n' +
					'google "is 47 days uptime good"\n' +
					'google "tier 4 datacenter requirements"\n' +
					'google "can a garage be a datacenter"\n' +
					'google "datacenter in garage legal washington state"\n' +
					'google "cheapest rack mount server ebay"\n' +
					'google "hyundai kona as ups"\n' +
					'google "how many servers can a kona power"\n' +
					'google "taco bell franchise cost"\n' +
					'google "taco bell franchise cost kelso wa"\n' +
					'google "how to expense tacos as business meal"',
			),
			'.plan': file("Expand to second garage. Maybe the neighbor's."),
		}),
		cosworth: dir({
			'.rhosts': file('+ +'),
			'.cshrc': file('# default .cshrc\nset prompt = "% "\nset history = 100'),
		}),
	}),
	tmp: dir({
		'.hidden_snack_stash': file(
			'3x Taco Bell hot sauce packets\n1x stale cinnamon twist\n2x vendor conference pens (structural load-bearing)\n1x mystery cable (do not remove)',
		),
		'scratch.txt': file(
			'TODO:\n- Fix the thing\n- Unforgotten the password\n- Ask Dirk about the API (oh wait)',
		),
		'randy-business-plan.txt': file(
			'ZEROONE HOSTING — BUSINESS PLAN v7.2 (CONFIDENTIAL)\n' +
				'====================================================\n' +
				'\n' +
				'MISSION: To provide hosting services that technically work.\n' +
				'\n' +
				'COMPETITIVE ADVANTAGES:\n' +
				'1. Lower prices than anyone (because lower costs) (because garage)\n' +
				'2. Personal service (because 4 employees)\n' +
				'3. Location near Mt. St. Helens (disaster recovery: already in disaster zone)\n' +
				'4. Taco Bell within delivery range\n' +
				'\n' +
				'GROWTH STRATEGY:\n' +
				'- Phase 1: Get 3 more clients (current: 2) (one is us)\n' +
				'- Phase 2: Upgrade from card table to actual rack\n' +
				'- Phase 3: ???\n' +
				'- Phase 4: IPO\n' +
				'\n' +
				'RISKS:\n' +
				'- Neighbor discovers wifi situation\n' +
				'- Kona battery dies during client demo\n' +
				'- Raccoon damages equipment\n' +
				'- Cosworth account still showing activity (NOTE: ask sysadmin about this)\n' +
				"- mr.pink's disco ball causes power fluctuation during peak hours\n" +
				'\n' +
				'FINANCIAL PROJECTIONS:\n' +
				'- Revenue: $142.25/month (NOTE: $141.50 this month?? check with helen)\n' +
				"- Expenses: Taco Bell ($89/month), electricity (neighbor's), rent (own garage)\n" +
				"- Profit: technically positive if you don't count labor\n" +
				'\n' +
				'APPENDIX A: Taco Bell Expense Justification\n' +
				'(see attached — 47 pages)',
		),
		'.raccoon-treaty.txt': file(
			'MUTUAL NON-AGGRESSION PACT\n' +
				'Between: ZeroOne Hosting ("The Party of the First Part")\n' +
				'And: The Garage Raccoon ("The Party of the Second Part", "Gerald")\n' +
				'\n' +
				'TERMS:\n' +
				'1. Gerald shall not chew on network cables.\n' +
				'2. Gerald may shelter in the garage during rain, provided he stays\n' +
				'   away from Rack 2 (the TV tray).\n' +
				'3. ZeroOne shall leave the small gap under the garage door open\n' +
				"   between 2 AM and 5 AM for Gerald's convenience.\n" +
				'4. Gerald shall not bring friends. One raccoon is character.\n' +
				'   Two is an infestation.\n' +
				'5. Leftover Taco Bell may be placed near the recycling bin as\n' +
				'   a gesture of goodwill. This is not rent.\n' +
				'6. Gerald acknowledges that the blinking lights are not food.\n' +
				'7. In the event of dispute, Cosworth shall arbitrate.\n' +
				'\n' +
				'SIGNATURES:\n' +
				'Dave (on behalf of ZeroOne): [signed]\n' +
				'Gerald: [paw print] [taco sauce stain]\n' +
				'\n' +
				'AMENDMENT 1 (1986-07-22):\n' +
				'Gerald has been bringing friends. Section 4 violated.\n' +
				'Treaty under review.\n' +
				'\n' +
				'AMENDMENT 2 (1986-08-03):\n' +
				'Gerald observed grooming near Rack 1. While technically not a\n' +
				'violation, it was uncomfortable for everyone. Added: Gerald shall\n' +
				'maintain professional demeanor in the server area.',
		),
	}),
	opt: dir({
		openstack: dir({
			README: file(
				"OpenStack deployment notes:\n\nQ: Why are we running OpenStack in a garage?\nA: Because Randy saw a YouTube video.\n\nQ: Is it production ready?\nA: Define 'production'. Define 'ready'.\n\nQ: Who maintains it?\nA: Ychto, when he's not at Yolo Colo.",
			),
		}),
	}),
});

function deepClone(node: FSNode): FSNode {
	if (node.type === 'file') {
		return { type: 'file', content: node.content };
	}
	const children: Record<string, FSNode> = {};
	for (const [name, child] of Object.entries(node.children)) {
		children[name] = deepClone(child);
	}
	return { type: 'dir', children };
}

export class VirtualFS {
	private root: FSDir;
	private cwd = '/';

	constructor() {
		this.root = deepClone(FILESYSTEM) as FSDir;
	}

	resolve(path: string): string {
		if (!path || path === '') return this.cwd;

		const base = path.startsWith('/') ? '/' : this.cwd;
		const segments = (base === '/' ? [] : base.split('/').filter(Boolean)).concat(
			path.split('/').filter(Boolean),
		);

		const resolved: string[] = [];
		for (const seg of segments) {
			if (seg === '.') continue;
			if (seg === '..') {
				resolved.pop();
			} else {
				resolved.push(seg);
			}
		}

		return `/${resolved.join('/')}`;
	}

	getNode(path: string): FSNode | null {
		const resolved = this.resolve(path);
		if (resolved === '/') return this.root;

		const parts = resolved.split('/').filter(Boolean);
		let node: FSNode = this.root;
		for (const part of parts) {
			if (node.type !== 'dir') return null;
			const child = node.children[part];
			if (!child) return null;
			node = child;
		}
		return node;
	}

	exists(path: string): boolean {
		return this.getNode(path) !== null;
	}

	isDir(path: string): boolean {
		return this.getNode(path)?.type === 'dir';
	}

	pwd(): string {
		return this.cwd;
	}

	cd(path: string): boolean {
		const resolved = this.resolve(path);
		const node = this.getNode(resolved);
		if (!node || node.type !== 'dir') return false;
		this.cwd = resolved;
		return true;
	}

	ls(path?: string, showHidden = false): string[] {
		const target = path ? this.resolve(path) : this.cwd;
		const node = this.getNode(target);
		if (!node || node.type !== 'dir') return [];
		return Object.keys(node.children)
			.filter((name) => showHidden || !name.startsWith('.'))
			.sort()
			.map((name) => (node.children[name].type === 'dir' ? `${name}/` : name));
	}

	cat(path: string): string | null {
		const node = this.getNode(path);
		if (!node || node.type !== 'file') return null;
		return node.content;
	}

	addNode(path: string, node: FSNode): boolean {
		const resolved = this.resolve(path);
		const parts = resolved.split('/').filter(Boolean);
		if (parts.length === 0) return false;
		const name = parts[parts.length - 1];
		const parentPath = `/${parts.slice(0, -1).join('/')}`;
		const parent = this.getNode(parentPath);
		if (!parent || parent.type !== 'dir') return false;
		parent.children[name] = node;
		return true;
	}

	removeNode(path: string): boolean {
		const resolved = this.resolve(path);
		const parts = resolved.split('/').filter(Boolean);
		if (parts.length === 0) return false;
		const name = parts[parts.length - 1];
		const parentPath = `/${parts.slice(0, -1).join('/')}`;
		const parent = this.getNode(parentPath);
		if (!parent || parent.type !== 'dir') return false;
		if (!(name in parent.children)) return false;
		delete parent.children[name];
		return true;
	}

	updateFile(path: string, content: string): boolean {
		const node = this.getNode(path);
		if (!node || node.type !== 'file') return false;
		node.content = content;
		return true;
	}
}
