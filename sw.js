const CACHE='lokanta-en-v23';
try{self.window=self;importScripts('config.js')}catch(_){}
const CORE=['./','index.html','config.js','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  const u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('/admin.html'))return;
  const fresh=r.mode==='navigate'||/\.(html|js|json|webmanifest|bin|mp3)$/.test(u.pathname)||u.pathname.endsWith('/');
  if(fresh){
    const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res});const back=()=>caches.match(r,{ignoreSearch:true}).then(h=>h||(r.mode==='navigate'?caches.match('index.html'):undefined));const nav=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');e.respondWith(nav?Promise.race([net.catch(()=>back()),new Promise(ok=>setTimeout(()=>ok(back()),2500))]).then(x=>x||net):net.catch(()=>back()));if(nav)e.waitUntil(net.catch(()=>{}));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));
});
function trackPush(x,title){const c=self.FB_CONFIG;if(!c||!x.did)return Promise.resolve();
return fetch('https://firestore.googleapis.com/v1/projects/'+c.projectId+'/databases/(default)/documents/students/'+encodeURIComponent(x.did)+'?updateMask.fieldPaths=pushAt&updateMask.fieldPaths=pushT&key='+encodeURIComponent(c.apiKey),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{pushAt:{timestampValue:new Date().toISOString()},pushT:{stringValue:String(title||'').slice(0,80)}}})}).catch(()=>{})}
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){}const n=d.notification||{},x=d.data||d,t=n.title||x.title||'Lokanta İngilizcesi';e.waitUntil(Promise.all([self.registration.showNotification(t,{body:n.body||x.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:x.tag||'gunun-kelimesi',data:{url:x.url||'./'}}),trackPush(x,t)]))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'./';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c){try{c.postMessage({type:'bd',url:u})}catch(_){}return c.focus()}}return clients.openWindow(u)}))});
