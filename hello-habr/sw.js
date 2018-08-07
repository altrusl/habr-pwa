// Caches

var updated = {};

var CURRENT_CACHES = {
    font: 'font-cache-v1',
    css:'css-cache-v1',
    js:'js-cache-v1',
    site: 'site-cache-v1',
    icons_ext: 'icons_ext-cache-v1',
    image: 'image-cache-v1'
};


// URLs to be removed from cache on activation
var cache_updates = ["/"];

self.addEventListener('install', (event) => {
	self.skipWaiting();
    console.log('Service Worker has been installed');
});


self.addEventListener('activate', (event) => {
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
        return CURRENT_CACHES[key];
    });
	
	cache_updates.forEach(function(ca) {
		// caches.delete(ca).then(function(res) {
		caches.open(CURRENT_CACHES.site).then(function(cache) {
			cache.delete(ca).then(function(res) {
				// console.log("Deleting -------" + res);
			})
		});
	});	
	
    // Delete out of date cahes
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) == -1) {
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    console.log('Service Worker has been activated');
	
});

function sleep(millis) {
    var t = (new Date()).getTime();
    var i = 0;
    while (((new Date()).getTime() - t) < millis) {
        i++;
    }
}


self.addEventListener('fetch', function(event) {
	console.log('Fetching:', event.request.url);

	var url = new URL(event.request.url);
	
	event.respondWith(async function() {
		
		// Template index.php
		if ((url.search == "") &&
			(event.request.method == "GET") &&
			// (url.search.indexOf("tmpl=content") == -1) && 
			(url.pathname == "/" || url.pathname.indexOf("/lenty") == 0)) {
			const tmpl = await caches.match("/");
			console.log("Returning template");
			return tmpl ? tmpl : fetchAndCache(event.request, true);
		}		
		const cachedResponse = await caches.match(event.request);
			
		// real page
	
		// console.log("======" + cachedResponse);
	
		if (cachedResponse) {
			
			// if ((pn == "/" || pn.indexOf("/lenty") == 0) && pn.indexOf("tmpl=content") == -1) {
				// console.log("======" + pn);
				// var init = {
					// status:     cachedResponse.status,
					// statusText: cachedResponse.statusText,
					// headers:	{'X-VG': 'Template from the Cache'}
				// }
				// cachedResponse.headers.forEach(function(v,k){
					// init.headers[k] = v;
				// });
				// return cachedResponse.text().then(function(body){
					// return cachedResponse;
					// var postfix = "\n<script>var xhr_url = '" + pn +"';</script>";
					// return new Response(body + postfix, init);
				// })
			// } else 
			{	
			
				// console.log("Cached version found: " + event.request.url);
				if (updated[url.pathname] === undefined || updated[url.pathname] == cachedResponse.headers.get("Last-Modified")) {
					// console.log("Returning from cache: " + event.request.url);
					return cachedResponse;
				} else {
					console.log("Updating cached resource: " + url.pathname);
					return await fetchAndCache(event.request);
				}
			}
		} else {				
			// console.log("Getting from the Internet:" + event.request.url);
			return await fetchAndCache(event.request);
		}
	}());

});


function fetchAndCache(request, saveAsTmpl=false) {
	
	return fetch(request)
	.then(function(response) {
		// Check if we received a valid response
		if (!response.ok) {
			return response;
			// throw Error(response.statusText);
		}
		
		var url = new URL(request.url);
		// console.log('  Response for %s from network is: %O', request.url, response);
		if (response.status < 400 &&
			response.type === 'basic' 
			// && response.headers.has('content-type')
			) {
			// debugger;
	
			var cur_cache;
			// console.log(url.pathname);
			// console.log(url.pathname.substr(-6));
			if (response.headers.get('content-type') && 
				response.headers.get('content-type').indexOf("application/javascript") >= 0) {
				cur_cache = CURRENT_CACHES.js;
			} else if (response.headers.get('content-type') && 
						response.headers.get('content-type').indexOf("text/css") >= 0) {
				cur_cache = CURRENT_CACHES.css;
			} else if (response.headers.get('content-type') && 
						response.headers.get('content-type').indexOf("font") >= 0) {
				cur_cache = CURRENT_CACHES.font;
			} else if (url.pathname.substr(-6) == ".woff2" ) {
				cur_cache = CURRENT_CACHES.font;
			} else if (	
						(url.pathname.indexOf('/css/images') >= 0 ||
						url.pathname == "/" ||
						url.search.indexOf("tmpl=content") >= 0 ||
						url.pathname.indexOf('/images/site') >= 0) &&
						
							url.pathname.split("/").length-1 > 2 &&		// не лента
							url.pathname.indexOf('/poleznoe/skidki') == -1 && 
							url.pathname.indexOf('/component/users') == -1 && 
							url.pathname.indexOf('/component/jcomments') == -1 && 
							url.pathname.indexOf('/component/search') == -1 
						) {
				cur_cache = CURRENT_CACHES.site;
			} else if (url.pathname.indexOf('/misc/image.php') >= 0) {
				cur_cache = CURRENT_CACHES.image;
			}
			if (saveAsTmpl) {
				request = new Request("/");
				cur_cache = CURRENT_CACHES.site;
				// console.log('  Caching TEMPLATE');
			}
			if (cur_cache) {
				// console.log('  Caching the response to', request.url);

				return caches.open(cur_cache).then(function(cache) {
					cache.put(request, response.clone());
					// response.headers.set("Date", "3333");
					// console.log('  dare ' + response.headers.get("Date"));
					updated[(new URL(request.url)).pathname] = response.headers.get("Last-Modified");
					return response;
				});
			}
		}
		return response;

	})
	.catch(function(error) {
		console.log('Request failed for: ' + request.url, error);
		throw error;
		// You could return a custom offline 404 page here
	});
}

