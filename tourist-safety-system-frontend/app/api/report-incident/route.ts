import { NextRequest, NextResponse } from "next/server";
import { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";

// ⛔ Required for formidable (it cannot run on Edge runtime)
export const runtime = "nodejs";

// Prevent Next.js from parsing body automatically
export const dynamic = "force-dynamic";
export const bodyParser = false;

export async function POST(req: NextRequest) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: "./public/uploads",
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    // Convert NextRequest → Node.js Request (required for formidable)
    const reqAny = req as any;

    form.parse(reqAny, (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error("[Formidable Error]", err);
        return resolve(
          NextResponse.json({ error: "Error parsing form data" }, { status: 500 })
        );
      }

      const description = fields.description || "";
      const location = fields.location || "";

      // Pick first image if array
      const file = files.image
        ? Array.isArray(files.image)
          ? files.image[0]
          : files.image
        : null;

      const data = {
        description,
        location,
        imageUrl: file ? `/uploads/${file.newFilename}` : null,
        time: new Date().toISOString()
      };

      console.log("[Incident Reported]", data);

      resolve(NextResponse.json({ success: true, data }));
    });
  });
}
