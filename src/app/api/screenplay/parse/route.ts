import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI();

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let rawText = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }

            const buffer = await file.arrayBuffer();
            const decoder = new TextDecoder("utf-8", { fatal: false });
            const decoded = decoder.decode(buffer);

            // Clean binary stream tags and preserve Unicode Sinhala & English characters
            rawText = decoded
                .replace(/%PDF-[\s\S]*?(?=stream|BT|\n)/gi, " ")
                .replace(/stream[\s\S]*?endstream/gi, " ")
                .replace(/<<[\s\S]*?>>/g, " ")
                .replace(/\b\d+\s+\d+\s+obj\b[\s\S]*?\bendobj\b/gi, " ")
                .replace(/[^\u0D80-\u0DFFa-zA-Z0-9\s.,!?'"()\-:\/]/g, " ")
                .replace(/\s+/g, " ")
                .slice(0, 70000); // Send sufficient context block to Gemini
        } else {
            const body = await req.json();
            rawText = (body.rawText || "").slice(0, 70000);
        }

        if (!rawText.trim()) {
            return NextResponse.json({ error: "Script content is empty" }, { status: 400 });
        }

        const systemPrompt = `
You are an expert film pre-production breakdown supervisor. Analyze the following screenplay text and break it down into sequential scenes.

STRICT INSTRUCTIONS:
1. Detect whether the script is written in Sinhala or English.
2. If Sinhala: Output sluglines, synopsis, characters, and dialogues in authentic Sinhala.
3. If English: Output sluglines, synopsis, characters, and dialogues in authentic English.
4. For EVERY scene, you MUST generate a high-detail English "visualPrompt" optimized for 16:9 cinematic storyboard frame generation (e.g. "Cinematic 16:9 movie still of [location], [lighting], [character action], 35mm anamorphic, photorealistic 8k"). Even if the scene is in Sinhala, the "visualPrompt" MUST BE IN ENGLISH.
5. Parse all genuine scenes found in the manuscript. Do not hardcode or limit artificially.

Return ONLY a valid JSON array of objects with this schema (no markdown, no backticks, only pure JSON):
[
  {
    "id": "SCENE-01",
    "sceneNumber": 1,
    "slugline": "string",
    "locationType": "INT" or "EXT",
    "timeOfDay": "DAY" or "NIGHT" or "DAWN" etc.,
    "synopsis": "string",
    "characters": ["string"],
    "props": ["string"],
    "dialogues": [{"speaker": "string", "line": "string"}],
    "plannedShots": 3,
    "visualPrompt": "string"
  }
]

Script Content:
${rawText}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const parsedData = JSON.parse(response.text || "[]");
        return NextResponse.json({ success: true, count: parsedData.length, scenes: parsedData });
    } catch (error: any) {
        console.error("Screenplay Parse Error:", error);
        return NextResponse.json({ error: error.message || "Failed to parse script" }, { status: 500 });
    }
}