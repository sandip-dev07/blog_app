export const BLOG_CLIENT_IP_HEADER = "x-blog-client-ip";

export function getForwardedClientIp(headers: Headers) {
  const forwardedFor =
    headers.get("x-vercel-forwarded-for") || headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-client-ip") ||
    ""
  ).trim();
}

export function getClientIp(headers: Headers) {
  return headers.get(BLOG_CLIENT_IP_HEADER)?.trim() || "";
}

export function resolveClientIp(headers: Headers) {
  return getClientIp(headers) || getForwardedClientIp(headers);
}
