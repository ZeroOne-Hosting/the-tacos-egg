# The Taco's Egg

A web-based adventure game where you play as a sysadmin at ZeroOne Hosting — a gloriously terrible hosting company run out of a garage in Longview, Washington. Someone used $0.75 of unauthorized compute time. You're going to find out who.

Inspired by Cliff Stoll's [The Cuckoo's Egg](https://www.amazon.com/Cuckoos-Egg-Tracking-Computer-Espionage/dp/1416507787).

## The Setup

You boot up your SparkStation One terminal running ZORK v2.1 (Zero One Recovery Kernel). There's a post-it note stuck to the side of the monitor with the login credentials. You check your mail. Between the Taco Bell group order and the garage door complaint, there's a billing alert: $0.75 is missing. Nobody else cares. You do.

## Features

- **Retro CRT terminal** — phosphor glow, scanlines, screen curvature, blinking cursor
- **Physical monitor housing** — beige bezel, vent slots, knobs, power LED, post-it note
- **Interactive login** — username/password prompt before shell access
- **Terminal commands** — `mail`, `read`, `who`, `ps`, `date`, `clear`, `tacos`, `zork`, `help`
- **Procedural generation** — `who` and `ps` output randomized every time with homelab users running increasingly suspicious programs
- **Zork I** — fully playable via the ifvms Z-machine interpreter, type `zork` to play
- **TACO** (Taco Automated Curro Ordering) — because the staff runs on Taco Bell

## Stack

- [SvelteKit](https://svelte.dev) + [shadcn-svelte](https://next.shadcn-svelte.com)
- [ifvms](https://github.com/curiousdannii/ifvms.js) — Z-machine interpreter for Zork
- [Bun](https://bun.sh) — runtime and package manager
- [just](https://github.com/casey/just) — command runner

## Getting Started

```sh
# install dependencies
bun install

# start dev server
just dev

# or without just
bun run dev
```

## Available Commands

```
just dev       # start dev server
just build     # production build
just preview   # preview production build
just check     # run svelte-check
just clean     # remove build artifacts
```

## Lore

- **ZeroOne Hosting** — "If you have a problem, if no one else will host your shit, and if you don't mind our low standards... maybe you can hire ZeroOne."
- **Backup power** — Electric Hyundai Kona
- **Network** — 3 of 7 neighbor WiFi connections
- **Cooling** — garage door (open)
- **Cosworth** controls the garage door opener
- **mr.pink** controls the disco ball
- **Dirk** has the API docs. Dirk is on vacation. No ETA.
