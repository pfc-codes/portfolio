export async function onRequest(context: any) {
  const { request, env, next } = context;

  // Change this if you only want to protect one path.
  // Example to protect ONLY "/" and "/contact":
  // const pathname = new URL(request.url).pathname;
  // if (pathname !== "/" && pathname !== "/contact" && !pathname.startsWith("/work")) return next();

  const USER = env.BASIC_USER || "pietro";
  const PASS = env.BASIC_PASS || "changeme";

  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorized();
  }

  const encoded = auth.slice(6);
  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(":");
  const u = idx >= 0 ? decoded.slice(0, idx) : "";
  const p = idx >= 0 ? decoded.slice(idx + 1) : "";

  if (u !== USER || p !== PASS) {
    return unauthorized();
  }

  return next();
}

function unauthorized() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Private"',
    },
  });
}
