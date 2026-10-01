import { NextResponse } from "next/server";

// Cinematic Scene Library Mapping
const CINEMATIC_LIBRARY = {
    lab: [
        "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1280&h=720&q=85",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1280&h=720&q=85"
    ],
    harbor: [
        "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1280&h=720&q=85",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&h=720&q=85"
    ],
    control: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1280&h=720&q=85",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&h=720&q=85"
    ],
    dawn: [
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1280&h=720&q=85",
        "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1280&h=720&q=85"
    ]
};

function scriptDirectorAgent(sceneSlug: string, synopsis: string, isWide: boolean): { prompt: string; imageUrl: string } {
    const text = `${sceneSlug} ${synopsis}`.toLowerCase();

    let category: keyof typeof CINEMATIC_LIBRARY = "lab";
    let locationDesc = "high-tech underground cybernetics research facility, glowing holographic consoles, server arrays";

    if (text.includes("වරාය") || text.includes("port") || text.includes("dock") || text.includes("harbor")) {
        category = "harbor";
        locationDesc = "industrial maritime harbor docks at night, heavy rain mist, stacked cargo containers, wet asphalt";
    } else if (text.includes("පාලක") || text.includes("control") || text.includes("command")) {
        category = "control";
        locationDesc = "tactical central control hub, flashing emergency red beacons, mainframe data banks";
    } else if (text.includes("dawn") || text.includes("අලුයම") || text.includes("බෝට්ටුව")) {
        category = "dawn";
        locationDesc = "foggy coastal shipyard perimeter at dawn, shipping crates, morning sea haze";
    }

    const prompt = isWide
        ? `Cinematic film still, 16:9 master establishing wide shot of ${locationDesc}, volumetric atmospheric rim lighting, 35mm anamorphic photography, photorealistic, directed by Denis Villeneuve.`
        : `Cinematic film still, 16:9 intense medium close-up, operative holding tactical scanner and decryption drives, sharp focus, ${locationDesc} blurred in background, 50mm Prime lens.`;

    const selectedImages = CINEMATIC_LIBRARY[category];
    const imageUrl = isWide ? selectedImages[0] : selectedImages[1];

    return { prompt, imageUrl };
}

export async function POST(req: Request) {
    try {
        const { sceneSlug, synopsis, isWide } = await req.json();
        const { prompt, imageUrl } = scriptDirectorAgent(sceneSlug || "", synopsis || "", isWide);

        return NextResponse.json({
            success: true,
            prompt,
            imageUrl
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Director Agent error" },
            { status: 500 }
        );
    }
}