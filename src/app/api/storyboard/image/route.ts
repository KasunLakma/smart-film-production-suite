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

    // Fallback: 404 නොවී සෘජුවම බ්‍රවුසරයට Valid SVG Storyboard Panel එකක් stream කිරීම
    const fallbackSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
      <rect width="960" height="540" fill="#0d1117"/>
      <rect x="30" y="25" width="900" height="490" fill="none" stroke="#334155" stroke-width="2"/>
      <line x1="30" y1="340" x2="930" y2="340" stroke="#475569" stroke-width="1.5" stroke-dasharray="4"/>
      <line x1="480" y1="340" x2="30" y2="515" stroke="#334155" stroke-width="1.5"/>
      <line x1="480" y1="340" x2="930" y2="515" stroke="#334155" stroke-width="1.5"/>
      <circle cx="480" cy="280" r="45" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <rect x="420" y="340" width="120" height="100" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
      <rect x="30" y="465" width="900" height="50" fill="#040806" stroke="#10b981" stroke-width="1"/>
      <text x="60" y="497" fill="#10b981" font-family="monospace" font-size="18" font-weight="bold">STORYBOARD PANEL</text>
      <text x="320" y="496" fill="#94a3b8" font-family="sans-serif" font-size="13">Cinematic Framing Reference Sketch</text>
    </svg>
  `;

    return new NextResponse(fallbackSvg, {
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=86400",
        },
    });
}
