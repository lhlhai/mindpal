import axios from "axios";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_API_ENDPOINT = "https://build.nvidia.com/minimaxai/minimax-m3";

interface ProcessedEntry {
  type: "task" | "event" | "knowledge" | "note";
  title: string;
  datetime: string | null;
  end_datetime: string | null;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  priority: "high" | "medium" | "low";
  tags: string[];
  people: string[];
  summary: string;
  reminders: Array<{
    offset: string;
    message: string;
  }>;
  raw_text: string;
}

const SYSTEM_PROMPT = `Bạn là một trợ lý trích xuất thông tin thông minh. Từ văn bản đầu vào của người dùng, hãy phân tích và trả về JSON có cấu trúc chính xác theo schema sau:

{
  "type": "task|event|knowledge|note",
  "title": "tiêu đề ngắn gọn (tối đa 100 ký tự)",
  "datetime": "ISO 8601 timestamp nếu có, null nếu không",
  "end_datetime": "ISO 8601 timestamp nếu có khoảng thời gian, null nếu không",
  "recurrence": "none|daily|weekly|monthly|yearly",
  "priority": "high|medium|low",
  "tags": ["tag1", "tag2"],
  "people": ["tên người liên quan"],
  "summary": "tóm tắt 1-2 câu",
  "reminders": [
    {"offset": "-1 week", "message": "Chuẩn bị cho sự kiện..."},
    {"offset": "-1 day", "message": "Mai diễn ra..."}
  ],
  "raw_text": "nguyên văn đầu vào"
}

Hướng dẫn:
- type: Phân loại entry (task=công việc cần làm, event=sự kiện có thời gian, knowledge=kiến thức, note=ghi chú tự do)
- datetime: Trích xuất thời gian chính từ văn bản (nếu có)
- end_datetime: Nếu có khoảng thời gian (ví dụ: từ 2-4 giờ chiều)
- recurrence: Nếu có lặp lại (hàng ngày, hàng tuần, v.v.)
- priority: Đánh giá độ ưu tiên dựa trên ngôn ngữ (urgent/important = high, normal = medium, low = low)
- tags: Trích xuất các chủ đề/danh mục liên quan
- people: Tên các người được đề cập
- summary: Tóm tắt nội dung chính
- reminders: Tạo các nhắc nhở hợp lý dựa trên loại entry (ví dụ: event cần nhắc trước 1 ngày)
- raw_text: Giữ nguyên văn bản đầu vào

Nếu không chắc chắn về một trường, hãy để nó null hoặc mảng rỗng. Chỉ trả về JSON, không giải thích gì thêm.`;

export async function callMinimax(userText: string): Promise<ProcessedEntry | null> {
  if (!MINIMAX_API_KEY) {
    console.error("[AI] MINIMAX_API_KEY not configured");
    return null;
  }

  try {
    const response = await axios.post(
      `${MINIMAX_API_ENDPOINT}/v1/chat/completions`,
      {
        model: "mistral-large",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userText,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          "Authorization": `Bearer ${MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[AI] Empty response from MiniMax");
      return null;
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[AI] No JSON found in response:", content);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ProcessedEntry;
    return parsed;
  } catch (error) {
    console.error("[AI] Error calling MiniMax API:", error);
    if (axios.isAxiosError(error)) {
      console.error("[AI] Response:", error.response?.data);
    }
    return null;
  }
}

export async function processEntryText(rawText: string): Promise<ProcessedEntry> {
  // Validate input
  if (!rawText || rawText.trim().length === 0) {
    console.warn("[AI] Empty text provided, creating empty note");
    return {
      type: "note",
      title: "",
      datetime: null,
      end_datetime: null,
      recurrence: "none",
      priority: "medium",
      tags: [],
      people: [],
      summary: "",
      reminders: [],
      raw_text: rawText,
    };
  }

  // Try to call AI
  const aiResult = await callMinimax(rawText);

  // If AI succeeds, return the result
  if (aiResult) {
    return aiResult;
  }

  // Fallback: create a basic note entry
  console.warn("[AI] Falling back to note creation for text:", rawText.substring(0, 100));
  return {
    type: "note",
    title: rawText.substring(0, 100),
    datetime: null,
    end_datetime: null,
    recurrence: "none",
    priority: "medium",
    tags: [],
    people: [],
    summary: rawText.substring(0, 200),
    reminders: [],
    raw_text: rawText,
  };
}
