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
- slugline: the original scene heading if it exists, otherwise write one (see LANGUAGE RULE for the format).
- locationType: "INT" or "EXT".
- timeOfDay: one of DAY, NIGHT, DAWN, DUSK, UNSPECIFIED.
- synopsis: 1-2 sentences summarising what happens (see LANGUAGE RULE for the language).
- characters: names of characters who appear or speak in this scene, in the original script language (max 8, no duplicates).
- props: important physical objects / equipment / vehicles / set items used or shown in the scene, in the original script language (max 8). Do not list characters or locations.
- dialogues: up to 3 of the most important spoken lines, with speaker and the line in the original language.
- visualDescriptionEN: ALWAYS ENGLISH, even if the script is Sinhala. 1-3 sentences that describe ONLY what a camera would see in this scene: the setting, the key characters (age, clothing, expression, action), important props, lighting and mood. No character names, no dialogue, no camera jargon, no text/letters in the image. This will be used directly as an AI image-generation prompt.
Return scenes strictly in story order.`;


const hasSinhala = (s: unknown) => /[\u0D80-\u0DFF]/.test(String(s || ""));

// අකුරු අතරින් සිංහල අකුරු කොපමණද කියා බලා භාෂාව තීරණය කරයි
function detectLanguage(text: string): "si" | "en" {
    const letters = text.match(/[A-Za-z\u0D80-\u0DFF]/g) || [];
    const sinhala = text.match(/[\u0D80-\u0DFF]/g) || [];
    return letters.length > 0 && sinhala.length / letters.length > 0.25 ? "si" : "en";
}

function languageRule(lang: "si" | "en"): string {
    if (lang === "si") {
        return `LANGUAGE RULE (very important, never break it):
This script is written in SINHALA. Write the fields slugline, synopsis, characters, props and dialogues in SINHALA using real Sinhala Unicode letters (like a Sinhala film crew would write them).
- Do NOT translate these fields into English. Do NOT write Sinhala words with English letters (no "gammanaya", no "yaka").
- If the text has no scene heading, write the slugline exactly in this style: "<අභ්‍යන්තර or බාහිර> - <place name in Sinhala> - <දහවල් or රාත්‍රී or අලුයම or සවස>". Example: "බාහිර - පැරණි ගම්මානය - දහවල්".
- The synopsis must be 1-2 Sinhala sentences.
- ONLY visualDescriptionEN is written in English.`;
    }
    return `LANGUAGE RULE: This script is in English. Write slugline, synopsis, characters, props and dialogues in English, using the format "INT. OLD HOUSE - NIGHT" for a slugline when no heading exists. visualDescriptionEN is also English.`;
}

// සිංහල script එකකදී ප්‍රතිඵලයේ කොපමණ ප්‍රමාණයක් සිංහලද (0-1)
function sinhalaShare(scenes: any[]): number {
    if (!scenes.length) return 1;
    const ok = scenes.filter((x) => hasSinhala(x?.synopsis) && hasSinhala(x?.slugline)).length;
    return ok / scenes.length;
}

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
    // හැම model එකකටම වෙන වෙනම free quota එකක් ඇත; එකක් ඉවර වුණොත් ඊළඟ එක උත්සාහ කරයි
    const list = [
        process.env.GEMINI_MODEL,
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ].filter(
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

        const lang: "si" | "en" = body?.language === "si" || body?.language === "en" ? body.language : detectLanguage(text);
        const system = `${SYSTEM_PROMPT}\n\n${languageRule(lang)}`;

        const ai = new GoogleGenAI({ apiKey });
        let lastError: any = null;

        const callModel = async (model: string, contents: string) => {
            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: system,
                    responseMimeType: "application/json",
                    responseJsonSchema: SCENE_SCHEMA,
                    temperature: 0.2,
                    maxOutputTokens: 16384,
                },
            });
            const raw = (response.text || "").replace(/^```json\s*|\s*```$/g, "").trim();
            const parsed = JSON.parse(raw); // JSON කැපී ගියා නම් SyntaxError
            return Array.isArray(parsed?.scenes) ? parsed.scenes : [];
        };

        for (const model of modelCandidates()) {
            try {
                const base = `SCREENPLAY PORTION:\n\n${text}`;
                let scenes = await callModel(model, base);
                let languageOk = true;

                // සිංහල script එකක ප්‍රතිඵලය ඉංග්‍රීසියෙන් ආවොත් එක වතාවක් නිවැරදි කරන්න ඉල්ලයි
                if (lang === "si" && sinhalaShare(scenes) < 0.7) {
                    const fixed = await callModel(
                        model,
                        `${base}\n\nIMPORTANT CORRECTION: Your previous answer wrote slugline and synopsis in English. This is a SINHALA script. Redo the whole answer and write slugline, synopsis, characters, props and dialogues in SINHALA Unicode letters. Only visualDescriptionEN stays English.`
                    );
                    if (sinhalaShare(fixed) >= sinhalaShare(scenes)) scenes = fixed;
                    languageOk = sinhalaShare(scenes) >= 0.7;
                }
                return NextResponse.json({ success: true, scenes, model, language: lang, languageOk });
            } catch (e: any) {
                if (e instanceof SyntaxError) {
                    // ප්‍රතිචාරය කැපී ගියා (output සීමාව ඉක්මවීම). නැවත යැවීමෙන් වැඩක් නැත; කොටස දෙකට බෙදා යැවිය යුතුය.
                    return NextResponse.json(
                        { success: false, code: "BAD_JSON", error: "Model output was cut off or invalid JSON" },
                        { status: 502 }
                    );
                }
                lastError = e;
                const status = errStatus(e);
                // Model නැති / quota ඉවර / overload නම් ඊළඟ model එක උත්සාහ කරයි
                if (status === 404 || status === 400 || status === 429 || status === 503) continue;
                break;
            }
        }

        const status = errStatus(lastError);
        const msg = String(lastError?.message || "");
        console.error("Gemini parse error:", msg);
        // දවසේ quota එක ඉවර වී ඇත්නම් නැවත උත්සාහ කිරීමෙන් වැඩක් නැත
        const daily = status === 429 && /PerDay|per day|daily/i.test(msg);
        return NextResponse.json(
            { success: false, error: msg || "Gemini parse failed", code: daily ? "DAILY_QUOTA" : status },
            { status: status === 429 ? 429 : 502 }
        );
    } catch (error: any) {
        console.error("Screenplay Route Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Parse process failed" }, { status: 500 });
    }
}
