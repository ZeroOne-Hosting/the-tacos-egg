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
	| { type: 'not-found'; cmd: string };

export type CommandHandler = (
	args: string[],
	state: GameState,
	vfs: VirtualFS,
	commandHistory: string[],
) => CommandResult;

const HOME = '/home/sysadmin';

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
		const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
		const pathArg = args.find((a) => !a.startsWith('-'));
		const entries = vfs.ls(pathArg, showHidden);
		if (entries.length === 0 && pathArg) {
			const node = vfs.getNode(vfs.resolve(pathArg));
			if (!node) {
				return { type: 'lines', lines: [`ls: ${pathArg}: No such file or directory`] };
			}
			return { type: 'lines', lines: [pathArg] };
		}
		return { type: 'lines', lines: entries.length > 0 ? [entries.join('  ')] : [''] };
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
