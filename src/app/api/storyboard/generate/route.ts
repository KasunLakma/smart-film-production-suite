import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

const SINHALA = /[\u0D80-\u0DFF]/;

// සරල hash එකකින් එකම දර්ශනයට හැමවිටම එකම seed එක ලබා දෙයි (පින්තූරය ස්ථාවරව තබයි)
function hashSeed(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % 1000000;
}

// පැරණි regex parser එකේ "Cinematic 16:9 movie still..." වැනි හිස් template එකක්ද?
function isGenericTemplate(p: string): boolean {
    return /^Cinematic 16:9 movie still/i.test(p.trim());
}

// දර්ශනයේ විස්තරය ඉංග්‍රීසියට හැරවීම (Gemini විස්තරයක් නැති විට පමණක් භාවිතා වේ)
async function describeInEnglish(scene: {
    slugline?: string;
    synopsis?: string;
    props?: string[];
    locationType?: string;
    timeOfDay?: string;
}): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "";
    const ai = new GoogleGenAI({ apiKey });
    const models = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest"].filter(
        Boolean
    ) as string[];

    const input = `Scene heading: ${scene.slugline || ""}
Location type: ${scene.locationType || ""}
Time: ${scene.timeOfDay || ""}
Summary: ${scene.synopsis || ""}
Props: ${(scene.props || []).join(", ")}`;

    for (const model of Array.from(new Set(models))) {
        try {
            const r = await ai.models.generateContent({
                model,
                contents: input,
                config: {
                    systemInstruction:
                        "Write 1-3 English sentences describing ONLY what a camera would see in this film scene: setting, characters (age, clothing, action, expression), key props, lighting, mood. No character names, no dialogue, no text in the image. Output only the description.",
                    temperature: 0.3,
                    maxOutputTokens: 300,
                },
            });
            const t = (r.text || "").trim();
            if (t) return t;
        } catch {
            /* ඊළඟ model එක */
        }
    }
    return "";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            sceneId,
            slugline,
            isWide,
            artStyle,
            visualPrompt,
            synopsis,
            props,
            locationType,
            timeOfDay,
        } = body as {
            sceneId?: string;
            slugline?: string;
            isWide?: boolean;
            artStyle?: string;
            visualPrompt?: string;
            synopsis?: string;
            props?: string[];
            locationType?: string;
            timeOfDay?: string;
        };

        // 1) දර්ශනයට ගැලපෙන ඉංග්‍රීසි විස්තරය තෝරා ගැනීම
        let description = (visualPrompt || "").trim();
        if (!description || SINHALA.test(description) || isGenericTemplate(description)) {
            description = await describeInEnglish({ slugline, synopsis, props, locationType, timeOfDay });
        }
        if (!description) {
            // අවසන් විකල්පය: slugline එකේ ඉංග්‍රීසි කොටස පමණක්
            const eng = (slugline || "").replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();
            description = eng || "a dramatic film scene";
        }
        description = description.replace(/\s+/g, " ").slice(0, 600);

        // 2) Shot එකේ වර්ගය
        const framing = isWide
            ? "wide establishing shot showing the whole location and the characters in it"
            : "medium close-up shot focused on the main character and the key action";

        // 3) Art style එක
        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${framing}, ${description}, bold black ink outlines, cel shading, vibrant cinematic colors, dramatic storyboard panel, no text, no letters`;
        } else {
            prompt = `black and white film storyboard drawing, ink sketch, crosshatching pencil shading, ${framing}, ${description}, bold ink linework, professional cinema storyboard, high contrast, monochrome, no color, no text, no letters`;
        }

        const seed = hashSeed(`${sceneId || slugline || ""}-${isWide ? "A" : "B"}`);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            prompt
        )}?width=1280&height=720&seed=${seed}&nologo=true`;

        return NextResponse.json({ success: true, imageUrl, prompt });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Failed" }, { status: 500 });
    }
}
