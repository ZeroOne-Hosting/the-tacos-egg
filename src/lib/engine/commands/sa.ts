import type { VirtualFS } from '../../filesystem.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

export function handleSa(_args: string[], state: GameState, _vfs: VirtualFS): CommandResult {
	state.setFlag('ran_sa');
	if (state.hasFlag('read_billing_email')) {
		state.setFlag('found_discrepancy');
		state.collectEvidence('billing_discrepancy');
	}

	return {
		type: 'lines',
		lines: [
			'                     stoll        2.4re    1.2cp     0avio     4k',
			'                    sysadmin      8.1re    3.8cp     0avio     6k',
			'                    randy        12.3re    6.1cp     0avio     8k',
			'                    helen         1.2re    0.4cp     0avio     2k',
			'                    cosworth      0.1re    0.0cp     0avio     0k',
		],
	};
}
