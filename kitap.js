/* Pratik Lokanta İngilizcesi — E-kitap (PDF) üretici. Yönetici sayfasından çağrılır.
   Veriyi index.html'den okur, A5 sayfalar çizer, PDF olarak birleştirir. */
(function(){
var W=559,H=794,PX=1.8;
var CATS=[['sebze','Sebzeler','🥕'],['et','Etler','🥩'],['ev','Ev yemekleri','🍲'],['sohbet','Kısa Sohbetler','💬'],['kelime','Kelimeler','🔤']];
var QR='data:image/png;base64,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';
var SITE='kanaatlokantasi.github.io/lokanta-ingilizcesi';
var MONTHS=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rgba(hex,a){var h=hex.replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function loadScript(u){return new Promise(function(res,rej){var s=document.createElement('script');s.src=u;s.onload=res;s.onerror=function(){rej(new Error('Kütüphane yüklenemedi: '+u))};document.head.appendChild(s)})}
function tick(){return new Promise(function(r){setTimeout(r,0)})}

var CSS='.bk-page{width:'+W+'px;height:'+H+'px;position:relative;overflow:hidden;background:#fffdf8;color:#1d231e;font-family:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-sizing:border-box}'+
'.bk-page *{box-sizing:border-box;margin:0;padding:0}'+
'.bk-foot{position:absolute;left:28px;right:28px;bottom:8px;height:54px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#8a948b;letter-spacing:.02em;border-top:1px solid #e6e9e4;padding-top:3px}'+
'.bk-qr{display:flex;align-items:center;gap:7px;text-align:right;line-height:1.2}.bk-qr b{color:#1414c8;font-size:11px;display:block}.bk-qr i{width:48px;height:48px;display:block;background-size:contain;background-repeat:no-repeat;background-position:center;background-color:#fff;border-radius:4px;image-rendering:pixelated}'+
'.bk-foot b{color:#444;font-weight:700}'+
'.bk-cover{background:linear-gradient(160deg,#0a1560 0%,#1414c8 58%,#3b4df0 100%);color:#fff}'+
'.bk-cover .ring{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.14)}'+
'.bk-kicker{position:absolute;left:40px;top:44px;font-size:12px;letter-spacing:.22em;text-transform:uppercase;opacity:.85;font-weight:700}'+
'.bk-title{position:absolute;left:40px;right:40px;top:78px;font-weight:800;font-size:50px;line-height:1.02;letter-spacing:-.02em}'+
'.bk-sub{position:absolute;left:40px;right:60px;top:236px;font-size:17px;line-height:1.35;opacity:.9}'+
'.bk-tiles{position:absolute;left:34px;right:34px;top:318px;height:340px}'+
'.bk-tile{position:absolute;width:150px;height:150px;border-radius:22px;border:5px solid #fff;background-size:cover;background-position:center;box-shadow:0 10px 24px rgba(0,0,0,.35)}'+
'.bk-coverfoot{position:absolute;left:40px;right:40px;bottom:34px;display:flex;justify-content:space-between;align-items:flex-end;font-size:13px}'+
'.bk-coverfoot b{display:block;font-size:20px;letter-spacing:-.01em;margin-bottom:2px}'+
'.bk-h1{font-weight:800;font-size:30px;letter-spacing:-.02em;line-height:1.05}'+
'.bk-pad{position:absolute;left:36px;right:36px;top:40px}'+
'.bk-step{display:flex;gap:14px;margin:0 0 14px;align-items:flex-start}'+
'.bk-num{flex:none;width:34px;height:34px;border-radius:50%;background:#1414c8;color:#fff;font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center}'+
'.bk-step p{font-size:14px;line-height:1.42;color:#2b332d}.bk-step b{color:#0f0f9a}'+
'.bk-toc{display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px dashed #d8ddd6;font-size:14.5px;margin-top:3px}'+
'.bk-toc .dot{width:12px;height:12px;border-radius:50%;flex:none}.bk-toc .nm{font-weight:700;flex:1}.bk-toc .pg{font-weight:800;color:#0f0f9a}'+
'.bk-toc.sub{padding:1.6px 0 1.6px 22px;border:0;font-size:11.5px;color:#59645b;margin:0}.bk-toc.sub .nm{font-weight:500}.bk-toc.sub .pg{color:#59645b;font-weight:600}'+
'.bk-chap{color:#fff}.bk-chap .big{position:absolute;left:0;right:0;top:150px;text-align:center;font-size:150px;line-height:1}'+
'.bk-chap .ttl{position:absolute;left:36px;right:36px;top:360px;text-align:center;font-weight:800;font-size:46px;letter-spacing:-.02em;line-height:1.05}'+
'.bk-chap .cnt{position:absolute;left:36px;right:36px;top:430px;text-align:center;font-size:17px;opacity:.92}'+
'.bk-chap .lst{position:absolute;left:60px;right:60px;top:490px;text-align:center;font-size:14px;line-height:1.7;opacity:.92}'+
'.bk-chap .ring{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.18)}'+
'.bk-top{position:absolute;left:0;right:0;top:0;color:#fff;padding:0 28px}'+
'.bk-top.big{height:84px;padding-top:18px}.bk-top.small{height:46px;padding-top:12px}'+
'.bk-top .tt{font-weight:800;font-size:25px;letter-spacing:-.01em;line-height:1.05}.bk-top.small .tt{font-size:17px}'+
'.bk-top .ss{font-size:12px;opacity:.92;margin-top:3px}'+
'.bk-top .pp{position:absolute;right:28px;top:20px;font-size:11px;opacity:.9;font-weight:700}.bk-top.small .pp{top:15px}'+
'.bk-flow{position:absolute;left:28px;right:28px;top:58px;display:flex;flex-direction:column}'+
'.bk-ban{height:44px;border-radius:13px;color:#fff;padding:0 14px;display:flex;align-items:center;justify-content:space-between;margin:0 0 8px}.bk-ban.mt{margin-top:6px}'+
'.bk-ban b{font-size:17px;font-weight:800;letter-spacing:-.01em;line-height:1.05}.bk-ban small{display:block;font-size:10.5px;opacity:.92;font-weight:500;margin-top:1px}.bk-ban i{font-style:normal;font-size:11px;font-weight:700;opacity:.92;white-space:nowrap;margin-left:8px}'+
'.bk-grid{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:196px;gap:8px;margin:0 0 8px}'+
'.bk-card{background:#fff;border-radius:16px;border:1.5px solid #e3e8e1;overflow:hidden;position:relative;box-shadow:0 2px 8px rgba(30,40,30,.07);display:flex;flex-direction:column}'+
'.bk-pic{height:88px;flex:none;background-size:cover;background-position:center}'+
'.bk-emo{height:88px;flex:none;display:flex;align-items:center;justify-content:center;font-size:52px;line-height:1}'+
'.bk-body{padding:8px 11px 0;flex:1;min-height:0;overflow:hidden}'+
'.bk-en{font-weight:800;line-height:1.08;letter-spacing:-.01em}'+
'.bk-tr{font-size:12.5px;color:#59645b;margin-top:2px;line-height:1.18}'+
'.bk-pr{flex:none;margin:0 10px 9px;border-radius:10px;padding:4px 9px 5px;font-size:12.5px;font-weight:700;line-height:1.15}'+
'.bk-pr small{display:block;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;opacity:.75;margin-bottom:1px}'+
'.bk-list{display:flex;flex-direction:column;gap:9px;margin:0 0 9px}'+
'.bk-row{display:flex;gap:13px;align-items:center;background:#fff;border:1.5px solid #e3e8e1;border-radius:16px;padding:10px 14px;height:104px;box-shadow:0 2px 8px rgba(30,40,30,.07)}'+
'.bk-ico{flex:none;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px}'+
'.bk-row .tx{flex:1;min-width:0}.bk-row .en{font-weight:800;font-size:18px;line-height:1.12;letter-spacing:-.01em}'+
'.bk-row .tr{font-size:12.5px;color:#59645b;margin-top:2px;line-height:1.2}'+
'.bk-row .pr{display:inline-block;margin-top:5px;border-radius:9px;padding:3px 9px;font-size:12.5px;font-weight:700;line-height:1.2}'+
'.bk-idx{position:absolute;left:28px;right:28px;top:82px;height:634px;display:flex;gap:22px;font-size:11px}.bk-idx .col{flex:1;min-width:0;overflow:hidden}'+
'.bk-idx .col>div{display:flex;gap:6px;padding:2.6px 0;border-bottom:1px dotted #d8ddd6;break-inside:avoid}'+
'.bk-idx b{font-weight:700;color:#1d231e}.bk-idx span{color:#59645b;flex:1;white-space:nowrap;overflow:hidden}.bk-idx i{font-style:normal;font-weight:800;color:#0f0f9a}'+
'.bk-idx .col>.ltr{display:block;border:0;break-after:avoid;margin:6px 0 2px;font-weight:800;font-size:15px;color:#fff;background:#1414c8;border-radius:6px;padding:1px 8px;width:30px;text-align:center}'+
'.bk-line{height:34px;border-bottom:1.5px solid #dfe4dc}';

function parseData(txt){
  var a=txt.indexOf('var IMG='),b=txt.indexOf('};',a);
  if(a<0||b<0)throw new Error('Görsel verisi bulunamadı');
  var IMG=JSON.parse(txt.slice(a+8,b+1));
  var s0=txt.indexOf('var S=['),s1=txt.indexOf('\n];',s0);
  if(s0<0||s1<0)throw new Error('Kelime verisi bulunamadı');
  var S=(new Function('return '+txt.slice(s0+6,s1+2)))();
  return{IMG:IMG,S:S}
}

function cut(t,n){return t.length>n?t.slice(0,n-1)+'…':t}
function enSize(t){var n=t.length;return n>38?12.5:n>30?13.5:n>23?15:n>17?17.5:n>12?20:23}

function plan(S,IMG,cats){
  var pages=[],chapters=[];
  pages.push({t:'cover'});pages.push({t:'intro'});pages.push({t:'toc'});
  cats.forEach(function(ck){
    var cinfo=CATS.filter(function(c){return c[0]===ck})[0];
    var secs=S.filter(function(s){return s.cat===ck});if(!secs.length)return;
    var ch={cat:ck,name:cinfo[1],emoji:cinfo[2],color:secs[0].color,page:pages.length+1,secs:[],count:0};
    chapters.push(ch);pages.push({t:'chap',ch:ch,secs:secs});
    var AV=664,BAN=52,cur=null;
    function newPage(){cur={t:'sec',ch:ch,blocks:[],used:0};pages.push(cur)}
    secs.forEach(function(sec){
      var sohbet=ck==='sohbet',per=sohbet?1:2,rowH=sohbet?113:204,n=sec.items.length,idx=0,first=true;
      ch.count+=n;
      while(idx<n){
        if(!cur||cur.used+BAN+rowH>AV)newPage();
        if(first){ch.secs.push({title:sec.title,page:pages.length});first=false}
        cur.blocks.push({ban:sec,cont:idx>0,top:cur.blocks.length===0});cur.used+=BAN;
        var rows=[];
        while(idx<n&&cur.used+rowH<=AV){rows.push(sec.items.slice(idx,idx+per));idx+=per;cur.used+=rowH}
        cur.blocks.push({rows:rows,sec:sec,list:sohbet})
      }
    })
  });
  var entries=[];
  pages.forEach(function(p,i){if(p.t==='sec'&&p.ch.cat!=='sohbet')p.blocks.forEach(function(bl){if(bl.rows)bl.rows.forEach(function(r){r.forEach(function(it){entries.push({en:it[1],tr:it[0],pg:i+1})})})})});
  entries.sort(function(a,b){return a.en.toLowerCase().localeCompare(b.en.toLowerCase(),'en')});
  var EPP=54,dizinStart=pages.length+1,chunks=[];
  var withLetters=[],last='';entries.forEach(function(e){var L=e.en.charAt(0).toUpperCase();if(L!==last){withLetters.push({ltr:L});last=L}withLetters.push(e)});
  for(var i=0;i<withLetters.length;i+=EPP)chunks.push(withLetters.slice(i,i+EPP));
  chunks.forEach(function(c,i){pages.push({t:'dizin',rows:c,idx:i,tot:chunks.length})});
  var dz={name:'Dizin (İngilizce A–Z)',page:dizinStart};
  pages.push({t:'notes'});var notesPg=pages.length;pages.push({t:'back'});
  return{pages:pages,chapters:chapters,dizin:chunks.length?dz:null,notesPg:notesPg}
}

function foot(n){return'<div class="bk-foot"><span><b>Kanaat Lokantası</b> · Pratik Lokanta İngilizcesi<br>Sayfa <b>'+n+'</b></span><span class="bk-qr"><span><b>Okut ve çalış</b>Sesli dinle, kelimeyi tekrarla</span><i style="background-image:url('+QR+')"></i></span></div>'}

function imgKey(it,IMG){var k=it[5]||(it[4]==='noimg'?'':it[0]);return k&&IMG[k]?k:''}
function cardHTML(it,IMG,color){
  var hasImg=imgKey(it,IMG);
  var top=hasImg?'<div class="bk-pic" style="background-image:url('+IMG[hasImg]+')"></div>':'<div class="bk-emo" style="background:'+rgba(color,.12)+'">'+esc(it[3]||'🍽️')+'</div>';
  return'<div class="bk-card">'+top+'<div class="bk-body"><div class="bk-en" style="font-size:'+enSize(it[1])+'px;color:'+color+'">'+esc(it[1])+'</div><div class="bk-tr">'+esc(it[0])+'</div></div>'+
    '<div class="bk-pr" style="background:'+rgba(color,.11)+';color:'+color+'"><small>Okunuşu</small>'+esc(it[2])+'</div></div>'
}
function rowHTML(it,color){
  return'<div class="bk-row"><div class="bk-ico" style="background:'+rgba(color,.13)+'">'+esc(it[3]||'💬')+'</div><div class="tx"><div class="en" style="color:'+color+'">'+esc(it[1])+'</div><div class="tr">'+esc(it[0])+'</div><span class="pr" style="background:'+rgba(color,.11)+';color:'+color+'">'+esc(it[2])+'</span></div></div>'
}

function pageHTML(p,n,pl,S,IMG,dateStr){
  var i,h='';
  if(p.t==='cover'){
    var pics=[];S.forEach(function(s){s.items.forEach(function(it){if(imgKey(it,IMG))pics.push(IMG[imgKey(it,IMG)])})});
    var pick=[];for(i=0;i<6&&pics.length;i++)pick.push(pics[Math.floor(i*pics.length/6)]);
    var pos=[[0,10,-5],[160,0,4],[320,16,-3],[14,170,3],[170,184,-4],[322,168,5]];
    var tiles=pick.map(function(u,k){return'<div class="bk-tile" style="left:'+pos[k][0]+'px;top:'+pos[k][1]+'px;transform:rotate('+pos[k][2]+'deg);background-image:url('+u+')"></div>'}).join('');
    return'<div class="bk-page bk-cover"><div class="ring" style="width:420px;height:420px;right:-150px;top:-120px"></div><div class="ring" style="width:260px;height:260px;left:-90px;bottom:120px"></div>'+
      '<div class="bk-kicker">Kanaat Lokantası</div><div class="bk-title">Pratik Lokanta İngilizcesi</div>'+
      '<div class="bk-sub">Mutfak ve servis ekibi için resimli kelime ve cümle rehberi</div><div class="bk-tiles">'+tiles+'</div>'+
      '<div class="bk-coverfoot"><div><b>Dinleyerek öğrenin</b>'+SITE+'</div><div style="text-align:right;opacity:.85">'+dateStr+'</div></div></div>'
  }
  if(p.t==='intro'){
    return'<div class="bk-page"><div class="bk-pad"><div class="bk-h1" style="color:#1414c8">Bu kitabı nasıl<br>kullanırsınız?</div>'+
      '<p style="margin:12px 0 22px;font-size:14px;color:#59645b;line-height:1.45">Her kartta bir kelime ya da cümle var. Önce resme bakın, sonra İngilizcesini ve okunuşunu yüksek sesle tekrar edin.</p>'+
      '<div class="bk-step"><div class="bk-num">1</div><p><b>Türkçesi</b> kartın altında küçük harflerle yazılıdır.</p></div>'+
      '<div class="bk-step"><div class="bk-num">2</div><p><b>İngilizcesi</b> renkli ve büyük yazılıdır. Müşteriye bunu söylersiniz.</p></div>'+
      '<div class="bk-step"><div class="bk-num">3</div><p><b>Okunuşu</b> Türkçe harflerle yazılmıştır. Yazıldığı gibi okuyun, tam doğru telaffuz için uygulamadaki Dinle düğmesine basın.</p></div>'+
      '<div style="margin:20px 0 0;display:flex;justify-content:center"><div style="width:240px">'+cardHTML(['Havuç','carrot','kerit','🥕','noimg'],{},'#a4470f')+'</div></div>'+
      '<style>.bk-intro-ex{}</style>'+
      '<div style="margin-top:20px;border-radius:14px;background:#eef1ff;padding:13px 16px;font-size:13px;line-height:1.5;color:#2b332d"><b style="color:#1414c8">İpucu:</b> Günde sadece 5 kelime çalışın. Bir ay sonunda 150 kelime bilirsiniz. Müşteriyle konuşurken yavaş ve net konuşun, gülümsemek yarı yarıya yardım eder.</div>'+
      '<div style="margin-top:14px;font-size:12px;color:#59645b;text-align:center">Sesli dinlemek için: <b style="color:#1414c8">'+SITE+'</b></div>'+
      '</div>'+foot(n)+'</div>'
  }
  if(p.t==='toc'){
    var rows='';
    pl.chapters.forEach(function(c){
      rows+='<div class="bk-toc"><span class="dot" style="background:'+c.color+'"></span><span class="nm">'+c.emoji+' '+esc(c.name)+'</span><span class="pg">'+c.page+'</span></div>';
      c.secs.forEach(function(s){rows+='<div class="bk-toc sub"><span class="nm">'+esc(s.title)+'</span><span class="pg">'+s.page+'</span></div>'})
    });
    if(pl.dizin)rows+='<div class="bk-toc"><span class="dot" style="background:#1414c8"></span><span class="nm">🔎 '+pl.dizin.name+'</span><span class="pg">'+pl.dizin.page+'</span></div>';
    rows+='<div class="bk-toc"><span class="dot" style="background:#8a948b"></span><span class="nm">✏️ Notlarım</span><span class="pg">'+pl.notesPg+'</span></div>';
    return'<div class="bk-page"><div class="bk-pad"><div class="bk-h1" style="color:#1414c8;margin-bottom:12px">İçindekiler</div>'+rows+'</div>'+foot(n)+'</div>'
  }
  if(p.t==='chap'){
    var c=p.ch,lst=p.secs.map(function(s){return esc(s.title)}).join(' · ');
    return'<div class="bk-page bk-chap" style="background:linear-gradient(165deg,'+c.color+',#101010 160%)"><div class="ring" style="width:480px;height:480px;left:-160px;top:-170px"></div><div class="ring" style="width:300px;height:300px;right:-110px;bottom:-60px"></div>'+
      '<div class="big">'+c.emoji+'</div><div class="ttl">'+esc(c.name)+'</div><div class="cnt">'+c.count+(c.cat==='sohbet'?' cümle':' kelime')+'</div><div class="lst">'+lst+'</div></div>'
  }
  if(p.t==='sec'){
    var cc=p.ch.color,flow='';
    p.blocks.forEach(function(bl){
      if(bl.ban){var sc=bl.ban.color;flow+='<div class="bk-ban'+(bl.top?'':' mt')+'" style="background:linear-gradient(100deg,'+sc+','+rgba(sc,.8)+')"><div><b>'+esc(bl.ban.title)+(bl.cont?' <span style="font-weight:600;font-size:12px;opacity:.9">(devam)</span>':'')+'</b>'+(bl.cont?'':'<small>'+esc(bl.ban.sub||'')+'</small>')+'</div><i>'+bl.ban.items.length+(p.ch.cat==='sohbet'?' cümle':' kelime')+'</i></div>'}
      else if(bl.list){flow+='<div class="bk-list">'+bl.rows.map(function(r){return rowHTML(r[0],bl.sec.color)}).join('')+'</div>'}
      else{flow+='<div class="bk-grid">'+bl.rows.map(function(r){return r.map(function(it){return cardHTML(it,IMG,bl.sec.color)}).join('')}).join('')+'</div>'}
    });
    return'<div class="bk-page"><div class="bk-top small" style="background:'+cc+'"><div class="tt">'+p.ch.emoji+' '+esc(p.ch.name)+'</div></div><div class="bk-flow">'+flow+'</div>'+foot(n)+'</div>'
  }
  if(p.t==='dizin'){
    function rr(list){return list.map(function(e){return e.ltr?'<div class="ltr">'+esc(e.ltr)+'</div>':'<div><b>'+esc(cut(e.en,30))+'</b><span>'+esc(cut(e.tr,Math.max(6,33-Math.min(e.en.length,30))))+'</span><i>'+e.pg+'</i></div>'}).join('')}
    var half=Math.ceil(p.rows.length/2),r='<div class="col">'+rr(p.rows.slice(0,half))+'</div><div class="col">'+rr(p.rows.slice(half))+'</div>';
    return'<div class="bk-page"><div class="bk-pad"><div class="bk-h1" style="color:#1414c8">Dizin <span style="font-size:14px;color:#8a948b;font-weight:600">İngilizce A–Z'+(p.tot>1?' · '+(p.idx+1)+'/'+p.tot:'')+'</span></div></div><div class="bk-idx">'+r+'</div>'+foot(n)+'</div>'
  }
  if(p.t==='notes'){
    var ln='';for(i=0;i<17;i++)ln+='<div class="bk-line"></div>';
    return'<div class="bk-page"><div class="bk-pad"><div class="bk-h1" style="color:#1414c8">Notlarım</div><p style="margin:6px 0 14px;font-size:13px;color:#59645b">Öğrendiğiniz yeni kelimeleri ve müşterilerden duyduklarınızı buraya yazın.</p>'+ln+'</div>'+foot(n)+'</div>'
  }
  if(p.t==='back'){
    return'<div class="bk-page bk-cover"><div class="ring" style="width:420px;height:420px;left:-140px;top:-100px"></div><div class="ring" style="width:300px;height:300px;right:-100px;bottom:-80px"></div>'+
      '<div style="position:absolute;left:0;right:0;top:250px;text-align:center;font-size:90px">🍽️</div>'+
      '<div style="position:absolute;left:30px;right:30px;top:380px;text-align:center;font-weight:800;font-size:40px;letter-spacing:-.02em;line-height:1.1">Enjoy your meal!</div>'+
      '<div style="position:absolute;left:30px;right:30px;top:440px;text-align:center;font-size:16px;opacity:.9">Afiyet olsun!</div>'+
      '<div style="position:absolute;left:30px;right:30px;bottom:44px;text-align:center;font-size:13px;opacity:.85"><b style="font-size:17px;display:block;margin-bottom:3px">Kanaat Lokantası</b>Selmanipak Caddesi No:9 · Üsküdar · İstanbul</div></div>'
  }
  return''
}

async function generate(opts){
  opts=opts||{};
  var prog=opts.onProgress||function(){},cats=opts.cats||CATS.map(function(c){return c[0]});
  function chk(){if(opts.signal&&opts.signal.aborted)throw new Error('İptal edildi')}
  prog(0,'Kitap verisi okunuyor…');
  var base=opts.base||'index.html';
  var resp=await fetch(base+(base.indexOf('?')<0?'?':'&')+'t='+Date.now(),{cache:'no-store'});
  if(!resp.ok)throw new Error('index.html okunamadı ('+resp.status+')');
  var data=parseData(await resp.text());chk();
  prog(0.02,'Çizim kütüphaneleri yükleniyor…');
  if(!window.html2canvas)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  if(!(window.jspdf&&window.jspdf.jsPDF))await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  chk();
  try{if(document.fonts&&document.fonts.load){await Promise.race([document.fonts.load('800 24px "Bricolage Grotesque"'),new Promise(function(r){setTimeout(r,4000)})])}}catch(e){}
  var pl=plan(data.S,data.IMG,cats),pages=pl.pages;
  var d=new Date(),dateStr=d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear();
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  var box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;width:'+W+'px;height:'+H+'px;z-index:-9999;pointer-events:none';document.body.appendChild(box);
  var thumbs=[],imgs=[];
  var pdf=new window.jspdf.jsPDF({unit:'mm',format:'a5',orientation:'portrait',compress:true});
  try{
    for(var i=0;i<pages.length;i++){
      chk();
      box.innerHTML=pageHTML(pages[i],i+1,pl,data.S,data.IMG,dateStr);
      var el=box.firstChild;
      await tick();
      var cv=await window.html2canvas(el,{scale:PX,backgroundColor:'#ffffff',logging:false,width:W,height:H,windowWidth:W,windowHeight:H,scrollX:0,scrollY:0});
      var jpg=cv.toDataURL('image/jpeg',0.82);var tc=document.createElement('canvas');tc.width=200;tc.height=Math.round(200*H/W);tc.getContext('2d').drawImage(cv,0,0,tc.width,tc.height);thumbs.push(tc.toDataURL('image/jpeg',0.6));imgs.push(jpg);cv.width=cv.height=0;
      if(i>0)pdf.addPage('a5','portrait');
      pdf.addImage(jpg,'JPEG',0,0,148,210,undefined,'FAST');
      prog((i+1)/pages.length,'Sayfa '+(i+1)+' / '+pages.length);
      await tick()
    }
    box.innerHTML='';
    var blob=pdf.output('blob');
    return{blob:blob,pages:pages.length,thumbs:thumbs,images:imgs}
  }finally{box.remove();st.remove()}
}
window.KITAP={generate:generate,CATS:CATS,_plan:plan,_parse:parseData,_css:CSS,_pageHTML:pageHTML,_months:MONTHS};
})();
