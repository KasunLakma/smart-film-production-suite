import { NextResponse } from "next/server";

// Script Director AI Agent
function buildDirectorPrompt(sceneSlug: string, synopsis: string, isWide: boolean): string {
    const text = `${sceneSlug} ${synopsis}`.toLowerCase();

    let location = "high tech underground cybernetics laboratory, glowing computer terminal screens, server racks, holographic displays";
    if (text.includes("වරාය") || text.includes("port") || text.includes("harbor") || text.includes("dock")) {
        location = "dark industrial harbor docks at night, wet asphalt, ocean fog, shipping containers, docked patrol boats";
    } else if (text.includes("පාර") || text.includes("street") || text.includes("alley")) {
        location = "rainy night city alleyway, neon sign reflections on wet ground, steam, dark parked vehicles";
    } else if (text.includes("පාලක") || text.includes("control")) {
        location = "tactical command control room, flashing emergency red warning lights, military computer consoles";
    }

    const isNight = text.includes("night") || text.includes("රාත්‍රී") || text.includes("රෑ") || text.includes("dark");
    const lighting = isNight
        ? "cinematic night lighting, volumetric blue and amber rim lights, dark atmosphere"
        : "overcast early morning daylight, soft diffused atmospheric fog";

    if (isWide) {
        return `cinematic film still, 16:9 widescreen, master establishing shot of ${location}, ${lighting}, 35mm anamorphic cinematography, dramatic movie scene, hyper-detailed, photorealistic, directed by Denis Villeneuve`;
    } else {
        return `cinematic film still, 16:9 widescreen, dramatic medium close up of young South Asian male operative in tactical jacket holding glowing device, intense eyes, ${location} blurred in background, ${lighting}, Arri Alexa 8k`;
    }
}

export async function POST(req: Request) {
    try {
        const { sceneSlug, synopsis, isWide } = await req.json();

        const prompt = buildDirectorPrompt(sceneSlug || "", synopsis || "", isWide);
        const cleanPrompt = encodeURIComponent(prompt);

        // Unique timestamp seed to completely break caching of dummy images
        const uniqueSeed = Date.now() + (isWide ? 101 : 202);

        // FLUX Engine Direct 16:9 Render
        const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&model=flux&enhance=true&nologo=true&seed=${uniqueSeed}`;

        return NextResponse.json({
            success: true,
            prompt,
            imageUrl
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Synthesis Failed" }, { status: 500 });
    }
}