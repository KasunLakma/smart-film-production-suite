import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Vercel හි උපරිම කාලය (තත්පර 60)
export const maxDuration = 60;

/**
 * POST /api/screenplay/parse
 * Body: { text: string }   <- තිර පිටපතේ එක කොටසක් (chunk) පමණි
 * Response: { success: true, scenes: AiScene[], model: string }
 *
 * Gemini භාවිතයෙන් සිංහල / English තිර පිටපතක් දර්ශන (scenes) වලට කඩා,
 * එක් එක් දර්ශනයේ චරිත, උපකරණ, දෙබස් සහ ඉංග්‍රීසි visual description එක ලබා දෙයි.
 */

const SYSTEM_PROMPT = `You are a professional script supervisor and film pre-production assistant.
You receive a PORTION of a screenplay or story. It may be written in Sinhala, English, or a mix of both.
Break it into scenes and return structured JSON.

RULES
- A new scene starts whenever the location or the time changes (or at an explicit heading such as INT./EXT./SCENE 1/දර්ශනය 1/අභ්‍යන්තර/බාහිර). Do NOT merge different locations into one scene. Do NOT invent scenes that are not in the text.
- If the text is a plain story with no headings, split it into scenes yourself based on location/time changes.
- If the portion begins in the middle of a scene, treat that beginning as its own scene.
- Ignore title pages, page numbers, "CONTINUED", "(MORE)", copyright lines and other non-story noise.
- slugline: the original scene heading if it exists, otherwise write one in the same language as the script (e.g. "INT. OLD HOUSE - NIGHT").
- locationType: "INT" or "EXT".
- timeOfDay: one of DAY, NIGHT, DAWN, DUSK, UNSPECIFIED.
- synopsis: 1-2 sentences summarising what happens, in the SAME language as the script.
- characters: names of characters who appear or speak in this scene, in the original script language (max 8, no duplicates).
- props: important physical objects / equipment / vehicles / set items used or shown in the scene, in the original script language (max 8). Do not list characters or locations.
- dialogues: up to 3 of the most important spoken lines, with speaker and the line in the original language.
- visualDescriptionEN: ALWAYS ENGLISH, even if the script is Sinhala. 1-3 sentences that describe ONLY what a camera would see in this scene: the setting, the key characters (age, clothing, expression, action), important props, lighting and mood. No character names, no dialogue, no camera jargon, no text/letters in the image. This will be used directly as an AI image-generation prompt.
Return scenes strictly in story order.`;

const SCENE_SCHEMA = {
    type: "object",
    properties: {
        scenes: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    slugline: { type: "string" },
                    locationType: { type: "string", enum: ["INT", "EXT"] },
                    timeOfDay: { type: "string", enum: ["DAY", "NIGHT", "DAWN", "DUSK", "UNSPECIFIED"] },
                    synopsis: { type: "string" },
                    characters: { type: "array", items: { type: "string" } },
                    props: { type: "array", items: { type: "string" } },
                    dialogues: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                speaker: { type: "string" },
                                line: { type: "string" },
                            },
                            required: ["speaker", "line"],
                        },
                    },
                    visualDescriptionEN: { type: "string" },
                },
                required: [
                    "slugline",
                    "locationType",
                    "timeOfDay",
                    "synopsis",
                    "characters",
                    "props",
                    "dialogues",
                    "visualDescriptionEN",
                ],
            },
        },
    },
    required: ["scenes"],
};

// පළමු model එක නැති නම් ඊළඟ එකට මාරු වේ. Vercel හි GEMINI_MODEL දමා වෙනස් කළ හැක.
function modelCandidates(): string[] {
    const list = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest"].filter(
        Boolean
    ) as string[];
    return Array.from(new Set(list));
}

function errStatus(e: any): number {
    const s = Number(e?.status ?? e?.code ?? e?.error?.code);
    if (Number.isFinite(s) && s > 0) return s;
    const m = String(e?.message || "");
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(m)) return 429;
    if (/503|UNAVAILABLE|overloaded/i.test(m)) return 503;
    if (/404|not found/i.test(m)) return 404;
    return 500;
}

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: "GEMINI_API_KEY සකසා නැත (.env.local / Vercel Environment Variables).", code: "NO_KEY" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const text = String(body?.text || "").trim();
        if (text.length < 20) {
            return NextResponse.json({ success: false, error: "පිටපතෙහි කියවිය හැකි පෙළක් හමු නොවීය." }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });
        let lastError: any = null;

        for (const model of modelCandidates()) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: `SCREENPLAY PORTION:\n\n${text}`,
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        responseMimeType: "application/json",
                        responseJsonSchema: SCENE_SCHEMA,
                        temperature: 0.2,
                        maxOutputTokens: 16384,
                    },
                });

                const raw = (response.text || "").replace(/^```json\s*|\s*```$/g, "").trim();
                const parsed = JSON.parse(raw);
                const scenes = Array.isArray(parsed?.scenes) ? parsed.scenes : [];
                return NextResponse.json({ success: true, scenes, model });
            } catch (e: any) {
                lastError = e;
                const status = errStatus(e);
                // Model නැති / අවලංගු නම් පමණක් ඊළඟ model එක උත්සාහ කරයි
                if (status === 404 || status === 400) continue;
                break;
            }
        }

        const status = errStatus(lastError);
        console.error("Gemini parse error:", lastError?.message || lastError);
        return NextResponse.json(
            { success: false, error: lastError?.message || "Gemini parse failed", code: status },
            { status: status === 429 ? 429 : 502 }
        );
    } catch (error: any) {
        console.error("Screenplay Route Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Parse process failed" }, { status: 500 });
    }
}
