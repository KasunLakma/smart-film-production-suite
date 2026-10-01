import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();

        const text = (slugline || "").toLowerCase();

        // Scene Environment Detection
        let sceneSubject = "cinematic interior scene with dramatic atmospheric lighting";
        if (/lab|විද්‍යාගාර|computer|research|tech/.test(text)) {
            sceneSubject = isWide
                ? "high tech cybernetics research laboratory, illuminated computer server arrays, holographic console desk in center, deep perspective"
                : "medium close-up of tactical male operative with intense eyes examining glowing electronic decoding scanner tool";
        } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
            sceneSubject = isWide
                ? "rainy industrial harbor checkpoint at night, shipping freight container stacks, dark tactical van parked on wet reflective tarmac"
                : "close up portrait of operative looking through tactical binoculars in heavy rain downpour, water droplets, intense expression";
        } else if (/control|පාලක|command|office/.test(text)) {
            sceneSubject = isWide
                ? "central operations command control center, emergency red beacon alarm flashing, banks of terminal monitors"
                : "dramatic close up of operative hand swiftly extracting encrypted military hard drive from terminal slot";
        } else {
            sceneSubject = isWide
                ? "misty coastal shipping container dock yard at dawn, morning sea fog, figures running in distance"
                : "medium tracking shot of two male operatives sprinting towards docked escape speedboat under dawn sky";
        }

        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, GTA loading screen art style, bold black ink outlines, cel shading, vibrant cinematic color palette, dramatic storyboard panel, no realistic photo, no 3d render`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${sceneSubject}, bold ink linework, film storyboard template, professional cinema sketch, no photo, no color`;
        }

        const seed = Math.floor(Math.random() * 899999) + 100000;
        const cleanPrompt = encodeURIComponent(prompt);

        // Endpoints array for maximum uptime
        const endpoints = [
            `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&model=turbo&nologo=true&seed=${seed}`,
            `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=450&nologo=true&seed=${seed}`
        ];

        let imageBuffer: ArrayBuffer | null = null;
        let contentType = "image/jpeg";

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);
                const res = await fetch(url, { cache: "no-store", signal: controller.signal });
                clearTimeout(timeout);
                if (res.ok) {
                    imageBuffer = await res.arrayBuffer();
                    contentType = res.headers.get("content-type") || "image/jpeg";
                    break;
                }
            } catch {
                continue;
            }
        }

        if (!imageBuffer) {
            throw new Error("Temporary synthesis timeout");
        }

        const base64 = Buffer.from(imageBuffer).toString("base64");
        const dataUrl = `data:${contentType};base64,${base64}`;

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