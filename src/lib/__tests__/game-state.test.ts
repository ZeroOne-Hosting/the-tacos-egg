import { describe, expect, it } from 'vitest';
import { GameState } from '$lib/engine/GameState.js';

describe('GameState', () => {
	describe('construction', () => {
		it('starts at chapter 1 with no evidence or flags', () => {
			const state = GameState.create();
			expect(state.chapter).toBe(1);
			expect(state.getEvidence()).toEqual([]);
			expect(state.getFlags()).toEqual({});
			expect(state.getDeliveredEmails()).toEqual([]);
		});
	});

	describe('flag management', () => {
		it('setFlag / hasFlag round-trips', () => {
			const state = GameState.create();
			expect(state.hasFlag('test_flag')).toBe(false);
			state.setFlag('test_flag');
			expect(state.hasFlag('test_flag')).toBe(true);
		});

		it('getFlags returns a copy', () => {
			const state = GameState.create();
			state.setFlag('a');
			const flags = state.getFlags();
			flags['b'] = true;
			expect(state.hasFlag('b')).toBe(false);
		});

		it('setting the same flag twice is idempotent', () => {
			const state = GameState.create();
			state.setFlag('dup');
			state.setFlag('dup');
			expect(Object.keys(state.getFlags())).toHaveLength(1);
		});
	});

	describe('evidence management', () => {
		it('collectEvidence returns true the first time', () => {
			const state = GameState.create();
			expect(state.collectEvidence('billing_discrepancy')).toBe(true);
		});

		it('collectEvidence returns false on duplicate', () => {
			const state = GameState.create();
			state.collectEvidence('billing_discrepancy');
			expect(state.collectEvidence('billing_discrepancy')).toBe(false);
		});

		it('hasEvidence reflects collected state', () => {
			const state = GameState.create();
			expect(state.hasEvidence('oct6_login')).toBe(false);
			state.collectEvidence('oct6_login');
			expect(state.hasEvidence('oct6_login')).toBe(true);
		});

		it('getEvidence returns a copy', () => {
			const state = GameState.create();
			state.collectEvidence('gateway_pdx');
			const ev = state.getEvidence();
			ev.push('injected');
			expect(state.hasEvidence('injected')).toBe(false);
		});
	});

	describe('chapter management', () => {
		it('canAdvance returns false with no flags', () => {
			const state = GameState.create();
			expect(state.canAdvance()).toBe(false);
		});

		it('canAdvance returns true for chapter 1 when all conditions met via ran_last_cosworth', () => {
			const state = GameState.create();
			state.setFlag('found_discrepancy');
			state.setFlag('found_gateway_pdx');
			state.setFlag('ran_last_cosworth');
			expect(state.canAdvance()).toBe(true);
		});

		it('canAdvance returns true for chapter 1 when all conditions met via fingered_cosworth', () => {
			const state = GameState.create();
			state.setFlag('found_discrepancy');
			state.setFlag('found_gateway_pdx');
			state.setFlag('fingered_cosworth');
			expect(state.canAdvance()).toBe(true);
		});

		it('canAdvance returns false for chapter 1 with only partial flags', () => {
			const state = GameState.create();
			state.setFlag('found_discrepancy');
			state.setFlag('found_gateway_pdx');
			// missing ran_last_cosworth / fingered_cosworth
			expect(state.canAdvance()).toBe(false);
		});

		it('advanceChapter increments chapter', () => {
			const state = GameState.create();
			state.advanceChapter();
			expect(state.chapter).toBe(2);
		});

		it('canAdvance checks the right conditions for chapter 2', () => {
			const state = GameState.create();
			state.advanceChapter(); // now chapter 2
			expect(state.canAdvance()).toBe(false);
			state.setFlag('found_suid_exploit');
			state.setFlag('found_rlogin_defense');
			state.setFlag('accessed_defense_files');
			expect(state.canAdvance()).toBe(true);
		});

		it('canAdvance returns false for chapter beyond 8', () => {
			const state = GameState.create();
			for (let i = 0; i < 8; i++) state.advanceChapter();
			expect(state.chapter).toBe(9);
			expect(state.canAdvance()).toBe(false);
		});
	});

	describe('email management', () => {
		it('deliverEmail / hasDeliveredEmail round-trips', () => {
			const state = GameState.create();
			expect(state.hasDeliveredEmail(1)).toBe(false);
			state.deliverEmail(1);
			expect(state.hasDeliveredEmail(1)).toBe(true);
		});

		it('delivering the same email twice is idempotent', () => {
			const state = GameState.create();
			state.deliverEmail(1);
			state.deliverEmail(1);
			expect(state.getDeliveredEmails()).toHaveLength(1);
		});

		it('markEmailRead / hasReadEmail round-trips', () => {
			const state = GameState.create();
			expect(state.hasReadEmail(2)).toBe(false);
			state.markEmailRead(2);
			expect(state.hasReadEmail(2)).toBe(true);
		});

		it('marking the same email read twice is idempotent', () => {
			const state = GameState.create();
			state.markEmailRead(3);
			state.markEmailRead(3);
			// hasReadEmail still true, no duplicates in internal list
			expect(state.hasReadEmail(3)).toBe(true);
		});

		it('getDeliveredEmails returns a copy', () => {
			const state = GameState.create();
			state.deliverEmail(5);
			const emails = state.getDeliveredEmails();
			emails.push(99);
			expect(state.hasDeliveredEmail(99)).toBe(false);
		});
	});

	describe('serialization', () => {
		it('serialize / deserialize round-trips correctly', () => {
			const state = GameState.create();
			state.setFlag('found_discrepancy');
			state.collectEvidence('billing_discrepancy');
			state.deliverEmail(1);
			state.markEmailRead(1);
			state.advanceChapter();

			const json = state.serialize();
			const restored = GameState.deserialize(json);

			expect(restored.chapter).toBe(2);
			expect(restored.hasFlag('found_discrepancy')).toBe(true);
			expect(restored.hasEvidence('billing_discrepancy')).toBe(true);
			expect(restored.hasDeliveredEmail(1)).toBe(true);
			expect(restored.hasReadEmail(1)).toBe(true);
		});

		it('serialize produces valid JSON', () => {
			const state = GameState.create();
			expect(() => JSON.parse(state.serialize())).not.toThrow();
		});

		it('deserialize rejects malformed JSON', () => {
			expect(() => GameState.deserialize('not json')).toThrow();
		});
	});
});
