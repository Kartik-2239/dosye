import chalk from "chalk";
import { getOpencodeCount } from "./agents/opencode.js";
import { getCodexCount } from "./agents/codex.js";
import { getCopilotCount } from "./agents/copilot.js";
import { getClaudeCount } from "./agents/claudecode.js";
import { getPiCount } from "./agents/pi.js";
import type { wordData } from "./types.js";

/** Supported AI agents that dosye can analyse. */
export enum Agent {
    Opencode = "opencode",
    Copilot = "copilot",
    Claudecode = "claudecode",
    Codex = "codex",
    Cursor = "cursor",
    Pi = "pi",
}

const intensityColorMap: Record<number, any> = {
        0: chalk.rgb(193, 193, 193),
        1: chalk.rgb(74, 209, 254),
        2: chalk.rgb(33, 91, 199),
        3: chalk.rgb(0, 71, 125)
    }

/**
 * Print word counts and an activity graph for an agent to stdout.
 * Shows a score bar, first-scan date, per-word totals, and a 12-month
 * GitHub-style contribution calendar derived from the time-series data.
 * @param agent  - Agent name used in the header line.
 * @param counts - Map of word → `wordData[]` entries, or `undefined` if unavailable.
 */
export function logWordCounts(agent: string, counts: Record<string, wordData[]> | undefined) {
    // console.log("counts: ", counts)
    console.log()
    const words = Object.keys(counts ?? {}).length;
    console.log(` Scanned ${words} words\n`)
    console.log(` Agent ${intensityColorMap[1](agent.slice(0, 1).toUpperCase() + agent.slice(1))}\n`);
    console.log(` ${(0.000005*words).toFixed(6)} ml ${intensityColorMap[1]("water")} used\n`)

    const key1 = Object.keys(counts ?? {})[0]
    let totalDays = 0;
    let totalCount = Object.values(counts ?? {}).reduce((acc, data) => acc + data.reduce((a, d) => a + d.count, 0), 0);
    if (key1 !== undefined && counts) {
        const t = counts[key1]?.sort((a, b) => a.time -  b.time)[0]?.time//.reduce()//[0]?.time;
        if (t) {
            totalDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
            console.log(` First scanned data from ${new Date(t).toLocaleDateString()} (${Math.floor(totalDays)} days ago)\n`)
        }
    }

    renderScore(Math.floor((((totalCount * 2)/ words) / (totalDays || 1)) * 100));

    console.log();

    if (!counts) {
        console.log("No data available.");
        return;
    }
    const maxw = 15
    for (const [word, count] of Object.entries(counts)) {
        console.log(`  ${intensityColorMap[1](word.padEnd(maxw))} ${chalk.whiteBright(count.reduce((acc, data) => acc + data.count, 0))}`);
    }
    console.log();

    renderGrapth(counts);
}


function renderScore(percent: number, size = 30) {
    if (percent > 100) {
        percent = 100;
    }
    const filled = Math.round((percent / 100) * size);
    const empty = size - filled;

    const bar = intensityColorMap[1]("█".repeat(filled)) + "░".repeat(empty);
    console.log(` ${percent} / 100`)
    console.log(` ${bar}`);
}


function renderGrapth(counts: Record<string, wordData[]> | undefined) {
    const dayMap: Record<string, number> = {};
    for (const [word, data] of Object.entries(counts ?? {})) {
        data.forEach(item => {
            const date = new Date(item.time);
            const d = date.toISOString()
            if (dayMap[d] !== undefined) {
                dayMap[d] += item.count;
            }else {
                dayMap[d] = item.count;
            }
        })
    }
    let sorted = Object.fromEntries(
        Object.entries(dayMap).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    );
    const maxMonths = 12
    const lastMonth = new Date().getTime() - maxMonths * 30 * 24 * 60 * 60 * 1000;

    sorted = Object.fromEntries(
        Object.entries(sorted).filter(([date, count]) => {
            return new Date(date).getTime() >= lastMonth;
        })
    )
    if (Object.keys(sorted).length === 0) {
        console.log(`No data in the last ${maxMonths} months to render graph.`);
        return;
    }
    let first = Object.keys(sorted)[0];
    let last = Object.keys(sorted)[Object.keys(sorted).length - 1];
    if (first) {
        const firstDate = new Date(first);
        if (firstDate.getDate() !== 1){
            for (let i = firstDate.getDate(); i > 0; i--) {
                const d = new Date(firstDate.getFullYear(), firstDate.getMonth(), i).toISOString();
                sorted = { [d]: 0, ...sorted };
                first = d;
            }
        }
    }

    // console.log(sorted)
    const months = new Set<string>();
    Object.keys(sorted).forEach(date => {
        const month = new Date(date).toLocaleString("default", { month: "short" });
        months.add(month);
    });

    const countPerDate : Record<string, number> = {};
    Object.entries(sorted).forEach(([date, count]) => {
        const reqDate = new Date(date).toISOString().split("T")[0];
        if (reqDate === undefined) return;
        if (countPerDate[reqDate] !== undefined) {
            countPerDate[reqDate] += count;
        }else {
            countPerDate[reqDate] = count;
        }
        // countPerDate[day] = (countPerDate[day] ?? 0) + count;
    });
    // console.log(countPerDate)

    const startDate = new Date(Object.keys(sorted)[0] as any)
    const endDate = new Date(Object.keys(sorted)[Object.keys(sorted).length - 1] as any);
    const days = new Set<string>();

    for (const d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = new Date(d).toISOString().split("T")[0]
        if (date === undefined) continue;
        days.add(date);
    }

    // console.log(days)
    console.log("   "+ intensityColorMap[0](Array.from(months).map(m => m).join(" ".repeat(4))));
    for (let i=0; i<7; i++) {
        let l = intensityColorMap[0](" "+" M W F "[i] + " ");

        Array.from(days).forEach((date, index) => {
            if (index % 7 !== i) return
            const count = countPerDate[date] ?? 0;
            l += intensityColorMap[Math.min(3, count)]("■ ");
        });

        console.log(l);
    }
    console.log()
    console.log(`   ${Array.from(Object.values(intensityColorMap)).map(fn => fn("■")).join(" ")}`);
}



/**
 * Dispatch word counting to the correct agent module and print results.
 * @param command - The agent to run (must be a value of the `Agent` enum).
 * @param words   - Words to count across that agent's history.
 */
export function handleAgents(command: Agent, words: string[]) {
    switch (command) {
    case Agent.Opencode:
        logWordCounts(Agent.Opencode, getOpencodeCount(words));
        break;
    case Agent.Copilot:
        logWordCounts(Agent.Copilot, getCopilotCount(words));
        break;
    case Agent.Codex:
        logWordCounts(Agent.Codex, getCodexCount(words));
        break;
    case Agent.Cursor:
        console.log("Coming soon...");
        // Windows: %APPDATA%\Cursor\User\workspaceStorage
        // macOS: ~/Library/Application Support/Cursor/User/workspaceStorage
        // Linux: ~/.config/Cursor/User/workspaceStorage
        break;
    case Agent.Claudecode:
        logWordCounts(Agent.Claudecode, getClaudeCount(words));
        break;
    case Agent.Pi:
        console.log("Pi does not have a local directory to scan. This command will fetch data from Pi's API in the future.");
        logWordCounts(Agent.Pi, getPiCount(words));
        break;
    }
}
