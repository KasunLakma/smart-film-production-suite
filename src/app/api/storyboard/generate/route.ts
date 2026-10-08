import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slugline = "", isWide = true, artStyle = "sketch_bw", synopsis = "" } = body;

        const fullText = `${slugline} ${synopsis}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);

        let locationEng = "";
        let lightingEng = "";
        let actionEng = "";

        if (isSinhala) {
            const isExt = /බාහිර|EXT/i.test(fullText);
            const isNight = /රාත්‍රී|NIGHT|අඳුරු|සන්ධ්‍යා|DARK/i.test(fullText);

            locationEng = isExt ? "exterior film scene, architectural cinematic space" : "interior moody room, film noir set";
            lightingEng = isNight ? "dramatic night chiaroscuro shadows" : "natural cinematic daylight";
            actionEng = "actor in intense cinematic composition";
        } else {
            locationEng = slugline.replace(/SCENE\s*\d+[:.\-\s]*/i, "").trim() || "cinematic scene sequence";
            lightingEng = /NIGHT/i.test(slugline) ? "dramatic atmospheric night shadows" : "cinematic daylight illumination";
            actionEng = synopsis.slice(0, 140).replace(/\s+/g, " ") || "actors in dynamic staging";
        }

        const framingEng = isWide
            ? "wide establishing master shot, environmental depth, 35mm anamorphic wide lens"
            : "medium close-up dramatic action framing, character focus, shallow depth of field, 50mm prime lens";

        // Thesis එකේ තිබූ exact StudioBinder B&W Sketch & Graphic Novel prompts
        const styleEng = artStyle === "sketch_bw"
            ? "StudioBinder storyboard sketch, pencil line drawing, charcoal shading, black and white monochrome storyboard panel, high contrast cinematic concept art, cross-hatching, storyboard paper texture"
            : "graphic novel comic illustration, dynamic ink outlines, moody comic color palette, cinematic lighting, 35mm film illustration still";

        const prompt = `${locationEng}, ${actionEng}, ${lightingEng}, ${framingEng}, ${styleEng}, 16:9 widescreen, masterpiece`;

        const seed = Math.floor(Math.random() * 8999999) + 1000000;

        // Cloudflare / Model bypass direct image stream URL
        const finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl: finalImageUrl,
            prompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}