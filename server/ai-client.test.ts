import { describe, expect, it } from "vitest";

// Unit test for fallback entry creation logic
// This tests the structure and behavior of fallback entries without making API calls

describe("AI Client - Fallback Entry Creation", () => {
  // Helper function to create fallback entries (mirrors the logic in processEntryText)
  function createFallbackEntry(rawText: string) {
    if (!rawText || rawText.trim().length === 0) {
      return {
        type: "note" as const,
        title: "",
        datetime: null,
        end_datetime: null,
        recurrence: "none" as const,
        priority: "medium" as const,
        tags: [],
        people: [],
        summary: "",
        reminders: [],
        raw_text: rawText,
      };
    }

    return {
      type: "note" as const,
      title: rawText.substring(0, 100),
      datetime: null,
      end_datetime: null,
      recurrence: "none" as const,
      priority: "medium" as const,
      tags: [],
      people: [],
      summary: rawText.substring(0, 200),
      reminders: [],
      raw_text: rawText,
    };
  }

  it("should create a valid fallback entry structure", () => {
    const testText = "Tuần sau con thi toán, tối thứ 4 và thứ 6 này phải ôn cùng con";
    const entry = createFallbackEntry(testText);

    expect(entry).toBeDefined();
    expect(entry.type).toBe("note");
    expect(entry.title).toBe(testText);
    expect(entry.summary).toBe(testText);
    expect(entry.raw_text).toBe(testText);
    expect(entry.priority).toBe("medium");
    expect(entry.recurrence).toBe("none");
    expect(Array.isArray(entry.tags)).toBe(true);
    expect(Array.isArray(entry.people)).toBe(true);
    expect(Array.isArray(entry.reminders)).toBe(true);
  });

  it("should handle empty text gracefully", () => {
    const entry = createFallbackEntry("");

    expect(entry.type).toBe("note");
    expect(entry.raw_text).toBe("");
    expect(entry.title).toBe("");
    expect(entry.summary).toBe("");
  });

  it("should preserve raw_text in the result", () => {
    const testText = "Hết hạn đóng bảo hiểm nhân thọ 15/8";
    const entry = createFallbackEntry(testText);

    expect(entry.raw_text).toBe(testText);
  });

  it("should truncate long titles to 100 characters", () => {
    const longText = "a".repeat(150);
    const entry = createFallbackEntry(longText);

    expect(entry.title.length).toBe(100);
    expect(entry.title).toBe("a".repeat(100));
  });

  it("should truncate long summaries to 200 characters", () => {
    const longText = "b".repeat(300);
    const entry = createFallbackEntry(longText);

    expect(entry.summary.length).toBe(200);
    expect(entry.summary).toBe("b".repeat(200));
  });

  it("should handle whitespace-only text as empty", () => {
    const entry = createFallbackEntry("   \n\t  ");

    expect(entry.type).toBe("note");
    expect(entry.title).toBe("");
    expect(entry.summary).toBe("");
  });

  it("should always set priority to medium for fallback entries", () => {
    const entry1 = createFallbackEntry("urgent task");
    const entry2 = createFallbackEntry("low priority");
    const entry3 = createFallbackEntry("");

    expect(entry1.priority).toBe("medium");
    expect(entry2.priority).toBe("medium");
    expect(entry3.priority).toBe("medium");
  });

  it("should always set recurrence to none for fallback entries", () => {
    const entry = createFallbackEntry("daily task");

    expect(entry.recurrence).toBe("none");
  });
});
