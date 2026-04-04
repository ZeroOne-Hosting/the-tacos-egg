import type { EMAILS } from '$lib/game-data.js';

type MailView = 'inbox' | 'reading';

export type MailAction = 'inbox' | 'reading' | 'exit';

const HEADER_LINES = 3; // header + separator + blank
const FOOTER_LINES = 2; // separator + status bar

export class MailClient {
	private emails: typeof EMAILS;
	private selectedIndex: number = 0;
	private view: MailView = 'inbox';
	private scrollOffset: number = 0;

	constructor(emails: typeof EMAILS) {
		this.emails = emails;
	}

	getView(): MailView {
		return this.view;
	}

	getSelectedIndex(): number {
		return this.selectedIndex;
	}

	/**
	 * Returns lines to fill the inbox view at the given viewport height.
	 * The caller is responsible for displaying exactly `viewportLines` rows.
	 */
	renderInbox(viewportLines: number): string[] {
		const count = this.emails.length;

		const header = `Mail \u2014 ${count} message${count === 1 ? '' : 's'}`;
		const separator = '\u2500'.repeat(60);
		const columnHeader = ' F  #  From                           Date         Subject';

		const lines: string[] = [header, separator, columnHeader, ''];

		for (let i = 0; i < this.emails.length; i++) {
			const e = this.emails[i];
			const flag = e.id === 1 ? 'N' : ' ';
			const selector = i === this.selectedIndex ? '>' : ' ';
			const from = e.from.slice(0, 30).padEnd(30);
			const date = e.date.slice(0, 12);
			const subject = e.subject.slice(0, 30);
			lines.push(`${selector} ${flag} ${String(e.id).padEnd(2)} ${from} ${date}  "${subject}"`);
		}

		// Pad to fill viewport minus footer
		const contentHeight = viewportLines - FOOTER_LINES;
		while (lines.length < contentHeight) {
			lines.push('');
		}

		// Footer
		lines.push('\u2500'.repeat(60));
		lines.push(' ^C Exit   \u2191\u2193 Navigate   Enter Read');

		return lines.slice(0, viewportLines);
	}

	/**
	 * Returns lines to fill the email reading view at the given viewport height.
	 */
	renderEmail(viewportLines: number): string[] {
		const email = this.emails[this.selectedIndex];
		if (!email) return [];

		const bodyLines = email.body.split('\n');
		const contentHeight = viewportLines - HEADER_LINES - FOOTER_LINES;

		const subject = `Subject: ${email.subject}`;
		const separator = '\u2500'.repeat(60);

		const visibleBody = bodyLines.slice(this.scrollOffset, this.scrollOffset + contentHeight);

		const lines: string[] = [subject, separator, '', ...visibleBody];

		// Pad to fill
		while (lines.length < viewportLines - FOOTER_LINES) {
			lines.push('');
		}

		lines.push('\u2500'.repeat(60));

		const canScrollUp = this.scrollOffset > 0;
		const canScrollDown = this.scrollOffset + contentHeight < bodyLines.length;
		const scrollHint =
			canScrollUp && canScrollDown
				? ' \u2191\u2193 Scroll'
				: canScrollDown
					? ' \u2193 More'
					: canScrollUp
						? ' \u2191 Scroll'
						: '';
		lines.push(` ^C Exit   Esc Back${scrollHint}`);

		return lines.slice(0, viewportLines);
	}

	/**
	 * Process a keypress. Returns the resulting action/state.
	 */
	handleKey(key: string, ctrl: boolean): MailAction {
		if (ctrl && key === 'c') {
			return 'exit';
		}

		if (this.view === 'inbox') {
			return this.handleInboxKey(key);
		}
		return this.handleReadingKey(key);
	}

	private handleInboxKey(key: string): MailAction {
		if (key === 'ArrowUp') {
			this.selectedIndex = Math.max(0, this.selectedIndex - 1);
			return 'inbox';
		}
		if (key === 'ArrowDown') {
			this.selectedIndex = Math.min(this.emails.length - 1, this.selectedIndex + 1);
			return 'inbox';
		}
		if (key === 'Enter') {
			this.view = 'reading';
			this.scrollOffset = 0;
			return 'reading';
		}
		return 'inbox';
	}

	private handleReadingKey(key: string): MailAction {
		if (key === 'Escape') {
			this.view = 'inbox';
			return 'inbox';
		}
		if (key === 'ArrowUp') {
			this.scrollOffset = Math.max(0, this.scrollOffset - 1);
			return 'reading';
		}
		if (key === 'ArrowDown') {
			const email = this.emails[this.selectedIndex];
			if (email) {
				const bodyLines = email.body.split('\n');
				this.scrollOffset = Math.min(bodyLines.length - 1, this.scrollOffset + 1);
			}
			return 'reading';
		}
		return 'reading';
	}
}
