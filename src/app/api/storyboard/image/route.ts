import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt");
    const seed = searchParams.get("seed") || "123456";

    if (!prompt) {
        return new NextResponse("Prompt required", { status: 400 });
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // Timeout එක තත්පර 25 දක්වා වැඩි කර ඇත

        const res = await fetch(targetUrl, {
            cache: "no-store",
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
            const contentType = res.headers.get("content-type") || "image/jpeg";
            const buffer = await res.arrayBuffer();
            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=604800, immutable",
                },
            });
        }
    } catch (err) {
        console.error("Direct fetch failed, redirecting:", err);
    }

    // Fetch එක delay වුවහොත් fallback svg වෙනුවට සෘජුවම image එකට redirect කරයි (එවිට මුල් පින්තූරයම load වේ)
    return NextResponse.redirect(targetUrl);
}