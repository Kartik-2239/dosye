import os from "os";
import path from "path";
import fs from "fs";

function copilotPath(){
    if (os.platform() === "win32") {
        return path.join(process.env.USERPROFILE || os.homedir(), ".copilot");
    }else {
        return path.join(os.homedir(), ".copilot");
    }
}

function getAllJsonlPaths(copilotDir: string, jsonlPaths: string[]) {
    if (!fs.existsSync(copilotDir)) {
        console.error("Copilot directory not found. Make sure Copilot is installed and has been run at least once.");
        return;
    }
    const files = fs.readdirSync(
        path.join(copilotDir, "session-state"),
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



export function getCopilotCount(wordlist: string[]): Record<string, number> | undefined {
    const copilotDir = copilotPath();
    const jsonlPaths: string[] = [];
    const countMap: Record<string, number> = {};
    wordlist.forEach(word => countMap[word] = 0);
    if (!fs.existsSync(copilotDir)) {
        console.error("Copilot directory not found. Make sure Copilot is installed and has been run at least once.");
        return;
    }
    getAllJsonlPaths(copilotDir, jsonlPaths);
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
