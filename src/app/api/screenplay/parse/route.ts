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

        const scriptSlice = rawText.slice(0, 30000);

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

        // Google Generative Language v1 සහ v1beta endpoints සඳහා වලංගු models waterfall
        const endpointsToTry = [
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
        ];

        let responseJson: any = null;
        let lastErrorMsg = "";

        for (const endpoint of endpointsToTry) {
            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }]
                            }
                        ]
                    })
                });

                if (res.ok) {
                    responseJson = await res.json();
                    break;
                } else {
                    const errDetail = await res.text();
                    lastErrorMsg = errDetail;
                    console.warn(`Endpoint failed (${endpoint}):`, errDetail);
                }
            } catch (err: any) {
                lastErrorMsg = err.message;
            }
        }

        if (!responseJson) {
            throw new Error(`Google API සමඟ සම්බන්ධ විය නොහැකි විය: ${lastErrorMsg}`);
        }

        const rawCandidate = responseJson.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const cleanedJson = rawCandidate.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        const parsedScenes = JSON.parse(cleanedJson);

        return NextResponse.json({ success: true, count: parsedScenes.length, scenes: parsedScenes });
    } catch (error: any) {
        console.error("Screenplay AI Parse Error:", error);
        return NextResponse.json({ error: error.message || "Breakdown අසාර්ථක විය" }, { status: 500 });
    }
}