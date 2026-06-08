import os from "os";
import path from "path";
import fs from "fs";
import type { wordData } from "./../types.js";
import { findAllJsonlFiles, countWordOccurrences } from "./utils.js";

function copilotPath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".copilot");
    }else {
        return path.join(os.homedir(), ".copilot");
    }
}




export function getCopilotCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const copilotDir = copilotPath();
    const jsonlPaths: string[] = [];
    const countMap: Record<string, wordData[]> = {};
    wordlist.forEach(word => countMap[word] = []);
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
                    wordlist.forEach(word => {
                        if (countMap[word] !== undefined) {
                            countMap[word].push({
                                count: countWordOccurrences(text, word),
                                time: Date.parse(parsed?.timestamp) ?? 0
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

// console.log(getCopilotCount(["the", "and", "I"]))