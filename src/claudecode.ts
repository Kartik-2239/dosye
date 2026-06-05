import os from "os";
import path from "path";
import fs from "fs";

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



export function getClaudeCount(wordlist: string[]): Record<string, number> | undefined {
    const claudecodeDir = claudecodePath();
    const jsonlPaths: string[] = [];
    const countMap: Record<string, number> = {};
    wordlist.forEach(word => countMap[word] = 0);
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
                            countMap[word] += text.toLowerCase().split(word.toLowerCase()).length - 1;
                        }
                    });
                }
            } catch {
                
            }
        });
    })
    return countMap;
}
