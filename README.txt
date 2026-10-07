Replace script.js, sealion.js, cards.js, server.js (other files unchanged).
Login: any username + password "Huh".
SYNC: run  SITE_KEY=abc ADMIN_TOKEN=secret node server.js
 Then either edit config.js -> {endpoint:"https://YOUR_HOST:8787", siteKey:"abc"}
 or open Settings -> Data, type the URL/site key and press "Sync now / test" (no file editing needed).
 If your site is https, the server URL must be https too (browsers block http).
Admin: click logo 10x, type "enable admin mode" in Sea Lion chat, click logo 5x, enter ADMIN_TOKEN, press Load.
