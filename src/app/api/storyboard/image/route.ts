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

    const sources = [
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=960&height=540&model=turbo&nologo=true&seed=${seed}`,
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${seed}`
    ];

    for (const url of sources) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(url, { cache: "no-store", signal: controller.signal });
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
        } catch {
            continue;
        }
    }

    // If external AI times out, redirect to safe procedural graphic sketch
    return NextResponse.redirect(new URL("/storyboard-placeholder.png", req.url));
}