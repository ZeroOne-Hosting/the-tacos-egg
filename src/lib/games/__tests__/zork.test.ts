import { describe, expect, it } from 'vitest';
import { initZork } from '$lib/games/zork.js';

describe('zork module', () => {
	it('exports initZork function', () => {
		expect(typeof initZork).toBe('function');
	});
});
