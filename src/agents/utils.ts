import path from "path";
import fs from "fs";

export function findAllJsonlFiles(dir: string, jsonlPaths: string[], agent: string) {
    if (!fs.existsSync(dir)) {
        console.error(`${agent} directory not found. Make sure ${agent} is installed and has been run at least once.`);
        return;
    }
    const files = fs.readdirSync(
        dir,
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