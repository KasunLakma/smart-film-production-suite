import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();
        const text = (slugline || "").toLowerCase();

        // 1. Scene & Shot Context Extraction
        let sceneSubject = "cinematic interior scene with dramatic atmospheric chiaroscuro lighting";
        if (/lab|විද්‍යාගාර|computer|research|tech/.test(text)) {
            sceneSubject = isWide
                ? "high tech underground cybernetics research laboratory, illuminated server racks, central holographic table, wide cinematic angle"
                : "medium close-up of tactical male technician with focused eyes examining glowing electronic decoding scanner gadget with circuit lights";
        } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
            sceneSubject = isWide
                ? "rainy industrial cargo harbor shipping checkpoint at night, stacked metal containers, dark tactical surveillance van parked on wet reflective tarmac"
                : "dramatic close up portrait of focused male covert agent in hooded tactical gear holding military binoculars looking through rain, water droplets";
        } else if (/control|පාලක|command|office/.test(text)) {
            sceneSubject = isWide
                ? "high security central operations command control center, emergency red warning alarm beacon flashing, banks of terminal monitors"
                : "intense close-up action frame of operative hand swiftly extracting encrypted military hard drive cartridge from server chassis";
        } else {
            sceneSubject = isWide
                ? "misty coastal container shipyard docks at early morning dawn, dense morning fog over water, figures moving in distance"
                : "medium close tracking action shot of two male operatives in urgent sprint towards docked escape speedboat under dawn sky";
        }

        // 2. Strict Prompt Styling
        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, GTA loading screen art style, bold black ink outlines, cel shading, vibrant cinematic colors, dramatic storyboard panel, no realistic photo, no 3d render`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${sceneSubject}, bold ink linework, film storyboard template, professional cinema sketch, no photo, no color`;
        }

        const seed = Math.floor(Math.random() * 899999) + 100000;
        const cleanPrompt = encodeURIComponent(prompt);

        // Endpoints fallback array
        const candidateUrls = [
            `https://image.pollinations.ai/prompt/${cleanPrompt}?width=960&height=540&model=turbo&nologo=true&seed=${seed}`,
            `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=450&nologo=true&seed=${seed}`
        ];

        let finalImageUrl = candidateUrls[0];

        // Return the stream proxy URL directly with prompt fallback
        const proxyUrl = `/api/storyboard/image?prompt=${cleanPrompt}&seed=${seed}`;

        return NextResponse.json({
            success: true,
            imageUrl: proxyUrl,
            prompt
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed" },
            { status: 500 }
        );
    }
}