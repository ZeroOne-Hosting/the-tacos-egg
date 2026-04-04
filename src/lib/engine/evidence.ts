import type { GameState } from './GameState.js';

export interface EvidenceItem {
	id: string;
	title: string;
	description: string;
	category: 'log' | 'account' | 'network' | 'session' | 'npc' | 'physical';
	chapter: number;
	/** One or more flags; if any is set the evidence is auto-collected */
	collectWhen?: string[];
}

export interface EvidenceConnection {
	requires: string[];
	unlocks: string;
	setFlag?: string;
}

export const EVIDENCE_CATALOG: EvidenceItem[] = [
	// Chapter 1
	{
		id: 'billing_discrepancy',
		title: "Helen's billing discrepancy report",
		description: 'A $0.75 gap between accounting totals and billable client usage.',
		category: 'log',
		chapter: 1,
		collectWhen: ['read_billing_email'],
	},
	{
		id: 'sa_cosworth',
		title: 'Cosworth account: 0.1re CPU usage',
		description:
			'sa output shows cosworth with 0.1 real-time -- the only account with unexplained usage.',
		category: 'account',
		chapter: 1,
		collectWhen: ['ran_sa'],
	},
	{
		id: 'oct6_login',
		title: 'Cosworth login: Oct 6 02:17, 9 seconds, from gateway-pdx',
		description:
			'lastcomm shows three commands run by cosworth in nine seconds on Oct 6 at 2:17 AM.',
		category: 'log',
		chapter: 1,
		collectWhen: ['ran_lastcomm_cosworth'],
	},
	{
		id: 'cosworth_identity',
		title: 'Cosworth: deprovisioned client account, should be inactive',
		description:
			'Passwd entry shows cosworth was created as a test account and never removed. No active user.',
		category: 'account',
		chapter: 1,
		collectWhen: ['fingered_cosworth', 'grepped_passwd_cosworth'],
	},
	{
		id: 'gateway_pdx',
		title: 'Connection origin: gateway-pdx.uucp (external)',
		description:
			'The cosworth session originated from a UUCP relay in Portland, not a local terminal.',
		category: 'network',
		chapter: 1,
		collectWhen: ['found_gateway_pdx'],
	},

	// Chapter 2
	{
		id: 'sep3_session',
		title: 'September 3 session: 38 minutes of activity',
		description:
			'last -60 reveals a 38-minute cosworth session on Sep 3 at 2:44 AM via tymnet-pdx.x25.',
		category: 'session',
		chapter: 2,
		collectWhen: ['found_sep3_session'],
	},
	{
		id: 'suid_exploit',
		title: 'SUID root escalation via movemail',
		description:
			'Syslog shows a SUID shell created by cron, used for 16 seconds, then deleted on Sep 3.',
		category: 'log',
		chapter: 2,
		collectWhen: ['found_suid_exploit'],
	},
	{
		id: 'rlogin_defense',
		title: 'rlogin to pacnw-defense-consulting',
		description:
			"During the Sep 3 session, the intruder rlogin'd to a hosted defense contractor directory.",
		category: 'network',
		chapter: 2,
		collectWhen: ['found_rlogin_defense'],
	},
	{
		id: 'time_pattern',
		title: 'All sessions between 2-3 AM Pacific (morning in Europe)',
		description:
			'Sep 3 and Oct 6 sessions both at ~2 AM Pacific -- 10-11 AM Central European time.',
		category: 'log',
		chapter: 2,
		collectWhen: ['found_time_pattern'],
	},
	{
		id: 'defense_files_accessed',
		title: 'Intruder searched for SDI, nuclear, MILNET keywords',
		description:
			'Access log shows cat and grep run against pacnw-defense-consulting files during Sep 3 session.',
		category: 'session',
		chapter: 2,
		collectWhen: ['accessed_defense_files'],
	},
];

export const EVIDENCE_CONNECTIONS: EvidenceConnection[] = [
	// Chapter 1
	{
		requires: ['billing_discrepancy', 'sa_cosworth'],
		unlocks: 'The $0.75 maps to exactly 9 seconds of cosworth CPU time',
	},
	{
		requires: ['oct6_login', 'gateway_pdx'],
		unlocks: 'The caller used an external gateway -- this is not a local login',
	},
	{
		requires: ['cosworth_identity', 'oct6_login'],
		unlocks: "A deprovisioned account logged in at 2 AM from outside. This wasn't billing noise.",
	},

	// Chapter 2
	{
		requires: ['sep3_session', 'oct6_login'],
		setFlag: 'found_time_pattern',
		unlocks: "The intruder always connects between 2-3 AM. That's 10-11 AM in Central Europe.",
	},
];

/**
 * Checks EVIDENCE_CATALOG entries whose collectWhen flags are satisfied and
 * collects them into state. Returns the IDs of newly collected evidence.
 */
export function checkNewEvidence(state: GameState): string[] {
	const collected: string[] = [];
	for (const item of EVIDENCE_CATALOG) {
		if (state.hasEvidence(item.id)) continue;
		if (!item.collectWhen) continue;
		const triggered = item.collectWhen.some((flag) => state.hasFlag(flag));
		if (triggered) {
			state.collectEvidence(item.id);
			collected.push(item.id);
		}
	}
	return collected;
}

/**
 * Renders an ASCII evidence board showing all collected evidence grouped by
 * category. Returns lines suitable for terminal output.
 */
export function renderCasefile(state: GameState): string[] {
	const evidence = state.getEvidence();
	if (evidence.length === 0) {
		return ['[CASEFILE] No evidence collected.'];
	}

	const collected = EVIDENCE_CATALOG.filter((e) => evidence.includes(e.id));
	const byCategory = new Map<string, EvidenceItem[]>();
	for (const item of collected) {
		const list = byCategory.get(item.category) ?? [];
		list.push(item);
		byCategory.set(item.category, list);
	}

	const lines: string[] = ['=== CASE FILE ==='];

	for (const [category, items] of byCategory) {
		lines.push(`  [${category.toUpperCase()}]`);
		for (const item of items) {
			lines.push(`    * ${item.title}`);
			lines.push(`      ${item.description}`);
		}
	}

	return lines;
}

/**
 * Renders a chronological list of collected evidence ordered by chapter then
 * catalog order. Returns lines suitable for terminal output.
 */
export function renderTimeline(state: GameState): string[] {
	const evidence = state.getEvidence();
	if (evidence.length === 0) {
		return ['[TIMELINE] No evidence collected.'];
	}

	const collected = EVIDENCE_CATALOG.filter((e) => evidence.includes(e.id)).sort(
		(a, b) => a.chapter - b.chapter || EVIDENCE_CATALOG.indexOf(a) - EVIDENCE_CATALOG.indexOf(b),
	);

	const lines: string[] = ['=== TIMELINE ==='];

	let lastChapter = 0;
	for (const item of collected) {
		if (item.chapter !== lastChapter) {
			lines.push(`  -- Chapter ${item.chapter} --`);
			lastChapter = item.chapter;
		}
		lines.push(`    [${item.category}] ${item.title}`);
	}

	return lines;
}

/**
 * Renders evidence connections: shows which have been unlocked (all required
 * evidence present) and which are still incomplete.
 */
export function renderConnections(state: GameState): string[] {
	const lines: string[] = ['=== CONNECTIONS ==='];

	for (const conn of EVIDENCE_CONNECTIONS) {
		const allPresent = conn.requires.every((id) => state.hasEvidence(id));
		const status = allPresent ? 'Y' : '?';
		const requireTitles = conn.requires.map((id) => {
			const item = EVIDENCE_CATALOG.find((e) => e.id === id);
			return item ? item.title : id;
		});
		lines.push(`  [${status}] ${conn.unlocks}`);
		lines.push(`      Requires: ${requireTitles.join(' + ')}`);
	}

	return lines;
}
