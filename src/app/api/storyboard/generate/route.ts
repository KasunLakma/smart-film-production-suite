import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();

        const text = (slugline || "").toLowerCase();

        // 1. Scene & Shot Context Extraction (Strict Storyboard Action)
        let environment = "";
        let characterAction = "";

        if (/lab|විද්‍යාගාර|computer|research|tech/.test(text)) {
            environment = "underground cybernetics research laboratory with glowing server arrays and holographic console table";
            characterAction = isWide
                ? "wide establishing camera angle, male technician figure seen from distance working at computer console, chiaroscuro lighting"
                : "tight dynamic camera framing, close up of South Asian male technician hands and face inspecting a high-tech glowing electronic decoder scanner gadget with circuit lights";
        } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
            environment = "industrial cargo harbor shipping gate at night in heavy pouring rain with stacked metal shipping containers";
            characterAction = isWide
                ? "wide cinematic angle, black tactical surveillance van parked under street lamps on wet asphalt with rain reflections"
                : "dramatic over-the-shoulder close up of a focused male spy agent wearing hooded tactical jacket holding military binoculars looking through rainy window, water droplets";
        } else if (/control|පාලක|command|office/.test(text)) {
            environment = "high security operations control room with flashing emergency alarm beacon sirens and mainframe computer banks";
            characterAction = isWide
                ? "wide establishing master shot of server consoles, flashing alarm warning beacons casting deep shadows"
                : "intense close-up action frame of operative hand pulling out an encrypted military hard drive cartridge from server chassis, motion lines";
        } else {
            environment = "misty coastal container shipyard docks at early morning dawn with dense fog rolling over water";
            characterAction = isWide
                ? "wide dramatic framing, two male operative silhouettes running between cargo shipping containers towards ocean pier"
                : "medium close tracking action shot of two male agents in intense sprint towards docked speed boat, urgency, dramatic facial expression";
        }

        // 2. Strict Storyboard Prompt Construction
        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic storyboard panel, GTA loading screen concept art, ${characterAction}, setting of ${environment}, bold ink linework, vibrant cel shaded colors, dramatic cinematography, 16:9 widescreen frame, no photo, no 3d render`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, pencil crosshatching, ${characterAction}, in ${environment}, dynamic movie storyboard panel, high contrast noir shadows, cinema concept sketch, 16:9 widescreen, no color, no photo, no watermark`;
        }

        const cleanPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 899999) + 100000;

        // Direct Image Fetch with Fallback models
        const primaryUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&model=turbo&nologo=true&seed=${seed}`;
        const secondaryUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&model=flux&nologo=true&seed=${seed}`;

        let imageBuffer: ArrayBuffer | null = null;
        let contentType = "image/jpeg";

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 18000);
            const res = await fetch(primaryUrl, { cache: "no-store", signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) {
                imageBuffer = await res.arrayBuffer();
                contentType = res.headers.get("content-type") || "image/jpeg";
            }
        } catch { }

        // Fallback to secondary if primary timed out
        if (!imageBuffer) {
            try {
                const controller2 = new AbortController();
                const timeout2 = setTimeout(() => controller2.abort(), 18000);
                const res2 = await fetch(secondaryUrl, { cache: "no-store", signal: controller2.signal });
                clearTimeout2(timeout2);
                if (res2.ok) {
                    imageBuffer = await res2.arrayBuffer();
                    contentType = res2.headers.get("content-type") || "image/jpeg";
                }
            } catch { }
        }

        if (!imageBuffer) {
            throw new Error("Image synthesis timed out across all engines");
        }

        const base64 = Buffer.from(imageBuffer).toString("base64");
        const dataUrl = `data:${contentType};base64,${base64}`;

        return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            prompt
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed to render frame" },
            { status: 500 }
        );
    }
}