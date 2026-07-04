export interface Entry {
  id: string;
  userId: number;
  rawText: string;
  processedJson: any;
  type: "task" | "event" | "knowledge" | "note";
  title: string | null;
  datetime: Date | null;
  endDatetime: Date | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  priority: "high" | "medium" | "low";
  status: "pending" | "done" | "archived";
  tags: string[] | null;
  people: string[] | null;
  notes: string | null;
  embedding: string | null;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
}
