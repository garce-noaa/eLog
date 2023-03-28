self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('simple-sw-v1').then(function(cache) {
      return cache.addAll([
        './',
        './icons/TripData.png',
        './icons/TripData2.png',
        './icons/TripInfo.png',
        './icons/TripInfo2.png',
        './icons/Client.png',
        './icons/Client2.png',
        './icons/Logbooks.png',
        './icons/Logbooks2.png',
        './icons/HelpIcon.png',
        './icons/HelpIcon2.png',
        'index.html',	        
        'manifest.json',     
        'favicon.ico',            
        'style.css',
	'noaaico.png',	 
        'elog.js'
      ]);
    })
  );
});
self.addEventListener('fetch', function(event) {
   event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});