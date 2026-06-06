#!/usr/bin/env node
import { Command, Argument } from "commander";
import { input } from "@inquirer/prompts";
import { handleAgents } from "./utils.js";

const agents = ["opencode", "copilot", "claudecode", "codex", "cursor", "pi"];

const program = new Command();

program
    .name("dosye")
    .description("Count word frequencies across local AI chat histories")
    .showHelpAfterError()
    .addArgument(
        new Argument("<agent...>", "one or more agents to analyze").choices(agents)
    )
    .option("-w, --words <words>", "comma-separated list of words to count")
    .action(async (agentArgs: string[], options: { words?: string }) => {
        let words = options.words ? splitWords(options.words) : [];

        if (words.length === 0) {
            const wordsInput = await input({
                message: "Words to scan for (comma separated):",
                validate: value => splitWords(value).length > 0 || "Enter at least one word.",
            });
            words = splitWords(wordsInput);
        }

        agentArgs.forEach(agent => handleAgents(agent, agents, words));
    });

program.parse();

function splitWords(value: string) {
    return value
        .split(",")
        .map(word => word.trim())
        .filter(Boolean);
}
