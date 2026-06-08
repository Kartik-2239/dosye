# dosye

Count how many times words appear in your local AI chat history.

<image src="assets/dosye.jpg"></image>

## Supports

- `copilot`
- `claudecode`
- `codex`
- `opencode`
- `cursor` (not implemented yet)

## Use with `npx`
```bash
npx dosye-ai@latest <agent> --words=word1,word2,...
```

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

