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
    const targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=960&height=540&model=turbo&nologo=true&seed=${seed}`;

    try {
        const res = await fetch(targetUrl, {
            cache: "no-store",
        });

        if (!res.ok) {
            return new NextResponse("Image generation failed", { status: 502 });
        }

        const contentType = res.headers.get("content-type") || "image/jpeg";
        const buffer = await res.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, immutable",
            },
        });
    } catch {
        return new NextResponse("Server proxy error", { status: 500 });
    }
}