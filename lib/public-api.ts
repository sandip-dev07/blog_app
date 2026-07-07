import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_ALLOWED_HEADERS = "Content-Type, If-None-Match";
const DEFAULT_ALLOWED_METHODS = "GET, HEAD, OPTIONS";
const DEFAULT_EXPOSED_HEADERS = "ETag";
const DEFAULT_MAX_AGE_SECONDS = "86400";
const WILDCARD_ORIGIN = "*";

function getConfiguredOrigins() {
  const rawValue = process.env.PUBLIC_BLOG_API_ORIGINS?.trim();

  if (!rawValue) {
    return [WILDCARD_ORIGIN];
  }

  const origins = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return origins.length ? origins : [WILDCARD_ORIGIN];
}

function resolveAllowedOrigin(request: NextRequest) {
  const configuredOrigins = getConfiguredOrigins();

  if (configuredOrigins.includes(WILDCARD_ORIGIN)) {
    return WILDCARD_ORIGIN;
  }

  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return configuredOrigins[0] ?? WILDCARD_ORIGIN;
}

export function withPublicApiCors(request: NextRequest, response: NextResponse) {
  const allowedOrigin = resolveAllowedOrigin(request);

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Headers", DEFAULT_ALLOWED_HEADERS);
  response.headers.set("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
  response.headers.set("Access-Control-Expose-Headers", DEFAULT_EXPOSED_HEADERS);
  response.headers.set("Access-Control-Max-Age", DEFAULT_MAX_AGE_SECONDS);

  if (allowedOrigin !== WILDCARD_ORIGIN) {
    response.headers.append("Vary", "Origin");
  }

  return response;
}

export function buildPublicApiOptionsResponse(request: NextRequest) {
  return withPublicApiCors(request, new NextResponse(null, { status: 204 }));
}
