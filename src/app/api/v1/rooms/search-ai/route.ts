import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import {
  mapPostToRoomDetail,
  serializePost,
  type RoomPostDocument,
} from "@/src/features/room/servers/room-mapper";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const PUBLIC_POST_STATUSES = ["pending", "published"] as const;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, message: "Prompt is required" }, { status: 400 });
    }

    const endpoint = process.env.LLM_ENDPOINT || "http://localhost:11434/api/chat";
    const model = process.env.OLLAMA_MODEL || "gpt-oss:20b";
    const num_ctx = 16 * 1024;
    const keep_alive = -1;
    const temperature = 0;

    await connectDB();
    const allPosts = await Post.find({ status: { $in: PUBLIC_POST_STATUSES } })
      .populate("ownerId", "fullName phone avatarUrl responseRate")
      .sort({ createdAt: -1 })
      .lean<RoomPostDocument[]>();

    const simplifiedRooms = allPosts.map((post) => {
      const room = mapPostToRoomDetail(serializePost(post));
      return {
        slug: room.slug,
        title: room.title,
        address: room.address,
        price: room.priceLabel,
        area: room.areaLabel,
        description: room.description || room.subtitle,
        amenities: room.amenities.map((a: any) => typeof a === "string" ? a : a.name),
        rules: room.rules,
        propertyType: room.propertyType === "can_ho_chung_cu" ? "Căn hộ/Chung cư" : room.propertyType === "nha_o" ? "Nhà ở" : "Phòng trọ"
      };
    });

    const systemPrompt = `Bạn là trợ lý AI phân tích và tìm kiếm phòng trọ thông minh bằng tiếng Việt.
Dưới đây là danh sách tất cả phòng trọ hiện có trong hệ thống dưới dạng JSON:
${JSON.stringify(simplifiedRooms, null, 2)}

Nhiệm vụ của bạn là đọc yêu cầu tìm kiếm của người dùng, phân tích ngữ nghĩa và so sánh với danh sách trên để tìm ra các phòng trọ phù hợp nhất (nếu có).

Trả về một đối tượng JSON duy nhất có cấu trúc sau (không kèm theo bất kỳ văn bản, lời giải thích hay block code nào khác):
{
  "slugs": string[] (Danh sách slug của các phòng trọ phù hợp, sắp xếp theo thứ tự phù hợp nhất giảm dần. Nếu không có phòng nào phù hợp, hãy trả về mảng rỗng []),
  "aiResponse": string (Lời phản hồi thân thiện bằng tiếng Việt gửi tới người dùng: chào hỏi, tóm tắt tiêu chí lọc, giải thích ngắn gọn lý do chọn các phòng trọ đó, hoặc gợi ý nếu không tìm thấy phòng phù hợp)
}`;

    let parsed: { slugs?: string[]; aiResponse?: string } = {};

    try {
      // Try Ollama first
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          stream: false,
          options: {
            temperature: temperature,
            num_ctx: num_ctx,
            keep_alive: keep_alive,
          },
          format: "json"
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const resData = await response.json();
      const jsonContent = resData.message?.content?.trim();
      if (!jsonContent) {
        throw new Error("Empty response from Ollama");
      }

      parsed = JSON.parse(jsonContent);
    } catch (ollamaError: any) {
      console.warn("Ollama failed, falling back to Gemini:", ollamaError.message);

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not configured in environment variables");
        }

        const ai = new GoogleGenAI({ apiKey });
        const interaction = await ai.interactions.create({
          model: "gemini-3.5-flash",
          system_instruction: systemPrompt,
          input: prompt,
        });

        let jsonContent = interaction.output_text?.trim() || "";

        // Remove markdown block wraps if present
        if (jsonContent.startsWith("```json")) {
          jsonContent = jsonContent.substring(7);
        } else if (jsonContent.startsWith("```")) {
          jsonContent = jsonContent.substring(3);
        }
        if (jsonContent.endsWith("```")) {
          jsonContent = jsonContent.substring(0, jsonContent.length - 3);
        }
        jsonContent = jsonContent.trim();

        if (!jsonContent) {
          throw new Error("Empty output from Gemini interaction");
        }

        parsed = JSON.parse(jsonContent);
      } catch (geminiError: any) {
        console.error("Gemini fallback also failed:", geminiError.message);
        throw new Error(`AI search failed. Ollama error: ${ollamaError.message}. Gemini error: ${geminiError.message}`);
      }
    }

    const slugs = Array.isArray(parsed.slugs) ? parsed.slugs : [];

    let matchedRooms: any[] = [];
    if (slugs.length > 0) {
      const matchedPosts = await Post.find({
        slug: { $in: slugs },
        status: { $in: PUBLIC_POST_STATUSES }
      })
        .populate("ownerId", "fullName phone avatarUrl responseRate")
        .lean<RoomPostDocument[]>();

      const postsMap = new Map(matchedPosts.map((p: RoomPostDocument) => [p.slug, p]));
      matchedRooms = slugs
        .map((slug: string) => postsMap.get(slug))
        .filter((post): post is RoomPostDocument => !!post)
        .map((post: RoomPostDocument) => mapPostToRoomDetail(serializePost(post)));
    }

    return NextResponse.json({
      success: true,
      aiResponse: parsed.aiResponse || `Tôi đã phân tích yêu cầu và tìm thấy ${matchedRooms.length} phòng trọ phù hợp.`,
      data: {
        posts: matchedRooms
      }
    });

  } catch (error: any) {
    console.error("AI Search API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
