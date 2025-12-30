export async function onRequest({ request, env, next }: any) {
  const USER = env.BASIC_USER;
  const PASS = env.BASIC_PASS;

  const auth = request.headers.get("Authorization");

  if (!auth || !auth.startsWith("Basic ")) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Private Site"' },
    });
  }

  const decoded = atob(auth.split(" ")[1]);
  const [user, pass] = decoded.split(":");

  if (user !== USER || pass !== PASS) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Private Site"' },
    });
  }

  return next();
}
