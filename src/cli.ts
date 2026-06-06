#!/usr/bin/env node
import { checkbox, input } from "@inquirer/prompts";
import { handleAgents } from "./utils.js";
import { parseArgs } from "./utils.js";

const agents = ["opencode", "copilot", "claudecode", "codex", "cursor", "pi"]
// add antigravity ~/.gemini/antigravity-cli/history.jsonl only has user text lol
let words: string[] = []
let curAgents: string[] = []

const [...args] = process.argv.slice(2);

const options = parseArgs(args, agents);
if (options.help) {
    handleAgents("--help", agents, words);
    process.exit(0);
}
if (options.words) {
    words = splitWords(options.words)
}
if (options.agents) {
    curAgents = options.agents?.split(",");
}

if (curAgents.length === 0) {
    curAgents = await checkbox({
        message: "Agents to scan:",
        choices: agents.map(agent => ({ name: agent, value: agent })),
        validate: selected => selected.length > 0 || "Select at least one agent.",
    });
}

if (words.length === 0) {
    const wordsInput = await input({
        message: "Words to scan for (comma separated):",
        validate: value => splitWords(value).length > 0 || "Enter at least one word.",
    });
    words = splitWords(wordsInput);
}

curAgents.forEach(agent => handleAgents(agent, agents, words));

function splitWords(value: string) {
    return value
        .split(",")
        .map(word => word.trim())
        .filter(Boolean);
}
