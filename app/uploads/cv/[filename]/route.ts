import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const filename = params?.filename;
    if (!filename) {
      return new NextResponse("Filename required", { status: 400 });
    }

    // Sanitize to avoid directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", "cv", safeFilename);

    if (!fs.existsSync(filePath)) {
      // Fallback: fetch from live production site and cache locally
      try {
        const remoteRes = await fetch(`https://hisfuturetalent.his.edu.dz/uploads/cv/${safeFilename}`);
        if (remoteRes.ok) {
          const ab = await remoteRes.arrayBuffer();
          const buf = Buffer.from(ab);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, buf);
        } else {
          return new NextResponse("File not found", { status: 404 });
        }
      } catch (e) {
        return new NextResponse("File not found", { status: 404 });
      }
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded CV:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
