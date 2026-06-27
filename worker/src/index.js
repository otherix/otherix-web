// get.otherix.dev: transparently serve the canonical scripts published by the
// docs site. Root and /install.sh -> install.sh; /quickstart.sh -> quickstart.sh.
// Returns 200 + text/plain so `curl get.otherix.dev/... | sh` works. 300s cache.
const DOCS = "https://docs.otherix.dev";

function upstreamFor(pathname) {
  if (pathname === "/quickstart.sh") return `${DOCS}/quickstart.sh`;
  // Root and anything else fall through to the component installer.
  return `${DOCS}/install.sh`;
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const upstream = await fetch(upstreamFor(pathname), {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!upstream.ok) {
      return new Response("installer temporarily unavailable\n", {
        status: 502,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
