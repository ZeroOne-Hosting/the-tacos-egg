import type { VirtualFS } from '../../filesystem.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

export function handleHistory(
	_args: string[],
	_state: GameState,
	_vfs: VirtualFS,
	commandHistory: string[],
): CommandResult {
	if (commandHistory.length === 0) {
		return { type: 'lines', lines: [] };
	}

	const lines = commandHistory.map((cmd, i) => {
		const num = String(i + 1).padStart(5);
		return `${num}  ${cmd}`;
	});

	return { type: 'lines', lines };
}
