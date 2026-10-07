import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let rawContent = "";
        let engine = "RULE_BASED";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            engine = (formData.get("engine") as string) || "RULE_BASED";

            if (file) {
                const buffer = await file.arrayBuffer();
                // UTF-8 stream decoding
                const decoder = new TextDecoder("utf-8");
                rawContent = decoder.decode(buffer);

                // Binary/Scanned characters පිරිසිදු කර පෙළ වෙන් කිරීම
                rawContent = rawContent.replace(/[^\x20-\x7E\u0D80-\u0DFF\n\r\t]/g, " ");
            }
        } else {
            const body = await req.json();
            rawContent = body.rawContent || "";
            engine = body.engine || "RULE_BASED";
        }

        if (!rawContent.trim()) {
            return NextResponse.json({ error: "Script content is empty." }, { status: 400 });
        }

        // 1. Language Detection Logic (සිංහල ද ඉංග්‍රීසි ද හඳුනාගැනීම)
        const isSinhala = /[\u0D80-\u0DFF]/.test(rawContent);

        // 2. Dynamic Universal Slugline Matcher
        const lines = rawContent.split(/\r?\n/);
        const scenes: any[] = [];
        let currentScene: any = null;
        let synopsisBuffer: string[] = [];
        let activeSpeaker: string | null = null;

        const slugRegex = /^(?:SCENE\s*\d+|දර්ශනය\s*\d+|INT\.|EXT\.|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර)/i;
        const propWords = [
            "GUN", "KNIFE", "PHONE", "CAR", "BAG", "WATER", "GLASS", "CLOCK", "PAPER", "FAN", "MONEY", "CAMERA",
            "තුවක්කුව", "පිහිය", "දුරකථනය", "රථය", "කාර්", "බෑගය", "වතුර", "වීදුරුව", "මුදල්", "විදුලි පන්දම", "ස්කෑනරය"
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (slugRegex.test(line) || (/^(INT|EXT)\s/i.test(line) && line.length < 80)) {
                if (currentScene) {
                    currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || (isSinhala ? "දර්ශනයේ පසුබිම් විස්තරය." : "Scene action staging.");
                    scenes.push(currentScene);
                    synopsisBuffer = [];
                    activeSpeaker = null;
                }

                const sceneNum = scenes.length + 1;
                const isExt = /EXT|බාහිර/i.test(line);
                const isNight = /NIGHT|රාත්‍රී|DARK/i.test(line);

                currentScene = {
                    id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
                    sceneNumber: sceneNum,
                    slugline: line.toUpperCase(),
                    locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
                    timeOfDay: isNight ? (isSinhala ? "NIGHT / රාත්‍රී" : "NIGHT") : (isSinhala ? "DAY / දහවල්" : "DAY"),
                    synopsis: "",
                    characters: [],
                    props: [],
                    dialogues: [],
                    plannedShots: 3
                };
                continue;
            }

            if (currentScene) {
                // Dialogues Extraction
                if (line.includes(":") || (line.includes("-") && !line.startsWith("-"))) {
                    const parts = line.split(/[:\-]/);
                    const spk = parts[0].trim();
                    const speech = parts.slice(1).join(":").trim();
                    if (spk.length > 1 && spk.length < 30 && speech.length > 0) {
                        if (!currentScene.characters.includes(spk)) currentScene.characters.push(spk);
                        if (currentScene.dialogues.length < 4) {
                            currentScene.dialogues.push({ speaker: spk, line: speech.replace(/^["“”]|["“”]$/g, "") });
                        }
                        continue;
                    }
                }

                // Speaker Headings
                if (line === line.toUpperCase() && line.length > 2 && line.length < 25 && !line.includes(".")) {
                    activeSpeaker = line;
                    if (!currentScene.characters.includes(line)) currentScene.characters.push(line);
                    continue;
                }

                if (activeSpeaker && line.length > 1) {
                    if (currentScene.dialogues.length < 4) {
                        currentScene.dialogues.push({ speaker: activeSpeaker, line: line.replace(/^["“”]|["“”]$/g, "") });
                    }
                    activeSpeaker = null;
                    continue;
                }

                propWords.forEach((pw) => {
                    if (line.toUpperCase().includes(pw.toUpperCase()) && !currentScene.props.includes(pw)) {
                        currentScene.props.push(pw);
                    }
                });

                if (synopsisBuffer.length < 3 && !line.startsWith("(")) {
                    synopsisBuffer.push(line);
                }
            }
        }

        if (currentScene) {
            currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || (isSinhala ? "දර්ශනයේ පසුබිම් විස්තරය." : "Scene action staging.");
            scenes.push(currentScene);
        }

        // ස්ක්‍රිප්ට් එකේ සම්මත sluglines නොමැති විට ඡේද අනුව scenes වෙන් කිරීම
        if (scenes.length === 0) {
            const paragraphs = rawContent.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
            paragraphs.forEach((p, idx) => {
                const sNum = idx + 1;
                const isExt = /EXT|බාහිර/i.test(p);
                const isNight = /NIGHT|රාත්‍රී/i.test(p);
                scenes.push({
                    id: `SCENE-${String(sNum).padStart(2, "0")}`,
                    sceneNumber: sNum,
                    slugline: `SCENE ${String(sNum).padStart(2, "0")}: ${isExt ? (isSinhala ? "EXT. බාහිර දර්ශනය" : "EXT. LOCATION SEQUENCE") : (isSinhala ? "INT. අභ්‍යන්තර දර්ශනය" : "INT. LOCATION SEQUENCE")}`,
                    locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
                    timeOfDay: isNight ? (isSinhala ? "NIGHT / රාත්‍රී" : "NIGHT") : (isSinhala ? "DAY / දහවල්" : "DAY"),
                    synopsis: p.slice(0, 200).trim() + "...",
                    characters: isSinhala ? ["ප්‍රධාන චරිතය"] : ["LEAD ROLE"],
                    props: [],
                    dialogues: [],
                    plannedShots: 3
                });
            });
        }

        return NextResponse.json({ success: true, count: scenes.length, scenes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Parsing failed." }, { status: 500 });
    }
}