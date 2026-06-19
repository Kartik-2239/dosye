import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = resolve(root, "src/cli.ts");
const tsx = resolve(root, "node_modules/.bin/tsx");

function run(args: string[], env?: NodeJS.ProcessEnv) {
    return spawnSync(tsx, [cli, ...args], { encoding: "utf8", cwd: root, timeout: 8000, env: env ?? process.env });
}

describe("CLI argument handling", () => {
    it("exits 0 and prints usage with --help", () => {
        const { status, stdout } = run(["--help"]);
        expect(status).toBe(0);
        expect(stdout).toContain("Usage:");
        expect(stdout).toContain("--words");
    });

    it("--help lists all valid agents as choices", () => {
        const { stdout } = run(["--help"]);
        for (const agent of ["opencode", "copilot", "claudecode", "codex", "cursor"]) {
            expect(stdout).toContain(agent);
        }
    });

    it("exits 1 with no arguments and shows help", () => {
        const { status, stderr } = run([]);
        expect(status).toBe(1);
        expect(stderr).toContain("missing required argument");
        expect(stderr).toContain("Usage:");
    });

    it("exits 1 with an unrecognised agent and shows help", () => {
        const { status, stderr } = run(["badagent"]);
        expect(status).toBe(1);
        expect(stderr).toContain("badagent");
        expect(stderr).toContain("Usage:");
    });

    it("accepts multiple valid agents without a usage error", { timeout: 15000 }, () => {
        // Agents will look for history files and may find none — that's fine.
        // We only assert commander doesn't reject the invocation itself.
        // Use a hermetic temp HOME so agents find no real history dirs.
        const tmp = mkdtempSync(`${tmpdir()}/dosye-test-`);
        const { stderr } = run(["copilot", "claudecode", "--words", "fix"], {
            ...process.env,
            HOME: tmp,
            USERPROFILE: tmp,
        });
        expect(stderr).not.toContain("invalid for argument");
        expect(stderr).not.toContain("missing required argument");
    });
});
