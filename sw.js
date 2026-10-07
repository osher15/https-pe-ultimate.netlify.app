/* ============================================================
   Service Worker — PE Ultimate
   ------------------------------------------------------------
   המורה עומד במגרש בלי קליטה. השירות הזה שומר את קליפת האפליקציה
   במטמון ומגיש אותה מהמכשיר, כך שפתיחה שנייה עובדת גם בלי רשת.

   הנתונים עצמם אינם עוברים כאן בכלל — הם ב-localStorage, מקומיים
   לדפדפן. השירות נוגע רק בקבצים הסטטיים של האפליקציה.

   CACHE_VERSION נחתם בזמן הבנייה לפי תוכן הקבצים, ולכן פריסה חדשה
   יוצרת מטמון חדש והישן נמחק — במקום שגרסה ישנה תישאר תקועה על
   מכשיר בלי שאיש יידע.
   ============================================================ */
const CACHE_VERSION = "6849a354";
const CACHE = "peultimate-" + CACHE_VERSION;

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./hm-styles.css?v=0be388c5",
  "./hm-fonts.css?v=a70ca9ac",
  "./fonts/heebo-hebrew-wght-normal.woff2",
  "./fonts/heebo-latin-wght-normal.woff2",
  "./fonts/heebo-latin-ext-wght-normal.woff2",
  "./fonts/inter-latin-wght-normal.woff2",
  "./fonts/inter-latin-ext-wght-normal.woff2",
  "./fonts/inter-cyrillic-wght-normal.woff2",
  "./fonts/inter-cyrillic-ext-wght-normal.woff2",
  "./fonts/share-tech-mono-latin-400-normal.woff2",
  "./hm-brand.js?v=4f30e0e9",
  "./hm-native.js?v=6c53d8bd",
  "./hm-backup-restore.js?v=f1a05be7",
  "./hm-data.js?v=54ec4254",
  "./hm-assessment-data.js?v=016c9c1c",
  "./hm-terms.js?v=0a0c7bd8",
  "./hm-texts.js?v=196145d3",
  "./hm-i18n.js?v=091fc26f",
  "./hm-app.js?v=2509b58b",
  "./hm-qr.js?v=82eb96ad",
  "./hm-howto.js?v=cc1c5bf0",
  "./hm-know.js?v=f7d05713",
  "./hm-tools.js?v=0baf385d",
  "./hm-plans.js?v=20cf74cb",
  "./hm-lessonbank.js?v=b28c19df",
  "./hm-lessonbank-basketball.js?v=0edb16e1",
  "./hm-lessonbank-football.js?v=fe744a2c",
  "./hm-lessonbank-handball.js?v=d8650cc8",
  "./hm-lessonbank-volleyball.js?v=1bf7154c",
  "./hm-lessonbank-athletics.js?v=591f101a",
  "./hm-lessonbank-fitness.js?v=25d01c77",
  "./hm-lesson.js?v=c2af9426",
  "./hm-build.js?v=908876ec",
  "./hm-tests.js?v=03154066",
  "./hm-new.js?v=0f791e96",
  "./hm-assessment.js?v=5fad1d30",
  "./hm-xlsx.js?v=3199b8b7",
  "./hm-assessment-report.js?v=394a2bae",
  "./hm-assessment-student-report.js?v=79f38133",
  "./hm-assessment-paste.js?v=d23810e0",
  "./hm-assessment-grid.js?v=e1b3a456",
  "./hm-live.js?v=c4f246ca",
  "./hm-hub.js?v=1e6ba46b"
];

self.addEventListener("install", e => {
  /* addAll נכשל כולו אם קובץ אחד נופל; כאן עדיף מטמון חלקי על פני
     התקנה שנכשלת ומשאירה את המשתמש בלי שום מטמון. */
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    /* cache:"reload" — בלעדיו ההתקנה עצמה יכולה לשאוב את הקבצים
       ממטמון ה-HTTP של הדפדפן, כלומר להתקין גרסה חדשה שמכילה
       קבצים ישנים. מטמון חדש שנולד ישן הוא הגרוע משני העולמות. */
    await Promise.all(SHELL.map(u =>
      c.add(new Request(u, { cache: "reload" })).catch(() => c.add(u).catch(() => {}))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    /* מטמון הגופנים נושא את שם הגרסה כדי שיימחק יחד איתה, אבל
       הגופנים עצמם לא משתנים בין פריסות — לכן שומרים אותו. */
    await Promise.all(keys.filter(k => k.startsWith("peultimate-") &&
                                       k !== CACHE && k !== CACHE + "-fonts" &&
                                       !k.endsWith("-fonts"))
                          .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  if (e.data === "skipWaiting") return self.skipWaiting();
  /* הדף שואל «איזו גרסה אתה». בלי התשובה הזאת הוא לא יכול לדעת אם
     יש באמת מה לרענן, והציע רענון גם כשהגרסה שהוא כבר מציג היא
     החדשה — פס שאי אפשר להיפטר ממנו. */
  if (e.data === "version" && e.ports && e.ports[0]) e.ports[0].postMessage(CACHE_VERSION);
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* גופני Google: cache-first לתמיד. אחרי טעינה מקוונת אחת הם זמינים
     גם בלי רשת, במקום שהאפליקציה תיפול לגופן מערכת דווקא במגרש.
     התשובות מ-gstatic הן opaque — אי אפשר לבדוק אותן, ולכן שומרים
     רק כשהבקשה הצליחה בכלל. */
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith((async () => {
      const c = await caches.open(CACHE + "-fonts");
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res) c.put(req, res.clone());
        return res;
      } catch (err) {
        return new Response("", { status: 504 });
      }
    })());
    return;
  }
  if (url.origin !== self.location.origin) return;   /* כל השאר — לדפדפן */

  /* ניווט: קודם רשת (כדי לקבל פריסה חדשה), ובלי רשת — הדף מהמטמון.
     כך עדכון מגיע מיד כשיש קליטה, ובלעדיה האפליקציה עדיין נפתחת. */
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        /* עוקפים את מטמון ה-HTTP במפורש. «קודם רשת» שמקבל תשובה
           ישנה מהמטמון הוא «קודם מטמון» בתחפושת — ומורה שלוחץ
           «רענן עכשיו» מקבל בדיוק את אותו דף, שוב ושוב. */
        const net = await fetch(req.url, { cache: "reload", credentials: "same-origin" });
        const c = await caches.open(CACHE);
        c.put("./index.html", net.clone());
        return net;
      } catch (err) {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  /* קובץ עם חותמת תוכן (hm-*.js?v=XXXXXXXX): הכתובת היא הגרסה, ולכן
     הוא בלתי משתנה. קודם מטמון, בלי רענון ברקע — והרשת נשמרת במטמון
     רק אם ה-SHA-1 של מה שהגיע תואם לחותמת. השרת הסטטי מתעלם מ-?v=,
     כך שבלי הבדיקה הזאת תוכן של פריסה חדשה נשמר תחת כתובת ישנה, ודף
     ישן שנפתח בלי רשת קיבל תערובת של קבצים משתי גרסאות. */
  const V = url.searchParams.get("v");
  if (V && /^[0-9a-f]{8}$/.test(V) && /\/hm-[\w-]+\.(?:js|css)$/.test(url.pathname)) {
    /* גם ברענון קשה (reload / no-store) — קודם רשת, אבל אותה בדיקה לפני שמירה */
    const bypass = req.cache === "reload" || req.cache === "no-store" || req.cache === "no-cache";
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached && !bypass) return cached;
      try {
        const res = await fetch(req, { cache: "no-store" });
        if (res && res.ok && await sameVersion(res.clone(), V))
          (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (err) {
        return cached || Response.error();
      }
    })());
    return;
  }

  /* בקשה שביקשה במפורש לעקוף מטמון (reload / no-store / no-cache)
     מקבלת רשת. אחרת «רענון קשה» אינו רענון — הוא מחזיר את אותו
     קובץ מהמטמון שביקשנו לדלג עליו. */
  if (req.cache === "reload" || req.cache === "no-store" || req.cache === "no-cache") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (err) {
        return (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  /* נכסים: קודם מטמון (מיידי), ורענון ברקע לפעם הבאה. */
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: false });
    const net = fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }).catch(() => null);
    return cached || (await net) || Response.error();
  })());
});

async function sameVersion(res, v) {
  try {
    const d = await crypto.subtle.digest("SHA-1", await res.arrayBuffer());
    return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 8) === v;
  } catch (err) {
    return false;
  }
}
