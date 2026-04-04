import type { VirtualFS } from '../../filesystem.js';
import { getChapter1LastEntries } from '../chapters/chapter1.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

export function handleLast(args: string[], state: GameState, _vfs: VirtualFS): CommandResult {
	const user = args[0];

	if (user) {
		const lower = user.toLowerCase();
		const entries = getChapter1LastEntries(lower);

		if (lower === 'cosworth') {
			state.setFlag('ran_last_cosworth');
			state.setFlag('found_gateway_pdx');
			state.collectEvidence('gateway_pdx');
		}

		if (entries.length === 0) {
			return { type: 'lines', lines: [`last: no logins found for ${user}`] };
		}
		return { type: 'lines', lines: entries };
	}

	return { type: 'lines', lines: getChapter1LastEntries() };
}
