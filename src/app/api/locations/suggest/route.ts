import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

/**
 * POST /api/locations/suggest
 * Body: { need: string, region: "sri_lanka" | "world", style?: string }
 * Returns up to 6 real, well-known places that could suit the scene.
 * These are AI suggestions: the user must verify them before planning.
 */

const SYSTEM = `You are an experienced film location scout.
Given a description of what a film scene needs, suggest REAL, well-known, publicly known places where it could be filmed.

RULES
- Only suggest places that really exist and are widely known (landmarks, parks, beaches, heritage areas, towns, streets, famous buildings). Never invent a place.
- Do NOT invent phone numbers, e-mails, private business names or prices that you are not sure about.
- If you are not sure about permits or fees, say "Please check with the owner/authority" instead of guessing.
- "roughDailyCost" must be an honest rough range in Sri Lankan rupees (LKR) or "Unknown — ask the owner".
- Write simple, friendly English that a non-technical producer can understand. Keep each field short (1-2 sentences).
- Give 5 or 6 different options with different looks.`;

const SCHEMA = {
    type: "object",
    properties: {
        places: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    area: { type: "string" },
                    country: { type: "string" },
                    type: { type: "string" },
                    whyItFits: { type: "string" },
                    bestTime: { type: "string" },
                    facilities: { type: "string" },
                    permits: { type: "string" },
                    roughDailyCost: { type: "string" },
                    caution: { type: "string" },
                },
                required: ["name", "area", "country", "type", "whyItFits", "bestTime", "facilities", "permits", "roughDailyCost", "caution"],
            },
        },
    },
    required: ["places"],
};

function models(): string[] {
    return Array.from(
        new Set(
            [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"].filter(
                Boolean
            ) as string[]
        )
    );
}

const statusOf = (e: any): number => {
    const s = Number(e?.status ?? e?.code);
    if (Number.isFinite(s) && s > 0) return s;
    const m = String(e?.message || "");
    if (/429|RESOURCE_EXHAUSTED|quota/i.test(m)) return 429;
    if (/404|not found/i.test(m)) return 404;
    return 500;
};

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, code: "NO_KEY", error: "GEMINI_API_KEY is not set." }, { status: 500 });
        }
        const body = await req.json();
        const need = String(body?.need || "").trim().slice(0, 1500);
        const region = body?.region === "world" ? "world" : "sri_lanka";
        if (need.length < 5) {
            return NextResponse.json({ success: false, error: "Please describe what you need." }, { status: 400 });
        }

        const where =
            region === "sri_lanka"
                ? "ONLY places inside Sri Lanka."
                : "Places anywhere in the world (mix of countries is fine, include Sri Lanka only if it truly fits).";

        const ai = new GoogleGenAI({ apiKey });
        let last: any = null;

        for (const model of models()) {
            try {
                const r = await ai.models.generateContent({
                    model,
                    contents: `What the scene needs:\n${need}\n\nWhere: ${where}`,
                    config: {
                        systemInstruction: SYSTEM,
                        responseMimeType: "application/json",
                        responseJsonSchema: SCHEMA,
                        temperature: 0.5,
                        maxOutputTokens: 6000,
                    },
                });
                const raw = (r.text || "").replace(/^```json\s*|\s*```$/g, "").trim();
                const parsed = JSON.parse(raw);
                const places = Array.isArray(parsed?.places) ? parsed.places.slice(0, 6) : [];
                return NextResponse.json({ success: true, places, model });
            } catch (e: any) {
                last = e;
                const st = statusOf(e);
                if (st === 404 || st === 400 || st === 429 || st === 503 || e instanceof SyntaxError) continue;
                break;
            }
        }
        const st = statusOf(last);
        return NextResponse.json(
            { success: false, code: st, error: last?.message || "Could not get suggestions" },
            { status: st === 429 ? 429 : 502 }
        );
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e?.message || "Failed" }, { status: 500 });
    }
}
