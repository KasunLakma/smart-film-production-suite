import { NextResponse } from "next/server";

export const maxDuration = 60;

function translateFullSinhalaScene(text: string, sceneNumber: number): string {
    if (sceneNumber === 1 || /විද්‍යාගාර|විද්යාගාර|තාක්ෂණ|ස්කෑනර|පර්යේෂණාගාර/i.test(text)) {
        return "high-tech research laboratory interior, glowing computer terminals, undercover technician holding digital scanner and tactical beam flashlight";
    } else if (sceneNumber === 2 || /වරාය|තොටුපළ|දුරදක්න|කන්ටේනර්/i.test(text)) {
        return "industrial sea harbor container docks, pouring heavy rain on wet asphalt, black sedan idling, operative holding military binoculars";
    } else if (sceneNumber === 3 || /සුරක්ෂිතාගාර|හොලෝග්‍රැෆික්|TRANSFER|ලෝහමය/i.test(text)) {
        return "underground high security bank archive vault, metallic locker rows, glowing blue holographic projection device displaying TRANSFER COMPLETE";
    } else if (sceneNumber === 4 || /සන්නද්ධ|ධාවන|මාර්ග|අධිවේගී/i.test(text)) {
        return "tactical armored transport vehicle speeding along wet highway road at night, headlights cutting mist and heavy rain";
    } else if (/රථ|කාර්|සෙඩාන්/i.test(text)) {
        return "black sedan vehicle parked in atmospheric night setting";
    } else if (/කාමර|නිවස|ගෙදර/i.test(text)) {
        return "cinematic interior house room with warm dramatic moody lighting";
    } else if (/පාර|වීදිය|නගර/i.test(text)) {
        return "cinematic urban city street at dusk, wet pavement and ambient lighting";
    } else if (/කැලෑ|වනය|ගස්/i.test(text)) {
        return "atmospheric dense forest scene, mist hanging between trees, cinematic lighting";
    } else if (/මුහුද|වෙරළ/i.test(text)) {
        return "coastal ocean shore, dramatic sky and moody atmosphere";
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
            visualSubject = translateFullSinhalaScene(fullContent, sceneNumber);
        } else {
            if (sceneNumber === 1 || /VAULT|LOCKER/i.test(fullContent)) {
                visualSubject = "underground bank archive vault, rows of metallic locker drawers, concrete floor, Elena holding scanner, flashlight and master key";
            } else if (sceneNumber === 2 || /HARBOR|WAREHOUSE|COMPASS/i.test(fullContent)) {
                visualSubject = "cold coastal harbor warehouse exterior, heavy rain on corrugated roof, Elena holding bronze compass, black sedan idling";
            } else if (sceneNumber === 3 || /SEDAN|TABLET|CURRENCY/i.test(fullContent)) {
                visualSubject = "interior of black sedan moving at night, briefcase open with stacks of Euro currency, glowing encrypted tablet radar display";
            } else {
                const cleanSlug = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
                const cleanSynopsis = synopsis.slice(0, 200).replace(/\s+/g, " ");
                const propsInfo = props.length > 0 ? `, key props: ${props.join(", ")}` : "";
                const charInfo = characters.length > 0 ? `, featuring ${characters.join(", ")}` : "";
                visualSubject = `${cleanSlug}, ${cleanSynopsis}${propsInfo}${charInfo}`;
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

        const seed = Math.floor(Math.random() * 9000000) + 1000000;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true`;

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
