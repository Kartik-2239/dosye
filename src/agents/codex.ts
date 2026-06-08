import os from "os";
import path from "path";
import fs from "fs";
import type { wordData } from "./../types.js";
import { findAllJsonlFiles, countWordOccurrences } from "./utils.js";

function codexPath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".codex");
    }else {
        return path.join(os.homedir(), ".codex");
    }
}

export function getCodexCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const codexDir = codexPath();
    const jsonlPaths: string[] = [];
    const countMap: Record<string, wordData[]> = {};
    wordlist.forEach(word => countMap[word] = []);
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
                    wordlist.forEach(word => {
                        if (countMap[word] !== undefined) {
                            countMap[word].push({
                                count: countWordOccurrences(text, word),
                                time: Date.parse(parsed?.timestamp) ?? 0 //"2026-02-05T07:03:10.302Z"
                            });
                        }
                    });
                }
            } catch {
               
            }
        });
    })
    return countMap;
}

// console.log(getCodexCount(["the", "and", "I"]))