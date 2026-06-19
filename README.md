# dosye

Count how many times words appear in your local AI chat history.

<image src="assets/dosye.jpg"></image>

## Supported agents

| Agent | Status |
|---|---|
| `copilot` | ✅ |
| `claudecode` | ✅ |
| `codex` | ✅ |
| `opencode` | ✅ |
| `cursor` | 🚧 not implemented yet |

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10 — install with `npm install -g pnpm`

## Usage

```bash
dosye <agent> --words=word1,word2,word3
```

**Example** — count how often you write "fix" or "bug" in your Copilot history:

```bash
dosye copilot --words=fix,bug
```

## Use with `npx`
```bash
npx dosye-ai@latest <agent> --words=word1,word2,...
```

## Quick start

```bash
pnpm install
pnpm build

# Run directly
node dist/cli.js copilot --words=fix,bug

# Or install globally as the `dosye` command
pnpm link --global
dosye copilot --words=fix,bug
```

## Development

```bash
# Install dependencies
pnpm install

# Run without compiling (via tsx)
pnpm dev -- copilot --words=fix,bug

# Compile TypeScript → dist/
pnpm build

# Run tests
pnpm test
```

## License

[ISC](./LICENSE)
