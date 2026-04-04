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
			'DEVICE: Garage Raccoon Proximity Detector\nSTATUS: ALERT\nLAST SIGHTING: 03:47 AM\nACTION TAKEN: None. Raccoon showed no interest in servers.',
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
					'Aug 11 03:14:01 zeroone sshd[42]: Accepted password for guest from tty03\n' +
					'Aug 11 03:14:22 zeroone sshd[42]: session opened for user guest by (uid=0)\n' +
					'Aug 11 03:47:19 zeroone raccoon-sensor: ALERT: proximity event zone=SERVER_RACK\n' +
					'Aug 11 03:47:21 zeroone raccoon-sensor: INFO: entity departed, no damage detected\n' +
					'Aug 11 06:02:17 zeroone ops[89]: garage-door: state=OPEN (unscheduled)\n' +
					'Aug 11 06:02:44 zeroone kernel: /dev/garage0: moisture detected, I/O continuing\n' +
					'Aug 11 07:45:02 zeroone billing[cron]: discrepancy detected: delta=-0.75 ref=INV-1986-0811-004\n' +
					'Aug 11 08:23:14 zeroone sshd[42]: Accepted password for sysadmin from console',
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
				'Aug  9 11:47 sysadmin    3x taco, 1x baja blast          FULFILLED\n' +
					'Aug  9 11:51 cosworth    1x burrito (no beans) [argued]  FULFILLED\n' +
					'Aug  9 11:55 mr.pink     "surprise me"                    PARTIALLY_FULFILLED\n' +
					'Aug 10 12:03 sysadmin    2x taco, 1x cinnamon twist      FULFILLED\n' +
					'Aug 10 12:04 dirk        [out of office]                  NOT_PLACED\n' +
					'Aug 11 11:30 sysadmin    PENDING — awaiting API docs from Dirk',
			),
			'neighbor-complaints': file(
				'Aug  1 idpromnut called. Upset about bandwidth.\n' +
					'Aug  2 idpromnut changed SSID to "iKnowItsYouZeroOne".\n' +
					'Aug  3 idpromnut knocked. We pretended not to be home.\n' +
					'Aug  4 SSID changed to "NoReallyStopIt".\n' +
					'Aug  5 idpromnut left note on door: "I will call the police."\n' +
					'Aug  6 SSID: "FineIllCallThePolice". No police came.\n' +
					'Aug  7 SSID: "JustKidding". Unclear if sincere.\n' +
					'Aug  8 SSID: "SeriouslyThough".\n' +
					'Aug  9 idpromnut installed a lock on his extension cord.\n' +
					'Aug 10 We found another extension cord. Crisis averted.\n' +
					'Aug 11 SSID: "GetOffMyLawn_v14". We updated the config.',
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
				'# .bashrc\nexport PS1="sysadmin@zeroone:\\w> "\nexport PATH="$PATH:/usr/local/bin"\nalias tacos="taco-order --party-pack"\nalias ll="ls -la"',
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
	}),
	tmp: dir({
		'.hidden_snack_stash': file(
			'3x Taco Bell hot sauce packets\n1x stale cinnamon twist\n2x vendor conference pens (structural load-bearing)\n1x mystery cable (do not remove)',
		),
		'scratch.txt': file(
			'TODO:\n- Fix the thing\n- Unforgotten the password\n- Ask Dirk about the API (oh wait)',
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
