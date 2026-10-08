import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();
        const text = (slugline || "").toLowerCase();

        let sceneSubject = "";

        // Scene 01 (Screenshot 2373 හි තිබූ මුල් Lab / Conference Room Setup එක)
        if (/lab|research|tech|විද්‍යාගාර|තාක්ෂණ/i.test(text) || /scene[\s_-]*0?1/i.test(text)) {
            sceneSubject = isWide
                ? "high tech cybernetics research laboratory interior, large dark metallic conference table in center, ceiling linear strip lights glowing, illuminated server racks in background, wide architectural perspective"
                : "close up portrait of tactical male technician with focused eyes wearing modern glasses, illuminated by computer screen glow, intense dramatic expression";
        } else if (/harbor|port|dock|වරාය|තොටුපළ/i.test(text) || /scene[\s_-]*0?2/i.test(text)) {
            sceneSubject = isWide
                ? "rainy industrial harbor checkpoint at night, shipping freight containers, dark tactical surveillance van parked on wet tarmac"
                : "close up portrait of hooded covert operative looking through tactical binoculars in heavy rain downpour, water droplets, intense expression";
        } else if (/control|command|office|සුරක්ෂිතාගාර|vault/i.test(text) || /scene[\s_-]*0?3/i.test(text)) {
            sceneSubject = isWide
                ? "high security central operations command control center, emergency beacon alarm flashing, banks of terminal monitors and blueprint screens"
                : "dramatic tight close up of operative hand swiftly extracting encrypted military data storage hard drive cartridge from server rack terminal slot";
        } else {
            sceneSubject = isWide
                ? "misty coastal container shipyard docks at night, shipping container on wet tarmac, floodlights cutting mist"
                : "close up portrait of tactical operative wearing black hood looking into camera, dramatic rim lighting";
        }

        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, bold black ink outlines, cel shading, vibrant cinematic colors, dramatic storyboard panel, no realistic photo`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${sceneSubject}, bold ink linework, film storyboard template, professional cinema sketch, high contrast, monochrome, no photo, no color`;
        }

        // Screenshot 2373 හි තිබූ රූපයේ නියම seed එක
        const seed = isWide ? 441092 : 882041;
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