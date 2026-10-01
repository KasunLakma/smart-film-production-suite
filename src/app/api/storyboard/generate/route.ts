import { NextResponse } from "next/server";

export const maxDuration = 60; // Vercel execution timeout limit වැඩි කිරීම

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();

        const text = (slugline || "").toLowerCase();

        // Scene Environment & Subject Context Detection
        let sceneSubject = "cinematic interior scene with dramatic chiaroscuro lighting";
        if (/lab|විද්‍යාගාර|computer|research|tech/.test(text)) {
            sceneSubject = isWide
                ? "high tech cybernetics research laboratory, illuminated computer server arrays, holographic console desk in center, deep wide perspective"
                : "medium close-up of tactical male operative with intense eyes examining glowing electronic decoding scanner tool";
        } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
            sceneSubject = isWide
                ? "rainy industrial harbor checkpoint at night, shipping freight containers, dark tactical van parked on wet reflective tarmac"
                : "close up portrait of covert operative looking through tactical binoculars in heavy rain downpour, water droplets, intense expression";
        } else if (/control|පාලක|command|office/.test(text)) {
            sceneSubject = isWide
                ? "central operations command control center, emergency red beacon alarm flashing, banks of terminal monitors"
                : "dramatic close up of operative hand swiftly extracting encrypted military hard drive from server slot";
        } else {
            sceneSubject = isWide
                ? "misty coastal shipping container dock yard at dawn, morning sea fog, figures running in distance"
                : "medium tracking shot of two male operatives sprinting towards docked escape speedboat under dawn sky";
        }

        // Storyboard Art Style Engineering (Ink & Shading)
        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, GTA loading screen art style, bold black ink outlines, cel shading, vibrant cinematic color palette, dramatic storyboard panel, no realistic photo, no 3d render`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${sceneSubject}, bold ink linework, film storyboard template, professional cinema sketch, no photo, no color`;
        }

        const seed = Math.floor(Math.random() * 899999) + 100000;
        const cleanPrompt = encodeURIComponent(prompt);
        // model=turbo භාවිතා කර ක්ෂණිකව (2-3s) high quality image render කර ගැනීම
        const pollUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&model=turbo&nologo=true&seed=${seed}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25s backend fetch timeout

        const imageRes = await fetch(pollUrl, {
            cache: "no-store",
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!imageRes.ok) {
            throw new Error("AI service timeout");
        }

        const arrayBuffer = await imageRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = imageRes.headers.get("content-type") || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            prompt
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed" },
            { status: 500 }
        );
    }
}