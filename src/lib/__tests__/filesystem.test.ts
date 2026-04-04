import { beforeEach, describe, expect, it } from 'vitest';
import { VirtualFS } from '$lib/filesystem.js';

describe('VirtualFS', () => {
	let fs: VirtualFS;

	beforeEach(() => {
		fs = new VirtualFS();
	});

	describe('pwd', () => {
		it('returns / at startup', () => {
			expect(fs.pwd()).toBe('/');
		});
	});

	describe('cd', () => {
		it('changes into an absolute directory', () => {
			expect(fs.cd('/home')).toBe(true);
			expect(fs.pwd()).toBe('/home');
		});

		it('changes into a relative directory', () => {
			fs.cd('/home');
			expect(fs.cd('sysadmin')).toBe(true);
			expect(fs.pwd()).toBe('/home/sysadmin');
		});

		it('supports .. to go up one level', () => {
			fs.cd('/home/sysadmin');
			expect(fs.cd('..')).toBe(true);
			expect(fs.pwd()).toBe('/home');
		});

		it('supports .. from root (stays at root)', () => {
			expect(fs.cd('..')).toBe(true);
			expect(fs.pwd()).toBe('/');
		});

		it('returns false for a nonexistent directory', () => {
			expect(fs.cd('/nonexistent')).toBe(false);
			expect(fs.pwd()).toBe('/');
		});

		it('returns false when targeting a file', () => {
			expect(fs.cd('/etc/passwd')).toBe(false);
		});

		it('handles deeply nested absolute paths', () => {
			expect(fs.cd('/usr/share/man/man1')).toBe(true);
			expect(fs.pwd()).toBe('/usr/share/man/man1');
		});
	});

	describe('ls', () => {
		it('lists root directory contents', () => {
			const entries = fs.ls();
			expect(entries).toContain('bin/');
			expect(entries).toContain('etc/');
			expect(entries).toContain('home/');
			expect(entries).toContain('tmp/');
		});

		it('appends trailing slash to directories', () => {
			const entries = fs.ls('/');
			for (const entry of entries) {
				const node = fs.getNode(`/${entry.replace('/', '')}`);
				if (node?.type === 'dir') {
					expect(entry).toMatch(/\/$/);
				}
			}
		});

		it('lists a path argument without cd', () => {
			const entries = fs.ls('/etc');
			expect(entries).toContain('passwd');
			expect(entries).toContain('hosts');
		});

		it('hides dotfiles by default', () => {
			const entries = fs.ls('/home/sysadmin');
			expect(entries).not.toContain('.bashrc');
			expect(entries).not.toContain('.plan');
		});

		it('shows dotfiles with showHidden=true', () => {
			const entries = fs.ls('/home/sysadmin', true);
			expect(entries).toContain('.bashrc');
			expect(entries).toContain('.plan');
		});

		it('returns empty array for a nonexistent path', () => {
			expect(fs.ls('/does/not/exist')).toEqual([]);
		});

		it('returns empty array when targeting a file', () => {
			expect(fs.ls('/etc/passwd')).toEqual([]);
		});

		it('shows hidden files in /tmp with showHidden=true', () => {
			const entries = fs.ls('/tmp', true);
			expect(entries).toContain('.hidden_snack_stash');
		});
	});

	describe('cat', () => {
		it('reads file content', () => {
			const content = fs.cat('/etc/resolv.conf');
			expect(content).toContain('nameserver 192.168.1.1');
		});

		it('returns null for a nonexistent file', () => {
			expect(fs.cat('/etc/nope')).toBeNull();
		});

		it('returns null for a directory', () => {
			expect(fs.cat('/etc')).toBeNull();
		});

		it('reads /etc/passwd with user entries', () => {
			const content = fs.cat('/etc/passwd');
			expect(content).toContain('root:x:0:0');
			expect(content).toContain('sysadmin:x:');
			expect(content).toContain('cosworth');
		});

		it('reads /dev/raccoon-sensor', () => {
			const content = fs.cat('/dev/raccoon-sensor');
			expect(content).toContain('ALERT');
		});

		it('reads /home/sysadmin/notes.txt', () => {
			const content = fs.cat('/home/sysadmin/notes.txt');
			expect(content).toContain('75 cents');
		});

		it('reads a relative path from cwd', () => {
			fs.cd('/home/sysadmin');
			const content = fs.cat('notes.txt');
			expect(content).toContain('75 cents');
		});
	});

	describe('resolve', () => {
		it('resolves absolute path unchanged', () => {
			expect(fs.resolve('/etc/passwd')).toBe('/etc/passwd');
		});

		it('resolves relative path from cwd', () => {
			fs.cd('/home');
			expect(fs.resolve('sysadmin')).toBe('/home/sysadmin');
		});

		it('resolves .. in path', () => {
			expect(fs.resolve('/home/sysadmin/../dirk')).toBe('/home/dirk');
		});

		it('resolves . in path', () => {
			expect(fs.resolve('/home/./sysadmin')).toBe('/home/sysadmin');
		});

		it('resolves empty string to cwd', () => {
			fs.cd('/tmp');
			expect(fs.resolve('')).toBe('/tmp');
		});
	});

	describe('exists and isDir', () => {
		it('exists returns true for known paths', () => {
			expect(fs.exists('/etc')).toBe(true);
			expect(fs.exists('/etc/passwd')).toBe(true);
		});

		it('exists returns false for unknown paths', () => {
			expect(fs.exists('/etc/shadow')).toBe(false);
		});

		it('isDir returns true for directories', () => {
			expect(fs.isDir('/home')).toBe(true);
		});

		it('isDir returns false for files', () => {
			expect(fs.isDir('/etc/passwd')).toBe(false);
		});
	});
});
