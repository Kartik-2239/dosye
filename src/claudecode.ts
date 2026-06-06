import os from "os";
import path from "path";
import fs from "fs";
import type { wordData } from "./types.js";

function claudecodePath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".claude");
    }else {
        return path.join(os.homedir(), ".claude");
    }
}

function getAllJsonlPaths(claudecodeDir: string, jsonlPaths: string[]) {
    if (!fs.existsSync(claudecodeDir)) {
        console.error("Claude directory not found. Make sure Claude is installed and has been run at least once.");
        return;
    }
    const files = fs.readdirSync(
        path.join(claudecodeDir, "projects"),
        {
            recursive: true,
            withFileTypes: true
        }
    );
    for (const file of files) {
        if (file.isFile() && file.name.endsWith(".jsonl")) {
            jsonlPaths.push(path.join(file.parentPath, file.name));
        }
    }
}



export function getClaudeCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const claudecodeDir = claudecodePath();
    const jsonlPaths: string[] = [];
    const countMap: Record<string, wordData[]> = {};
    wordlist.forEach(word => countMap[word] = []);
     if (!fs.existsSync(claudecodeDir)) {
        console.error("Claude directory not found. Make sure Claude is installed and has been run at least once.");
        return;
    }
    getAllJsonlPaths(claudecodeDir, jsonlPaths);
    // console.log(jsonlPaths)
    jsonlPaths.forEach(jsonlPath => {
        const content = fs.readFileSync(jsonlPath, "utf-8");
        const jsonFiles = content.trim().split("\n")
        jsonFiles.forEach(jsonFile => {
            try {
                const parsed = JSON.parse(jsonFile.trim());
                if (parsed?.message && parsed?.message.role === "user") {
                    const text: string = parsed.message.content ?? "";
                    wordlist.forEach(word => {
                        if (countMap[word] !== undefined) {
                            countMap[word].push({
                                count: text.toLowerCase().split(word.toLowerCase()).length - 1,
                                time: Date.parse(parsed.timestamp) ?? 0
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


// console.log(getClaudeCount(["the", "and", "I"]))