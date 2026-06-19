import path from "path";
import fs from "fs";
import type { wordData } from "./../types.js";

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

/** Initialise an empty `wordData[]` bucket for each word in the wordlist. */
export function initCountMap(wordlist: string[]): Record<string, wordData[]> {
    const countMap: Record<string, wordData[]> = {};
    wordlist.forEach(word => (countMap[word] = []));
    return countMap;
}

/**
 * Push a `{count, time}` entry for each word found in `text` into `countMap`.
 * Delegates to `countWordOccurrences` so matching is whole-word, case-insensitive.
 * @param text      - The source text to search.
 * @param wordlist  - Words to count; only those already in `countMap` are processed.
 * @param countMap  - Mutable map updated in place.
 * @param time      - Timestamp (ms since epoch) of the message being processed.
 */
export function countWordsInText(
    text: string,
    wordlist: string[],
    countMap: Record<string, wordData[]>,
    time: number
): void {
    wordlist.forEach(word => {
        if (countMap[word] !== undefined) {
            countMap[word].push({ count: countWordOccurrences(text, word), time });
        }
    });
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