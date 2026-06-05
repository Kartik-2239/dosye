import chalk from "chalk";
import { getOpencodeCount } from "./opencode.js";
import { getCodexCount } from "./codex.js";
import { getCopilotCount } from "./copilot.js";
import { getClaudeCount } from "./claudecode.js";

export function logWordCounts(agent: string, counts: Record<string, number> | undefined) {
    console.log(`Word counts for ${chalk.redBright(agent)}:\n`);
    if (!counts) {
        console.log("No data available.");
        return;
    }
    // const words = Object.keys(counts);
    // const count = Object.values(counts)
    // console.log(words)
    // console.log(count)
    const maxw = 15

    for (const [word, count] of Object.entries(counts)) {
        console.log(`     ${chalk.yellowBright(word.padEnd(maxw))} ${chalk.whiteBright(count.toString())}`);
    }
}

export function parseArgs(args: string[], agents: string[] = []): Record<string, string> {
    const result: Record<string, string> = {};
    const curAgents: string[] = []
    if (args.length === 0) {
        result["help"] = "true";
        return result;
    }
    args.forEach(arg => {
        const [key, value] = arg.split("=");
        if (key && value) {
            result[key.replace(/^--/, "")] = value;
        }
        if (agents.includes(arg)) {
            curAgents.push(arg);
        }
        if (arg === "--help") {
            result["help"] = "true";
        }
    });
    if (curAgents.length > 0) {
        result["agents"] = curAgents.join(",");
    }
    return result;
}


export function handleAgents(command: string, agents: string[], words: string[]) {
    switch (command) {
    case "--help":
        console.log("Usage: dosye <command> <options>");
        console.log("--words=word1,word2,...   Specify a comma-separated list of words")
        console.log("Commands:");
        agents.forEach(agent => console.log(`  - ${agent}`));
        break;
    case "opencode":
        logWordCounts("opencode", getOpencodeCount(words));
        break;
    case "copilot":
        logWordCounts("copilot", getCopilotCount(words));
        break;
    case "codex":
        logWordCounts("codex", getCodexCount(words));
        break
    case "cursor":
        console.log("Coming soon...");
        // Windows: %APPDATA%\Cursor\User\workspaceStorage
        // macOS: ~/Library/Application Support/Cursor/User/workspaceStorage
        // Linux: ~/.config/Cursor/User/workspaceStorage
        break;
    case "claudecode":
        logWordCounts("claudecode", getClaudeCount(words));
        break;
    default:
        console.log(`Unknown command: ${command}`);
        console.log("Usage: dosye <command> <options>");
        console.log("--words=word1,word2,...   Specify a comma-separated list of words")
        console.log("Commands:");
        agents.forEach(agent => console.log(`  - ${agent}`));
        break
}

}
