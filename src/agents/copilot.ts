import os from "os";
import path from "path";
import fs from "fs";
import type { wordData } from "./../types.js";
import { findAllJsonlFiles, initCountMap, countWordsInText } from "./utils.js";

/** Resolve the platform-specific GitHub Copilot config directory. */
function copilotPath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".copilot");
    }else {
        return path.join(os.homedir(), ".copilot");
    }
}




/**
 * Count whole-word occurrences of each word in GitHub Copilot chat history.
 * Reads user messages from .jsonl files under `~/.copilot/session-state/` where
 * `type === "user.message"`, extracting text from `data.content`.
 * @param wordlist - Words to count.
 * @returns Map of word → time-series `wordData[]` entries, or `undefined` if the directory is missing.
 */
export function getCopilotCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const copilotDir = copilotPath();
    const jsonlPaths: string[] = [];
    const countMap = initCountMap(wordlist);
    if (!fs.existsSync(copilotDir)) {
        console.error("Copilot directory not found. Make sure Copilot is installed and has been run at least once.");
        return;
    }
    // getAllJsonlPaths(copilotDir, jsonlPaths);
    findAllJsonlFiles(path.join(copilotDir, "session-state"), jsonlPaths, "copilot");
    // console.log(jsonlPaths)
    jsonlPaths.forEach(jsonlPath => {
        const content = fs.readFileSync(jsonlPath, "utf-8");
        const jsonFiles = content.trim().split("\n")
        jsonFiles.forEach(jsonFile => {
            try {
                const parsed = JSON.parse(jsonFile.trim());
                if (parsed?.type === "user.message") {
                    const text: string = parsed.data.content ?? "";
                    const time = Date.parse(parsed?.timestamp);
                    countWordsInText(text, wordlist, countMap, Number.isNaN(time) ? 0 : time);
                }
            } catch {
                
            }
        });
    })
    return countMap;
}

// console.log(getCopilotCount(["the", "and", "I"]))