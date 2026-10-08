import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slugline = "", isWide = true, artStyle = "sketch_bw", synopsis = "" } = body;

        // 1. භාෂාව හඳුනාගෙන 100% Cinematic English Visual Prompt එකක් සෑදීම
        const fullText = `${slugline} ${synopsis}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);

        let locationEnglish = "";
        let lightingEnglish = "";

        if (isSinhala) {
            const isExt = /බාහිර|EXT/i.test(fullText);
            const isNight = /රාත්‍රී|NIGHT|අඳුරු|සන්ධ්‍යා|DARK/i.test(fullText);

            locationEnglish = isExt ? "exterior film set cinematic sequence" : "interior moody room scene";
            lightingEnglish = isNight ? "dramatic night lighting, deep shadows" : "bright cinematic day illumination";
        } else {
            locationEnglish = slugline.replace(/SCENE\s*\d+[:.\-\s]*/i, "").trim();
            lightingEnglish = /NIGHT/i.test(slugline) ? "dramatic night shadows" : "cinematic day lighting";
        }

        const framingEnglish = isWide
            ? "wide establishing cinematic master shot, 35mm anamorphic frame"
            : "medium close-up dramatic action framing, character focus, 50mm lens";

        const styleEnglish =
            artStyle === "sketch_bw"
                ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome drawing, high contrast storyboard panel"
                : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm film illustration";

        const prompt = `${locationEnglish}, ${framingEnglish}, ${lightingEnglish}, ${styleEnglish}, 16:9 widescreen composition, 8k resolution, cinematic masterpiece`;

        // 2. Real Dedicated AI Image Generator Endpoint Call
        const seed = Math.floor(Math.random() * 9000000) + 100000;
        const directApiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        // Server-side fetch image buffer
        const imgRes = await fetch(directApiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        if (!imgRes.ok) {
            throw new Error(`AI Image Generation failed with status: ${imgRes.status}`);
        }

        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        const dataUri = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
            success: true,
            imageUrl: dataUri,
            prompt
        });
    } catch (error: any) {
        console.error("Storyboard Dedicated API Error:", error);
        return NextResponse.json(
            { error: error.message || "Image Generation Error" },
            { status: 500 }
        );
    }
}