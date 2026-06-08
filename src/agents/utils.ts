import path from "path";
import fs from "fs";

/** Escape special regex metacharacters in a word for safe use in RegExp. */
function escapeRegExp(word: string): string {
    return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Count occurrences of `word` as a whole word in `text` (case-insensitive).
 * Uses `\b` word-boundary anchors so "fix" does not match "prefix" or "fixed".
 */
export function countWordOccurrences(text: string, word: string): number {
    const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    return text.match(pattern)?.length ?? 0;
}

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