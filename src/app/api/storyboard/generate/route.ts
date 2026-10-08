import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sceneSlug = "", synopsis = "", isWide = true, artStyle = "sketch_bw", props = [], characters = [] } = body;

        // 1. භාෂාව හඳුනාගැනීම (Language Detection)
        const combinedText = `${sceneSlug} ${synopsis} ${props.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(combinedText);

        let locationPrompt = "";
        let lightingPrompt = "";
        let characterActionPrompt = "";

        // 2. භාෂාව කුමක් වුවත් 100% ගැලපෙන ඉංග්‍රීසි Prompt එක ගොඩනැගීම
        if (isSinhala) {
            const isExt = /බාහිර|EXT/i.test(combinedText);
            const isNight = /රාත්‍රී|NIGHT|අඳුරු|සන්ධ්‍යා|DARK/i.test(combinedText);

            locationPrompt = isExt
                ? "cinematic exterior film setting, moody environment"
                : "cinematic interior production room, architectural set";

            lightingPrompt = isNight
                ? "dramatic night atmosphere, low-key lighting, deep cinematic shadows"
                : "natural daylight illumination, 35mm film lighting style";

            const validProps = props.filter((p: string) => p && p !== "ප්‍රධාන පසුතල උපකරණ");
            const propsEng = validProps.length > 0 ? `visible props (${validProps.join(", ")})` : "authentic set props";
            const charEng = characters.length > 0 ? `actors performing as (${characters.join(", ")})` : "lead actor in scene";

            characterActionPrompt = `${charEng}, ${propsEng}`;
        } else {
            locationPrompt = sceneSlug.replace(/SCENE\s*\d+[:.\-\s]*/i, "").trim() || "cinematic scene location";
            lightingPrompt = /NIGHT/i.test(sceneSlug) ? "dramatic atmospheric night shadows" : "bright cinematic natural daylight";
            characterActionPrompt = synopsis.slice(0, 150).replace(/\s+/g, " ") || "actors in dynamic staging";
        }

        // Framing: Wide Master (WMS) vs Medium Close (MCU)
        const framingPrompt = isWide
            ? "wide establishing master shot, environmental composition, 35mm anamorphic wide lens"
            : "medium close-up dramatic action framing, character focus, shallow depth of field, 50mm lens";

        // Art Style නීති
        const stylePrompt = artStyle === "sketch_bw"
            ? "StudioBinder storyboard sketch, pencil drawing, charcoal shading, black and white monochrome line art, storyboard panel"
            : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm illustration";

        // 100% Cinematic English Visual Prompt
        const englishVisualPrompt = `${locationPrompt}, ${characterActionPrompt}, ${lightingPrompt}, ${framingPrompt}, ${stylePrompt}, 16:9 widescreen composition, 8k resolution, cinematic film still`;

        // 3. AI Image Engine එකට ඉංග්‍රීසි Prompt එක යැවීම
        const seed = Math.floor(Math.random() * 8999999) + 1000000;
        const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishVisualPrompt)}?width=1280&height=720&seed=${seed}&nologo=true`;

        return NextResponse.json({
            success: true,
            imageUrl: aiImageUrl,
            englishVisualPrompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Image Generation Failed" }, { status: 500 });
    }
}