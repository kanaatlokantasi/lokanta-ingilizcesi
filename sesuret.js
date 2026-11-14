/* Pratik Lokanta İngilizcesi — ElevenLabs ses üretici (yönetici sayfası).
   Tüm İngilizce kelime/cümleleri ElevenLabs ile seslendirir, ses-f.bin / ses-m.bin / ses.json dosyalarını zip olarak verir.
   API anahtarı yalnızca bu tarayıcıdan ElevenLabs'e gider. */
(function(){
var DEF={female:'XlDdozLmuTofIxK4BjPD',male:'Aa6nEBJJMKJwJkCx8VU2'};
var SPEAK={'cabbage':'Cabbage.','lettuce':'Lettuce.','quince':'Quince.','quince compote':'Quince compote.','nuts':'Nuts.','sea bass':'See bass.','soup':'Soup.','bonito':'Bonito.','roasted lamb with potatoes':'Roasted lamb with potatoes.','oven baked lamb with potatoes':'Oven baked lamb with potatoes.','beef with potatoes, carrots and thyme':'Beef with potatoes, carrots and thyme.','bulgur rice':'Bulgur rice.'};/* tek sözcüklerde sondaki ünlü eklenmesini önlemek için okunacak metin */
var MODELS=[['eleven_multilingual_v2','Multilingual v2 (önerilen, 1 kredi/karakter)',1],['eleven_flash_v2_5','Flash v2.5 (yarı fiyat, biraz daha az doğal)',0.5],['eleven_turbo_v2_5','Turbo v2.5 (yarı fiyat)',0.5]];
function kk(t){var s=String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40),h=5381,i;for(i=0;i<t.length;i++)h=(((h<<5)+h)+t.charCodeAt(i))>>>0;return s+'-'+h.toString(36)+t.length.toString(36)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}

function parseTexts(txt){
  var s0=txt.indexOf('var S=['),s1=txt.indexOf('\n];',s0);
  if(s0<0||s1<0)throw new Error('Kelime verisi bulunamadı');
  var S=(new Function('return '+txt.slice(s0+6,s1+2)))(),seen={},out=[];
  var t0=txt.indexOf('var S2=['),t1=t0<0?-1:txt.indexOf('\n];',t0);
  if(t0>=0&&t1>0){S=S.concat((new Function('return '+txt.slice(t0+7,t1+2)))())}
  var dlg=[],dseen={};
  S.forEach(function(sec){sec.items.forEach(function(it){var t=String(it[1]).trim();if(!t)return;
    var role=sec.cat==='seviye2'?(/^Siz: /.test(it[0])?'w':(/^Müşteri: /.test(it[0])?'c':null)):null;
    if(role){if(!dseen[t]){dseen[t]=1;dlg.push({t:t,role:role})}return}
    if(!seen[t]){seen[t]=1;out.push(t)}})});
  out.dlg=dlg;
  return out
}

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
    cen.push(new Uint8Array(ch.buffer),nm);
    off+=30+nm.length+sz
  });
  var cs=0;cen.forEach(function(c){cs+=c.length});
  var end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[new Uint8Array(end.buffer)]),{type:'application/zip'})
}

/* --- ElevenLabs --- */
function apiErr(status,msg,code){
  if(status===401)return new Error('API anahtarı geçersiz ya da yetkisiz (401). Anahtarı kontrol edin.');
  if(status===402||code==='payment_required')return new Error('Plan/kredi sorunu (402): '+(msg||'Hesabınızın ses üretme hakkını kontrol edin.'));
  if(status===404||code==='voice_not_found')return new Error('Ses hesabınızda bulunamadı. ElevenLabs sitesinde sesin sayfasında "Add to my voices / Seslerime ekle" deyip tekrar deneyin.');
  if(status===422)return new Error('Geçersiz istek (422): '+(msg||''));
  return new Error('ElevenLabs hatası ('+status+'): '+(msg||''))
}
async function tts(o,voice,text){
  text=SPEAK[String(text).toLowerCase()]||text;
  var netErr=null;
  for(var a=0;a<6;a++){
    if(o.signal&&o.signal.aborted)throw new Error('İptal edildi');
    var r;
    try{
      r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voice)+'?output_format=mp3_44100_64',{method:'POST',signal:o.signal,
        headers:{'xi-api-key':o.key,'Content-Type':'application/json',Accept:'audio/mpeg'},
        body:JSON.stringify({text:text,model_id:o.model,voice_settings:{stability:o.stab,similarity_boost:0.75,speed:o.speed}})})
    }catch(e){
      if(e&&e.name==='AbortError')throw new Error('İptal edildi');
      netErr=e;await sleep(1500*(a+1));continue
    }
    if(r.ok)return new Uint8Array(await r.arrayBuffer());
    var msg='',code='';try{var j=await r.json();var d=j&&j.detail;if(d&&typeof d==='object'){msg=d.message||'';code=d.status||''}else if(typeof d==='string')msg=d}catch(e){}
    if(r.status===429||r.status>=500){await sleep(1500*(a+1));continue}
    throw apiErr(r.status,msg,code)
  }
  if(netErr)throw new Error('ElevenLabs\'e ulaşılamadı (ağ/bağlantı hatası: '+(netErr.message||netErr)+'). İnternet bağlantınızı kontrol edip tekrar deneyin. Sürerse ElevenLabs panelinde API anahtarındaki IP/izin kısıtlamasına bakın.');
  throw new Error('ElevenLabs birçok denemeye rağmen yanıt vermedi')
}

/* --- Mevcut paket (eksikleri üretmek için) --- */
async function loadExisting(){
  var res={f:{},m:{},d:{}};
  try{
    var r=await fetch('ses.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return res;
    var man=await r.json();
    for(var g of['f','m','d']){
      if(!man[g]||!Object.keys(man[g]).length)continue;
      var b=await fetch('ses-'+g+'.bin?t='+Date.now(),{cache:'no-store'});if(!b.ok)continue;
      var buf=new Uint8Array(await b.arrayBuffer());
      Object.keys(man[g]).forEach(function(k){var p=man[g][k];res[g][k]=buf.slice(p[0],p[0]+p[1])})
    }
  }catch(e){}
  return res
}
function pack(clips,keys){
  var chunks=[],man={},off=0;
  keys.forEach(function(k){var c=clips[k];if(!c)return;man[k]=[off,c.length];chunks.push(c);off+=c.length});
  var bin=new Uint8Array(off),p=0;chunks.forEach(function(c){bin.set(c,p);p+=c.length});
  return{bin:bin,man:man}
}

async function generate(o){
  var prog=o.onProgress||function(){};
  prog(0,'Kelime listesi okunuyor…');
  var texts=parseTexts(await (await fetch('index.html?t='+Date.now(),{cache:'no-store'})).text());
  var dlg=texts.dlg||[],dkeys=dlg.map(function(x){return kk(x.t)});
  var keyOf={};texts.forEach(function(t){keyOf[t]=kk(t)});
  var existing=o.onlyMissing?await loadExisting():{f:{},m:{},d:{}};
  var voices=[];if(o.female)voices.push(['f',o.female]);if(o.male)voices.push(['m',o.male]);
  var clips={f:{},m:{},d:{}},tasks=[];
  var redoL=String(o.redo||'').split('|').map(function(x){return x.trim().toLowerCase()}).filter(Boolean);function isRedo(t){var l=t.toLowerCase();return redoL.some(function(r){return r.charAt(0)==='='?l===r.slice(1).trim():l.indexOf(r)!==-1})}
  dlg.forEach(function(x,i){var v=x.role==='w'?o.waiter:o.customer;if(!v)return;var k=dkeys[i];if(existing.d[k]&&!isRedo(x.t))clips.d[k]=existing.d[k];else tasks.push({g:'d',voice:v,t:x.t,k:k,stab:0.7})});
  voices.forEach(function(v){texts.forEach(function(t){var k=keyOf[t];if(existing[v[0]][k]&&!isRedo(t))clips[v[0]][k]=existing[v[0]][k];else tasks.push({g:v[0],voice:v[1],t:t,k:k})})});
  var total=tasks.length,done=0,chars=0;tasks.forEach(function(x){chars+=x.t.length});
  var failed=null,idx=0;
  if(!total)prog(1,'Üretilecek yeni kelime yok');
  async function worker(){
    while(!failed){
      var i=idx++;if(i>=total)return;var tk=tasks[i];
      try{clips[tk.g][tk.k]=await tts(tk.stab?Object.assign({},o,{stab:tk.stab}):o,tk.voice,tk.t)}catch(e){failed=failed||e;return}
      done++;prog(done/total,done+' / '+total+' ses üretildi')
    }
  }
  var ws=[];for(var w=0;w<(o.concurrency||3);w++)ws.push(worker());
  await Promise.all(ws);
  if(failed)throw failed;
  var keys=texts.map(function(t){return keyOf[t]}),files=[],man={v:1,n:texts.length,date:new Date().toISOString().slice(0,10)},bytes=0;
  ['f','m','d'].forEach(function(g){var has=g==='d'?!!(o.waiter||o.customer):voices.some(function(v){return v[0]===g});if(!has)clips[g]=existing[g];var p=pack(clips[g],g==='d'?dkeys:keys);man[g]=p.man;if(p.bin.length){files.push({name:'ses-'+g+'.bin',data:p.bin});bytes+=p.bin.length}});
  files.push({name:'ses.json',data:new TextEncoder().encode(JSON.stringify(man))});
  var sample=null;voices.forEach(function(v){var k=keys[0];if(clips[v[0]][k]&&!sample)sample=clips[v[0]][k]});
  return{zip:makeZip(files),generated:total,chars:chars,bytes:bytes,count:texts.length,clips:clips,keys:keys,texts:texts}
}

/* --- Arayüz --- */
function open(){
  if(document.getElementById('bkm'))return;
  var m=el('div');m.id='bkm';var bx=el('div','bx');m.appendChild(bx);document.body.appendChild(m);
  var ctl=null,lastZip=null,lastName='';
  function close(){if(ctl)ctl.abort();m.remove()}
  function field(label,type,val,ph){var l=el('label',null,label);l.style.cssText='display:block;font-size:12.5px;font-weight:600;margin:10px 0 3px;color:var(--muted)';var i=document.createElement('input');i.type=type;i.value=val||'';if(ph)i.placeholder=ph;i.style.cssText='width:100%;min-height:42px;padding:0 10px;border-radius:9px;border:1.5px solid var(--line);background:var(--card,#fff);color:var(--text);font-size:15px';bx.appendChild(l);bx.appendChild(i);return i}
  function playBlob(u8){var a=new Audio(URL.createObjectURL(new Blob([u8],{type:'audio/mpeg'})));a.play().catch(function(){});return a}
  function stepOptions(){
    bx.innerHTML='';bx.appendChild(el('h2',null,'ElevenLabs ses üretici'));
    bx.appendChild(el('p',null,'Uygulamadaki tüm İngilizce kelime ve cümleler kadın ve erkek sesiyle seslendirilir. API anahtarınız yalnızca bu tarayıcıdan ElevenLabs\'e gider; siteye kaydedilmez.'));
    var saved='';try{saved=localStorage.getItem('lokElKey')||''}catch(e){}
    var key=field('ElevenLabs API anahtarı','password',saved,'sk_…');
    var rem=el('label','ck');var rc=document.createElement('input');rc.type='checkbox';rc.checked=!!saved;rem.appendChild(rc);rem.appendChild(document.createTextNode('Bu cihazda hatırla'));bx.appendChild(rem);
    var fem=field('Kadın sesi (Voice ID)','text',DEF.female);var mal=field('Erkek sesi (Voice ID)','text',DEF.male);
    var sw='',sc='';try{sw=localStorage.getItem('lokElW')||'';sc=localStorage.getItem('lokElC')||''}catch(e){}
    var wai=field('Seviye 2 diyalog: garson sesi, erkek (Voice ID)','text',sw,'Seviye 1\'den farklı bir ses ID\'si');var cus=field('Seviye 2 diyalog: müşteri sesi, kadın (Voice ID)','text',sc,'Seviye 1\'den farklı bir ses ID\'si');
    var lm=el('label',null,'Model');lm.style.cssText='display:block;font-size:12.5px;font-weight:600;margin:10px 0 3px;color:var(--muted)';var sel=document.createElement('select');sel.style.cssText='width:100%;min-height:42px;border-radius:9px;border:1.5px solid var(--line);background:var(--card,#fff);color:var(--text);font-size:14px;padding:0 8px';MODELS.forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];sel.appendChild(o)});bx.appendChild(lm);bx.appendChild(sel);
    var sp=field('Konuşma hızı (0,7 – 1,2; öğrenme için 0,9 önerilir)','text','0.9');
    var rdo=field('Yalnızca şu cümleyi yeniden üret (İngilizce metinde geçen birkaç sözcük; boş bırakın = kapalı)','text','','örn: =soup|=bonito  (=: tam eşleşme, |: birden çok)');
    var onl=el('label','ck');var oc=document.createElement('input');oc.type='checkbox';oc.checked=true;onl.appendChild(oc);onl.appendChild(document.createTextNode('Yalnızca eksik/yeni kelimeleri üret'));bx.appendChild(onl);
    var info=el('p',null,'');info.style.marginTop='10px';bx.appendChild(info);
    var texts=null;
    fetch('index.html').then(function(r){return r.text()}).then(function(t){texts=parseTexts(t);upd()}).catch(function(){});
    function factor(){var f=1;MODELS.forEach(function(x){if(x[0]===sel.value)f=x[2]});return f}
    function upd(){if(!texts)return;var c=0;texts.forEach(function(t){c+=t.length});var v=(fem.value.trim()?1:0)+(mal.value.trim()?1:0);var dc=0;(texts.dlg||[]).forEach(function(x){if(x.role==='w'?wai.value.trim():cus.value.trim())dc+=x.t.length});info.textContent=texts.length+' kelime/cümle + '+(texts.dlg||[]).length+' diyalog satırı. Tümünü üretirseniz yaklaşık '+Math.round((c*v+dc)*factor())+' kredi harcanır.'}
    sel.addEventListener('change',upd);fem.addEventListener('input',upd);mal.addEventListener('input',upd);
    function opts(){
      var k=key.value.trim();if(!k){alert('API anahtarını yapıştırın.');return null}
      if(/[^\x21-\x7E]/.test(k)){alert('API anahtarında geçersiz karakter var (boşluk, satır sonu ya da Türkçe harf). Anahtarı ElevenLabs sayfasından tekrar kopyalayıp yapıştırın.');return null}
      try{if(rc.checked)localStorage.setItem('lokElKey',k);else localStorage.removeItem('lokElKey')}catch(e){}
      try{if(wai.value.trim())localStorage.setItem('lokElW',wai.value.trim());if(cus.value.trim())localStorage.setItem('lokElC',cus.value.trim())}catch(e){}
      var s=parseFloat(String(sp.value).replace(',','.'));if(!(s>=0.7&&s<=1.2))s=0.9;
      return{key:k,female:fem.value.trim(),male:mal.value.trim(),waiter:wai.value.trim(),redo:rdo.value.trim(),customer:cus.value.trim(),model:sel.value,speed:s,stab:0.5,onlyMissing:oc.checked,concurrency:3}
    }
    var r1=el('div','row');var tb=el('button','alt','Sesleri dene');tb.type='button';
    var out=el('p',null,'');out.style.marginTop='8px';
    tb.addEventListener('click',function(){var o=opts();if(!o)return;out.textContent='Deneme sesi üretiliyor…';ctl=new AbortController();o.signal=ctl.signal;
      var vs=[['Kadın',o.female],['Erkek',o.male],['Garson',o.waiter],['Müşteri',o.customer]].filter(function(v){return v[1]});
      Promise.all(vs.map(function(v){return tts(o,v[1],'Tomato soup. Would you like some water?').then(function(u){return[v[0],u]})})).then(function(rs){out.textContent='Çalıyor: '+rs.map(function(x){return x[0]}).join(' → ');var i=0;(function nx(){if(i>=rs.length)return;var a=playBlob(rs[i++][1]);a.onended=nx})()}).catch(function(e){out.textContent='Hata: '+e.message})});
    r1.appendChild(tb);bx.appendChild(r1);bx.appendChild(out);
    var r=el('div','row');var go=el('button',null,'Üretimi başlat');go.type='button';var cn=el('button','alt','Kapat');cn.type='button';cn.addEventListener('click',close);
    go.addEventListener('click',function(){var o=opts();if(!o)return;if(!o.female&&!o.male&&!o.waiter&&!o.customer){alert('En az bir ses ID\'si girin.');return}run(o)});
    r.appendChild(go);r.appendChild(cn);bx.appendChild(r)
  }
  function run(o){
    bx.innerHTML='';bx.appendChild(el('h2',null,'Sesler üretiliyor…'));var tx=el('p',null,'Başlıyor');var pb=el('div','pb');var bar=document.createElement('i');pb.appendChild(bar);bx.appendChild(tx);bx.appendChild(pb);
    var r=el('div','row');var cn=el('button','alt','Vazgeç');cn.type='button';cn.addEventListener('click',function(){if(ctl)ctl.abort();stepOptions()});r.appendChild(cn);bx.appendChild(r);
    ctl=new AbortController();o.signal=ctl.signal;
    o.onProgress=function(f,t){bar.style.width=Math.round(f*100)+'%';tx.textContent=t+' (%'+Math.round(f*100)+')'};
    generate(o).then(function(res){
      var d=new Date();lastName='ses-paketi-'+d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+'.zip';
      lastZip=new File([res.zip],lastName,{type:'application/zip'});
      bx.innerHTML='';bx.appendChild(el('h2',null,'Sesler hazır ✓'));
      bx.appendChild(el('p',null,res.count+' kelime/cümle · '+res.generated+' yeni klip üretildi · paket '+(lastZip.size/1048576).toFixed(1)+' MB. Önce birkaç kelimeyi dinleyin:'));
      var li=el('div');li.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px';
      var pick=[0,Math.floor(res.texts.length/3),Math.floor(res.texts.length*2/3),res.texts.length-1];
      pick.forEach(function(i){['f','m'].forEach(function(g){var c=res.clips[g][res.keys[i]];if(!c)return;var b=el('button','alt sm',(g==='f'?'👩 ':'👨 ')+res.texts[i].slice(0,22));b.type='button';b.addEventListener('click',function(){playBlob(c)});li.appendChild(b)})});
      bx.appendChild(li);
      var r2=el('div','row');var sh=el('button',null,'Paylaş / Kaydet');sh.type='button';
      function dl(){var u=URL.createObjectURL(lastZip);var a=document.createElement('a');a.href=u;a.download=lastName;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},60000)}
      sh.addEventListener('click',function(){if(navigator.canShare&&navigator.canShare({files:[lastZip]})){navigator.share({files:[lastZip],title:'Ses paketi'}).catch(function(e){if(e&&e.name!=='AbortError')dl()})}else dl()});
      var cl=el('button','alt','Kapat');cl.type='button';cl.addEventListener('click',close);r2.appendChild(sh);r2.appendChild(cl);bx.appendChild(r2);
      bx.appendChild(el('p',null,'Bu zip dosyasını Claude\'a sohbette gönderin; siteye ben yüklerim.'))
    }).catch(function(e){if(ctl&&ctl.signal.aborted)return;bx.innerHTML='';bx.appendChild(el('h2',null,'Üretim durdu'));bx.appendChild(el('p',null,String(e&&e.message||e)));var r3=el('div','row');var b1=el('button',null,'Geri dön');b1.type='button';b1.addEventListener('click',stepOptions);var b2=el('button','alt','Kapat');b2.type='button';b2.addEventListener('click',close);r3.appendChild(b1);r3.appendChild(b2);bx.appendChild(r3)})
  }
  stepOptions()
}
window.KSES={open:open,kk:kk,generate:generate,_zip:makeZip,_parse:parseTexts};
})();
