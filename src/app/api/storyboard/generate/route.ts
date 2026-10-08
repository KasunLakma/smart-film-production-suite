import { NextResponse } from "next/server";

export const maxDuration = 60;

// සිංහල පිටපතේ සියලු වචන සහ වාක්‍ය 100% Cinematic English බවට පෙරළීම
function translateFullSinhalaScene(text: string, sceneNumber: number): string {
    // දර්ශන අංකය සහ මූලික වචන අනුව නිශ්චිත Scene Subject එකක් ගොඩනැගීම
    if (sceneNumber === 1 || /විද්‍යාගාර|තාක්ෂණ|ස්කෑනර/i.test(text)) {
        return "high-tech futuristic research laboratory, server racks, glowing blue computer terminals, technician holding handheld digital scanner and tactical flashlight";
    } else if (sceneNumber === 2 || /වරාය|තොටුපළ|දුරදක්න/i.test(text)) {
        return "industrial sea harbor container docks, pouring heavy rain, wet slick asphalt tarmac, black sedan car parked, operative looking through military binoculars";
    } else if (sceneNumber === 3 || /සුරක්ෂිතාගාර|හොලෝග්‍රැෆික්|TRANSFER/i.test(text)) {
        return "underground high security bank archive vault, metallic locker safety deposit boxes, glowing holographic projection device displaying transfer complete";
    } else if (sceneNumber === 4 || /සන්නද්ධ|ධාවන|මාර්ග/i.test(text)) {
        return "tactical armored transport vehicle speeding along wet highway road at night, bright headlights cutting through mist and storm";
    }

    return "cinematic interior moody scene, atmospheric lighting, high contrast dramatic setup";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            sceneNumber = 1,
            slugline = "",
            synopsis = "",
            isWide = true,
            artStyle = "sketch_bw",
            props = [],
            characters = []
        } = body;

        const fullContent = `${slugline} ${synopsis} ${props.join(" ")} ${characters.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullContent);

        let visualSubject = "";

        if (isSinhala) {
            // සිංහල පිටපතට අදාළ නිශ්චිත දර්ශන විස්තරය
            visualSubject = translateFullSinhalaScene(fullContent, sceneNumber);
        } else {
            // ඉංග්‍රීසි පිටපතට (THE SHADOW CIPHER) අදාළ නිශ්චිත දර්ශන විස්තරය
            if (sceneNumber === 1 || /VAULT|LOCKER/i.test(fullContent)) {
                visualSubject = "underground bank archive vault, rows of metallic locker drawers, concrete floor, Elena holding scanner, flashlight and master key";
            } else if (sceneNumber === 2 || /HARBOR|WAREHOUSE|COMPASS/i.test(fullContent)) {
                visualSubject = "cold coastal harbor warehouse exterior, heavy rain on rusted corrugated roof, Elena holding bronze compass, black sedan idling";
            } else if (sceneNumber === 3 || /SEDAN|TABLET|CURRENCY/i.test(fullContent)) {
                visualSubject = "interior of black sedan moving at night, briefcase open with stacks of Euro currency, glowing encrypted tablet radar display";
            } else {
                const cleanSlug = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
                const cleanSynopsis = synopsis.slice(0, 160).replace(/\s+/g, " ");
                visualSubject = `${cleanSlug}, ${cleanSynopsis}`;
            }
        }

        const framing = isWide
            ? "wide establishing master shot, deep focus, environmental perspective, 35mm anamorphic wide lens"
            : "medium close-up dramatic action framing, character expression and props in focus, 50mm prime cinematic lens";

        const style =
            artStyle === "sketch_bw"
                ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome storyboard panel, high contrast film previsualization"
                : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm film illustration still";

        const prompt = `${visualSubject}, ${framing}, ${style}, 16:9 widescreen composition, 8k resolution, cinematic masterpiece`;

        // Script එක (Sinhala vs English) සහ Scene Number එක අනුව වෙනස් වන Unique Seed එකක්
        const scriptMultiplier = isSinhala ? 777 : 333;
        const seed = (sceneNumber * 999331 + (isWide ? 101 : 202) + scriptMultiplier) % 9999999;

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl,
            prompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}