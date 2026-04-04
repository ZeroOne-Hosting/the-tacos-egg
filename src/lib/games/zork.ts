/*
 * Zork integration using ifvms ZVM + a custom in-memory GlkOte.
 *
 * Data flow:
 *   initZork()          → fetch .z3 → vm.prepare() → Glk.init() → vm.init()
 *                         → VM runs until glk_select → Glk.update()
 *                         → captureGlkOte captures output lines
 *   ZorkEngine.send()   → captureGlkOte.sendLine(input) → accept_ui_event('line')
 *                         → VM.resume() → runs until glk_select → Glk.update()
 *                         → returns captured lines
 */

// --------------------------------------------------------------------------
// Minimal stub Dialog (no file I/O — save/restore not supported)
// --------------------------------------------------------------------------

const StubDialog = {
	streaming: false,
	file_ref_exists: () => false,
	file_read: () => null,
	file_write: () => undefined,
	file_construct_ref: () => null,
	file_construct_temp_ref: () => null,
	file_fopen: () => null,
};

// --------------------------------------------------------------------------
// In-memory GlkOte — captures text output, feeds line input synchronously
// --------------------------------------------------------------------------

class CaptureGlkOte {
	private _iface: { accept: (res: object) => void } | null = null;
	private _generation = 0;
	private _pendingLines: string[] = [];
	private _windowId: number | null = null;
	private _waitingForLine = false;

	/** Called by Glk.init() to set up the interface */
	init(iface: { accept: (res: object) => void }) {
		this._iface = iface;
		this._iface.accept({
			type: 'init',
			gen: this._generation,
			metrics: {
				buffercharheight: 1,
				buffercharwidth: 1,
				buffermarginx: 0,
				buffermarginy: 0,
				graphicsmarginx: 0,
				graphicsmarginy: 0,
				gridcharheight: 1,
				gridcharwidth: 1,
				gridmarginx: 0,
				gridmarginy: 0,
				height: 24,
				inspacingx: 0,
				inspacingy: 0,
				outspacingx: 0,
				outspacingy: 0,
				width: 80,
			},
			support: [],
		});
	}

	/** Called by Glk.update() / the VM after each run cycle */
	update(data: {
		type: string;
		gen: number;
		windows?: Array<{ id: number; type: string }>;
		content?: Array<{
			id: number;
			text?: Array<{ append?: boolean; content?: unknown[] }>;
		}>;
		input?: Array<{ id: number; type: string }>;
	}) {
		if (data.type === 'error') {
			throw new Error(`ZVM error: ${JSON.stringify(data)}`);
		}
		if (data.type !== 'update' && data.type !== 'exit') {
			return;
		}

		this._generation = data.gen;

		if (data.windows) {
			for (const win of data.windows) {
				if (win.type === 'buffer') {
					this._windowId = win.id;
				}
			}
		}

		if (data.content) {
			for (const block of data.content) {
				if (block.id !== this._windowId) continue;
				if (!block.text) continue;
				for (const lineObj of block.text) {
					const line = this._extractText(lineObj);
					if (lineObj.append && this._pendingLines.length > 0) {
						this._pendingLines[this._pendingLines.length - 1] += line;
					} else {
						this._pendingLines.push(line);
					}
				}
			}
		}

		this._waitingForLine = false;
		if (data.input) {
			for (const inp of data.input) {
				if (inp.type === 'line') {
					this._waitingForLine = true;
				}
			}
		}
	}

	sendLine(input: string): void {
		if (!this._iface || this._windowId === null) return;
		this._iface.accept({
			type: 'line',
			gen: this._generation,
			window: this._windowId,
			value: input,
		});
	}

	drainLines(): string[] {
		const lines = this._pendingLines;
		this._pendingLines = [];
		return lines;
	}

	isWaitingForLine(): boolean {
		return this._waitingForLine;
	}

	private _extractText(lineObj: { content?: unknown[] }): string {
		if (!lineObj.content) return '';
		let text = '';
		const content = lineObj.content;
		for (let i = 0; i < content.length; i++) {
			const item = content[i];
			if (typeof item === 'string') {
				i++;
				if (i < content.length) {
					text += String(content[i]);
				}
			} else if (item && typeof item === 'object' && 'text' in (item as object)) {
				text += String((item as { text: string }).text);
			}
		}
		return text;
	}

	error(msg: string) {
		throw new Error(msg);
	}
	log() {}
	warning() {}
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

export class ZorkEngine {
	private _glkOte: CaptureGlkOte;

	constructor(glkOte: CaptureGlkOte) {
		this._glkOte = glkOte;
	}

	getInitialText(): string[] {
		return this._glkOte.drainLines();
	}

	sendCommand(input: string): string[] {
		if (!this._glkOte.isWaitingForLine()) return [];
		this._glkOte.sendLine(input);
		return this._glkOte.drainLines();
	}

	isActive(): boolean {
		return this._glkOte.isWaitingForLine();
	}
}

/** Load the game file and start the VM. Resolves with a ZorkEngine. */
export async function initZork(): Promise<ZorkEngine> {
	// Dynamic imports — vendored glkapi.js exports a factory function
	const [{ default: createGlk }, ifvmsModule] = await Promise.all([
		import('$lib/vendor/glkapi.js'),
		import('ifvms'),
	]);

	// Create a fresh Glk instance (evaluated in sloppy mode via Function constructor)
	// biome-ignore lint/suspicious/noExplicitAny: glkote-term lacks TypeScript declarations
	const Glk = (createGlk as any)();

	// biome-ignore lint/suspicious/noExplicitAny: ifvms lacks TypeScript declarations
	const ZVM = ((ifvmsModule as any).default ?? ifvmsModule).ZVM;

	const response = await fetch('/games/zork1.z3');
	if (!response.ok) {
		throw new Error(`Failed to load Zork game file: ${response.status} ${response.statusText}`);
	}
	const buffer = await response.arrayBuffer();
	const data = new Uint8Array(buffer);

	const glkOte = new CaptureGlkOte();
	const vm = new ZVM();

	const options = {
		vm,
		Dialog: StubDialog,
		Glk,
		GlkOte: glkOte,
	};

	vm.prepare(data, options);
	Glk.init(options);

	return new ZorkEngine(glkOte);
}
