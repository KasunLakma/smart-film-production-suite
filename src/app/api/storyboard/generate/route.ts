import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slugline = "", isWide = true, artStyle = "sketch_bw" } = body;

        // සිංහල අකුරු තිබේ නම් visual prompt එක සඳහා generic cinematic location එකක් බවට හැරවීම
        let cleanLocation = slugline.replace(/[\u0D80-\u0DFF]/g, "cinematic film sequence").trim();
        if (!cleanLocation || cleanLocation.length < 5) {
            cleanLocation = "dramatic cinematic sequence in noir setting";
        }

        let stylePrompt = "";
        if (artStyle === "sketch_bw") {
            stylePrompt = `StudioBinder storyboard sketch, black and white pencil drawing, dynamic charcoal shading, detailed line art, professional film previsualization, anamorphic film framing, monochrome storyboard panel`;
        } else {
            stylePrompt = `graphic novel film storyboard, dynamic comic book color grading, rich moody ink outlines, cinematic lighting, 35mm film still illustration, anamorphic frame`;
        }

        const shotFraming = isWide
            ? "wide establishing cinematic master shot, deep focus, environmental perspective"
            : "medium close-up dramatic action framing, character focus, intense lighting";

        const fullPrompt = `${cleanLocation}, ${shotFraming}, ${stylePrompt}, 16:9 widescreen aspect ratio, highly detailed, masterwork`;
        const encodedPrompt = encodeURIComponent(fullPrompt);
        const seed = Math.floor(Math.random() * 999999);

        // 16:9 HD Frame via Flux / Pollinations
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Frame generation failed" }, { status: 500 });
    }
}