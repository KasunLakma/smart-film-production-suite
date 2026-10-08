import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let rawText = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) {
                return NextResponse.json({ error: "ගොනුවක් හමු නොවීය." }, { status: 400 });
            }
            rawText = await file.text();
        } else {
            const body = await req.json();
            rawText = (body.rawText || "").trim();
        }

        if (!rawText || rawText.length < 20) {
            return NextResponse.json({ error: "පිටපතෙහි කියවිය හැකි පෙළක් හමු නොවීය." }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Screenplay text received successfully",
            length: rawText.length
        });
    } catch (error: any) {
        console.error("Screenplay Route Error:", error);
        return NextResponse.json({ error: error.message || "Parse process failed" }, { status: 500 });
    }
}