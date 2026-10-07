import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // Vercel function timeout එක තත්පර 60 දක්වා වැඩි කිරීම

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const contentType = req.headers.get("content-type") || "";

        let filePart: any = null;
        let textContent = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }

            const buffer = await file.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString("base64");
            const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "text/plain");

            filePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            };
        } else {
            const body = await req.json();
            textContent = body.rawText || "";
        }

        const systemPrompt = `
You are an expert film pre-production breakdown supervisor. Analyze this screenplay document (whether native text or scanned/image PDF).

STRICT OPERATIONAL RULES:
1. DETECT LANGUAGE: Determine if the script is in Sinhala or English.
2. SCRIPT DETAILS EXTRACTION:
   - If Sinhala: Extract sluglines, synopses, characters, and dialogues purely in authentic Sinhala.
   - If English: Extract them purely in authentic English.
3. FOR STORYBOARD PRE-VISUALIZATION:
   - For EVERY scene, create a high-detail English "visualPrompt" optimized for 16:9 cinematic image generation (e.g., "Cinematic 16:9 movie still of [location], [lighting], [character action], 35mm anamorphic, photorealistic 8k"). Even for Sinhala scripts, this "visualPrompt" MUST BE IN ENGLISH.
4. PARSE ALL SCENES: Extract all genuine narrative scenes sequentially across the entire manuscript.

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
`;

        const contents = filePart ? [filePart, systemPrompt] : [textContent, systemPrompt];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
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