import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slugline = "", synopsis = "", isWide = true, artStyle = "sketch_bw", props = [], characters = [] } = body;

        const fullText = `${slugline} ${synopsis} ${props.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);

        let subject = "";

        if (isSinhala) {
            if (/විද්‍යාගාර|තාක්ෂණ/i.test(fullText)) {
                subject = "futuristic laboratory interior, glowing screens, digital equipment";
            } else if (/වරාය|නැව්|තොටුපළ/i.test(fullText)) {
                subject = "industrial harbor docks, shipping containers, pouring rain, wet asphalt";
            } else if (/රථය|කාර්/i.test(fullText)) {
                subject = "black sedan vehicle interior, highway at night, glowing dashboard";
            } else {
                subject = "dramatic cinematic interior thriller scene";
            }
        } else {
            if (/VAULT|LOCKER/i.test(fullText)) {
                subject = "underground bank archive vault, metallic lockers, safe deposit boxes, briefcase";
            } else if (/HARBOR|WAREHOUSE|PIER/i.test(fullText)) {
                subject = "old harbor warehouse exterior, heavy rain, black sedan car, industrial cranes";
            } else if (/SEDAN|CAR|HIGHWAY/i.test(fullText)) {
                subject = "inside moving black sedan car at night, encrypted tablet screen glowing";
            } else {
                subject = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim() || "cinematic scene sequence";
            }
        }

        const framing = isWide
            ? "wide establishing master shot, deep focus, environmental view, 35mm lens"
            : "medium close-up dramatic shot, character face and props in focus, 50mm lens";

        const style = artStyle === "sketch_bw"
            ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome, storyboard panel"
            : "graphic novel comic illustration, bold ink outlines, comic color palette, 35mm film illustration";

        const finalPrompt = `${subject}, ${framing}, ${style}, 16:9 widescreen, cinematic film still`;

        // අහඹු සහ දර්ශනයට අදාළ seed එකක්
        const seed = Math.floor(Math.random() * 8999999) + 1000000;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({ success: true, imageUrl, prompt: finalPrompt });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}