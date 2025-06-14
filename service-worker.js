const CACHE_NAME = 'taxilog-cache-v1.2'; // Promijenite verziju ako ažurirate datoteke
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Preglednik će zapravo keširati JS koji generira esm.sh za index.tsx
  // CDN resursi - važno je da se i oni keširaju
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client', // Provjerite točnu esm.sh putanju ako se koristi createRoot
  'https://esm.sh/react@^19.1.0/jsx-runtime', // Potreban za JSX
  'https://esm.sh/recharts@^2.15.3',
  // Ovdje možete dodati putanje do vaših ikona ako ih želite keširati
  // npr. '/icons/icon-192x192.png', itd.
  // Za sada, nećemo eksplicitno dodavati sve ikone da lista ne bude preduga,
  // ali za potpunu offline funkcionalnost ikona, trebalo bi ih dodati.
  '/manifest.json'
];

// Pre-cache React/ReactDOM/Recharts dependencies that esm.sh might resolve to
// Ovo je malo nagađanje jer esm.sh može imati kompleksne interne redirekcije,
// ali ciljamo na glavne module.
const esmShDependencies = [
    'https://esm.sh/react@19.1.0/es2022/react.mjs',
    'https://esm.sh/react-dom@19.1.0/es2022/client.mjs',
    'https://esm.sh/react-dom@19.1.0/es2022/react-dom.mjs',
    'https://esm.sh/recharts@2.15.3/es2022/recharts.mjs',
    'https://esm.sh/react@19.1.0/es2022/jsx-runtime.mjs', // jsx-runtime
    // Dodajte ovdje i druge ovisnosti ako primijetite da nedostaju pri offline radu
];

urlsToCache.push(...esmShDependencies);


self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Napomena: fetch može biti problematičan za neprozirne odgovore (npr. CDN bez CORS-a)
        // ali za osnovne GET zahtjeve za javne CDN-ove ovo bi trebalo raditi.
        // Zahtjevi za 'index.tsx' i druge lokalne datoteke će biti OK.
        const cachePromises = urlsToCache.map(urlToCache => {
          return fetch(urlToCache, { mode: 'cors' }) // Pokušavamo s 'cors' modeom gdje je primjenjivo
            .then(response => {
              if (!response.ok) {
                // Za CDN-ove koji ne podržavaju CORS ili vraćaju neprozirne odgovore,
                // možemo pokušati s 'no-cors', ali tada ne možemo provjeriti status.
                // Ovo je kompromis za CDN-ove.
                if (urlToCache.startsWith('https://cdn.') || urlToCache.startsWith('https://esm.sh')) {
                  return fetch(urlToCache, { mode: 'no-cors' });
                }
                throw new Error(`Failed to fetch ${urlToCache} with status ${response.status}`);
              }
              return response;
            })
            .then(response => {
              // Važno: Za 'no-cors' odgovore, ne možemo direktno provjeriti status
              // ali ih ipak možemo spremiti. Preglednik će ih koristiti ako su valjani.
              if (response.type === 'opaque') {
                 return cache.put(urlToCache, response);
              }
              // Za normalne odgovore, provjeravamo status prije spremanja.
              if (!response.ok) { // Ova provjera je suvišna ako smo je već radili gore, ali za svaki slučaj
                  console.warn(`Service Worker: Failed to cache ${urlToCache} - status: ${response.status}`);
                  return Promise.resolve(); // Ne prekidaj sve zbog jedne neuspjele datoteke
              }
              return cache.put(urlToCache, response);
            })
            .catch(error => {
              console.error(`Service Worker: Failed to fetch and cache ${urlToCache}`, error);
              return Promise.resolve(); // Ne prekidaj sve zbog jedne neuspjele datoteke
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Service Worker: App shell cached successfully.');
        return self.skipWaiting(); // Aktivira novi service worker odmah
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Activated successfully.');
        return self.clients.claim(); // Preuzima kontrolu nad otvorenim klijentima
    })
  );
});

self.addEventListener('fetch', event => {
  // console.log('Service Worker: Fetching', event.request.url);
  // Zahtjevi za navigaciju (HTML stranice) - pokušaj mrežu prvo, pa keš (ili samo keš ako je offline)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request)) // Ako mreža ne uspije, vrati iz keša
        .then(response => response || caches.match('/index.html')) // Ako ni to ne uspije, vrati index.html
    );
    return;
  }

  // Za ostale zahtjeve (CSS, JS, slike), koristi strategiju "cache first"
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }
        // console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Ako je odgovor valjan, kloniraj ga i spremi u keš za buduću upotrebu
            if (networkResponse && networkResponse.ok && event.request.method === 'GET') { // Samo GET zahtjeve keširamo
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  // console.log('Service Worker: Caching new resource', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.warn('Service Worker: Fetch failed; returning offline fallback or error for:', event.request.url, error);
          // Ovdje biste mogli vratiti neku offline fallback stranicu ili sliku ako je potrebno
          // Na primjer, za slike: return caches.match('/offline-placeholder.png');
        });
      })
  );
});
