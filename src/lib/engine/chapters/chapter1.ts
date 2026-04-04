import type { VirtualFS } from '../../filesystem.js';

export interface EmailData {
	id: number;
	from: string;
	subject: string;
	date: string;
	body: string;
}

export const CHAPTER1_EMAILS: EmailData[] = [
	{
		id: 1,
		from: 'helen@zeroone',
		subject: 'Billing discrepancy - need your help',
		date: 'Thu Oct 13 08:11:09 1988',
		body: [
			'From: helen@zeroone Thu Oct 13 08:11:09 1988',
			'To: sysadmin@zeroone',
			'Subject: Billing discrepancy - need your help',
			'',
			'Hi,',
			'',
			'I was reconciling the October compute invoices this morning and found',
			'something I cannot explain. The monthly totals from the accounting system',
			"don't match what I can actually bill to client accounts. The gap is",
			'only $0.75 but I cannot find where it went.',
			'',
			"I'd normally just write it off but Randy gets weird when the books",
			"don't balance (long story involving the court thing). Could you",
			'look at the accounting logs? The discrepancy would have appeared',
			'sometime in the last 30 days.',
			'',
			'Thanks,',
			'Helen',
		].join('\n'),
	},
	{
		id: 2,
		from: 'randy@zeroone',
		subject: 're: billing thing helen mentioned',
		date: 'Thu Oct 13 09:44:32 1988',
		body: [
			'From: randy@zeroone Thu Oct 13 09:44:32 1988',
			'To: sysadmin@zeroone',
			'Subject: re: billing thing helen mentioned',
			'',
			'Yeah just look at the accounting logs and figure out where the',
			'75 cents went. Probably a rounding error. Dont spend more than',
			'like an hour on it.',
			'',
			'Thanks',
			'Randy',
			'',
			'P.S. the Kona needs to charge before 5pm or we lose power in',
			'the east bay. dont let anyone park in front of the garage door.',
		].join('\n'),
	},
	{
		id: 3,
		from: 'nobody@uucp',
		subject: '[AUTOBOT] Daily acct summary',
		date: 'Thu Oct 13 11:00:00 1988',
		body: [
			'From: nobody@uucp Thu Oct 13 11:00:00 1988',
			'To: sysadmin@zeroone',
			'Subject: [AUTOBOT] Daily acct summary',
			'',
			'ZeroOne Hosting — Daily Accounting Summary',
			'Period: Wed Oct 12 00:00 - Wed Oct 12 23:59',
			'',
			'  stoll        2.4re    1.2cp     0avio     4k',
			'  sysadmin     8.1re    3.8cp     0avio     6k',
			'  randy       12.3re    6.1cp     0avio     8k',
			'  helen        1.2re    0.4cp     0avio     2k',
			'  cosworth     0.1re    0.0cp     0avio     0k',
			'',
			'Total billable CPU: $142.25',
			'Variance from ledger: -$0.75',
			'',
			'-- accounting daemon (cron, runs at 11:00)',
		].join('\n'),
	},
];

const LAST_ALL_ENTRIES: string[] = [
	'sysadmin  console            Thu Oct 13 09:00   still logged in',
	'randy     ttyp1  console     Thu Oct 13 09:40 - 09:45  (00:05)',
	'helen     ttyp2  console     Thu Oct 13 08:05 - 08:20  (00:15)',
	'sysadmin  console            Wed Oct 12 16:40 - 17:10  (00:30)',
	'randy     ttyp1  console     Wed Oct 12 10:00 - 15:55  (05:55)',
	'helen     ttyp2  console     Wed Oct 12 08:00 - 12:30  (04:30)',
	'sysadmin  console            Tue Oct 11 09:00 - 18:00  (09:00)',
	'randy     ttyp1  console     Mon Oct 10 10:00 - 16:00  (06:00)',
	'sysadmin  console            Mon Oct 10 08:30 - 17:45  (09:15)',
	'helen     ttyp2  console     Mon Oct 10 08:00 - 13:00  (05:00)',
	'stoll     ttyp4  console     Sat Oct  8 14:00 - 16:00  (02:00)',
	'randy     ttyp1  console     Fri Oct  7 09:00 - 17:00  (08:00)',
	'sysadmin  console            Fri Oct  7 08:00 - 18:30  (10:30)',
	'cosworth  ttyp3  gateway-pdx.uucp  Thu Oct  6 02:17 - 02:17  (00:00)',
	'helen     ttyp2  console     Thu Oct  6 08:00 - 12:00  (04:00)',
	'randy     ttyp1  console     Wed Oct  5 09:30 - 16:45  (07:15)',
	'sysadmin  console            Wed Oct  5 08:00 - 17:00  (09:00)',
];

const LASTCOMM_ALL: string[] = [
	'csh             sysadmin console  0.10 secs Thu Oct 13 09:00',
	'ls              sysadmin console  0.02 secs Thu Oct 13 09:01',
	'mail            sysadmin console  0.05 secs Thu Oct 13 09:02',
	'who             sysadmin console  0.01 secs Thu Oct 13 09:03',
	'sa              sysadmin console  0.08 secs Thu Oct 13 09:04',
	'csh             randy    ttyp1    0.10 secs Thu Oct 13 09:40',
	'rn              randy    ttyp1    1.20 secs Thu Oct 13 09:41',
	'csh             helen    ttyp2    0.10 secs Thu Oct 13 08:05',
	'vi              helen    ttyp2    0.30 secs Thu Oct 13 08:06',
	'sh              cosworth ttyp3    0.02 secs Thu Oct  6 02:17',
	'ls              cosworth ttyp3    0.04 secs Thu Oct  6 02:17',
	'cat          F  cosworth ttyp3    0.01 secs Thu Oct  6 02:17',
];

export function getChapter1LastEntries(user?: string): string[] {
	if (!user) return LAST_ALL_ENTRIES;
	const lower = user.toLowerCase();
	return LAST_ALL_ENTRIES.filter((line) => line.trimStart().startsWith(lower));
}

export function getChapter1LastcommEntries(user?: string): string[] {
	if (!user) return LASTCOMM_ALL;
	const lower = user.toLowerCase();
	return LASTCOMM_ALL.filter((line) => line.includes(lower));
}

export function applyChapter1(_vfs: VirtualFS): void {
	// Chapter 1 is the starting state; the VFS is already populated.
	// Future chapters will mutate the filesystem here.
}
