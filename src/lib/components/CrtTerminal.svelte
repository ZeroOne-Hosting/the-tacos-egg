<script lang="ts">
	import { onMount, tick } from 'svelte';

	type OutputLine = {
		text: string;
		instant?: boolean;
	};

	const PROMPT = 'zeroone> ';
	const TYPING_DELAY_MS = 18;
	const BOOT_LINE_DELAY_MS = 120;

	const BOOT_SEQUENCE: OutputLine[] = [
		{ text: 'ZeroOne Hosting Systems Inc.', instant: true },
		{ text: '"Lowering expectations since our court date"', instant: true },
		{ text: 'Kelso, WA - Garage Datacenter', instant: true },
		{ text: '', instant: true },
		{ text: 'Performing system checks...', instant: true },
		{ text: 'Memory: 640K (should be enough for anyone)', instant: true },
		{ text: 'Disk: /dev/garage0 mounted (83% Taco Bell receipts)', instant: true },
		{ text: 'Network: Hyundai Kona backup power... ONLINE', instant: true },
		{ text: 'UPS: Extension cord to neighbor\'s house... OK', instant: true },
		{ text: 'Cooling: Garage door open... CONFIRMED', instant: true },
		{ text: '', instant: true },
		{ text: 'Login: sysadmin', instant: true },
		{ text: 'Password: ********', instant: true },
		{ text: '', instant: true },
		{ text: 'Last login: Mon Aug 11 08:23:14 1986', instant: true },
		{ text: 'WARNING: Accounting discrepancy detected. Check your mail.', instant: true },
		{ text: 'You have new mail.', instant: true },
		{ text: '', instant: true }
	];

	const EMAILS = [
		{
			id: 1,
			from: 'billing@zeroone.local',
			subject: '*** ALERT *** Accounting discrepancy - $0.75',
			date: 'Mon Aug 11 07:45:02 1986',
			body: `From: billing@zeroone.local
To: sysadmin@zeroone.local
Date: Mon Aug 11 07:45:02 1986
Subject: *** ALERT *** Accounting discrepancy - $0.75

Sysadmin,

The automated billing reconciliation script found a $0.75 discrepancy
in the Q3 accounts. This is NOT the taco fund. This is real money.

Ledger entry ref: INV-1986-0811-004
Expected: $142.25
Actual:   $141.50
Delta:    -$0.75

Please investigate and reply-all. Gary from accounting is already
upset and he controls the garage door opener.

-- ZeroOne Billing Daemon (cron job, mostly works)`
		},
		{
			id: 2,
			from: 'ops@zeroone.local',
			subject: 'Garage door left open AGAIN',
			date: 'Mon Aug 11 06:02:17 1986',
			body: `From: ops@zeroone.local
To: all@zeroone.local
Date: Mon Aug 11 06:02:17 1986
Subject: Garage door left open AGAIN

Whoever left the garage door open last night: the servers got wet.
Rack 1 (the card table) is fine. Rack 2 (the TV tray) has some
moisture on the power strip. It dried out. Probably fine.

Please close the door when you leave. We cannot afford another
incident. We literally cannot. The Kona's warranty doesn't cover this.

Also a raccoon got in. It did not touch the servers. Respect.

-- Ops (Dave)`
		},
		{
			id: 3,
			from: 'tacobell-order@zeroone.local',
			subject: 'GROUP TACO ORDER - respond by 11:30',
			date: 'Mon Aug 11 08:00:44 1986',
			body: `From: tacobell-order@zeroone.local
To: all@zeroone.local
Date: Mon Aug 11 08:00:44 1986
Subject: GROUP TACO ORDER - respond by 11:30

Doing a Taco Bell run at noon. Reply with your order.

Current orders:
  Dave    - 3x taco, 1x burrito
  Sandra  - 2x taco (no sour cream, she means it this time)
  Mike    - waiting to see what Dave gets and then getting the same

If you don't reply by 11:30 you get whatever's left over. Last week
that was a cinnamon twist and nobody was happy.

Cash only. The card reader is still "in transit" from Radio Shack.

-- The Automated Taco Ordering System (ATOS v0.3, use at own risk)`
		},
		{
			id: 4,
			from: 'kona-monitor@zeroone.local',
			subject: 'Kona battery: 23% - CHARGING REMINDER',
			date: 'Sun Aug 10 23:47:59 1986',
			body: `From: kona-monitor@zeroone.local
To: sysadmin@zeroone.local
Date: Sun Aug 10 23:47:59 1986
Subject: Kona battery: 23% - CHARGING REMINDER

AUTOMATED ALERT from the Hyundai Kona Datacenter Power Monitor

The Kona is at 23% battery. This is the backup power supply for
Rack 1 and the network switch. If it dies so does the internet.

Charging schedule:
  Sun night  - Mike's house (he said it's fine, don't ask again)
  Mon-Wed    - Neighbor's extension cord (see UPS config)
  Thu-Sat    - TBD / pray

Action required: plug in the car.

-- KonaWatch v1.0 (runs on the Kona's own battery, we know)`
		}
	];

	const WHO_OUTPUT = [
		'sysadmin  tty01  Aug 11 08:23',
		'dave      tty02  Aug 11 06:01',
		'sandra    tty03  Aug 11 07:58',
		'mike      tty04  Aug 11 08:00',
		'root      console Aug 10 23:47'
	];

	const HELP_TEXT = [
		'Available commands:',
		'',
		'  mail         Read your mail',
		'  read <n>     Read message number <n>',
		'  who          Show logged-in users',
		'  date         Show current date and time',
		'  clear        Clear the terminal',
		'  tacos        Open taco ordering system',
		'  help         Show this help'
	];

	let outputLines = $state<string[]>([]);
	let inputValue = $state('');
	let commandHistory = $state<string[]>([]);
	let historyIndex = $state(-1);
	let isBooting = $state(true);
	let isTyping = $state(false);
	let outputEl = $state<HTMLDivElement | undefined>();
	let inputEl = $state<HTMLInputElement | undefined>();

	async function sleep(ms: number): Promise<void> {
		return new Promise((r) => setTimeout(r, ms));
	}

	async function appendLine(text: string): Promise<void> {
		outputLines = [...outputLines, text];
		await tick();
		scrollToBottom();
	}

	async function typeLines(lines: string[]): Promise<void> {
		isTyping = true;
		for (const line of lines) {
			if (line === '') {
				await appendLine('');
				await sleep(TYPING_DELAY_MS * 2);
				continue;
			}
			let built = '';
			outputLines = [...outputLines, ''];
			for (const ch of line) {
				built += ch;
				outputLines = [...outputLines.slice(0, -1), built];
				await tick();
				scrollToBottom();
				await sleep(TYPING_DELAY_MS);
			}
		}
		isTyping = false;
	}

	async function runBootSequence(): Promise<void> {
		isBooting = true;
		for (const line of BOOT_SEQUENCE) {
			await appendLine(line.text);
			await sleep(BOOT_LINE_DELAY_MS);
		}
		isBooting = false;
		inputEl?.focus();
	}

	function scrollToBottom(): void {
		if (outputEl) {
			outputEl.scrollTop = outputEl.scrollHeight;
		}
	}

	async function handleCommand(raw: string): Promise<void> {
		const cmd = raw.trim();

		await appendLine(`${PROMPT}${cmd}`);

		if (cmd === '') return;

		commandHistory = [cmd, ...commandHistory];
		historyIndex = -1;

		const parts = cmd.toLowerCase().split(/\s+/);
		const verb = parts[0];

		if (verb === 'help') {
			await typeLines(HELP_TEXT);
		} else if (verb === 'clear') {
			outputLines = [];
		} else if (verb === 'date') {
			await typeLines(['Mon Aug 11 09:14:22 PDT 1986']);
		} else if (verb === 'who') {
			await typeLines(WHO_OUTPUT);
		} else if (verb === 'mail') {
			const header = [
				'Mail version 2.18 6/28/83.  Type ? for help.',
				`"/usr/spool/mail/sysadmin": ${EMAILS.length} messages, 1 new`,
				''
			];
			const inbox = EMAILS.map(
				(e) =>
					`${e.id === 1 ? 'N' : ' '} ${String(e.id).padEnd(2)} ${e.from.padEnd(30)} ${e.date.slice(0, 12)}  "${e.subject}"`
			);
			await typeLines([...header, ...inbox]);
		} else if (verb === 'read') {
			const n = parseInt(parts[1] ?? '', 10);
			const email = EMAILS.find((e) => e.id === n);
			if (isNaN(n) || !email) {
				await typeLines([`No message ${parts[1] ?? ''}.`]);
			} else {
				await typeLines(email.body.split('\n'));
			}
		} else if (verb === 'tacos') {
			await typeLines([
				'Automated Taco Ordering System (ATOS) v0.3',
				'"If you have a problem with our tacos, call someone who cares."',
				'',
				'  [1] Taco         $0.25',
				'  [2] Burrito      $0.50',
				'  [3] Nachos       $0.35',
				'  [4] Cinnamon Twist $0.15  (last resort)',
				'',
				'Order integration pending. Dave has the API docs.',
				'Dave is on vacation. No ETA.'
			]);
		} else {
			await typeLines([`${cmd}: command not found`]);
		}
	}

	async function onKeyDown(e: KeyboardEvent): Promise<void> {
		if (isBooting || isTyping) return;

		if (e.key === 'Enter') {
			const val = inputValue;
			inputValue = '';
			await handleCommand(val);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (historyIndex < commandHistory.length - 1) {
				historyIndex += 1;
				inputValue = commandHistory[historyIndex];
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex > 0) {
				historyIndex -= 1;
				inputValue = commandHistory[historyIndex];
			} else if (historyIndex === 0) {
				historyIndex = -1;
				inputValue = '';
			}
		}
	}

	onMount(() => {
		runBootSequence();

		function refocusInput() {
			inputEl?.focus();
		}
		window.addEventListener('click', refocusInput);
		return () => window.removeEventListener('click', refocusInput);
	});
</script>

<div class="crt-wrapper">
	<div class="crt-screen">
		<div class="scanlines" aria-hidden="true"></div>

		<div class="terminal" bind:this={outputEl}>
			{#each outputLines as line}
				<div class="line">{line || '\u00a0'}</div>
			{/each}

			{#if !isBooting}
				<div class="input-row">
					<span class="prompt">{PROMPT}</span>
					<div class="input-area">
						<input
							bind:this={inputEl}
							bind:value={inputValue}
							onkeydown={onKeyDown}
							class="cmd-input"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck={false}
							aria-label="terminal input"
						/>
						<span class="cursor" aria-hidden="true"></span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.crt-wrapper {
		position: fixed;
		inset: 0;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		cursor: text;
	}

	.crt-screen {
		position: relative;
		width: 100%;
		max-width: 900px;
		height: 100%;
		max-height: 680px;
		background: #0a0a0a;
		border-radius: 16px;
		overflow: hidden;
		box-shadow:
			0 0 0 2px #1a1a1a,
			0 0 0 4px #111,
			0 0 60px 8px rgba(0, 255, 70, 0.15),
			0 0 120px 20px rgba(0, 255, 70, 0.06),
			inset 0 0 80px rgba(0, 0, 0, 0.6);
	}

	/* Subtle screen curvature via pseudo-element overlay */
	.crt-screen::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 60%,
			rgba(0, 0, 0, 0.45) 100%
		);
		border-radius: 16px;
		pointer-events: none;
		z-index: 10;
	}

	/* Phosphor flicker animation */
	.crt-screen::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(0, 255, 70, 0.02);
		border-radius: 16px;
		pointer-events: none;
		z-index: 11;
		animation: flicker 0.15s infinite steps(1);
	}

	@keyframes flicker {
		0%   { opacity: 1; }
		50%  { opacity: 0.97; }
		100% { opacity: 1; }
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			transparent 0px,
			transparent 2px,
			rgba(0, 0, 0, 0.18) 2px,
			rgba(0, 0, 0, 0.18) 4px
		);
		pointer-events: none;
		z-index: 9;
		border-radius: 16px;
	}

	.terminal {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 20px 24px;
		overflow-y: auto;
		overflow-x: hidden;
		font-family: 'IBM Plex Mono', 'VT323', monospace;
		font-size: 14px;
		line-height: 1.55;
		color: #33ff57;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
		z-index: 1;
		scrollbar-width: none;
	}

	.terminal::-webkit-scrollbar {
		display: none;
	}

	.line {
		white-space: pre;
		display: block;
		min-height: 1.55em;
	}

	.input-row {
		display: flex;
		align-items: center;
		margin-top: 2px;
	}

	.prompt {
		white-space: pre;
		color: #33ff57;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.input-area {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
	}

	.cmd-input {
		background: transparent;
		border: none;
		outline: none;
		color: #33ff57;
		font-family: 'IBM Plex Mono', 'VT323', monospace;
		font-size: 14px;
		line-height: 1.55;
		width: 100%;
		caret-color: transparent;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.cursor {
		display: inline-block;
		width: 9px;
		height: 1.1em;
		background: #33ff57;
		box-shadow: 0 0 6px rgba(51, 255, 87, 0.9);
		margin-left: 1px;
		animation: blink 1.1s step-end infinite;
		vertical-align: text-bottom;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0; }
	}
</style>
