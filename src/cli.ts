#!/usr/bin/env node
import { handleAgents } from "./utils.js";
import { parseArgs } from "./utils.js";

const agents = ["opencode", "copilot", "claudecode", "codex", "cursor", "pi"]
var words: string[] = []
var curAgents: string[] = []

const [...args] = process.argv.slice(2);

const options = parseArgs(args, agents);
if (Object.keys(options).length === 0 || options.help) {
    handleAgents("--help", agents, words);
    process.exit(0);
}
if (options.words) {
    words = options.words.split(",")
}
if (options.agents) {
    curAgents = options.agents?.split(",");
}
curAgents.forEach(agent => {
    handleAgents(agent, agents, words);
});