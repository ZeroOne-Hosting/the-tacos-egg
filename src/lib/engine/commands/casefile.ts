import type { VirtualFS } from '../../filesystem.js';
import { renderCasefile, renderConnections, renderTimeline } from '../evidence.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

export function handleCasefile(args: string[], state: GameState, _vfs: VirtualFS): CommandResult {
	const sub = args[0]?.toLowerCase();

	if (!sub || sub === 'list') {
		return { type: 'lines', lines: renderCasefile(state) };
	}

	if (sub === 'connections') {
		return { type: 'lines', lines: renderConnections(state) };
	}

	if (sub === 'timeline') {
		return { type: 'lines', lines: renderTimeline(state) };
	}

	return {
		type: 'lines',
		lines: ['usage: casefile [list|connections|timeline]'],
	};
}
