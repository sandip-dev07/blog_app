import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Compute a weak ETag for a JSON serializable value
export function computeETag(payload: unknown): string {
  const json = JSON.stringify(payload);
  const hash = crypto.createHash("sha1").update(json).digest("base64");
  return `W/"${hash}"`;
}

type JsonInit = NonNullable<Parameters<typeof NextResponse.json>[1]>;

interface ETagOptions extends JsonInit {
  request: NextRequest;
  payload: unknown;
}

/**
 * Build a JSON response with ETag/If-None-Match support.
 * - Returns 304 if client's If-None-Match matches current ETag.
 * - Otherwise returns 200 (or provided status) with payload and ETag header.
 */
export function jsonWithETag({ request, payload, ...init }: ETagOptions): NextResponse {
  const etag = computeETag(payload);
  const ifNoneMatch = request.headers.get('if-none-match');
  const method = request.method.toUpperCase();
  const canReturnNotModified = method === 'GET' || method === 'HEAD';
  const headers = new Headers(init.headers);
  const clientEtags =
    ifNoneMatch?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];

  headers.set("ETag", etag);

  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  if (canReturnNotModified && clientEtags.includes(etag)) {
    const res = new NextResponse(null, {
      status: 304,
      headers,
    });
    return res;
  }

  return NextResponse.json(payload, {
    ...init,
    headers,
  });
}
