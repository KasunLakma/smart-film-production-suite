import { NextResponse } from "next/server";

export const maxDuration = 60;

// සිංහල සිනමාත්මක වචන සෘජුවම ඉංග්‍රීසි විස්තර බවට පත් කරන සිතියම (Semantic Map)
function translateSinhalaToCinematicEnglish(text: string): string {
    let eng = text;

    // Locations
    eng = eng.replace(/තාක්ෂණ\s*විද්‍යාගාරය/gi, "futuristic research laboratory filled with computer terminals and glowing tech");
    eng = eng.replace(/කාමරය/gi, "dimly lit enclosed room");
    eng = eng.replace(/වරාය(\s*පිවිසුම්\s*මාර්ගය)?/gi, "industrial harbor docks, wet asphalt, ocean shipping containers, rain");
    eng = eng.replace(/මාර්ගය/gi, "wet asphalt road with vehicle headlights");
    eng = eng.replace(/ගබඩාව/gi, "abandoned industrial warehouse with rusted corrugated metal");
    eng = eng.replace(/රථය|මෝටර්\s*රථය/gi, "black sedan car parked at night");
    eng = eng.replace(/සුරක්ෂිතාගාරය/gi, "high-security underground archive vault with metallic locker boxes");

    // Props
    eng = eng.replace(/විදුලි\s*පන්දම/gi, "tactical beam flashlight");
    eng = eng.replace(/ඩිජිටල්\s*ස්කෑනරය/gi, "handheld glowing digital scanner device");
    eng = eng.replace(/හොලෝග්‍රැෆික්\s*උපකරණය/gi, "holographic projection device with blue laser interface");
    eng = eng.replace(/ලියකියවිලි\s*බෑගය/gi, "leather vintage briefcase");
    eng = eng.replace(/මාලිමාව|ලෝකඩ\s*මාලිමාව/gi, "antique brass bronze compass with etched navigation coordinates");
    eng = eng.replace(/දුරදක්නය/gi, "military binoculars");
    eng = eng.replace(/යතුර/gi, "heavy brass master skeleton key");

    // Atmospheres
    eng = eng.replace(/වැසි|වහින/gi, "heavy pouring rain and wet reflections");
    eng = eng.replace(/අඳුරු/gi, "moody dark atmospheric shadow contrast");
    eng = eng.replace(/රාත්‍රී/gi, "night sequence under dim amber sodium lights");

    // Characters
    eng = eng.replace(/කසුන්/gi, "male undercover technician in dark coat");
    eng = eng.replace(/නිමල්/gi, "rugged detective partner in wet trench coat");

    // ඉතිරි සිංහල යුනිකෝඩ් අක්ෂර ඉවත් කර පිරිසිදු කිරීම
    eng = eng.replace(/[\u0D80-\u0DFF]/g, " ").replace(/\s+/g, " ").trim();

    return eng || "cinematic suspense thriller setting";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            slugline = "",
            isWide = true,
            artStyle = "sketch_bw",
            synopsis = "",
            characters = [],
            props = []
        } = body;

        const isSinhala = /[\u0D80-\u0DFF]/.test(`${slugline} ${synopsis} ${props.join(" ")}`);

        let sceneDescription = "";

        if (isSinhala) {
            const translatedLoc = translateSinhalaToCinematicEnglish(slugline);
            const translatedSynopsis = translateSinhalaToCinematicEnglish(synopsis);
            const translatedProps = props.map((p: string) => translateSinhalaToCinematicEnglish(p)).filter(Boolean).join(", ");

            sceneDescription = `${translatedLoc}, ${translatedSynopsis}${translatedProps ? `, key props: ${translatedProps}` : ""}`;
        } else {
            const cleanSlug = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
            const cleanSynopsis = synopsis.slice(0, 160).replace(/\s+/g, " ");
            const cleanProps = props.filter((p: string) => p && p.length > 2).join(", ");

            sceneDescription = `${cleanSlug}, ${cleanSynopsis}${cleanProps ? `, showing ${cleanProps}` : ""}`;
        }

        // Shot Framing
        const shotFraming = isWide
            ? "wide establishing master shot, wide angle lens, deep cinematic staging, environmental view, 35mm anamorphic composition"
            : "medium close-up dramatic action framing, character expression and props in focus, shallow depth of field, 50mm prime lens";

        // Art Style
        const styleDescription =
            artStyle === "sketch_bw"
                ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome drawing, high contrast cinematic storyboard panel, detailed concept art"
                : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm film illustration still";

        // 100% English Visual Prompt
        const finalPrompt = `${sceneDescription}, ${shotFraming}, ${styleDescription}, 16:9 widescreen aspect ratio, highly detailed, film storyboard panel`;

        // Unique Seed per shot + slugline
        const hash = slugline.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const seed = (hash * 997 + (isWide ? 101 : 202) + Math.floor(Math.random() * 500)) % 9999999;

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl,
            prompt: finalPrompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}