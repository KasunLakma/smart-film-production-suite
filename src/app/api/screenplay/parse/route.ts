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

        // 1. ඔබගේ API Key එකට අදාළව Google හි සක්‍රීයව ඇති model එක ස්වයංක්‍රීයව හඳුනා ගැනීම (Auto Model Discovery)
        let selectedModel = "gemini-2.5-flash";
        try {
            const modelsListRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (modelsListRes.ok) {
                const modelsData = await modelsListRes.json();
                const available = (modelsData.models || [])
                    .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
                    .map((m: any) => m.name.replace("models/", ""));

                // GenerateContent සහය දක්වන ප්‍රශස්ත flash model එකක් තෝරා ගැනීම
                const preferred = available.find((m: string) => m.includes("2.5-flash") || m.includes("2.0-flash") || m.includes("flash"));
                if (preferred) {
                    selectedModel = preferred;
                } else if (available.length > 0) {
                    selectedModel = available[0];
                }
            }
        } catch {
            // Fallback default
            selectedModel = "gemini-2.5-flash";
        }

        // 2. තෝරාගත් සක්‍රීය model එකට prompt එක යැවීම
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
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
            const errText = await apiRes.text();
            console.error(`Gemini API Error with model ${selectedModel}:`, errText);
            throw new Error(`Google API Error (${selectedModel}): ${errText}`);
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