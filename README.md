# dosye

Count how many times words appear in your local AI chat history.

## Supports

- `copilot`
- `claudecode`
- `codex`
- `opencode`
- `cursor` (not implemented yet)

## Quick start

```bash
pnpm install
pnpm build
node dist/cli.js copilot --words=fix,bug
```

For development:

```bash
pnpm dev -- copilot --words=fix,bug
```

Usage:
```bash
<command> <agent> --words=word1,word2,word3
```

