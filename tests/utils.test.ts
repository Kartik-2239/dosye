import { describe, it, expect } from "vitest";
import { countWordOccurrences, countWordsInText, initCountMap } from "../src/agents/utils.js";

describe("countWordOccurrences", () => {
    it("counts a single whole-word match", () => {
        expect(countWordOccurrences("please fix this", "fix")).toBe(1);
    });

    it("counts multiple whole-word matches", () => {
        expect(countWordOccurrences("fix the fix", "fix")).toBe(2);
    });

    it("is case-insensitive", () => {
        expect(countWordOccurrences("Fix FIX fix", "fix")).toBe(3);
    });

    it("does NOT match word embedded in a longer word (word boundary bug)", () => {
        // The old split-based code would return 3 for this input.
        expect(countWordOccurrences("prefix suffix fixed", "fix")).toBe(0);
    });

    it("does not match partial prefix", () => {
        expect(countWordOccurrences("prefix the thing", "fix")).toBe(0);
    });

    it("does not match partial suffix", () => {
        expect(countWordOccurrences("the suffix here", "fix")).toBe(0);
    });

    it("returns 0 on empty text", () => {
        expect(countWordOccurrences("", "fix")).toBe(0);
    });

    it("returns 0 when word is not present at all", () => {
        expect(countWordOccurrences("nothing relevant here", "fix")).toBe(0);
    });

    it("handles punctuation as a word boundary", () => {
        expect(countWordOccurrences("please fix, then fix.", "fix")).toBe(2);
    });

    it("handles word at start and end of string", () => {
        expect(countWordOccurrences("fix everything and then fix", "fix")).toBe(2);
    });

    it("handles regex metacharacters in the word safely", () => {
        // Should not throw; should return 0 (no match)
        expect(countWordOccurrences("some text", "c++")).toBe(0);
    });
});

describe("initCountMap", () => {
    it("returns an empty-array bucket for each word", () => {
        expect(initCountMap(["fix", "bug"])).toEqual({ fix: [], bug: [] });
    });

    it("returns an empty map for an empty wordlist", () => {
        expect(initCountMap([])).toEqual({});
    });
});

describe("countWordsInText", () => {
    it("accumulates counts into the map as wordData entries", () => {
        const map = initCountMap(["fix", "bug"]);
        countWordsInText("fix the bug and fix it", ["fix", "bug"], map, 0);
        const fixTotal = map.fix.reduce((acc, d) => acc + d.count, 0);
        const bugTotal = map.bug.reduce((acc, d) => acc + d.count, 0);
        expect(fixTotal).toBe(2);
        expect(bugTotal).toBe(1);
    });

    it("does not count substrings (word-boundary aware)", () => {
        const map = initCountMap(["fix"]);
        countWordsInText("prefix suffix fixed", ["fix"], map, 0);
        const total = map.fix.reduce((acc, d) => acc + d.count, 0);
        expect(total).toBe(0);
    });

    it("each call pushes a separate entry (simulates multiple messages)", () => {
        const map = initCountMap(["fix"]);
        countWordsInText("fix this", ["fix"], map, 100);
        countWordsInText("and fix that too", ["fix"], map, 200);
        expect(map.fix).toHaveLength(2);
        const total = map.fix.reduce((acc, d) => acc + d.count, 0);
        expect(total).toBe(2);
    });

    it("records the provided timestamp on each entry", () => {
        const map = initCountMap(["fix"]);
        countWordsInText("fix this", ["fix"], map, 12345);
        expect(map.fix[0]?.time).toBe(12345);
    });

    it("ignores words not in the initial map", () => {
        const map = initCountMap(["fix"]);
        countWordsInText("fix the bug", ["fix", "bug"], map, 0);
        // "bug" was not in the original map so it should not appear
        expect(Object.keys(map)).toEqual(["fix"]);
    });
});
