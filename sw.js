"use strict";
/* LUME service worker: precache the shell, network-first for navigations (so a fresh
   index.html always wins when you're online), cache-first for static assets.
   Bump VERSION when shipping a new build; the page reloads itself on controllerchange. */
const VERSION = "lume-v31-matrix";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* CDN (the theremin's MediaPipe) passes straight through to the network */
  e.respondWith(
    (req.mode === "navigate"
      ? fetch(req).then(res => {                                   /* network-first for the page itself */
          if (res && res.ok) {                                       /* v28: never cache an error page over the good copy */
            const copy = res.clone();
            caches.open(VERSION).then(cache => cache.put(req, copy));
          }
          return res;
        }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
      : caches.match(req).then(hit => hit || fetch(req).then(res => {   /* cache-first for icons/manifest */
          if (res && res.ok && (res.type === "basic" || res.type === "default")) {
            const copy = res.clone();
            caches.open(VERSION).then(cache => cache.put(req, copy));
          }
          return res;
        })))
  );
});
