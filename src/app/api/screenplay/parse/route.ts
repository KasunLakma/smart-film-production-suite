import { NextResponse } from "next/server";

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
}

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let rawText = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }
            const buffer = await file.arrayBuffer();
            const decoder = new TextDecoder("utf-8");
            rawText = decoder.decode(buffer);
            // Clean non-text streams while preserving Sinhala Unicode & English text
            rawText = rawText.replace(/[^\u0D80-\u0DFFa-zA-Z0-9\s.,!?'"()\-:\/]/g, " ");
        } else {
            const body = await req.json();
            rawText = body.rawText || "";
        }

        if (!rawText.trim()) {
            return NextResponse.json({ error: "Empty script content" }, { status: 400 });
        }

        // Thesis Section 5.3.2: Universal Deterministic Parser Logic
        const lines = rawText.split(/\r?\n/);
        const scenes: ExtractedScene[] = [];
        let currentScene: ExtractedScene | null = null;
        let synopsisBuffer: string[] = [];

        // Universal slugline regex: matches INT, EXT, SCENE, දර්ශනය, අභ්‍යන්තර, බාහිර
        const sluglineRegex = /^(SCENE\s*\d+|දර්ශනය\s*\d+|(?:INT|EXT|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර)[\.\s\:\-])/i;
        const characterRegex = /^([A-Z\u0D80-\u0DFF\s]{2,25})$/;
        const propKeywords = [
            "GUN", "REVOLVER", "KNIFE", "SWITCHBLADE", "PHONE", "CAMERA", "BRIEFCASE", "BOTTLE", "MAP", "CAR", "FAN", "CLOCK", "PAPER",
            "තුවක්කුව", "පිහිය", "දුරකථනය", "කැමරාව", "සිතියම", "රථය", "කාර්", "විදුලි පන්දම", "ස්කෑනරය", "ඔරලෝසුව"
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (sluglineRegex.test(line)) {
                if (currentScene) {
                    currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || "Dramatic action and narrative staging.";
                    scenes.push(currentScene);
                    synopsisBuffer = [];
                }

                const isExt = /EXT|බාහිර/i.test(line);
                const isNight = /NIGHT|රාත්‍රී|DARK|අඳුරු/i.test(line);
                const sceneNum = scenes.length + 1;

                currentScene = {
                    id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
                    sceneNumber: sceneNum,
                    slugline: line.toUpperCase(),
                    locationType: isExt ? "EXT (Exterior)" : "INT (Interior)",
                    timeOfDay: isNight ? "NIGHT" : "DAY",
                    synopsis: "",
                    characters: [],
                    props: [],
                    dialogues: [],
                    plannedShots: 3
                };
                continue;
            }

            if (currentScene) {
                // Speaker Cue Detection
                if (characterRegex.test(line) && !line.includes(".") && !line.includes(":")) {
                    const charName = line.toUpperCase().trim();
                    if (!currentScene.characters.includes(charName) && charName.length < 25) {
                        currentScene.characters.push(charName);
                    }
                    // Check next line for dialogue
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine && !sluglineRegex.test(nextLine) && !characterRegex.test(nextLine)) {
                            currentScene.dialogues.push({
                                speaker: charName,
                                line: nextLine.replace(/^["“”]|["“”]$/g, "")
                            });
                            i++;
                            continue;
                        }
                    }
                    continue;
                }

                // Inline Dialogue Detection (Speaker: Line)
                if (line.includes(":") || (line.includes("-") && !line.startsWith("-"))) {
                    const delimiter = line.includes(":") ? ":" : "-";
                    const [speaker, ...rest] = line.split(delimiter);
                    const dialogueText = rest.join(delimiter).trim();
                    const cleanSpeaker = speaker.trim().toUpperCase();

                    if (cleanSpeaker.length > 1 && cleanSpeaker.length < 25 && dialogueText.length > 0) {
                        if (!currentScene.characters.includes(cleanSpeaker)) {
                            currentScene.characters.push(cleanSpeaker);
                        }
                        if (currentScene.dialogues.length < 4) {
                            currentScene.dialogues.push({
                                speaker: cleanSpeaker,
                                line: dialogueText.replace(/^["“”]|["“”]$/g, "")
                            });
                        }
                        continue;
                    }
                }

                // Prop Extraction
                for (const prop of propKeywords) {
                    if (line.toUpperCase().includes(prop) && !currentScene.props.includes(prop)) {
                        currentScene.props.push(prop);
                    }
                }

                // Synopsis / Action line accumulation
                if (synopsisBuffer.length < 3 && !line.startsWith("(")) {
                    synopsisBuffer.push(line);
                }
            }
        }

        if (currentScene) {
            currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || "Dramatic action and narrative staging.";
            scenes.push(currentScene);
        }

        // Dynamic Paragraph-based segmentation if unformatted text is provided
        if (scenes.length === 0 && rawText.trim().length > 40) {
            const blocks = rawText.split(/\n\s*\n/).filter((b) => b.trim().length > 25);
            blocks.forEach((blk, idx) => {
                const sNum = idx + 1;
                const isExt = /EXT|බාහිර/i.test(blk);
                const isNight = /NIGHT|රාත්‍රී/i.test(blk);
                scenes.push({
                    id: `SCENE-${String(sNum).padStart(2, "0")}`,
                    sceneNumber: sNum,
                    slugline: `SCENE ${String(sNum).padStart(2, "0")}: ${isExt ? "EXT. SCENE SEQUENCE" : "INT. SCENE SEQUENCE"} - ${isNight ? "NIGHT" : "DAY"}`,
                    locationType: isExt ? "EXT" : "INT",
                    timeOfDay: isNight ? "NIGHT" : "DAY",
                    synopsis: blk.slice(0, 200).trim() + "...",
                    characters: [],
                    props: [],
                    dialogues: [],
                    plannedShots: 3
                });
            });
        }

        return NextResponse.json({ success: true, count: scenes.length, scenes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Parsing failed" }, { status: 500 });
    }
}