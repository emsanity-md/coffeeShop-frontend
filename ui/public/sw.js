/*
 * Intentionally does not cache anything.
 *
 * This app has no offline support and does not want any: the cart and order
 * history live in localStorage, and a caching service worker would only add a
 * way to serve a stale bundle.
 *
 * So why does this file exist? Browsers probe `/sw.js` at the site root on
 * every page load when a service worker has ever been registered for that
 * origin and scope — typically left over from another project that ran on the
 * same localhost port. With no file at that path, Nitro falls through to the
 * Vue router, which logs a VUE_ROUTER_R0004 warning per request and 404s.
 *
 * Serving this file from public/ resolves it as a static asset, so the request
 * never reaches the router. The handlers below then clean up: on activation we
 * drop every cache and unregister this worker, so a stale registration is gone
 * for good after a single load. This is the standard self-healing pattern for
 * retiring an unwanted service worker.
 *
 * If offline support is ever added for real, replace this file — and delete
 * the unregister call, which exists only to clean up after the old one.
 */

self.addEventListener('install', () => {
  // Take over as soon as possible so cleanup isn't deferred.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Remove anything a previous (real) service worker may have left behind.
    const keys = await caches.keys()
    await Promise.all(keys.map(key => caches.delete(key)))

    // Retire ourselves — see the note above.
    await self.registration.unregister()
    await self.clients.claim()
  })())
})
