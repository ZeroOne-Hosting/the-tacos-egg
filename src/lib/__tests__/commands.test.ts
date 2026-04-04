import { beforeEach, describe, expect, it } from 'vitest';
import { dispatch } from '$lib/engine/commands/index.js';
import { GameState } from '$lib/engine/GameState.js';
import { VirtualFS } from '$lib/filesystem.js';

let state: GameState;
let vfs: VirtualFS;

beforeEach(() => {
	state = new GameState();
	vfs = new VirtualFS();
});

describe('dispatch', () => {
	it('routes help to the help handler', () => {
		const result = dispatch('help', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('Available commands');
		}
	});

	it('returns not-found for unknown commands', () => {
		const result = dispatch('frobnicate', state, vfs);
		expect(result.type).toBe('not-found');
		if (result.type === 'not-found') {
			expect(result.cmd).toBe('frobnicate');
		}
	});

	it('routes clear', () => {
		const result = dispatch('clear', state, vfs);
		expect(result.type).toBe('clear');
	});

	it('routes mail', () => {
		const result = dispatch('mail', state, vfs);
		expect(result.type).toBe('mail');
	});

	it('routes zork', () => {
		const result = dispatch('zork', state, vfs);
		expect(result.type).toBe('zork');
	});

	it('lowercases the verb', () => {
		const result = dispatch('HELP', state, vfs);
		expect(result.type).toBe('lines');
	});
});

describe('sa command', () => {
	it('returns output containing cosworth', () => {
		const result = dispatch('sa', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('cosworth');
		}
	});

	it('sets ran_sa flag', () => {
		dispatch('sa', state, vfs);
		expect(state.hasFlag('ran_sa')).toBe(true);
	});

	it('sets found_discrepancy when read_billing_email is set', () => {
		state.setFlag('read_billing_email');
		dispatch('sa', state, vfs);
		expect(state.hasFlag('found_discrepancy')).toBe(true);
	});

	it('does not set found_discrepancy without read_billing_email', () => {
		dispatch('sa', state, vfs);
		expect(state.hasFlag('found_discrepancy')).toBe(false);
	});
});

describe('last command', () => {
	it('returns entries with no args', () => {
		const result = dispatch('last', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.length).toBeGreaterThan(0);
		}
	});

	it('filters to cosworth entries with last cosworth', () => {
		const result = dispatch('last cosworth', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.every((l) => l.toLowerCase().startsWith('cosworth'))).toBe(true);
		}
	});

	it('sets ran_last_cosworth and found_gateway_pdx flags', () => {
		dispatch('last cosworth', state, vfs);
		expect(state.hasFlag('ran_last_cosworth')).toBe(true);
		expect(state.hasFlag('found_gateway_pdx')).toBe(true);
	});

	it('contains the suspicious gateway-pdx entry in full last output', () => {
		const result = dispatch('last', state, vfs);
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('gateway-pdx.uucp');
		}
	});
});

describe('lastcomm command', () => {
	it('returns all entries with no args', () => {
		const result = dispatch('lastcomm', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.length).toBeGreaterThan(0);
		}
	});

	it('returns exactly 3 entries for lastcomm cosworth', () => {
		const result = dispatch('lastcomm cosworth', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines).toHaveLength(3);
			expect(result.lines[0]).toContain('sh');
			expect(result.lines[1]).toContain('ls');
			expect(result.lines[2]).toContain('cat');
		}
	});

	it('sets ran_lastcomm_cosworth flag', () => {
		dispatch('lastcomm cosworth', state, vfs);
		expect(state.hasFlag('ran_lastcomm_cosworth')).toBe(true);
	});
});

describe('finger command', () => {
	it('returns all logged-in users with no args', () => {
		const result = dispatch('finger', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('Login');
		}
	});

	it('returns cosworth user info for finger cosworth', () => {
		const result = dispatch('finger cosworth', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			const text = result.lines.join('\n');
			expect(text).toContain('cosworth');
			expect(text).toContain('gateway-pdx.uucp');
		}
	});

	it('sets fingered_cosworth flag', () => {
		dispatch('finger cosworth', state, vfs);
		expect(state.hasFlag('fingered_cosworth')).toBe(true);
	});

	it('returns no such user for unknown users', () => {
		const result = dispatch('finger nobody_real', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines[0]).toContain('no such user');
		}
	});
});

describe('grep command', () => {
	it('filters file content by pattern', () => {
		const result = dispatch('grep root /etc/passwd', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.every((l) => l.toLowerCase().includes('root'))).toBe(true);
		}
	});

	it('sets grepped_passwd_cosworth when grepping cosworth in /etc/passwd', () => {
		dispatch('grep cosworth /etc/passwd', state, vfs);
		expect(state.hasFlag('grepped_passwd_cosworth')).toBe(true);
	});

	it('returns error for missing file', () => {
		const result = dispatch('grep foo /nonexistent/file', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines[0]).toContain('No such file or directory');
		}
	});

	it('returns usage when called with fewer than 2 args', () => {
		const result = dispatch('grep onlyone', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines[0]).toContain('usage');
		}
	});

	it('returns empty lines when pattern has no matches', () => {
		const result = dispatch('grep zzznomatch /etc/passwd', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines).toHaveLength(0);
		}
	});
});

describe('man command', () => {
	it('returns man page for sa', () => {
		const result = dispatch('man sa', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('SA(8)');
		}
	});

	it('returns man page for last', () => {
		const result = dispatch('man last', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('LAST(1)');
		}
	});

	it('returns no manual entry for unknown command', () => {
		const result = dispatch('man xyzzy', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines[0]).toContain('No manual entry for xyzzy');
		}
	});

	it('returns not-found message for man nmap', () => {
		const result = dispatch('man nmap', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines[0]).toContain('nmap: command not found');
		}
	});
});

describe('history command', () => {
	it('returns empty lines when history is empty', () => {
		const result = dispatch('history', state, vfs, []);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines).toHaveLength(0);
		}
	});

	it('returns numbered history entries', () => {
		const history = ['mail', 'sa', 'lastcomm cosworth'];
		const result = dispatch('history', state, vfs, history);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines).toHaveLength(3);
			expect(result.lines[0]).toContain('mail');
			expect(result.lines[1]).toContain('sa');
			expect(result.lines[2]).toContain('lastcomm cosworth');
			expect(result.lines[0]).toMatch(/^\s+1/);
			expect(result.lines[1]).toMatch(/^\s+2/);
		}
	});
});

describe('casefile command', () => {
	it('reports no evidence when nothing collected', () => {
		const result = dispatch('casefile', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('No evidence');
		}
	});

	it('shows evidence after collection', () => {
		state.collectEvidence('billing_discrepancy');
		const result = dispatch('casefile list', state, vfs);
		expect(result.type).toBe('lines');
		if (result.type === 'lines') {
			expect(result.lines.join('\n')).toContain('$0.75');
		}
	});
});
