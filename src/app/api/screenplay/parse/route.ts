import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY සකසා නොමැත." }, { status: 500 });
        }

        const body = await req.json();
        const rawText = (body.rawText || "").trim();

        if (!rawText || rawText.length < 20) {
            return NextResponse.json({ error: "පිටපතෙහි කියවිය හැකි පෙළක් හමු නොවීය." }, { status: 400 });
        }

        const scriptSlice = rawText.slice(0, 35000);

        const prompt = `
You are an expert film pre-production assistant. Analyze the following screenplay text and break it down into sequential scenes.

STRICT RULES:
1. Detect whether the script is written in Sinhala or English.
2. If Sinhala: Output sluglines, synopsis, characters, and dialogues purely in authentic Sinhala.
3. If English: Output sluglines, synopsis, characters, and dialogues purely in authentic English.
4. For EVERY scene, output an English "visualPrompt" optimized for 16:9 cinematic storyboard frame generation (e.g., "Cinematic 16:9 movie still of [location], [lighting], [character action], 35mm anamorphic frame, 8k resolution"). Even for Sinhala scripts, this "visualPrompt" MUST BE IN ENGLISH.
5. Parse all genuine sequential scenes found in the text.

Return ONLY a valid JSON array conforming to this schema (no markdown, no backticks, only pure JSON):
[
  {
    "id": "SCENE-01",
    "sceneNumber": 1,
    "slugline": "SCENE 01: INT/EXT LOCATION - DAY/NIGHT",
    "locationType": "INT" or "EXT",
    "timeOfDay": "DAY" or "NIGHT" or "DAWN" etc.,
    "synopsis": "brief scene staging description",
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

        // 1. ඔබගේ නිශ්චිත API Key එකට සහය දක්වන Active Models ලැයිස්තුව Google එකෙන්ම විමසා ගැනීම
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!listRes.ok) {
            const listErr = await listRes.text();
            throw new Error(`Google Models Query Failed: ${listRes.status} - ${listErr}`);
        }

        const listData = await listRes.json();
        const availableModels: string[] = (listData.models || [])
            .filter((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
            .map((m: any) => m.name); // උදා: "models/gemini-1.5-flash-8b", "models/gemini-2.0-flash" ආදිය

        if (availableModels.length === 0) {
            throw new Error("ඔබගේ Gemini API Key එකට generateContent සහය දක්වන models කිසිවක් හමු නොවීය.");
        }

        // වේගවත් flash model එකක් ප්‍රමුඛතාවය අනුව තෝරා ගැනීම
        let targetModelPath = availableModels.find((m) => m.includes("flash") && !m.includes("exp")) || availableModels[0];

        // 2. Google විසින් ලබාදුන් නිල model path එක කෙළින්ම generateContent සඳහා යෙදීම
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${targetModelPath}:generateContent?key=${apiKey}`;

        const apiRes = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!apiRes.ok) {
            const errDetail = await apiRes.text();
            throw new Error(`Google API Error (${targetModelPath}): ${errDetail}`);
        }

        const resJson = await apiRes.json();
        const rawCandidate = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const cleanedJson = rawCandidate.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        const parsedScenes = JSON.parse(cleanedJson);

        return NextResponse.json({ success: true, count: parsedScenes.length, scenes: parsedScenes });
    } catch (error: any) {
        console.error("Screenplay AI Parse Error:", error);
        return NextResponse.json({ error: error.message || "Breakdown අසාර්ථක විය" }, { status: 500 });
    }
}