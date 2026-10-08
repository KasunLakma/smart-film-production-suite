import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { sceneNumber = 1, slugline = "", synopsis = "", props = [], characters = [], isWide = true, artStyle = "sketch_bw" } = await req.json();

        const fullContent = `${slugline} ${synopsis} ${props.join(" ")} ${characters.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullContent);

        let sceneSubject = "";

        if (isSinhala) {
            if (sceneNumber === 1 || /විද්‍යාගාර|තාක්ෂණ|ස්කෑනර/i.test(fullContent)) {
                sceneSubject = isWide
                    ? "high tech cybernetics research laboratory, illuminated computer server arrays, holographic console desk in center, deep perspective"
                    : "medium close-up of tactical male technician with focused eyes examining glowing electronic decoding scanner gadget with circuit lights";
            } else if (sceneNumber === 2 || /වරාය|තොටුපළ|දුරදක්න/i.test(fullContent)) {
                sceneSubject = isWide
                    ? "rainy industrial harbor checkpoint at night, shipping freight containers, dark tactical surveillance van parked on wet tarmac"
                    : "close up portrait of covert operative looking through tactical binoculars in heavy rain downpour, water droplets, intense expression";
            } else if (sceneNumber === 3 || /සුරක්ෂිතාගාර|හොලෝග්‍රැෆික්|TRANSFER/i.test(fullContent)) {
                sceneSubject = isWide
                    ? "high security central archive vault, rows of metallic locker drawers, emergency red alarm beacon, holographic projection screen"
                    : "dramatic tight close up of operative hand swiftly extracting encrypted data storage cartridge from locker terminal slot";
            } else {
                sceneSubject = isWide
                    ? "tactical armored transport vehicle speeding along wet highway road at night, headlights cutting mist and storm"
                    : "medium close tracking action shot of operatives inside vehicle monitoring illuminated tactical radar display";
            }
        } else {
            if (sceneNumber === 1 || /VAULT|LOCKER/i.test(fullContent)) {
                sceneSubject = isWide
                    ? "underground bank archive vault, rows of metallic locker drawers, concrete floor, Elena holding scanner, flashlight and master key"
                    : "close up of Elena opening metallic locker drawer with master skeleton key, flashlight beam illuminating interior";
            } else if (sceneNumber === 2 || /HARBOR|WAREHOUSE|COMPASS/i.test(fullContent)) {
                sceneSubject = isWide
                    ? "cold coastal harbor warehouse exterior, heavy rain on corrugated roof, Elena holding bronze compass, black sedan idling"
                    : "tight close up of Elena holding antique bronze compass in heavy rain, water splashing off wet metallic casing";
            } else if (sceneNumber === 3 || /SEDAN|TABLET|CURRENCY/i.test(fullContent)) {
                sceneSubject = isWide
                    ? "interior of black sedan moving at night, briefcase open with stacks of Euro currency, glowing encrypted tablet radar display"
                    : "close up of glowing rugged tablet displaying decrypted radar map coordinates inside dark moving sedan";
            } else {
                const cleanSlug = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
                sceneSubject = isWide
                    ? `wide establishing perspective of ${cleanSlug}`
                    : `dramatic close up character action frame in ${cleanSlug}`;
            }
        }

        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, bold black ink outlines, cel shading, vibrant cinematic colors, dramatic storyboard panel, no realistic photo`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${sceneSubject}, bold ink linework, film storyboard template, professional cinema sketch, high contrast, no photo, no color`;
        }

        const scriptMultiplier = isSinhala ? 777 : 333;
        const seed = (sceneNumber * 999331 + (isWide ? 101 : 202) + scriptMultiplier + Math.floor(Math.random() * 500)) % 9999999;
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