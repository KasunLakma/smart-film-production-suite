import { NextResponse } from "next/server";

function scriptDirectorAgent(sceneSlug: string, synopsis: string, isWide: boolean): { prompt: string; shortPrompt: string } {
    const combined = `${sceneSlug} ${synopsis}`.toLowerCase();

    let setting = "underground cybernetics laboratory, glowing holographic terminals";
    if (combined.includes("වරාය") || combined.includes("port") || combined.includes("dock") || combined.includes("harbor")) {
        setting = "wet industrial harbor docks at night, container cranes, rain reflections";
    } else if (combined.includes("පාර") || combined.includes("street") || combined.includes("road")) {
        setting = "neon-lit wet city alleyway at night, steam and reflections";
    } else if (combined.includes("පාලක") || combined.includes("control")) {
        setting = "command center, flashing emergency amber lights, server consoles";
    }

    const isNight = combined.includes("night") || combined.includes("රාත්‍රී") || combined.includes("රෑ") || combined.includes("dark");
    const lighting = isNight ? "night, moody cinematic blue and neon lighting" : "overcast dawn, volumetric morning haze";

    const charAction = isWide
        ? "Asian male operative in background"
        : "intense close-up of Asian male operative holding tactical scanner";

    // Detailed prompt for UI display
    const displayPrompt = `Cinematic 16:9 film still of ${setting}, ${lighting}, ${charAction}, 35mm anamorphic photography, photorealistic, 8k resolution.`;

    // Short clean prompt for URL generation to prevent timeouts/blocks
    const shortPrompt = isWide
        ? `cinematic film still, 16:9, ${setting}, ${lighting}, 35mm photography`
        : `cinematic film still, 16:9, close-up Asian male operative, ${setting}, ${lighting}`;

    return { prompt: displayPrompt, shortPrompt };
}

export async function POST(req: Request) {
    try {
        const { sceneSlug, synopsis, isWide } = await req.json();

        const { prompt, shortPrompt } = scriptDirectorAgent(sceneSlug || "", synopsis || "", isWide);
        const encoded = encodeURIComponent(shortPrompt);
        const seed = Math.floor(Math.random() * 800000) + 100000;

        // Stable, fast 16:9 generation URL
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&nologo=true&seed=${seed}`;

        return NextResponse.json({
            success: true,
            prompt,
            imageUrl
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
    }
}