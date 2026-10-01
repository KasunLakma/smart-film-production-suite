import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();
        const text = (slugline || "").toLowerCase();

        let sceneSubject = "";

        if (/lab|research|tech|විද්‍යාගාර/.test(text)) {
            sceneSubject = isWide
                ? "high tech cybernetics research laboratory, illuminated computer server arrays, holographic console desk in center, deep perspective"
                : "medium close-up of tactical male technician with focused eyes examining glowing electronic decoding scanner gadget with circuit lights";
        } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
            sceneSubject = isWide
                ? "rainy industrial harbor checkpoint at night, shipping freight containers, dark tactical surveillance van parked on wet tarmac"
                : "close up portrait of covert operative looking through tactical binoculars in heavy rain downpour, water droplets, intense expression";
        } else if (/control|command|office|පාලක/.test(text) || /scene[\s_-]*0?3/.test(text)) {
            sceneSubject = isWide
                ? "high security central operations command control center, emergency red beacon alarm flashing, banks of terminal monitors"
                : "dramatic tight close up of operative hand swiftly extracting encrypted military hard drive cartridge from server rack terminal slot, sparks and indicator lights";
        } else {
            // Scene 04 / Dawn / Escape
            sceneSubject = isWide
                ? "misty coastal container shipyard docks at early morning dawn, dense morning fog over ocean pier, figures running in distance"
                : "medium close tracking action shot of two tactical male operatives in intense sprint towards docked escape speedboat under dawn sky";
        }

        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, GTA loading screen art style, bold black ink outlines, cel shading, vibrant cinematic colors, dramatic storyboard panel, no realistic photo, no 3d render`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${sceneSubject}, bold ink linework, film storyboard template, professional cinema sketch, high contrast, no photo, no color`;
        }

        const seed = Math.floor(Math.random() * 899999) + 100000;
        const cleanPrompt = encodeURIComponent(prompt);
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