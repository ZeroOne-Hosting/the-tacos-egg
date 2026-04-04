import { describe, expect, it } from 'vitest';
import { MailClient } from '$lib/components/MailClient.js';
import { EMAILS } from '$lib/game-data.js';

const VIEWPORT = 24;

describe('MailClient — initial state', () => {
	it('starts in inbox view', () => {
		const client = new MailClient(EMAILS);
		expect(client.getView()).toBe('inbox');
	});

	it('starts with first email selected', () => {
		const client = new MailClient(EMAILS);
		expect(client.getSelectedIndex()).toBe(0);
	});
});

describe('MailClient — inbox navigation', () => {
	it('ArrowDown moves selection down', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('ArrowDown', false);
		expect(client.getSelectedIndex()).toBe(1);
	});

	it('ArrowUp moves selection up', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('ArrowDown', false);
		client.handleKey('ArrowDown', false);
		client.handleKey('ArrowUp', false);
		expect(client.getSelectedIndex()).toBe(1);
	});

	it('ArrowUp clamps at 0', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('ArrowUp', false);
		expect(client.getSelectedIndex()).toBe(0);
	});

	it('ArrowDown clamps at last email', () => {
		const client = new MailClient(EMAILS);
		const lastIndex = EMAILS.length - 1;
		for (let i = 0; i <= lastIndex + 5; i++) {
			client.handleKey('ArrowDown', false);
		}
		expect(client.getSelectedIndex()).toBe(lastIndex);
	});

	it('returns inbox action while navigating', () => {
		const client = new MailClient(EMAILS);
		expect(client.handleKey('ArrowDown', false)).toBe('inbox');
		expect(client.handleKey('ArrowUp', false)).toBe('inbox');
	});
});

describe('MailClient — opening an email', () => {
	it('Enter switches to reading view', () => {
		const client = new MailClient(EMAILS);
		const action = client.handleKey('Enter', false);
		expect(action).toBe('reading');
		expect(client.getView()).toBe('reading');
	});

	it('opens the currently selected email', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('ArrowDown', false);
		client.handleKey('Enter', false);
		expect(client.getSelectedIndex()).toBe(1);
		const lines = client.renderEmail(VIEWPORT);
		expect(lines.some((l) => l.includes(EMAILS[1].subject))).toBe(true);
	});
});

describe('MailClient — reading view navigation', () => {
	function openFirst() {
		const client = new MailClient(EMAILS);
		client.handleKey('Enter', false);
		return client;
	}

	it('Escape goes back to inbox', () => {
		const client = openFirst();
		const action = client.handleKey('Escape', false);
		expect(action).toBe('inbox');
		expect(client.getView()).toBe('inbox');
	});

	it('ArrowDown scrolls down and returns reading', () => {
		const client = openFirst();
		const action = client.handleKey('ArrowDown', false);
		expect(action).toBe('reading');
	});

	it('ArrowUp at offset 0 clamps and returns reading', () => {
		const client = openFirst();
		const action = client.handleKey('ArrowUp', false);
		expect(action).toBe('reading');
	});

	it('scroll offset increases on ArrowDown', () => {
		const client = openFirst();
		client.handleKey('ArrowDown', false);
		// render should differ from offset=0
		const linesAfterScroll = client.renderEmail(VIEWPORT);
		const clientFresh = openFirst();
		const linesAtStart = clientFresh.renderEmail(VIEWPORT);
		expect(linesAfterScroll).not.toEqual(linesAtStart);
	});
});

describe('MailClient — exit', () => {
	it('Ctrl-C returns exit from inbox', () => {
		const client = new MailClient(EMAILS);
		expect(client.handleKey('c', true)).toBe('exit');
	});

	it('Ctrl-C returns exit from reading view', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('Enter', false);
		expect(client.handleKey('c', true)).toBe('exit');
	});
});

describe('MailClient — rendering', () => {
	it('renderInbox returns exactly viewportLines lines', () => {
		const client = new MailClient(EMAILS);
		const lines = client.renderInbox(VIEWPORT);
		expect(lines.length).toBe(VIEWPORT);
	});

	it('renderEmail returns exactly viewportLines lines', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('Enter', false);
		const lines = client.renderEmail(VIEWPORT);
		expect(lines.length).toBe(VIEWPORT);
	});

	it('inbox shows > indicator on selected row', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('ArrowDown', false);
		const lines = client.renderInbox(VIEWPORT);
		const selectedLine = lines.find((l) => l.startsWith('>'));
		expect(selectedLine).toBeDefined();
		expect(selectedLine).toContain(EMAILS[1].from.slice(0, 10));
	});

	it('inbox status bar contains navigation hints', () => {
		const client = new MailClient(EMAILS);
		const lines = client.renderInbox(VIEWPORT);
		const last = lines[lines.length - 1];
		expect(last).toContain('^C');
		expect(last).toContain('Enter');
	});

	it('reading status bar contains exit and back hints', () => {
		const client = new MailClient(EMAILS);
		client.handleKey('Enter', false);
		const lines = client.renderEmail(VIEWPORT);
		const last = lines[lines.length - 1];
		expect(last).toContain('^C');
		expect(last).toContain('Esc');
	});
});
