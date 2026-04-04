import type { VirtualFS } from '../../filesystem.js';
import { getChapter1LastcommEntries } from '../chapters/chapter1.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

export function handleLastcomm(args: string[], state: GameState, _vfs: VirtualFS): CommandResult {
	const user = args[0];

	if (user) {
		const lower = user.toLowerCase();
		const entries = getChapter1LastcommEntries(lower);

		if (lower === 'cosworth') {
			state.setFlag('ran_lastcomm_cosworth');
		}

		if (entries.length === 0) {
			return { type: 'lines', lines: [`lastcomm: no entries for ${user}`] };
		}
		return { type: 'lines', lines: entries };
	}

	return { type: 'lines', lines: getChapter1LastcommEntries() };
}
