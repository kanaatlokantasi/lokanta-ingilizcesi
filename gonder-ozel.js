// Doğum günü ve bayram bildirimleri: her gün İstanbul saatiyle 15:00'te çalışır.
// Yalnızca o gün bir doğum günü ya da bayram varsa bildirim gider.

// Resmî bayramlar (her yıl aynı gün) – anahtar: 'AA-GG'
const RESMI = {
  '04-23': ['🇹🇷 23 Nisan kutlu olsun!', '🎈 Ulusal Egemenlik ve Çocuk Bayramımız kutlu olsun! 🎉'],
  '05-01': ['🌷 1 Mayıs kutlu olsun!', '💪 Emek ve Dayanışma Günümüz kutlu olsun! 🤝'],
  '05-19': ['🇹🇷 19 Mayıs kutlu olsun!', '⚽ Atatürk\'ü Anma, Gençlik ve Spor Bayramımız kutlu olsun! 🏃'],
  '08-30': ['🇹🇷 30 Ağustos kutlu olsun!', '🎖️ Zafer Bayramımız kutlu olsun! 🎉'],
  '10-29': ['🇹🇷 Cumhuriyet Bayramımız kutlu olsun!', '🎉 29 Ekim\'de Cumhuriyetimizin kuruluşunu birlikte kutluyoruz! 🌟'],
};
// Dinî bayramların 1. günü – anahtar: 'YYYY-AA-GG' (Diyanet takvimi / 2028 sonrası astronomik hesap; her yıl kontrol edilmeli)
const RAMAZAN = ['2027-03-09', '2028-02-27', '2029-02-15', '2030-02-05', '2031-01-25'];
const KURBAN = ['2027-05-16', '2028-05-05', '2029-04-24', '2030-04-14', '2031-04-03'];
const DINI = {};
RAMAZAN.forEach(d => DINI[d] = ['🌙 Ramazan Bayramınız mübarek olsun!', '🍬 Sevdiklerinizle sağlık, huzur ve mutlulukla nice bayramlara 🤲']);
KURBAN.forEach(d => DINI[d] = ['🐑 Kurban Bayramınız mübarek olsun!', '🌙 Hayırlara vesile olsun, sevdiklerinizle nice bayramlara 🤲']);

const norm = s => String(s || '').toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim();
const titleTR = s => String(s || '').trim().split(/\s+/).map(w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1).toLocaleLowerCase('tr')).join(' ');
const firstName = s => titleTR(s).split(' ')[0];
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function istanbulToday(now) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(now || new Date()).reduce((o, x) => (o[x.type] = x.value, o), {});
  return { y: +p.year, m: p.month, d: p.day };
}

// bd 'YYYY-AA-GG'; 29 Şubat doğumlular artık olmayan yıllarda 28 Şubat'ta kutlanır
function isBirthday(bd, t) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bd || '')) return false;
  const md = bd.slice(5);
  if (md === t.m + '-' + t.d) return true;
  return md === '02-29' && !isLeap(t.y) && t.m === '02' && t.d === '28';
}

function plan(today, students) {
  // students: [{id, name, token, bd}] – yalnızca aktif ve bildirim izni olanlar
  const out = [];
  const key = today.m + '-' + today.d;
  const hol = RESMI[key] || DINI[today.y + '-' + key];
  if (hol) out.push({ tokens: students.map(s => s.token), title: hol[0], body: hol[1], tag: 'ozel-bayram' });

  const bdays = students.filter(s => isBirthday(s.bd, today));
  const seen = new Set();
  bdays.forEach(b => {
    const nm = norm(b.name);
    if (seen.has(nm)) return;
    seen.add(nm);
    const age = today.y - +b.bd.slice(0, 4);
    const ageTxt = age > 0 && age < 100 ? age : null;
    const same = students.filter(s => norm(s.name) === nm);
    const sameIds = new Set(same.map(s => s.id));
    out.push({
      tokens: same.map(s => s.token),
      title: '🎂 Doğum günün kutlu olsun ' + firstName(b.name) + '! 🎉',
      body: (ageTxt ? ageTxt + ' yaşına girdin! ' : '') + 'Kanaat ailesi seninle, nice mutlu yıllara 🥳🎁',
      tag: 'ozel-dogum-' + nm,
    });
    out.push({
      tokens: students.filter(s => !sameIds.has(s.id)).map(s => s.token),
      title: '🎈 Bugün doğum günü: ' + titleTR(b.name) + '!',
      body: (ageTxt ? ageTxt + ' yaşına giriyor 🎂 ' : '🎂 ') + 'Kutladın mı? Bir tebrik herkesi mutlu eder 🎁😊',
      tag: 'ozel-dogum-' + nm,
    });
  });
  return out.filter(m => m.tokens.length);
}

module.exports = { plan, isBirthday, istanbulToday, DINI, RESMI };

if (require.main === module) {
  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SA)) });
  const db = admin.firestore();
  const today = process.env.TEST_DATE
    ? { y: +process.env.TEST_DATE.slice(0, 4), m: process.env.TEST_DATE.slice(5, 7), d: process.env.TEST_DATE.slice(8, 10) }
    : istanbulToday();
  (async () => {
    const snap = await db.collection('students').where('status', '==', 'active').get();
    const students = [];
    const idOf = {};
    snap.forEach(d => { const t = d.get('fcm'); if (t) { students.push({ id: d.id, name: d.get('name'), token: t, bd: d.get('bd') }); idOf[t] = d.id; } });
    console.log('Tarih:', today.y + '-' + today.m + '-' + today.d, '| bildirimli cihaz:', students.length);
    const msgs = plan(today, students);
    if (!msgs.length) { console.log('Bugün doğum günü ya da bayram yok.'); return; }
    for (const m of msgs) {
      console.log('Gönderiliyor:', m.title, '→', m.tokens.length, 'cihaz');
      if (process.env.DRY_RUN) continue;
      for (let i = 0; i < m.tokens.length; i += 500) {
        const chunk = m.tokens.slice(i, i + 500);
        const res = await admin.messaging().sendEachForMulticast({
          tokens: chunk,
          data: { title: m.title, body: m.body, url: './', tag: m.tag },
          webpush: { headers: { Urgency: 'normal', TTL: '43200' } },
        });
        for (let k = 0; k < res.responses.length; k++) {
          const r = res.responses[k];
          if (!r.success) {
            const c = r.error && r.error.code;
            console.log('Hata:', idOf[chunk[k]], c);
            if (c === 'messaging/registration-token-not-registered' || c === 'messaging/invalid-registration-token')
              await db.collection('students').doc(idOf[chunk[k]]).update({ fcm: admin.firestore.FieldValue.delete() });
          }
        }
        console.log('Gönderildi:', res.successCount, 'Başarısız:', res.failureCount);
      }
    }
  })().catch(e => { console.error(e); process.exit(1); });
}
