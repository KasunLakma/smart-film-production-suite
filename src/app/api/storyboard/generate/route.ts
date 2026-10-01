import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { slugline, isWide, artStyle } = await req.json();
        const text = (slugline || "").toLowerCase();

        let sceneSubject = "";

        if (/lab|research|tech|විද්‍යාගාර/.test(text) || /scene[\s_-]*0?1/.test(text)) {
            sceneSubject = isWide
                ? "high tech cybernetics research laboratory, glowing computer server racks, wide cinematic perspective, film storyboard sketch"
                : "dynamic close-up action storyboard panel of technician gloved hands operating an illuminated tactical holographic scanner tool, circuit lights, no fashion portrait";
        } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text) || /scene[\s_-]*0?2/.test(text)) {
            sceneSubject = isWide
                ? "rainy industrial harbor checkpoint at night, stacked metal shipping containers, dark tactical surveillance van parked on wet tarmac, storyboard sketch"
                : "dramatic over the shoulder close-up storyboard sketch of hooded tactical agent holding military binoculars looking through rain, water streaks, dynamic angle";
        } else if (/control|command|office|පාලක/.test(text) || /scene[\s_-]*0?3/.test(text)) {
            sceneSubject = isWide
                ? "high security central operations command control center, emergency warning beacon alarms, banks of terminal monitors, film storyboard"
                : "tight macro close-up action frame of operative hand swiftly extracting encrypted military hard drive cartridge from server chassis, sparks, motion lines";
        } else {
            // Scene 04 / Dawn / Escape
            sceneSubject = isWide
                ? "misty coastal container shipyard docks at dawn, morning sea fog rolling over ocean pier, wide cinematic angle, storyboards concept drawing"
                : "medium dynamic low angle tracking action shot of two tactical operatives in intense sprint towards docked speed boat at dawn pier, urgency, cinematic frame";
        }

        let prompt = "";
        if (artStyle === "graphic_novel") {
            prompt = `graphic novel comic book illustration, dynamic comic panel, ${sceneSubject}, GTA concept art style, bold black ink outlines, cel shading, vibrant cinematic colors, 16:9 widescreen, no realistic photo, no 3d render`;
        } else {
            prompt = `black and white film storyboard drawing, studiobinder ink sketch, pencil crosshatching, ${sceneSubject}, bold ink linework, professional cinema sketch, chiaroscuro shading, 16:9 widescreen frame, no photo, no color, no portrait photo`;
        }

        const seed = Math.floor(Math.random() * 899999) + 100000;
        const cleanPrompt = encodeURIComponent(prompt);
        const proxyUrl = `/api/storyboard/image?prompt=${cleanPrompt}&seed=${seed}`;

        return NextResponse.json({
            success: true,
            imageUrl: proxyUrl,
            prompt
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || "Failed" },
            { status: 500 }
        );
    }
}