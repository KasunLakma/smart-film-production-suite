import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY සැකසී නොමැත" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const body = await req.json();
        const rawText = (body.rawText || "").trim();

        if (!rawText || rawText.length < 20) {
            return NextResponse.json({ error: "පිටපතෙහි කියවිය හැකි පෙළක් හමු නොවීය." }, { status: 400 });
        }

        // Vercel timeout සහ payload ගැටලු මඟහැරීමට අවශ්‍ය ප්‍රශස්ත කොටස යැවීම
        const scriptSlice = rawText.slice(0, 35000);

        const systemPrompt = `
You are an expert film pre-production assistant. Analyze the following screenplay text and break it down into sequential scenes.

STRICT RULES:
1. Detect whether the script is written in Sinhala or English.
2. If Sinhala: Output sluglines, synopsis, characters, and dialogues purely in natural Sinhala.
3. If English: Output sluglines, synopsis, characters, and dialogues purely in English.
4. For EVERY scene, output an English "visualPrompt" optimized for 16:9 cinematic storyboard frame generation (e.g. "Cinematic 16:9 movie still of [location], [lighting], [character action], 35mm anamorphic frame, 8k resolution"). Even for Sinhala scripts, the "visualPrompt" MUST BE IN ENGLISH.
5. Parse all genuine scenes sequentially. Do not limit artificially.

Return ONLY a valid JSON array conforming to this schema (no markdown, no backticks, only pure JSON):
[
  {
    "id": "SCENE-01",
    "sceneNumber": 1,
    "slugline": "SCENE 01: INT/EXT LOCATION - DAY/NIGHT",
    "locationType": "INT" or "EXT",
    "timeOfDay": "DAY" or "NIGHT" or "DAWN" etc.,
    "synopsis": "brief staging description",
    "characters": ["character1"],
    "props": ["prop1"],
    "dialogues": [{"speaker": "NAME", "line": "dialogue line"}],
    "plannedShots": 3,
    "visualPrompt": "Cinematic 16:9 shot..."
  }
]

Screenplay Text:
${scriptSlice}
`;

        // නිවැරදි model නාමය: gemini-1.5-flash
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const outputText = response.text || "[]";
        const cleanedJson = outputText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        const parsedScenes = JSON.parse(cleanedJson);

        return NextResponse.json({ success: true, count: parsedScenes.length, scenes: parsedScenes });
    } catch (error: any) {
        console.error("Screenplay AI Parse Error:", error);
        return NextResponse.json({ error: error.message || "Breakdown අසාර්ථක විය" }, { status: 500 });
    }
}