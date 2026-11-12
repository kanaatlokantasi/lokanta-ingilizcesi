// Günün 5 kelimesi: her 2 günde bir İstanbul saatiyle 14:00'te çalışır.
const admin = require('firebase-admin');
const words = require('./kelimeler.json');
const sa = JSON.parse(process.env.FIREBASE_SA);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const day = Math.floor(Date.now() / 864e5);
const manual = process.env.GITHUB_EVENT_NAME !== 'schedule';
if (!manual && day % 2 !== 0) { console.log('Bugün sıra değil.'); process.exit(0); }

const n = Math.floor(day / 2);
const pick = [];
for (let i = 0; i < 5; i++) pick.push(words[(n * 5 + i) % words.length]);
const MSG = [
  ['🔔 Ding! Sipariş hazır', 'Siparişiniz: 5 taze kelime. Soğumadan tüketin 😄'],
  ['🔔 Servis zili çaldı!', 'Garson geliyor, tepside 5 kelime var 🍽️'],
  ['🔔 Ding ding! Mutfaktan sıcak sıcak', '5 yeni kelime çıktı, hemen servis!'],
  ['🔔 Masa 5: kelime siparişiniz hazır', 'Afiyet olsun, bu sefer yemek değil kelime 😉'],
  ['🔔 Şef sesleniyor!', 'Bugünün 5 kelimesini ezberleyen bahşiş alır (belki) 😄'],
];
const [title, joke] = MSG[n % MSG.length];
const body = joke + '\n' + pick.map(w => '• ' + w[0] + ' = ' + w[1]).join('\n');

(async () => {
  const snap = await db.collection('students').where('status', '==', 'active').get();
  const targets = [];
  snap.forEach(d => { const t = d.get('fcm'); if (t) targets.push({ id: d.id, token: t }); });
  console.log('Hedef cihaz:', targets.length, '|', title, '|', pick.map(w => w[1]).join(', '));
  for (let i = 0; i < targets.length; i += 500) {
    const chunk = targets.slice(i, i + 500);
    const res = await admin.messaging().sendEach(chunk.map(x => ({
      token: x.token,
      data: { title, body, url: './', did: x.id },
      webpush: { headers: { Urgency: 'normal', TTL: '43200' } },
    })));
    for (let k = 0; k < res.responses.length; k++) {
      const r = res.responses[k];
      if (!r.success) {
        const c = r.error && r.error.code;
        console.log('Hata:', chunk[k].id, c, r.error && r.error.message);
        if (c === 'messaging/registration-token-not-registered' || c === 'messaging/invalid-registration-token')
          await db.collection('students').doc(chunk[k].id).update({ fcm: admin.firestore.FieldValue.delete() });
      }
    }
    console.log('Gönderildi:', res.successCount, 'Başarısız:', res.failureCount);
  }
})().catch(e => { console.error(e); process.exit(1); });
