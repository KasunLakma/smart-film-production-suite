import { NextResponse } from "next/server";

export const maxDuration = 60;

interface ExtractedScene {
    id: string;
    sceneNumber: number;
    slugline: string;
    locationType: string;
    timeOfDay: string;
    synopsis: string;
    characters: string[];
    props: string[];
    dialogues: { speaker: string; line: string }[];
    plannedShots: number;
    visualPrompt: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rawText = (body.rawText || "").trim();

        if (!rawText || rawText.length < 20) {
            return NextResponse.json({ error: "පිටපතෙහි කියවිය හැකි පෙළක් හමු නොවීය." }, { status: 400 });
        }

        // 1. භාෂාව හඳුනාගැනීම (සිංහල හෝ ඉංග්‍රීසි)
        const isSinhala = /[\u0D80-\u0DFF]/.test(rawText);

        // 2. Universal Slugline Splitter
        const slugRegex = /(?:^|\n)\s*(?:SCENE\s*\d+|දර්ශනය\s*\d+|(?:INT|EXT|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර)[\.\s\:\-])/i;
        let chunks: string[] = [];

        if (slugRegex.test(rawText)) {
            const splitRegex = /(?=(?:^|\n)\s*(?:SCENE\s*\d+|දර්ශනය\s*\d+|INT\.|EXT\.|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර))/gi;
            chunks = rawText.split(splitRegex).map((c: string) => c.trim()).filter((c: string) => c.length > 20);
        } else {
            chunks = rawText.split(/\n\s*\n|\.\s{2,}/).map((c: string) => c.trim()).filter((c: string) => c.length > 30);
            if (chunks.length > 25) {
                const grouped: string[] = [];
                for (let i = 0; i < chunks.length; i += 3) {
                    grouped.push(chunks.slice(i, i + 3).join("\n"));
                }
                chunks = grouped;
            }
        }

        if (chunks.length === 0) {
            chunks = [rawText];
        }

        // 3. Scene Objects Dynamic Extraction
        const scenes: ExtractedScene[] = chunks.map((chunk: string, index: number) => {
            const sceneNum = index + 1;
            const firstLine = chunk.split("\n")[0].trim();

            const isExt = /EXT|බාහිර/i.test(firstLine) || /EXT|බාහිර/i.test(chunk);
            const isNight = /NIGHT|රාත්‍රී|DARK|සන්ධ්‍යා/i.test(firstLine) || /NIGHT|රාත්‍රී/i.test(chunk);

            let slugline = "";
            const slugMatch = chunk.match(/(?:SCENE\s*\d+[:.\-\s]*|දර්ශනය\s*\d+[:.\-\s]*|INT\.|EXT\.|අභ්‍යන්තර|බාහිර)(.*?)(?=[.?!]|\n|$)/i);
            if (slugMatch && slugMatch[0].length > 4) {
                slugline = slugMatch[0].trim().toUpperCase();
            } else {
                slugline = isSinhala
                    ? `දර්ශනය ${String(sceneNum).padStart(2, "0")}: ${isExt ? "EXT. බාහිර පසුතලය" : "INT. අභ්‍යන්තර පසුතලය"} - ${isNight ? "රාත්‍රී" : "දහවල්"}`
                    : `SCENE ${String(sceneNum).padStart(2, "0")}: ${isExt ? "EXT. LOCATION SEQUENCE" : "INT. LOCATION SEQUENCE"} - ${isNight ? "NIGHT" : "DAY"}`;
            }

            // Characters Extraction
            const characters: string[] = [];
            const charMatches = chunk.match(/([A-Z\u0D80-\u0DFF]{2,25})(?=\s*[:\-])/g);
            if (charMatches) {
                charMatches.forEach((c: string) => {
                    const cleanName = c.trim();
                    if (
                        !characters.includes(cleanName) &&
                        characters.length < 5 &&
                        !cleanName.includes("SCENE") &&
                        !cleanName.includes("දර්ශනය") &&
                        !cleanName.includes("INT") &&
                        !cleanName.includes("EXT")
                    ) {
                        characters.push(cleanName);
                    }
                });
            }
            if (characters.length === 0) {
                characters.push(isSinhala ? "ප්‍රධාන චරිතය" : "LEAD ROLE");
            }

            // Dialogues Extraction
            const dialogues: { speaker: string; line: string }[] = [];
            const lines = chunk.split("\n");
            lines.forEach((l: string) => {
                if (l.includes(":") || l.includes("-")) {
                    const [spk, ...rest] = l.split(/[:\-]/);
                    const lineTxt = rest.join(":").trim();
                    if (spk.trim().length > 1 && spk.trim().length < 25 && lineTxt.length > 2 && dialogues.length < 3) {
                        dialogues.push({
                            speaker: spk.trim(),
                            line: lineTxt.replace(/^["“”]|["“”]$/g, "")
                        });
                    }
                }
            });

            // Props Extraction
            const propTokens: string[] = [
                "GUN", "KNIFE", "PHONE", "CAR", "BOTTLE", "BAG", "LETTER", "DOOR", "CLOCK", "CHAIR", "TABLE",
                "තුවක්කුව", "පිහිය", "දුරකථනය", "රථය", "ලිපිය", "බෝතලය", "දොර", "ඔරලෝසුව", "පුටුව", "මේසය"
            ];
            const props: string[] = [];
            propTokens.forEach((p: string) => {
                if (chunk.toUpperCase().includes(p.toUpperCase()) && !props.includes(p) && props.length < 4) {
                    props.push(p);
                }
            });
            if (props.length === 0) {
                props.push(isSinhala ? "ප්‍රධාන පසුතල උපකරණ" : "KEY SCENE PROP");
            }

            const cleanSynopsis = chunk.replace(slugline, "").replace(/\s+/g, " ").trim();
            const synopsis = cleanSynopsis.length > 20
                ? cleanSynopsis.slice(0, 260) + "..."
                : chunk.slice(0, 260) + "...";

            // 100% English Visual Prompt for Storyboard
            const visualPrompt = `Cinematic 16:9 widescreen movie still, ${isExt ? "exterior shot" : "interior shot"}, ${isNight ? "dramatic moody night lighting" : "natural cinematic day illumination"}, 35mm anamorphic frame, photorealistic 8k, setting: ${slugline.replace(/[\u0D80-\u0DFF]/g, "film location")}.`;

            return {
                id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
                sceneNumber: sceneNum,
                slugline,
                locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
                timeOfDay: isNight ? (isSinhala ? "NIGHT / රාත්‍රී" : "NIGHT") : (isSinhala ? "DAY / දහවල්" : "DAY"),
                synopsis,
                characters,
                props,
                dialogues,
                plannedShots: 3,
                visualPrompt
            };
        });

        return NextResponse.json({ success: true, count: scenes.length, scenes });
    } catch (error: any) {
        console.error("Screenplay Parse Error:", error);
        return NextResponse.json({ error: error.message || "Breakdown අසාර්ථක විය" }, { status: 500 });
    }
}