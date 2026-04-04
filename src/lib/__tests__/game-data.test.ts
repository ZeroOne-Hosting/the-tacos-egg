import { describe, expect, it } from 'vitest';
import { generatePs, generateWho, pick, WHO_ALWAYS, WHO_POOL, WHO_RARE } from '$lib/game-data.js';

describe('pick', () => {
	it('returns an element from the array', () => {
		const arr = ['a', 'b', 'c'];
		const result = pick(arr);
		expect(arr).toContain(result);
	});

	it('works with single element arrays', () => {
		expect(pick([42])).toBe(42);
	});
});

describe('generateWho', () => {
	it('always includes sysadmin and root', () => {
		for (let i = 0; i < 20; i++) {
			const lines = generateWho();
			const users = lines.map((l) => l.trim().split(/\s+/)[0]);
			for (const required of WHO_ALWAYS) {
				expect(users).toContain(required);
			}
		}
	});

	it('returns different results across calls', () => {
		const results = new Set<string>();
		for (let i = 0; i < 20; i++) {
			results.add(generateWho().join('\n'));
		}
		expect(results.size).toBeGreaterThan(1);
	});

	it('never has duplicate usernames', () => {
		for (let i = 0; i < 20; i++) {
			const lines = generateWho();
			const users = lines.map((l) => l.trim().split(/\s+/)[0]);
			expect(new Set(users).size).toBe(users.length);
		}
	});

	it('only includes users from WHO_ALWAYS and WHO_POOL', () => {
		const allValid = new Set([...WHO_ALWAYS, ...WHO_POOL, ...WHO_RARE]);
		for (let i = 0; i < 20; i++) {
			const lines = generateWho();
			const users = lines.map((l) => l.trim().split(/\s+/)[0]);
			for (const user of users) {
				expect(allValid).toContain(user);
			}
		}
	});
});

describe('generatePs', () => {
	it('starts with a header row', () => {
		const lines = generatePs();
		expect(lines[0]).toContain('USER');
		expect(lines[0]).toContain('PID');
		expect(lines[0]).toContain('COMMAND');
	});

	it('includes system, openstack, and user processes', () => {
		const lines = generatePs();
		const allText = lines.join('\n');
		// System procs (root with low PIDs)
		expect(allText).toMatch(/root/);
		// OpenStack procs (service users like nova, neutron, etc)
		const osUsers = [
			'nova',
			'neutron',
			'glance',
			'cinder',
			'keystone',
			'heat',
			'swift',
			'horizon',
			'rabbitmq',
			'mysql',
			'memcache',
		];
		const hasOsUser = osUsers.some((u) => allText.includes(u));
		expect(hasOsUser).toBe(true);
		// User procs (from WHO_POOL)
		const hasPoolUser = WHO_POOL.some((u) => allText.includes(u));
		expect(hasPoolUser).toBe(true);
	});

	it('user processes do not repeat usernames', () => {
		for (let i = 0; i < 20; i++) {
			const lines = generatePs();
			// Skip header, extract user column from lines that have WHO_POOL users
			const poolUsers = lines
				.slice(1)
				.map((l) => l.trim().split(/\s+/)[0])
				.filter((u) => WHO_POOL.includes(u));
			expect(new Set(poolUsers).size).toBe(poolUsers.length);
		}
	});
});
