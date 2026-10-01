import { NextResponse } from "next/server";

// Script Director Agent: දර්ශනයේ අර්ථය සිනමාත්මක Prompt එකක් බවට පත් කිරීම
function scriptDirectorAgent(sceneSlug: string, synopsis: string, shotType: string, isWide: boolean): string {
    const combined = `${sceneSlug} ${synopsis}`.toLowerCase();

    let environment = "cinematic interior setting with volumetric practical lights";
    if (combined.includes("විද්‍යාගාර") || combined.includes("lab") || combined.includes("archive")) {
        environment = "underground cybernetics laboratory, glowing holographic terminals, metallic server racks, cable conduits";
    } else if (combined.includes("වරාය") || combined.includes("port") || combined.includes("dock") || combined.includes("harbor")) {
        environment = "industrial harbor docks at night, wet slick tarmac reflecting amber streetlamps, massive shipping container stacks";
    } else if (combined.includes("පාර") || combined.includes("street") || combined.includes("road") || combined.includes("alley")) {
        environment = "neon-lit urban alleyway, light rain mist, steam rising from grates, wet asphalt reflections";
    } else if (combined.includes("පාලක") || combined.includes("control") || combined.includes("room")) {
        environment = "command operations control room, emergency amber lights, complex switchboards and tactical screens";
    }

    const isNight = combined.includes("night") || combined.includes("රාත්‍රී") || combined.includes("රෑ") || combined.includes("dark");
    const lighting = isNight
        ? "deep night atmosphere, dramatic chiaroscuro lighting, neon edge lights, volumetric haze"
        : "early morning overcast dawn light, soft diffused cinematic mist, cool color temperature";

    let characterAction = "a focused operative during a tense tactical moment";
    if (combined.includes("කසුන්") || combined.includes("elena") || combined.includes("marcus")) {
        characterAction = "a Sri Lankan male operative with intense expression holding a specialized tactical device";
    } else if (combined.includes("නිමල්") || combined.includes("agent")) {
        characterAction = "a covert agent on high alert watching the perimeter through optics";
    }

    if (isWide) {
        return `cinematic film still, 16:9 widescreen master shot of ${environment}, ${lighting}, ${characterAction} in mid-ground, 35mm anamorphic lens, shallow depth of field in background, Panavision aesthetic, directed by Denis Villeneuve, 8k resolution, color graded --no text, cartoon, 3d render, watermark`;
    } else {
        return `cinematic film still, 16:9 widescreen, intense medium close up of ${characterAction}, sharp focus on face and tactical gear, ${environment} soft blurred in background, ${lighting}, Arri Alexa LF 50mm T1.5 prime lens, high fidelity, authentic cinematic movie frame --no text, blur, drawing, watermark`;
    }
}

export async function POST(req: Request) {
    try {
        const { sceneSlug, synopsis, shotType, isWide } = await req.json();

        const generatedPrompt = scriptDirectorAgent(sceneSlug || "", synopsis || "", shotType || "", isWide);
        const encodedPrompt = encodeURIComponent(generatedPrompt);
        const seed = Math.floor(Math.random() * 900000) + 100000;

        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${seed}`;

        return NextResponse.json({
            success: true,
            prompt: generatedPrompt,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error("Storyboard Agent Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to synthesize visual frame" },
            { status: 500 }
        );
    }
}