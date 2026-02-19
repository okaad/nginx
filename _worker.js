const mapCfg = {
 paths: {
  "/server1": "https://emby.nas.edu.kg:443",
  "/server2": "https://emby.dnscf.dpdns.org:443"
 },
 main: "http://filmtoday.emby.moe:80",
 cors: true
};

export default {
 async fetch(req, env, ctx) {
  const rawUrl = new URL(req.url);
  let target = mapCfg.main;
  let prefix = "";
   
  for (const key in mapCfg.paths) {
   if (rawUrl.pathname.startsWith(key)) {
    target = mapCfg.paths[key];
    prefix = key;
    break;
   }
  }

  let cleanPath = rawUrl.pathname;
  if (prefix) {
   cleanPath = cleanPath.replace(prefix, '');
   if (cleanPath === '' || !cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
   }
  }

  const tUrl = new URL(target);
  const finalUrl = new URL(cleanPath + rawUrl.search, tUrl);
   
  const h = new Headers(req.headers);
  h.set('Host', tUrl.host);
   
  if (h.has('Referer')) h.set('Referer', target);
  if (h.has('Origin')) h.set('Origin', target);

  const newReq = new Request(finalUrl.toString(), {
   method: req.method,
   headers: h,
   body: req.body,
   redirect: 'follow'
  });

  try {
   const res = await fetch(newReq);
   const resH = new Headers(res.headers);
    
   if (mapCfg.cors) {
    resH.set('Access-Control-Allow-Origin', '*');
    resH.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    resH.set('Access-Control-Allow-Headers', '*');
   }

   return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: resH
   });
  } catch (err) {
   return new Response(err.message, { status: 502 });
  }
 }
};








