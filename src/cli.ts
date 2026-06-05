#!/usr/bin/env node
import { handleAgents } from "./utils.js";
import { parseArgs } from "./utils.js";

const agents = ["opencode", "copilot", "claudecode", "codex", "cursor"]
var words: string[] = []
var curAgents: string[] = []

const [...args] = process.argv.slice(2);

const options = parseArgs(args, agents);
if (options.words) {
    words = options.words.split(",")
}
if (options.agents) {
    curAgents = options.agents?.split(",");
}else if (options.help) {
    handleAgents("--help", agents, words);
    process.exit(0);
}
curAgents.forEach(agent => {
    handleAgents(agent, agents, words);
    process.exit(0)
});