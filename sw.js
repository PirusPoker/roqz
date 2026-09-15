/* Roqz Pro Academy offline cache: saves the app shell on first visit, serves it when there's no signal. */
var CACHE = 'roqz-v4';

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(['./','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png']); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var req = e.request;
  var isPage = req.mode === 'navigate';
  e.respondWith(
    // Pages are always re-checked with the server so an update shows on the next open, not 10 minutes later.
    fetch(isPage ? new Request(req, {cache:'no-cache'}) : req).then(function(res){
      // Fresh copy arrived: keep it for next time (page, fonts, anything GET).
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(isPage ? './' : req, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(isPage ? './' : req).then(function(hit){
        return hit || (isPage ? caches.match('./') : Response.error());
      });
    })
  );
});
