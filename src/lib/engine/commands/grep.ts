import type { VirtualFS } from '../../filesystem.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

export function handleGrep(args: string[], state: GameState, vfs: VirtualFS): CommandResult {
	if (args.length < 2) {
		return { type: 'lines', lines: ['usage: grep pattern file'] };
	}

	const [pattern, filePath] = args;
	const content = vfs.cat(filePath);

	if (content === null) {
		const node = vfs.getNode(vfs.resolve(filePath));
		if (!node) {
			return { type: 'lines', lines: [`grep: ${filePath}: No such file or directory`] };
		}
		return { type: 'lines', lines: [`grep: ${filePath}: Is a directory`] };
	}

	const lower = pattern.toLowerCase();
	const matches = content.split('\n').filter((line) => line.toLowerCase().includes(lower));

	if (lower === 'cosworth' && filePath === '/etc/passwd') {
		state.setFlag('grepped_passwd_cosworth');
		state.collectEvidence('cosworth_identity');
	}

	if (matches.length === 0) {
		return { type: 'lines', lines: [] };
	}

	return { type: 'lines', lines: matches };
}
