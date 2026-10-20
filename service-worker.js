const CACHE_NAME = "hunter-v1.0.4";
//configも!!//

//追加ファイル//
const FILES_TO_CACHE = [

  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./game.js",

  "./assets/ui/title.png",
  "./assets/ui/gameover.png",
  "./assets/ui/achievement.png",

  "./assets/pieces/hunter.png",
  "./assets/pieces/snake.png",
  "./assets/pieces/fox.png",
  "./assets/pieces/horse.png",
  "./assets/pieces/elephant.png",
  "./assets/pieces/hawk.png",
  "./assets/pieces/lion.png",
  "./assets/pieces/dragon.png",
  "./assets/pieces/rock.png",

  "./assets/effects/aura.png",
  "./assets/effects/flame-sweep.png",
  "./assets/effects/explosion.png",

  "./assets/icon/icon-192.png",
  "./assets/icon/icon-512.png"

];

// インストール//
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 有効化//
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 通信//
self.addEventListener("fetch", event => {

  event.respondWith(
    caches.match(event.request).then(response => {

        if (response) return response;

        return fetch(event.request).then(networkResponse => {

            return caches.open(CACHE_NAME).then(cache => {

                cache.put(event.request, networkResponse.clone());

                return networkResponse;

            });
        });
    })
);
});