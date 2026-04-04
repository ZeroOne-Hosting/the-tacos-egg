const STORAGE_KEY = 'tacos-egg-save';

export interface GameStateData {
	chapter: number;
	evidence: string[];
	flags: Record<string, boolean>;
	deliveredEmails: number[];
	readEmails: number[];
	gameStartedAt: number;
	lastSavedAt: number;
}

function freshData(): GameStateData {
	return {
		chapter: 1,
		evidence: [],
		flags: {},
		deliveredEmails: [],
		readEmails: [],
		gameStartedAt: Date.now(),
		lastSavedAt: Date.now(),
	};
}

export class GameState {
	private data: GameStateData;

	constructor(data?: GameStateData) {
		this.data = data ?? freshData();
	}

	// Flag management

	setFlag(flag: string): void {
		this.data.flags[flag] = true;
	}

	hasFlag(flag: string): boolean {
		return this.data.flags[flag] === true;
	}

	getFlags(): Record<string, boolean> {
		return { ...this.data.flags };
	}

	// Evidence management

	collectEvidence(id: string): boolean {
		if (this.data.evidence.includes(id)) return false;
		this.data.evidence.push(id);
		return true;
	}

	hasEvidence(id: string): boolean {
		return this.data.evidence.includes(id);
	}

	getEvidence(): string[] {
		return [...this.data.evidence];
	}

	// Chapter management

	get chapter(): number {
		return this.data.chapter;
	}

	advanceChapter(): void {
		this.data.chapter += 1;
	}

	canAdvance(): boolean {
		const f = (flag: string) => this.hasFlag(flag);
		switch (this.data.chapter) {
			case 1:
				return (
					f('found_discrepancy') &&
					f('found_gateway_pdx') &&
					(f('ran_last_cosworth') || f('fingered_cosworth'))
				);
			case 2:
				return f('found_suid_exploit') && f('found_rlogin_defense') && f('accessed_defense_files');
			case 3:
				return f('created_bait_file') && f('intruder_accessed_honeypot');
			case 4:
				return f('paulson_authorized') && f('sent_auth_to_sherry');
			case 5:
				return f('trace_2_international');
			case 6:
				return f('accepted_cert_coordination') && f('paulson_reengaged');
			case 7:
				return f('trace_3_complete') && f('identified_germany');
			case 8:
				return f('submitted_report');
			default:
				return false;
		}
	}

	// Email management

	deliverEmail(id: number): void {
		if (!this.data.deliveredEmails.includes(id)) {
			this.data.deliveredEmails.push(id);
		}
	}

	hasDeliveredEmail(id: number): boolean {
		return this.data.deliveredEmails.includes(id);
	}

	markEmailRead(id: number): void {
		if (!this.data.readEmails.includes(id)) {
			this.data.readEmails.push(id);
		}
	}

	hasReadEmail(id: number): boolean {
		return this.data.readEmails.includes(id);
	}

	getDeliveredEmails(): number[] {
		return [...this.data.deliveredEmails];
	}

	// Serialization

	serialize(): string {
		this.data.lastSavedAt = Date.now();
		return JSON.stringify(this.data);
	}

	static deserialize(json: string): GameState {
		const data = JSON.parse(json) as GameStateData;
		return new GameState(data);
	}

	save(): void {
		localStorage.setItem(STORAGE_KEY, this.serialize());
	}

	static load(): GameState | null {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		try {
			return GameState.deserialize(raw);
		} catch {
			return null;
		}
	}

	static create(): GameState {
		return new GameState();
	}
}
