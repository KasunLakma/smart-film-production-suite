import { NextResponse } from "next/server";

export const maxDuration = 60;

// සිංහල පිටපතේ සියලු වචන සහ වාක්‍ය 100% Cinematic English බවට පෙරළීම
function translateFullSinhalaScene(text: string): string {
    let eng = text;

    // Locations & Environments
    eng = eng.replace(/තාක්ෂණ(ික)?\s*විද්‍යාගාරය|විද්‍යාගාරය/gi, "high-tech research laboratory, server racks, glowing blue LED terminal screens");
    eng = eng.replace(/වරාය(\s*පිවිසුම්\s*මාර්ගය)?|තොටුපළ/gi, "industrial sea harbor container docks, wet slick asphalt ground, shipping cranes, rainy atmosphere");
    eng = eng.replace(/ගබඩාව|පැරණි\s*ගබඩාව/gi, "abandoned rust-covered warehouse, corrugated tin walls, dust beams");
    eng = eng.replace(/සුරක්ෂිතාගාරය/gi, "underground bank archive vault with metallic locker deposit boxes");
    eng = eng.replace(/කාමරය|අභ්‍යන්තර\s*කාමරය/gi, "moody dimly lit interior room, vintage furniture");
    eng = eng.replace(/මාවත|මාර්ගය|වීදිය/gi, "slick wet city street, neon reflections on asphalt, night fog");
    eng = eng.replace(/නිවස|ගෙදර/gi, "old rustic interior house, dramatic window lighting");

    // Vehicles & Props
    eng = eng.replace(/මෝටර්\s*රථය|රථය|කාර්\s*එක/gi, "sleek black sedan vehicle, glowing dashboard instruments");
    eng = eng.replace(/ඩිජිටල්\s*ස්කෑනරය|ස්කෑනරය/gi, "handheld digital military scanner device with cyan display");
    eng = eng.replace(/විදුලි\s*පන්දම/gi, "tactical beam flashlight illuminating dark room");
    eng = eng.replace(/ලියකියවිලි\s*බෑගය|බෑගය/gi, "leather vintage attaché briefcase");
    eng = eng.replace(/මාලිමාව|ලෝකඩ\s*මාලිමාව/gi, "ornate antique brass bronze compass");
    eng = eng.replace(/යතුර|ප්‍රධාන\s*යතුර/gi, "heavy brass skeleton master key");
    eng = eng.replace(/ටැබ්ලට්\s*පරිගණකය|ටැබ්ලටය/gi, "rugged tactical digital tablet with glowing map schematic");
    eng = eng.replace(/දුරකථනය|ජංගම\s*දුරකථනය/gi, "burner mobile flip phone");
    eng = eng.replace(/තුවක්කුව/gi, "tactical sidearm handgun");

    // Lighting & Atmosphere
    eng = eng.replace(/රාත්‍රී|අඳුර|අඳුරු/gi, "atmospheric midnight sequence, deep shadows, chiaroscuro low-key cinematic lighting");
    eng = eng.replace(/දහවල්|උදෑසන/gi, "golden hour morning daylight, volumetric sunbeams");
    eng = eng.replace(/වැසි|වහින|තෙත/gi, "heavy torrential downpour, rain droplets splashing, puddles");

    // Characters
    eng = eng.replace(/කසුන්/gi, "male undercover technician in dark coat");
    eng = eng.replace(/නිමල්/gi, "detective in drenched trench coat");

    // Remaining Sinhala Unicode removal
    eng = eng.replace(/[\u0D80-\u0DFF]/g, " ").replace(/\s+/g, " ").trim();

    return eng || "dramatic suspense film setting";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            slugline = "",
            synopsis = "",
            isWide = true,
            artStyle = "sketch_bw",
            props = [],
            characters = []
        } = body;

        const fullContent = `${slugline} ${synopsis} ${props.join(" ")} ${characters.join(" ")}`;
        const isSinhala = /[\u0D80-\u0DFF]/.test(fullContent);

        let visualSubject = "";

        if (isSinhala) {
            visualSubject = translateFullSinhalaScene(fullContent);
        } else {
            const cleanSlug = slugline.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
            const cleanSynopsis = synopsis.slice(0, 160).replace(/\s+/g, " ");
            visualSubject = `${cleanSlug}, ${cleanSynopsis}`;
        }

        const framing = isWide
            ? "wide establishing master shot, deep focus, environmental perspective, 35mm anamorphic wide lens"
            : "medium close-up dramatic action framing, character expression and props in focus, 50mm prime cinematic lens";

        const style =
            artStyle === "sketch_bw"
                ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome storyboard panel, high contrast film previsualization"
                : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm film illustration still";

        const prompt = `${visualSubject}, ${framing}, ${style}, 16:9 widescreen composition, 8k resolution, cinematic masterpiece`;

        // Unique seed per scene content & shot type
        const hash = (visualSubject + (isWide ? "-W" : "-C")).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const seed = (hash * 1337 + Math.floor(Math.random() * 500)) % 9999999;

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`;

        return NextResponse.json({
            success: true,
            imageUrl,
            prompt
        });
    } catch (error: any) {
        console.error("Storyboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
    }
}