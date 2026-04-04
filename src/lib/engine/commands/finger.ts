import type { VirtualFS } from '../../filesystem.js';
import type { GameState } from '../GameState.js';
import type { CommandResult } from './index.js';

const FINGER_COSWORTH = [
	'Login: cosworth                         Name: Cosworth Mallard',
	'Directory: /home/cosworth               Shell: /bin/csh',
	'Office: Waterfowl Solutions LLC',
	'Last login Thu Oct  6 02:17 on ttyp3 from gateway-pdx.uucp',
	'Plan:',
	'Out of office Oct 3-15.',
	'Attending PacNW Fowl Expo & Waterfowl Convention, Portland OR.',
	'No laptop. No modem. No remote access. OFFLINE entire trip.',
];

const FINGER_ALL = [
	'Login    Name                 TTY   Idle  When',
	'sysadmin Sysadmin             con      -  Thu Oct 13 09:00',
	'randy    Randy                p1       -  Thu Oct 13 09:40',
	'helen    Helen                p2       -  Thu Oct 13 08:05',
];

export function handleFinger(args: string[], state: GameState, _vfs: VirtualFS): CommandResult {
	const user = args[0];

	if (!user) {
		return { type: 'lines', lines: FINGER_ALL };
	}

	const lower = user.toLowerCase();
	if (lower === 'cosworth') {
		state.setFlag('fingered_cosworth');
		state.collectEvidence('cosworth_identity');
		return { type: 'lines', lines: FINGER_COSWORTH };
	}

	return { type: 'lines', lines: [`finger: ${user}: no such user`] };
}
