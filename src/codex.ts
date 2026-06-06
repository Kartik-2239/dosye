import os from "os";
import path from "path";
import fs from "fs";
import { get } from "http";
import type { wordData } from "./types.js";

function codexPath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".codex");
    }else {
        return path.join(os.homedir(), ".codex");
    }
}

function getAllJsonlPaths(codexDir: string, jsonlPaths: string[]) {
    const files = fs.readdirSync(
        path.join(codexDir, "sessions"),
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

export function getCodexCount(wordlist: string[]): Record<string, wordData[]> | undefined {
    const codexDir = codexPath();
    const jsonlPaths: string[] = [];
    const countMap: Record<string, wordData[]> = {};
    wordlist.forEach(word => countMap[word] = []);
     if (!fs.existsSync(codexDir)) {
        console.error("Codex directory not found. Make sure Codex is installed and has been run at least once.");
        return;
    }
    getAllJsonlPaths(codexDir, jsonlPaths);
    // console.log(jsonlPaths)
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
                                count: text.toLowerCase().split(word.toLowerCase()).length - 1,
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