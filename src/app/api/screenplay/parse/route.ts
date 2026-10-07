import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const contentType = req.headers.get("content-type") || "";
        let extractedText = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }

            const buffer = await file.arrayBuffer();
            const decoder = new TextDecoder("utf-8", { fatal: false });
            const fullStr = decoder.decode(buffer);

            extractedText = fullStr
                .replace(/%PDF-[\s\S]*?(?=stream|BT|\n)/gi, " ")
                .replace(/stream[\s\S]*?endstream/gi, " ")
                .replace(/<<[\s\S]*?>>/g, " ")
                .replace(/\b\d+\s+\d+\s+obj\b[\s\S]*?\bendobj\b/gi, " ")
                .replace(/[^\u0D80-\u0DFFa-zA-Z0-9\s.,!?'"()\-:\/]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        } else {
            const body = await req.json();
            extractedText = (body.rawText || "").trim();
        }

        if (!extractedText || extractedText.length < 20) {
            return NextResponse.json({ error: "Script content is empty or unreadable" }, { status: 400 });
        }

        const textSample = extractedText.slice(0, 40000);

        const systemPrompt = `
You are a screenplay analysis assistant. Break down this screenplay into sequential scenes.

RULES:
1. Detect language (Sinhala or English).
2. If Sinhala: Output sluglines, synopsis, characters, and dialogues in Sinhala.
3. If English: Output them in English.
4. For EVERY scene, output an English "visualPrompt" for 16:9 cinematic storyboard generation.
5. Parse all genuine scenes sequentially.

Output ONLY a JSON array conforming to this schema:
[
  {
    "id": "SCENE-01",
    "sceneNumber": 1,
    "slugline": "SCENE 01: INT/EXT LOCATION - DAY/NIGHT",
    "locationType": "INT" or "EXT",
    "timeOfDay": "DAY" or "NIGHT",
    "synopsis": "brief scene staging",
    "characters": ["character1"],
    "props": ["prop1"],
    "dialogues": [{"speaker": "NAME", "line": "dialogue"}],
    "plannedShots": 3,
    "visualPrompt": "Cinematic 16:9 movie still of..."
  }
]

Script:
${textSample}
`;

        // gemini-2.0-flash ලෙස නිවැරදි කරන ලදී
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const outputText = response.text || "[]";
        const cleanedJson = outputText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        const parsedData = JSON.parse(cleanedJson);

        return NextResponse.json({ success: true, count: parsedData.length, scenes: parsedData });
    } catch (error: any) {
        console.error("Screenplay AI Parse Error:", error);
        return NextResponse.json({ error: error.message || "Failed to parse screenplay" }, { status: 500 });
    }
}