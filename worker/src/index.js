// get.otherix.dev: transparently serve the canonical installer published by
// the docs site. Returns 200 + text/plain so both `curl get.otherix.dev | sh`
// and `curl -fsSL get.otherix.dev | sh` work. Always-latest; 300s edge cache.
const UPSTREAM = "https://docs.otherix.dev/install.sh";

export default {
  async fetch() {
    const upstream = await fetch(UPSTREAM, {
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
