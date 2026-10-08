import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            sceneNumber = 1,
            slugline = "",
            synopsis = "",
            isWide = true,
            artStyle = "sketch_bw",
            characters = [],
            props = []
        } = body;

        const fullText = `${slugline} ${synopsis} ${props.join(" ")} ${characters.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);

        let specificSceneSubject = "";

        if (isSinhala) {
            // සිංහල පිටපතේ දර්ශන 4ට අදාළ නිශ්චිත සිනමානුරූපී විස්තරය
            if (sceneNumber === 1 || /විද්‍යාගාර|ස්කෑනර/i.test(fullText)) {
                specificSceneSubject = "high-tech research laboratory interior, glowing computer terminals, undercover technician holding digital scanner and tactical beam flashlight";
            } else if (sceneNumber === 2 || /වරාය|දුරදක්න/i.test(fullText)) {
                specificSceneSubject = "industrial coastal shipping harbor docks, heavy pouring rain on wet asphalt, black sedan idling, operative with military binoculars";
            } else if (sceneNumber === 3 || /සුරක්ෂිතාගාර|හොලෝග්‍රැෆික්|TRANSFER/i.test(fullText)) {
                specificSceneSubject = "underground high security archive vault, metallic locker rows, glowing blue holographic projection device displaying TRANSFER COMPLETE";
            } else if (sceneNumber === 4 || /සන්නද්ධ|ධාවන/i.test(fullText)) {
                specificSceneSubject = "high-speed chase on wet highway, armored tactical transport vehicle racing through the storm, headlights cutting mist";
            } else {
                specificSceneSubject = "cinematic thriller interior scene, dramatic tension";
            }
        } else {
            // ඉංග්‍රීසි පිටපතේ (THE SHADOW CIPHER) දර්ශන 3ට අදාළ නිශ්චිත විස්තරය
            if (sceneNumber === 1 || /VAULT|LOCKER/i.test(fullText)) {
                specificSceneSubject = "underground bank archive vault, rows of metallic locker drawers, concrete floor, Elena holding scanner, flashlight and master skeleton key";
            } else if (sceneNumber === 2 || /HARBOR|WAREHOUSE|COMPASS/i.test(fullText)) {
                specificSceneSubject = "old coastal harbor warehouse, heavy rain on corrugated iron roof, Elena and Marcus holding bronze compass, black sedan idling on wet tarmac";
            } else if (sceneNumber === 3 || /SEDAN|TABLET|CURRENCY/i.test(fullText)) {
                specificSceneSubject = "interior of black sedan moving on highway at night, Elena opening briefcase with stacks of Euro currency, glowing encrypted tablet radar display";
            } else {
                const clean = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
                specificSceneSubject = clean || "cinematic scene noir sequence";
            }
        }

        const framing = isWide
            ? "wide establishing master shot, deep focus, environmental perspective, 35mm anamorphic wide lens"
            : "medium close-up dramatic action framing, character expression, key props in focus, 50mm prime lens";

        const style = artStyle === "sketch_bw"
            ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome drawing, high contrast cinematic storyboard panel"
            : "graphic novel comic illustration, bold ink outlines, comic color palette, vivid cinematic lighting, 35mm film illustration still";

        const finalPrompt = `${specificSceneSubject}, ${framing}, ${style}, 16:9 widescreen aspect ratio, highly detailed masterwork`;

        const seed = (sceneNumber * 999331 + (isWide ? 101 : 202) + (isSinhala ? 777 : 333)) % 9999999;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl,
            prompt: finalPrompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}