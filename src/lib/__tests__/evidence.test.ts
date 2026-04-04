import { describe, expect, it } from 'vitest';
import {
	checkNewEvidence,
	EVIDENCE_CATALOG,
	EVIDENCE_CONNECTIONS,
	renderCasefile,
	renderConnections,
	renderTimeline,
} from '$lib/engine/evidence.js';
import { GameState } from '$lib/engine/GameState.js';

describe('EVIDENCE_CATALOG', () => {
	it('contains all required chapter 1 items', () => {
		const ids = EVIDENCE_CATALOG.map((e) => e.id);
		expect(ids).toContain('billing_discrepancy');
		expect(ids).toContain('sa_cosworth');
		expect(ids).toContain('oct6_login');
		expect(ids).toContain('cosworth_identity');
		expect(ids).toContain('gateway_pdx');
	});

	it('contains all required chapter 2 items', () => {
		const ids = EVIDENCE_CATALOG.map((e) => e.id);
		expect(ids).toContain('sep3_session');
		expect(ids).toContain('suid_exploit');
		expect(ids).toContain('rlogin_defense');
		expect(ids).toContain('time_pattern');
		expect(ids).toContain('defense_files_accessed');
	});

	it('each item has a valid category', () => {
		const valid = new Set(['log', 'account', 'network', 'session', 'npc', 'physical']);
		for (const item of EVIDENCE_CATALOG) {
			expect(valid.has(item.category), `${item.id} has invalid category "${item.category}"`).toBe(
				true,
			);
		}
	});
});

describe('EVIDENCE_CONNECTIONS', () => {
	it('contains expected chapter 1 connections', () => {
		const unlocks = EVIDENCE_CONNECTIONS.map((c) => c.unlocks);
		expect(unlocks.some((u) => u.includes('9 seconds'))).toBe(true);
		expect(unlocks.some((u) => u.includes('external gateway'))).toBe(true);
		expect(unlocks.some((u) => u.includes('deprovisioned'))).toBe(true);
	});

	it('chapter 2 time-pattern connection sets a flag', () => {
		const conn = EVIDENCE_CONNECTIONS.find((c) => c.setFlag === 'found_time_pattern');
		expect(conn).toBeDefined();
		expect(conn?.requires).toContain('sep3_session');
		expect(conn?.requires).toContain('oct6_login');
	});
});

describe('checkNewEvidence', () => {
	it('returns empty array when no flags are set', () => {
		const state = GameState.create();
		expect(checkNewEvidence(state)).toEqual([]);
	});

	it('collects billing_discrepancy when read_billing_email flag is set', () => {
		const state = GameState.create();
		state.setFlag('read_billing_email');
		const collected = checkNewEvidence(state);
		expect(collected).toContain('billing_discrepancy');
		expect(state.hasEvidence('billing_discrepancy')).toBe(true);
	});

	it('collects sa_cosworth when ran_sa flag is set', () => {
		const state = GameState.create();
		state.setFlag('ran_sa');
		const collected = checkNewEvidence(state);
		expect(collected).toContain('sa_cosworth');
	});

	it('collects cosworth_identity via fingered_cosworth flag', () => {
		const state = GameState.create();
		state.setFlag('fingered_cosworth');
		const collected = checkNewEvidence(state);
		expect(collected).toContain('cosworth_identity');
	});

	it('collects cosworth_identity via grepped_passwd_cosworth flag', () => {
		const state = GameState.create();
		state.setFlag('grepped_passwd_cosworth');
		const collected = checkNewEvidence(state);
		expect(collected).toContain('cosworth_identity');
	});

	it('does not return already-collected evidence', () => {
		const state = GameState.create();
		state.setFlag('read_billing_email');
		checkNewEvidence(state); // first pass collects it
		const second = checkNewEvidence(state);
		expect(second).not.toContain('billing_discrepancy');
	});

	it('collects multiple items when multiple flags are set', () => {
		const state = GameState.create();
		state.setFlag('read_billing_email');
		state.setFlag('ran_sa');
		state.setFlag('found_gateway_pdx');
		const collected = checkNewEvidence(state);
		expect(collected).toContain('billing_discrepancy');
		expect(collected).toContain('sa_cosworth');
		expect(collected).toContain('gateway_pdx');
	});
});

describe('renderCasefile', () => {
	it('returns empty message when no evidence collected', () => {
		const state = GameState.create();
		const lines = renderCasefile(state);
		expect(lines.length).toBeGreaterThan(0);
		expect(lines[0]).toContain('No evidence');
	});

	it('shows collected evidence titles', () => {
		const state = GameState.create();
		state.collectEvidence('billing_discrepancy');
		const lines = renderCasefile(state);
		const output = lines.join('\n');
		expect(output).toContain("Helen's billing discrepancy report");
	});

	it('groups evidence by category', () => {
		const state = GameState.create();
		state.collectEvidence('billing_discrepancy'); // log
		state.collectEvidence('sa_cosworth'); // account
		const lines = renderCasefile(state);
		const output = lines.join('\n');
		expect(output).toContain('[LOG]');
		expect(output).toContain('[ACCOUNT]');
	});
});

describe('renderTimeline', () => {
	it('returns empty message when no evidence collected', () => {
		const state = GameState.create();
		const lines = renderTimeline(state);
		expect(lines[0]).toContain('No evidence');
	});

	it('shows chapter headings for collected evidence', () => {
		const state = GameState.create();
		state.collectEvidence('billing_discrepancy');
		const lines = renderTimeline(state);
		const output = lines.join('\n');
		expect(output).toContain('Chapter 1');
	});

	it('orders chapter 1 evidence before chapter 2', () => {
		const state = GameState.create();
		state.collectEvidence('sep3_session'); // chapter 2
		state.collectEvidence('billing_discrepancy'); // chapter 1
		const lines = renderTimeline(state);
		const output = lines.join('\n');
		const ch1Pos = output.indexOf('Chapter 1');
		const ch2Pos = output.indexOf('Chapter 2');
		expect(ch1Pos).toBeLessThan(ch2Pos);
	});
});

describe('renderConnections', () => {
	it('shows unresolved connections with ? marker', () => {
		const state = GameState.create();
		const lines = renderConnections(state);
		const output = lines.join('\n');
		expect(output).toContain('[?]');
	});

	it('shows resolved connections with Y marker when required evidence present', () => {
		const state = GameState.create();
		state.collectEvidence('billing_discrepancy');
		state.collectEvidence('sa_cosworth');
		const lines = renderConnections(state);
		const output = lines.join('\n');
		expect(output).toContain('[Y]');
	});

	it('includes the unlocked lead text', () => {
		const state = GameState.create();
		state.collectEvidence('oct6_login');
		state.collectEvidence('gateway_pdx');
		const lines = renderConnections(state);
		const output = lines.join('\n');
		expect(output).toContain('external gateway');
	});
});
