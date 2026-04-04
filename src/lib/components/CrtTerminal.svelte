<script lang="ts">
import { onMount, tick } from 'svelte';
import { MailClient } from '$lib/components/MailClient.js';
import { dispatch } from '$lib/engine/commands/index.js';
import { checkNewEvidence } from '$lib/engine/evidence.js';
import { GameState } from '$lib/engine/GameState.js';
import { VirtualFS } from '$lib/filesystem.js';
import { BOOT_SEQUENCE, EMAILS } from '$lib/game-data.js';

type ZorkEngine = {
	sendCommand(input: string): string[];
	getInitialText(): string[];
};

const HOME = '/home/sysadmin';
const TYPING_DELAY_MS = 10;
const BOOT_LINE_DELAY_MS = 90;

const vfs = new VirtualFS();
vfs.cd(HOME);
const gameState = GameState.load() ?? GameState.create();

function buildPrompt(): string {
	const cwd = vfs.pwd();
	const display =
		cwd === HOME ? '~' : cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd;
	return `sysadmin@zeroone:${display}> `;
}

let outputLines = $state<string[]>([]);
let inputValue = $state('');
let commandHistory = $state<string[]>([]);
let historyIndex = $state(-1);
let isBooting = $state(true);
let isTyping = $state(false);
let loginPhase = $state<'username' | 'password' | 'done'>('username');
let outputEl = $state<HTMLDivElement | undefined>();
let inputEl = $state<HTMLInputElement | undefined>();
let zorkActive = $state(false);
let zorkEngine = $state<ZorkEngine | null>(null);
let mailActive = $state(false);
let mailClient = $state<MailClient | null>(null);
const MAIL_VIEWPORT = 24;

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
	new Audio('/audio/win95.mp3').play().catch(() => {});
	for (const line of BOOT_SEQUENCE) {
		await appendLine(line.text);
		await sleep(BOOT_LINE_DELAY_MS);
	}
	await appendLine('');
	isBooting = false;
	loginPhase = 'username';
	inputEl?.focus();
}

async function handleLogin(value: string): Promise<void> {
	if (loginPhase === 'username') {
		await appendLine(`Login: ${value}`);
		loginPhase = 'password';
	} else if (loginPhase === 'password') {
		await appendLine(`Password: ${'*'.repeat(value.length)}`);
		loginPhase = 'done';
		await appendLine('');
		await appendLine('Last login: Mon Aug 11 08:23:14 1986');
		await appendLine('You have new mail.');
		new Audio('/audio/yougotmail.mp3').play().catch(() => {});
		await appendLine('');
	}
}

function scrollToBottom(): void {
	if (outputEl) {
		outputEl.scrollTop = outputEl.scrollHeight;
	}
}

function renderMailClient(): void {
	if (!mailClient) return;
	const lines =
		mailClient.getView() === 'inbox'
			? mailClient.renderInbox(MAIL_VIEWPORT)
			: mailClient.renderEmail(MAIL_VIEWPORT);
	outputLines = lines;
	tick().then(scrollToBottom);
}

async function handleMailKey(e: KeyboardEvent): Promise<void> {
	if (!mailClient) return;
	e.preventDefault();
	const action = mailClient.handleKey(e.key, e.ctrlKey);
	if (action === 'exit') {
		mailActive = false;
		mailClient = null;
		outputLines = [];
		await appendLine('[Mail closed]');
		await appendLine('');
	} else {
		renderMailClient();
	}
}

async function handleCommand(raw: string): Promise<void> {
	const cmd = raw.trim();

	await appendLine(`${buildPrompt()}${cmd}`);

	if (cmd === '') return;

	commandHistory = [cmd, ...commandHistory];
	historyIndex = -1;

	const result = dispatch(cmd, gameState, vfs, commandHistory);

	switch (result.type) {
		case 'lines':
			if (result.lines.length > 0) {
				await typeLines(result.lines);
			}
			break;
		case 'clear':
			outputLines = [];
			break;
		case 'mail':
			mailClient = new MailClient(EMAILS);
			mailActive = true;
			renderMailClient();
			break;
		case 'zork':
			await appendLine('Loading Zork I...');
			try {
				const { initZork } = await import('$lib/games/zork.js');
				const engine = await initZork();
				zorkEngine = engine;
				zorkActive = true;
				const opening = engine.getInitialText();
				for (const line of opening) {
					await appendLine(line);
				}
			} catch (err) {
				await appendLine(
					`zork: failed to load: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
			break;
		case 'not-found':
			await typeLines([`${cmd}: command not found`]);
			break;
	}

	// Post-command: check for new evidence
	const newEvidence = checkNewEvidence(gameState);
	for (const id of newEvidence) {
		await appendLine(`[EVIDENCE COLLECTED] ${id}`);
	}

	// Check chapter advancement
	if (gameState.canAdvance()) {
		gameState.advanceChapter();
		await appendLine('');
		await appendLine(`[CHAPTER ${gameState.chapter}]`);
	}

	// Save state
	gameState.save();
}

async function handleZorkInput(raw: string): Promise<void> {
	const input = raw.trim();

	if (input.toLowerCase() === 'quit') {
		await appendLine('>quit');
		if (zorkEngine) {
			const lines = zorkEngine.sendCommand('quit');
			for (const line of lines) {
				await appendLine(line);
			}
		}
		zorkActive = false;
		zorkEngine = null;
		await appendLine('');
		await appendLine('[Returned to ZeroOne terminal]');
		return;
	}

	await appendLine(`>${input}`);
	if (zorkEngine) {
		const lines = zorkEngine.sendCommand(input);
		for (const line of lines) {
			await appendLine(line);
		}
	}
}

async function onKeyDown(e: KeyboardEvent): Promise<void> {
	if (isBooting || isTyping) return;

	if (mailActive) {
		await handleMailKey(e);
		return;
	}

	if (e.key === 'Enter') {
		const val = inputValue;
		inputValue = '';
		if (loginPhase !== 'done') {
			await handleLogin(val);
			return;
		}
		if (zorkActive) {
			await handleZorkInput(val);
			return;
		}
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
	<div class="monitor-body">
		<div class="monitor-top">
			<div class="vent-slots" aria-hidden="true">
				{#each Array(8) as _}
					<div class="vent"></div>
				{/each}
			</div>
		</div>
		<div class="crt-screen">
			<div class="screen-glass" aria-hidden="true"></div>
			<div class="scanlines" aria-hidden="true"></div>

			<div class="terminal" bind:this={outputEl}>
			{#each outputLines as line}
				<div class="line">{line || '\u00a0'}</div>
			{/each}

			{#if !isBooting}
				<div class="input-row">
					{#if !mailActive}
						{#if loginPhase === 'done' && zorkActive}
							<span class="prompt">{'>'}</span>
							<span class="typed-text">{inputValue}</span>
						{:else if loginPhase === 'done'}
							<span class="prompt">{buildPrompt()}</span>
							<span class="typed-text">{inputValue}</span>
						{:else if loginPhase === 'password'}
							<span class="prompt">Password: </span>
							<span class="typed-text">{'*'.repeat(inputValue.length)}</span>
						{:else}
							<span class="prompt">Login: </span>
							<span class="typed-text">{inputValue}</span>
						{/if}
						<span class="cursor" aria-hidden="true"></span>
					{/if}
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
				</div>
			{/if}
		</div>
		</div>
		<div class="postit" aria-label="Post-it note with login credentials">
			<div class="postit-text">
				<span class="postit-title">LOGIN:</span>
				<span>user: sysadmin</span>
				<span>pass: tacos123</span>
			</div>
		</div>
		<div class="monitor-bottom">
			<div class="monitor-label">SparkStation One</div>
			<div class="monitor-controls" aria-hidden="true">
				<div class="knob"></div>
				<div class="knob"></div>
				<div class="power-led"></div>
			</div>
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

	.monitor-body {
		position: relative;
		width: 100%;
		max-width: 960px;
		height: 100%;
		max-height: 760px;
		background: linear-gradient(180deg, #d4cfc0 0%, #c8c2b0 30%, #b8b2a0 100%);
		border-radius: 18px 18px 12px 12px;
		padding: 12px 28px 8px;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.15);
	}

	.monitor-top {
		display: flex;
		justify-content: center;
		padding-bottom: 8px;
	}

	.vent-slots {
		display: flex;
		gap: 6px;
	}

	.vent {
		width: 28px;
		height: 3px;
		background: linear-gradient(180deg, #9a9588 0%, #b0aa98 100%);
		border-radius: 1px;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.3);
	}

	.crt-screen {
		position: relative;
		width: 100%;
		flex: 1;
		background: #0a0a0a;
		border-radius: 20px / 18px;
		overflow: hidden;
		box-shadow:
			inset 0 0 60px rgba(0, 0, 0, 0.8),
			0 0 0 3px #2a2a2a,
			0 0 0 5px #1a1a1a,
			0 0 30px 4px rgba(0, 255, 70, 0.08);
	}

	.screen-glass {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at 30% 25%,
			rgba(255, 255, 255, 0.06) 0%,
			transparent 50%
		);
		border-radius: 20px / 18px;
		pointer-events: none;
		z-index: 12;
	}

	.crt-screen::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 55%,
			rgba(0, 0, 0, 0.5) 100%
		);
		border-radius: 20px / 18px;
		pointer-events: none;
		z-index: 10;
	}

	.crt-screen::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(0, 255, 70, 0.02);
		border-radius: 20px / 18px;
		pointer-events: none;
		z-index: 11;
		animation: flicker 0.15s infinite steps(1);
	}

	.monitor-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 8px 6px;
	}

	.monitor-label {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: #7a7568;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.monitor-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.knob {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: linear-gradient(145deg, #8a8578, #6a6458);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.4),
			inset 0 1px 1px rgba(255, 255, 255, 0.15);
		border: 1px solid #5a5448;
	}

	.power-led {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #33ff57;
		box-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.postit {
		position: absolute;
		right: -40px;
		top: 15%;
		width: 120px;
		padding: 12px 10px 14px;
		background: linear-gradient(135deg, #ffef82 0%, #f8e45c 100%);
		box-shadow:
			2px 3px 8px rgba(0, 0, 0, 0.3),
			inset 0 -2px 3px rgba(0, 0, 0, 0.05);
		transform: rotate(4deg);
		z-index: 20;
		border-radius: 1px;
	}

	.postit::before {
		content: '';
		position: absolute;
		top: 0;
		left: 10%;
		right: 10%;
		height: 14px;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 0 0 2px 2px;
	}

	.postit-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-family: 'Comic Sans MS', 'Marker Felt', cursive;
		font-size: 12px;
		color: #333;
		line-height: 1.4;
	}

	.postit-title {
		font-weight: 700;
		font-size: 11px;
		text-transform: uppercase;
		color: #c00;
		text-decoration: underline;
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

	.typed-text {
		white-space: pre;
		color: #33ff57;
		text-shadow:
			0 0 4px rgba(51, 255, 87, 0.8),
			0 0 10px rgba(51, 255, 87, 0.4);
	}

	.cmd-input {
		position: absolute;
		left: -9999px;
		opacity: 0;
		width: 0;
		height: 0;
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
