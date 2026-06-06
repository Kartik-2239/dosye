import os from "os";
import path from "path";
import fs from "fs";
import type { wordData } from "./../types.js";
import { findAllJsonlFiles, initCountMap, countWordsInText } from "./utils.js";

/** Resolve the platform-specific Codex config directory. */
function codexPath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".codex");
    }else {
        return path.join(os.homedir(), ".codex");
    }
}

/**
 * Count whole-word occurrences of each word in Codex chat history.
 * Reads user messages from .jsonl files under `~/.codex/sessions/` where
 * `payload.type === "user_message"`, extracting text from `payload.message`.
 * @param wordlist - Words to count.
 * @returns Map of word → time-series `wordData[]` entries, or `undefined` if the directory is missing.
 */
export function getCodexCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const codexDir = codexPath();
    const jsonlPaths: string[] = [];
    const countMap = initCountMap(wordlist);
     if (!fs.existsSync(codexDir)) {
        console.error("Codex directory not found. Make sure Codex is installed and has been run at least once.");
        return;
    }
    // getAllJsonlPaths(codexDir, jsonlPaths);
    findAllJsonlFiles(path.join(codexDir, "sessions"), jsonlPaths, "codex");
    jsonlPaths.forEach(jsonlPath => {
        const content = fs.readFileSync(jsonlPath, "utf-8");
        const jsonFiles = content.trim().split("\n")
        jsonFiles.forEach(jsonFile => {
            try {
                const parsed = JSON.parse(jsonFile.trim());
                if (parsed?.payload?.type === "user_message") {
                    const text: string = parsed.payload.message ?? "";
                    countWordsInText(text, wordlist, countMap, Date.parse(parsed?.timestamp) ?? 0);
                }
            } catch {
               
            }
        });
    })
    return countMap;
}

// console.log(getCodexCount(["the", "and", "I"]))