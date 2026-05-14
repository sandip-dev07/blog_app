import { NextResponse, type NextRequest } from "next/server";

import { createBlogImageUploadSignature } from "@/lib/cloudinary";
import { getXmdxAdminUser } from "@/lib/xmdx-admin";

export async function POST(request: NextRequest) {
  const user = await getXmdxAdminUser(request.headers);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = createBlogImageUploadSignature();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not prepare the image upload.",
      },
      { status: 500 }
    );
  }
}
