import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slugline = "", isWide = true, artStyle = "sketch_bw" } = body;

        // සිංහල අකුරු ඉවත් කර පිරිසිදු cinematic prompt එකක් සෑදීම
        let cleanLocation = slugline.replace(/[\u0D80-\u0DFF]/g, "film location scene").trim();
        if (!cleanLocation || cleanLocation.length < 5) {
            cleanLocation = "dramatic cinematic interior sequence, moody lighting";
        }

        const stylePrompt =
            artStyle === "sketch_bw"
                ? "StudioBinder storyboard sketch, pencil line drawing, black and white charcoal shading, detailed storyboard panel, dynamic angle, high contrast, monochrome artwork"
                : "graphic novel storyboard panel, rich ink outline, comic book color palette, dramatic cinematic lighting, 35mm film illustration";

        const framing = isWide
            ? "wide establishing master shot, cinematic composition, 16:9 widescreen aspect ratio"
            : "medium close-up dramatic action framing, character focus, 16:9 widescreen aspect ratio";

        const fullPrompt = `${cleanLocation}, ${framing}, ${stylePrompt}, highly detailed, cinematic masterpiece`;
        const encoded = encodeURIComponent(fullPrompt);
        const seed = Math.floor(Math.random() * 9999999);

        const targetUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        // Backend එක හරහා image එක download කර base64 දත්තයක් ලෙස frontend එකට යැවීම (CORS / Adblock bypass)
        const imgRes = await fetch(targetUrl);
        if (!imgRes.ok) {
            // Fallback direct url
            return NextResponse.json({ success: true, imageUrl: targetUrl });
        }

        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        const dataUri = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
            success: true,
            imageUrl: dataUri
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        // Failure fallback
        return NextResponse.json(
            {
                success: true,
                imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/1280/720`
            },
            { status: 200 }
        );
    }
}