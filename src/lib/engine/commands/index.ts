import type { VirtualFS } from '../../filesystem.js';
import { EMAILS, generatePs, generateWho, HELP_TEXT } from '../../game-data.js';
import type { GameState } from '../GameState.js';
import { handleCasefile } from './casefile.js';
import { handleFinger } from './finger.js';
import { handleGrep } from './grep.js';
import { handleHistory } from './history.js';
import { handleLast } from './last.js';
import { handleLastcomm } from './lastcomm.js';
import { handleMan } from './man.js';
import { handleSa } from './sa.js';

export type CommandResult =
	| { type: 'lines'; lines: string[] }
	| { type: 'clear' }
	| { type: 'mail' }
	| { type: 'zork' }
	| { type: 'logout' }
	| { type: 'not-found'; cmd: string };

export type CommandHandler = (
	args: string[],
	state: GameState,
	vfs: VirtualFS,
	commandHistory: string[],
) => CommandResult;

const HOME = '/home/sysadmin';

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes}`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

const REGISTRY: Record<string, CommandHandler> = {
	help: (_args, _state, _vfs) => ({ type: 'lines', lines: HELP_TEXT }),

	clear: (_args, _state, _vfs) => ({ type: 'clear' }),

	date: (_args, _state, _vfs) => ({
		type: 'lines',
		lines: ['Thu Oct 13 09:14:22 PDT 1988'],
	}),

	who: (_args, _state, _vfs) => ({ type: 'lines', lines: generateWho() }),

	ps: (_args, _state, _vfs) => ({ type: 'lines', lines: generatePs() }),

	pwd: (_args, _state, vfs) => ({ type: 'lines', lines: [vfs.pwd()] }),

	cd: (args, _state, vfs) => {
		const target = args[0] ?? HOME;
		if (!vfs.cd(target)) {
			return { type: 'lines', lines: [`cd: ${target}: No such file or directory`] };
		}
		return { type: 'lines', lines: [] };
	},

	ls: (args, _state, vfs) => {
		const flags = args.filter((a) => a.startsWith('-')).join('');
		const showHidden = flags.includes('a');
		const longFormat = flags.includes('l');
		const humanReadable = flags.includes('h');
		const pathArg = args.find((a) => !a.startsWith('-'));
		const resolved = vfs.resolve(pathArg ?? '');
		const node = pathArg ? vfs.getNode(resolved) : vfs.getNode(vfs.pwd());

		if (pathArg && !node) {
			return { type: 'lines', lines: [`ls: ${pathArg}: No such file or directory`] };
		}
		if (node && node.type === 'file') {
			if (longFormat) {
				const size = node.content.length;
				const sizeStr = humanReadable ? formatSize(size) : String(size);
				return {
					type: 'lines',
					lines: [`-rw-r--r--  1 sysadmin staff  ${sizeStr.padStart(6)}  Oct 13 08:00  ${pathArg}`],
				};
			}
			return { type: 'lines', lines: [pathArg ?? ''] };
		}

		const entries = vfs.ls(pathArg, showHidden);
		if (!longFormat) {
			return { type: 'lines', lines: entries.length > 0 ? [entries.join('  ')] : [''] };
		}

		// Long format
		const dir = node as {
			type: 'dir';
			children: Record<
				string,
				{ type: string; content?: string; children?: Record<string, unknown> }
			>;
		};
		const lines: string[] = [`total ${entries.length}`];
		lines.push('drwxr-xr-x   2 sysadmin staff       0  Oct 13 08:00  .');
		lines.push('drwxr-xr-x   2 sysadmin staff       0  Oct 13 08:00  ..');
		for (const entry of entries) {
			const name = entry.replace(/\/$/, '');
			const child = dir.children[name];
			if (!child) continue;
			const isDir = child.type === 'dir';
			const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
			const size = isDir ? Object.keys(child.children ?? {}).length : (child.content ?? '').length;
			const sizeStr = humanReadable ? formatSize(size) : String(size);
			const links = isDir ? String(2 + Object.keys(child.children ?? {}).length) : '1';
			lines.push(
				`${perms}  ${links.padStart(2)} sysadmin staff  ${sizeStr.padStart(6)}  Oct 13 08:00  ${entry}`,
			);
		}
		return { type: 'lines', lines };
	},

	cat: (args, _state, vfs) => {
		const pathArg = args[0];
		if (!pathArg) {
			return { type: 'lines', lines: ['cat: missing operand'] };
		}
		const content = vfs.cat(pathArg);
		if (content === null) {
			const node = vfs.getNode(vfs.resolve(pathArg));
			if (!node) {
				return { type: 'lines', lines: [`cat: ${pathArg}: No such file or directory`] };
			}
			return { type: 'lines', lines: [`cat: ${pathArg}: Is a directory`] };
		}
		return { type: 'lines', lines: content === '' ? [''] : content.split('\n') };
	},

	mail: (_args, _state, _vfs) => ({ type: 'mail' }),

	tacos: (_args, _state, _vfs) => ({
		type: 'lines',
		lines: [
			'Taco Automated Curro Ordering (TACO) v0.3',
			'"If you have a problem with our tacos, call someone who cares."',
			'',
			'  [1] Taco         $0.25',
			'  [2] Burrito      $0.50',
			'  [3] Nachos       $0.35',
			'  [4] Cinnamon Twist $0.15  (last resort)',
			'',
			'Order integration pending. Dirk has the API docs.',
			'Dirk is on vacation. No ETA.',
		],
	}),

	zork: (_args, _state, _vfs) => ({ type: 'zork' }),

	logout: (_args, _state, _vfs) => ({ type: 'logout' }),
	exit: (_args, _state, _vfs) => ({ type: 'logout' }),

	sa: handleSa,
	last: handleLast,
	lastcomm: handleLastcomm,
	finger: handleFinger,
	grep: handleGrep,
	man: handleMan,
	casefile: handleCasefile,

	history: (args, state, vfs, commandHistory) => handleHistory(args, state, vfs, commandHistory),
};

export function dispatch(
	raw: string,
	state: GameState,
	vfs: VirtualFS,
	commandHistory: string[] = [],
): CommandResult {
	const parts = raw.trim().split(/\s+/);
	const verb = parts[0].toLowerCase();
	const args = parts.slice(1);

	const handler = REGISTRY[verb];
	if (!handler) {
		return { type: 'not-found', cmd: verb };
	}

	return handler(args, state, vfs, commandHistory);
}

export { EMAILS };
