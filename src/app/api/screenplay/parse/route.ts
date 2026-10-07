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

            // Clean stream and binary tags, keeping Sinhala Unicode & English text
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

        // Pass sufficient narrative text (up to 40,000 characters) to avoid Vercel limits and timeouts
        const textSample = extractedText.slice(0, 40000);

        const systemPrompt = `
You are an expert film pre-production breakdown supervisor. Analyze the following screenplay text and break it down into sequential scenes.

STRICT OPERATIONAL RULES:
1. DETECT LANGUAGE: Determine if the script is in Sinhala or English.
2. SCRIPT DETAILS EXTRACTION:
   - If Sinhala: Output sluglines, synopses, characters, and dialogues strictly in natural Sinhala.
   - If English: Output them strictly in natural English.
3. FOR STORYBOARD PRE-VISUALIZATION:
   - For EVERY scene, create a high-detail English "visualPrompt" optimized for 16:9 cinematic image generation (e.g., "Cinematic 16:9 movie still of [location], [lighting], [character action], 35mm anamorphic, photorealistic 8k"). Even for Sinhala scripts, this "visualPrompt" MUST BE IN ENGLISH.
4. PARSE SCENES SEQUENTIALLY: Extract genuine narrative scenes from the text.

Output ONLY a valid JSON array of objects conforming exactly to this structure (no markdown formatting, no backticks, only pure JSON):
[
  {
    "id": "SCENE-01",
    "sceneNumber": 1,
    "slugline": "SCENE 01: INT/EXT LOCATION - DAY/NIGHT",
    "locationType": "INT" or "EXT",
    "timeOfDay": "DAY" or "NIGHT" or "DAWN" etc.,
    "synopsis": "detailed narrative action staging",
    "characters": ["character1", "character2"],
    "props": ["prop1", "prop2"],
    "dialogues": [{"speaker": "NAME", "line": "dialogue line"}],
    "plannedShots": 3,
    "visualPrompt": "Cinematic 16:9 widescreen movie still..."
  }
]

Script Text:
${textSample}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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