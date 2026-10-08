import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { slugline = "", synopsis = "", isWide = true, artStyle = "sketch_bw", props = [], characters = [] } = body;

        const fullText = `${slugline} ${synopsis} ${props.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);

        let sceneSubject = "";

        // 1. භාෂාව හඳුනාගෙන නිශ්චිත දර්ශන පසුතලය (Visual Subject) තැනීම
        if (isSinhala) {
            if (/විද්‍යාගාර|තාක්ෂණ/i.test(fullText)) {
                sceneSubject = "high-tech research laboratory interior, glowing computer monitors, digital scanning equipment";
            } else if (/වරාය|නැව්|තොටුපළ/i.test(fullText)) {
                sceneSubject = "industrial harbor warehouse exterior, heavy rain pouring on wet asphalt tarmac, black sedan car parked";
            } else if (/රථය|කාර්|වේගයෙන්/i.test(fullText)) {
                sceneSubject = "interior of moving black sedan car at night, glowing electronic dashboard, encrypted tablet screen";
            } else {
                sceneSubject = "cinematic thriller sequence, intense actors in dramatic scene";
            }
        } else {
            if (/VAULT|LOCKER|ARCHIVE/i.test(fullText)) {
                sceneSubject = "underground high security archive vault, metallic locker drawers, concrete corridor, leather briefcase, brass key";
            } else if (/HARBOR|WAREHOUSE|PIER/i.test(fullText)) {
                sceneSubject = "old harbor warehouse, heavy coastal rain, idling black sedan with bright headlights cutting through mist";
            } else if (/SEDAN|HIGHWAY|TABLET/i.test(fullText)) {
                sceneSubject = "interior of black sedan racing along highway at night, glowing radar on tablet screen, cutting dashboard wires";
            } else {
                const cleanSlug = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
                sceneSubject = cleanSlug || "dramatic cinema film scene";
            }
        }

        // Shot Framing
        const framing = isWide
            ? "wide establishing master shot, deep environmental composition, wide angle lens, 35mm anamorphic"
            : "medium close-up dramatic action shot, intense character expression, props in focus, shallow depth of field, 50mm prime";

        // Art Style
        const style = artStyle === "sketch_bw"
            ? "StudioBinder storyboard sketch, pencil line drawing, charcoal shading, black and white monochrome storyboard panel, high contrast cinematic concept art"
            : "graphic novel comic illustration, bold ink outlines, comic color palette, cinematic lighting, 35mm film illustration still";

        // 100% English Visual Prompt
        const finalPrompt = `${sceneSubject}, ${framing}, ${style}, 16:9 widescreen composition, highly detailed`;

        // 2. Server-Side Direct Image Fetch (Base64 Data URI)
        const seed = Math.floor(Math.random() * 8999999) + 1000000;
        const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&seed=${seed}&nologo=true`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        try {
            const imgRes = await fetch(directUrl, {
                signal: controller.signal,
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            clearTimeout(timeout);

            if (imgRes.ok) {
                const arrayBuffer = await imgRes.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
                const dataUri = `data:${mimeType};base64,${base64}`;

                return NextResponse.json({
                    success: true,
                    imageUrl: dataUri,
                    prompt: finalPrompt
                });
            }
        } catch (fetchErr) {
            clearTimeout(timeout);
        }

        // Fallback: Direct high-speed seed url
        return NextResponse.json({
            success: true,
            imageUrl: directUrl,
            prompt: finalPrompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}