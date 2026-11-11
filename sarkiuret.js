/* Pratik Lokanta İngilizcesi — Doğum günü şarkısı üretici (yönetici sayfası, ElevenLabs Music).
   Her ilk ad için bir şarkı üretir; sarki-xxxx.mp3 dosyalarını zip olarak verir.
   API anahtarı yalnızca bu tarayıcıdan ElevenLabs'e gider. */
(function(){
var SALT='kanaat-dg|';
function norm(s){return String(s||'').toLocaleLowerCase('tr').replace(/\s+/g,' ').trim().split(' ')[0]}
function h(s,seed,mul){var x=seed;for(var i=0;i<s.length;i++)x=(((x*mul)+s.charCodeAt(i))>>>0);return x.toString(36)}
function sarkiFile(name){var n=SALT+norm(name);return 'sarki-'+h(n,5381,33)+h(n,52711,31)+'.mp3'}
function titleTR(s){s=String(s||'').trim();return s.charAt(0).toLocaleUpperCase('tr')+s.slice(1).toLocaleLowerCase('tr')}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
var STYLE='A cheerful, warm, upbeat Turkish pop birthday song with handclaps and a festive party feeling.';
var LYR='İyi ki doğdun {isim}, iyi ki doğdun {isim}\nNice mutlu yıllara, nice güzel günlere\nKanaat ailesi seninle, gülsün yüzün her zaman\nİyi ki doğdun {isim}, hep mutlu ol {isim}';
/* --- ZIP (sıkıştırmasız) --- */
var CT=null;
function crc32(u8){if(!CT){CT=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CT[n]=c>>>0}}
  var crc=0xFFFFFFFF;for(var i=0;i<u8.length;i++)crc=CT[(crc^u8[i])&255]^(crc>>>8);return(crc^0xFFFFFFFF)>>>0}
function makeZip(files){
  var enc=new TextEncoder(),parts=[],cen=[],off=0,date=((2026-1980)<<9)|(11<<5)|10;
  files.forEach(function(f){
    var nm=enc.encode(f.name),crc=crc32(f.data),sz=f.data.length;
    var lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,0,true);lh.setUint16(12,date,true);
    lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
    parts.push(new Uint8Array(lh.buffer),nm,f.data);
    var ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,0,true);ch.setUint16(14,date,true);
    ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
    cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+sz
  });
  var cs=0;cen.forEach(function(c){cs+=c.length});
  var end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[new Uint8Array(end.buffer)]),{type:'application/zip'})
}
async function compose(o,name){
  var lyr=o.lyrics.replace(/\{isim\}/g,titleTR(name));
  var prompt=o.style+' Sung in Turkish by a '+o.vocal+' vocalist. Sing exactly these lyrics, pronouncing the name "'+titleTR(name)+'" clearly:\n'+lyr;
  var netErr=null;
  for(var a=0;a<3;a++){
    if(o.signal&&o.signal.aborted)throw new Error('İptal edildi');
    var r;
    try{r=await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128',{method:'POST',signal:o.signal,headers:{'xi-api-key':o.key,'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt,music_length_ms:o.sec*1000,model_id:o.model})})}
    catch(e){if(e&&e.name==='AbortError')throw new Error('İptal edildi');netErr=e;await sleep(2000*(a+1));continue}
    if(r.ok)return new Uint8Array(await r.arrayBuffer());
    var msg='';try{var j=await r.json();var d=j&&j.detail;msg=typeof d==='string'?d:(d&&(d.message||(d[0]&&d[0].msg)))||''}catch(e){}
    if(r.status===401)throw new Error('API anahtarı geçersiz ya da yetkisiz (401).');
    if(r.status===402||r.status===403)throw new Error('Plan/kredi sorunu ('+r.status+'): '+(msg||'Hesabınızda müzik üretme hakkı olmayabilir.'));
    if(r.status===429||r.status>=500){await sleep(3000*(a+1));continue}
    throw new Error('ElevenLabs hatası ('+r.status+'): '+msg)
  }
  throw new Error(netErr?'ElevenLabs\'e ulaşılamadı: '+(netErr.message||netErr):'ElevenLabs yanıt vermedi')
}
function open(){
  if(document.getElementById('bkm'))return;
  var m=el('div');m.id='bkm';var bx=el('div','bx');m.appendChild(bx);document.body.appendChild(m);
  var ctl=null,songs={};
  function close(){if(ctl)ctl.abort();m.remove()}
  function field(label,type,val,ph){var l=el('label',null,label);l.style.cssText='display:block;font-size:12.5px;font-weight:600;margin:10px 0 3px;color:var(--muted)';var i=document.createElement(type==='area'?'textarea':'input');if(type!=='area')i.type=type;i.value=val||'';if(ph)i.placeholder=ph;i.style.cssText='width:100%;min-height:42px;border-radius:9px;border:1.5px solid var(--line);background:var(--card,#fff);color:var(--text);font:inherit;padding:8px 10px;box-sizing:border-box';if(type==='area')i.rows=4;bx.appendChild(l);bx.appendChild(i);return i}
  function sel(label,opts){var l=el('label',null,label);l.style.cssText='display:block;font-size:12.5px;font-weight:600;margin:10px 0 3px;color:var(--muted)';var s=document.createElement('select');s.style.cssText='width:100%;min-height:42px;border-radius:9px;border:1.5px solid var(--line);background:var(--card,#fff);color:var(--text);font-size:15px;padding:0 8px';opts.forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];s.appendChild(o)});bx.appendChild(l);bx.appendChild(s);return s}
  function step1(){
    bx.innerHTML='';bx.appendChild(el('h2',null,'🎵 Doğum günü şarkısı üretici'));
    bx.appendChild(el('p',null,'Her ilk ad için kısa bir doğum günü şarkısı üretilir. API anahtarınız yalnızca bu tarayıcıdan ElevenLabs\'e gider; siteye kaydedilmez.'));
    var saved='';try{saved=localStorage.getItem('lokElKey')||''}catch(e){}
    var key=field('ElevenLabs API anahtarı','password',saved,'sk_…');
    var names=field('İlk adlar (her satıra bir ad)','area','Mansur');
    var vocal=sel('Vokal',[['male','Erkek'],['female','Kadın']]);
    var sec=field('Süre (saniye, 10–60)','text','30');
    var model=sel('Model',[['music_v1','Music v1 (varsayılan)'],['music_v2_5','Music v2.5 (daha yeni)']]);
    var style=field('Müzik tarzı (İngilizce yazın)','area',STYLE);
    var lyr=field('Söz şablonu ({isim} yerine ad gelir)','area',LYR);lyr.rows=6;
    var r=el('div','row');var go=el('button',null,'Şarkıları üret');go.type='button';var cn=el('button','alt','Kapat');cn.type='button';cn.addEventListener('click',close);
    go.addEventListener('click',function(){
      var k=key.value.trim();if(!k||/[^\x21-\x7E]/.test(k)){alert('API anahtarını (boşluk ve Türkçe harf olmadan) yapıştırın.');return}
      try{localStorage.setItem('lokElKey',k)}catch(e){}
      var seen={},list=[];names.value.split(/\n/).forEach(function(x){x=x.trim();if(!x)return;var n=norm(x);if(!seen[n]){seen[n]=1;list.push(titleTR(n))}});
      if(!list.length){alert('En az bir ad yazın.');return}
      var s=parseInt(sec.value,10);if(!(s>=10&&s<=60))s=30;
      run({key:k,vocal:vocal.value,sec:s,model:model.value,style:style.value.trim()||STYLE,lyrics:lyr.value.trim()||LYR},list)
    });
    r.appendChild(go);r.appendChild(cn);bx.appendChild(r)
  }
  function run(o,list){
    bx.innerHTML='';bx.appendChild(el('h2',null,'Şarkılar'));
    bx.appendChild(el('p',null,'Her şarkı yaklaşık yarım dakika sürer. Dinleyin, beğenmediğinizi "Yeniden üret" ile değiştirin. Hazır olunca zip\'i indirin.'));
    var rows={};ctl=new AbortController();o.signal=ctl.signal;
    var box=el('div');bx.appendChild(box);
    function mk(name){
      var row=el('div');row.style.cssText='display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:wrap';
      var nm=el('b',null,name);nm.style.flex='1 1 90px';var st=el('span',null,'Bekliyor…');st.style.cssText='font-size:12.5px;color:var(--muted);flex:2 1 120px';
      var pl=el('button','alt sm','▶ Dinle');pl.type='button';pl.hidden=true;var rg=el('button','alt sm','Yeniden üret');rg.type='button';rg.hidden=true;
      var au=null;pl.addEventListener('click',function(){if(au){au.pause();au=null}au=new Audio(URL.createObjectURL(new Blob([songs[name]],{type:'audio/mpeg'})));au.play().catch(function(){})});
      rg.addEventListener('click',function(){gen(name)});
      row.appendChild(nm);row.appendChild(st);row.appendChild(pl);row.appendChild(rg);box.appendChild(row);rows[name]={st:st,pl:pl,rg:rg};return rows[name]
    }
    var busy=false,queue=[];
    async function gen(name){
      if(ctl.signal.aborted)return;
      queue.push(name);if(busy)return;busy=true;
      while(queue.length){
        var n=queue.shift(),R=rows[n]||mk(n);R.rg.hidden=true;R.pl.hidden=true;R.st.textContent='Üretiliyor… (yaklaşık 30-60 sn)';
        try{songs[n]=await compose(o,n);R.st.textContent='Hazır ✓ '+(songs[n].length/1048576).toFixed(1)+' MB';R.pl.hidden=false;R.rg.hidden=false;zipBtn.hidden=false}
        catch(e){if(ctl.signal.aborted){busy=false;return}R.st.textContent='Hata: '+(e&&e.message||e);R.rg.hidden=false;if(/401|402|403/.test(String(e&&e.message))){queue.length=0}}
      }
      busy=false
    }
    list.forEach(function(n){mk(n)});
    var r=el('div','row');var zipBtn=el('button',null,'Zip olarak indir / paylaş');zipBtn.type='button';zipBtn.hidden=true;var cl=el('button','alt','Kapat');cl.type='button';cl.addEventListener('click',close);
    zipBtn.addEventListener('click',function(){
      var files=Object.keys(songs).map(function(n){return{name:sarkiFile(n),data:songs[n]}});
      var d=new Date(),nm='sarkilar-'+d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+'.zip';
      var f=new File([makeZip(files)],nm,{type:'application/zip'});
      function dl(){var u=URL.createObjectURL(f);var a=document.createElement('a');a.href=u;a.download=nm;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},60000)}
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Doğum günü şarkıları'}).catch(function(e){if(e&&e.name!=='AbortError')dl()})}else dl()
    });
    r.appendChild(zipBtn);r.appendChild(cl);bx.appendChild(r);
    bx.appendChild(el('p',null,'Zip\'i Claude\'a sohbette gönderin; siteye ben yüklerim.')).style.marginTop='10px';
    list.forEach(function(n){gen(n)})
  }
  step1()
}
window.KSARKI={open:open,file:sarkiFile,norm:norm,_compose:compose};
})();
