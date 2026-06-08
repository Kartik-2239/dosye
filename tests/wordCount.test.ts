import { describe, it, expect } from "vitest";
import { countWordOccurrences } from "../src/agents/utils.js";

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

    it("does NOT match a word embedded in a longer word (word boundary bug)", () => {
        // The old split-based code would return 3 for this input.
        expect(countWordOccurrences("prefix suffix fixed", "fix")).toBe(0);
    });

    it("does not match a partial prefix", () => {
        expect(countWordOccurrences("prefix the thing", "fix")).toBe(0);
    });

    it("does not match a partial suffix", () => {
        expect(countWordOccurrences("the suffix here", "fix")).toBe(0);
    });

    it("returns 0 on empty text", () => {
        expect(countWordOccurrences("", "fix")).toBe(0);
    });

    it("returns 0 when the word is not present at all", () => {
        expect(countWordOccurrences("nothing relevant here", "fix")).toBe(0);
    });

    it("handles punctuation as a word boundary", () => {
        expect(countWordOccurrences("please fix, then fix.", "fix")).toBe(2);
    });

    it("handles a word at the start and end of the string", () => {
        expect(countWordOccurrences("fix everything and then fix", "fix")).toBe(2);
    });

    it("handles regex metacharacters in the word safely", () => {
        // Should not throw; should return 0 (no match)
        expect(countWordOccurrences("some text", "c++")).toBe(0);
    });
});
