set shell := ["pwsh", "-NoProfile", "-Command"]

default: dev

dev:
    bun run dev

build:
    bun run build

preview:
    bun run preview

check:
    bun run check

install:
    bun install

clean:
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules, .svelte-kit, build

format:
    bunx biome check --write .

lint:
    bunx biome check .

test:
    bun run vitest run

test-watch:
    bun run vitest

ci: check lint test build
