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
    rm -rf node_modules .svelte-kit build

format:
    @echo "No formatter configured"

lint:
    @echo "No linter configured"
