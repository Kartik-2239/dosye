import os from "os";
import path from "path";
import fs from "fs";
import type { wordData } from "./../types.js";
import { findAllJsonlFiles, initCountMap, countWordsInText } from "./utils.js";

/** Resolve the platform-specific Claude Code config directory. */
function claudecodePath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".claude");
    }else {
        return path.join(os.homedir(), ".claude");
    }
}


/**
 * Count whole-word occurrences of each word in Claude Code chat history.
 * Reads user messages from .jsonl files under `~/.claude/projects/` where
 * `message.role === "user"`, extracting text from `message.content`.
 * @param wordlist - Words to count.
 * @returns Map of word → time-series `wordData[]` entries, or `undefined` if the directory is missing.
 */
export function getClaudeCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const claudecodeDir = claudecodePath();
    const jsonlPaths: string[] = [];
    const countMap = initCountMap(wordlist);
     if (!fs.existsSync(claudecodeDir)) {
        console.error("Claude directory not found. Make sure Claude is installed and has been run at least once.");
        return;
    }
    // getAllJsonlPaths(claudecodeDir, jsonlPaths);
    findAllJsonlFiles(path.join(claudecodeDir, "projects"), jsonlPaths, "claude");
    // console.log(jsonlPaths)
    jsonlPaths.forEach(jsonlPath => {
        const content = fs.readFileSync(jsonlPath, "utf-8");
        const jsonFiles = content.trim().split("\n")
        jsonFiles.forEach(jsonFile => {
            try {
                const parsed = JSON.parse(jsonFile.trim());
                if (parsed?.message && parsed?.message.role === "user") {
                    const text: string = parsed.message.content ?? "";
                    const time = Date.parse(parsed.timestamp);
                    countWordsInText(text, wordlist, countMap, Number.isNaN(time) ? 0 : time);
                }
            } catch {
                
            }
        });
    })
    return countMap;
}


// console.log(getClaudeCount(["the", "and", "I"]))