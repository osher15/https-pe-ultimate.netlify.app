#!/usr/bin/env node
/* Interval Trainer — data extractor (store build, task C9).
 *
 * Reads the PE Ultimate fitness trainer module (`FIT` in hm-app.js, "מודול 4") and the app's
 * own translation dictionaries (hm-terms.js + hm-texts.js, window.I18N_TERMS: Hebrew key ->
 * [en, ar, ru, es]) READ-ONLY, and rewrites the data block of interval-trainer.html between
 * the markers DATA-START / DATA-END. Nothing in the app is modified.
 *
 *   node store-content/tools/interval-trainer/tools/extract-app-data.cjs          # rewrite block
 *   node store-content/tools/interval-trainer/tools/extract-app-data.cjs --check  # exit 1 if stale
 *
 * Column order in the output is LANGS = [en, he, ar, ru, es] (Hebrew is the app's source text).
 * Every string is tagged by provenance:
 *   app     — taken verbatim from the app dictionary (or the app's unit table);
 *   changed — app translation exists but was replaced here (AI-translated, listed in README);
 *   new     — not in the app; written for this product (AI-translated, listed in README).
 * The Node check `checks/data.test.cjs` re-derives every "app" string and fails on drift.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");

const HERE = __dirname;
const TOOL = path.resolve(HERE, "..");
const ROOT = path.resolve(TOOL, "..", "..", "..");
const HTML = path.join(TOOL, "interval-trainer.html");
const VERSION = "1.0.0";

/* ---------- load the app (read-only) ---------- */
function loadTerms(root) {
  const ctx = { window: {} }; vm.createContext(ctx);
  for (const f of ["hm-terms.js", "hm-texts.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
  return ctx.window.I18N_TERMS;
}
function sliceFit(root) {
  const app = fs.readFileSync(path.join(root, "hm-app.js"), "utf8");
  const a = app.indexOf("const FIT=(function(){");
  if (a < 0) throw new Error("FIT module not found in hm-app.js");
  const b = app.indexOf("})();", a);
  return app.slice(a, b);
}
/* Evaluates one literal (array/object) that follows `marker` inside the FIT module. */
function literalAfter(src, marker) {
  const s = src.indexOf(marker); if (s < 0) throw new Error("marker not found: " + marker);
  const open = s + marker.length - 1, ch = src[open], close = ch === "[" ? "]" : "}";
  let depth = 0, i = open, q = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if (c === ch) depth++; else if (c === close && --depth === 0) break;
  }
  return vm.runInNewContext("(" + src.slice(open, i + 1) + ")", {});
}
/* buildPhases straight from the app, for cross-checks. */
function appBuildPhases(src) {
  const s = src.indexOf("function buildPhases("), e = src.indexOf("\n  }\n", s) + 4;
  return vm.runInNewContext("(" + src.slice(s, e) + ")", {});
}

/* ---------- the app's lookup, reduced to what FIT needs ---------- */
const UNITS = { "מ׳": ["m", "م", "м", "m"], "שנ׳": ["s", "ث", "с", "s"] }; /* = hm-i18n.js UNITS */
function splitTerm(s) {
  const m = /^([^\p{L}\p{N}_«"(]*)([\s\S]*?)([\s:·…←→⇩⇧▾▸]*)$/u.exec(s);
  return m ? [m[1], m[2].replace(/[‎‏]/g, "").replace(/\s+/g, " ").trim(), m[3]] : ["", s, ""];
}
function lookup(T, s) {
  if (T[s]) return T[s];
  const [pre, c, post] = splitTerm(s);
  if (T[c]) return T[c].map(x => pre + x + post); /* the app re-attaches emoji/ellipsis around a term */
  const m = /^([\d.,:±–\-‎ ]*\d)\s*(\S+)$/.exec(c);
  if (m && UNITS[m[2]]) return UNITS[m[2]].map(u => m[1] + " " + u);
  if (c.includes(" · ")) {
    const parts = c.split(" · ").map(p => lookup(T, p));
    if (parts.every(Boolean)) return [0, 1, 2, 3].map(i => parts.map(p => p[i]).join(" · "));
  }
  return null;
}
const HEB = /[֐-׿]/;
/* app row [en,ar,ru,es] + Hebrew -> [en,he,ar,ru,es]; strings with no Hebrew (e.g. "Dead bug")
   are shown unchanged in every language, exactly as the app does. */
function fromApp(T, he) {
  if (!HEB.test(he)) return [he, he, he, he, he];
  const r = lookup(T, he);
  if (!r) throw new Error("no app translation for: " + he);
  return [r[0], he, r[1], r[2], r[3]];
}

/* ---------- UI strings that reuse the app's Hebrew source ---------- */
const UI_FROM_APP = {
  "tab.timer": "טיימר אינטרוולים", "tab.circuit": "תחנות לכיתה", "tab.lib": "ספריית תרגילים", "tab.dice": "קוביית הכושר",
  "t.presets": "תבניות מהירות", "t.work": "עבודה (שנ׳)", "t.rest": "מנוחה (שנ׳)", "t.rounds": "סבבים", "t.sets": "סטים",
  "t.setRest": "מנוחה בין סטים", "t.ready": "מוכנים?", "t.pressStart": "לחץ ▶ כדי להתחיל", "t.start": "התחל אימון",
  "ph.prep": "מתכוננים…", "ph.rest": "מנוחה", "ph.setRest": "מנוחה בין סטים", "ph.workRound": "עבודה · סבב {0}/{1}",
  "ph.set": "סט {0}", "t.next": "הבא: {0}", "t.last": "שלב אחרון!", "t.done": "סיימתם!", "t.stopped": "הופסק",
  "say.done": "כל הכבוד! סיימתם את האימון", "say.prep": "מתכוננים", "say.work": "עבודה!", "say.rest": "מנוחה",
  "pre.tabata": "טבאטה", "pre.hiit": "HIIT כיתתי", "pre.emom": "EMOM 10", "pre.strength": "כוח 3 סטים", "pre.quick": "זריז",
  "c.title": "מחולל אימון תחנות", "c.focus": "מיקוד", "grp.mix": "משולב", "grp.strength": "כוח", "grp.cardio": "אירובי",
  "grp.core": "ליבה", "grp.mobility": "ניידות", "c.stations": "תחנות", "c.time": "זמן בתחנה (שנ׳)", "c.change": "מעבר (שנ׳)",
  "c.gen": "הגרל תחנות", "c.plan": "מערך התחנות", "c.ready": "מוכנים בתחנות?", "c.start": "הפעל סבב תחנות",
  "c.changeNow": "מעבר תחנות!", "c.last": "תחנה אחרונה!", "c.done": "הסבב הושלם!", "c.stationName": "תחנה {0}: {1}",
  "c.next": "הבאה: {0}", "c.count": "תחנה {0}/{1}", "c.drawnN": "הוגרלו {0} תחנות 🎰",
  "say.cStart": "לתחנות! מתחילים בעוד חמש שניות", "say.cDone": "סבב הושלם! כל הכבוד",
  "l.title": "ספריית תרגילים", "l.cues": "ביצוע נכון", "l.mis": "טעויות נפוצות", "l.dose": "מינון מומלץ",
  "lvl.easy": "קל", "lvl.medium": "בינוני", "lvl.advanced": "מתקדם",
  "d.title": "קוביית הכושר · משחק כיתתי", "d.hint": "מטילים — והכיתה מבצעת. קובייה אחת בוחרת תרגיל, השנייה כמות.",
  "d.ex": "תרגיל", "d.amt": "כמות", "d.roll": "הטל קוביות!", "d.time": "זמן", "d.reps": "חזרות",
  "ui.close": "סגור", "ui.all": "הכל", "t.stop": "עצור", "about.safetyH": "בטיחות", "t.total": "סה״כ"
};
/* App translation exists, replaced here (reason in comment). Hebrew is unchanged. */
const CHANGED = {
  "pre.quick": ["Quick", null, "سريع", "Быстрый", "Rápido"],          /* app: "Agile"/"Ловкий"/"Ágil" mean nimble, not short */
  "lvl.medium": ["Intermediate", null, "متوسط", "Средний", "Intermedio"]  /* app: "Average"/"Regular" */
};
/* Not in the app: written for the standalone product. [en, he, ar, ru, es] */
const NEW = {
  "brand": ["PE Tools", "PE Tools", "PE Tools", "PE Tools", "PE Tools"],
  "app.name": ["Interval Trainer", "מאמן אינטרוולים", "مدرّب الفترات", "Интервальный тренер", "Entrenador de intervalos"],
  "ui.lang": ["Language", "שפה", "اللغة", "Язык", "Idioma"],
  "ui.about": ["About", "אודות", "حول الأداة", "О программе", "Acerca de"],
  "ui.sound": ["Sound", "צליל", "الصوت", "Звук", "Sonido"],
  "ui.voice": ["Voice", "קריינות", "التعليق الصوتي", "Голос", "Voz"],
  "ui.voiceNA": ["Voice announcements are not available in this browser.", "קריינות קולית אינה זמינה בדפדפן הזה.", "التعليق الصوتي غير متاح في هذا المتصفح.", "Голосовые подсказки недоступны в этом браузере.", "Los avisos de voz no están disponibles en este navegador."],
  "ui.testSound": ["Test sound", "בדיקת צליל", "اختبار الصوت", "Проверить звук", "Probar sonido"],
  "ui.full": ["Full screen", "מסך מלא", "ملء الشاشة", "Во весь экран", "Pantalla completa"],
  "ui.exitFull": ["Exit full screen", "יציאה ממסך מלא", "الخروج من ملء الشاشة", "Выйти из полноэкранного режима", "Salir de pantalla completa"],
  "t.pause": ["Pause", "השהיה", "إيقاف مؤقت", "Пауза", "Pausa"],
  "t.resume": ["Resume", "המשך", "استئناف", "Продолжить", "Reanudar"],
  "t.skip": ["Skip", "דלג", "تخطٍّ", "Пропустить", "Saltar"],
  "t.paused": ["Paused", "מושהה", "متوقّف مؤقتًا", "На паузе", "En pausa"],
  "t.remaining": ["Remaining {0}", "נותרו {0}", "المتبقي {0}", "Осталось {0}", "Restante {0}"],
  "t.custom": ["Your own settings", "הגדרות משלכם", "إعداداتك الخاصة", "Свои настройки", "Ajustes propios"],
  "l.tap": ["Tap an exercise for details.", "הקישו על תרגיל לפרטים.", "اضغط على تمرين لعرض التفاصيل.", "Нажмите на упражнение, чтобы увидеть подробности.", "Toca un ejercicio para ver los detalles."],
  "l.noMedia": ["No illustration yet", "אין עדיין איור", "لا يوجد رسم توضيحي بعد", "Иллюстрации пока нет", "Aún sin ilustración"],
  "l.equip": ["Equipment", "ציוד", "الأدوات", "Инвентарь", "Material"],
  "st.blocked": ["Settings can't be saved in this browser. They will reset when the page is closed.", "לא ניתן לשמור הגדרות בדפדפן הזה. הן יתאפסו כשהדף ייסגר.", "لا يمكن حفظ الإعدادات في هذا المتصفح. ستُعاد إلى الوضع الافتراضي عند إغلاق الصفحة.", "В этом браузере нельзя сохранить настройки. Они сбросятся после закрытия страницы.", "No se pueden guardar los ajustes en este navegador. Se restablecerán al cerrar la página."],
  "safety.short": ["The teacher supervises at all times. Exercises are suggestions: adapt them to each student's ability and stop if anything hurts.", "המורה משגיח/ה כל הזמן. התרגילים הם הצעות: התאימו אותם ליכולת של כל תלמיד/ה, ועצרו אם משהו כואב.", "يشرف المعلّم طوال الوقت. التمارين اقتراحات: كيِّفوها وفق قدرة كل طالب، وتوقّفوا إذا شعر أحد بألم.", "Учитель всё время наблюдает за занятием. Упражнения — это предложения: адаптируйте их к возможностям каждого ученика и прекращайте при любой боли.", "El docente supervisa en todo momento. Los ejercicios son sugerencias: adáptalos a la capacidad de cada alumno y detén el ejercicio si algo duele."],
  "about.version": ["Version {0}", "גרסה {0}", "الإصدار {0}", "Версия {0}", "Versión {0}"],
  "about.licenceH": ["Licence", "רישיון", "الترخيص", "Лицензия", "Licencia"],
  "about.licence": ["Licence terms: to be set by the publisher before sale.", "תנאי הרישיון: ייקבעו על ידי המפרסם לפני המכירה.", "شروط الترخيص: يحدّدها الناشر قبل البيع.", "Условия лицензии: будут определены издателем до начала продаж.", "Términos de la licencia: los fijará el editor antes de la venta."],
  "about.privacyH": ["Privacy", "פרטיות", "الخصوصية", "Конфиденциальность", "Privacidad"],
  "about.privacy": ["No account and no student data. Only your settings (language, timer values, sound) are stored, locally in this browser. Nothing is sent over the internet.", "בלי חשבון ובלי נתוני תלמידים. רק ההגדרות שלכם (שפה, ערכי טיימר, צליל) נשמרות, מקומית בדפדפן הזה. שום דבר לא נשלח באינטרנט.", "لا حساب ولا بيانات طلاب. تُحفظ إعداداتك فقط (اللغة وقيم المؤقّت والصوت) محليًا في هذا المتصفح. لا يُرسَل أي شيء عبر الإنترنت.", "Без учётной записи и без данных учеников. Сохраняются только ваши настройки (язык, значения таймера, звук) — локально в этом браузере. Ничего не отправляется в интернет.", "Sin cuenta y sin datos del alumnado. Solo se guardan tus ajustes (idioma, valores del temporizador, sonido), localmente en este navegador. No se envía nada por internet."],
  "about.mediaH": ["Media credits", "קרדיט למדיה", "حقوق الوسائط", "Авторство иллюстраций", "Créditos de los medios"],
  "about.media": ["Exercise animations: original cartoon-style drawings made for this project and owned by the publisher. No third-party photos or media are included.", "אנימציות התרגילים: איורים מקוריים בסגנון קריקטורה שנוצרו לפרויקט הזה ושייכים למפרסם. לא נכללים תמונות או מדיה של צד שלישי.", "رسوم التمارين المتحرّكة: رسومات أصلية بأسلوب الكرتون أُنشئت لهذا المشروع ويملكها الناشر. لا تتضمّن الأداة صورًا أو وسائط من أطراف ثالثة.", "Анимации упражнений: оригинальные рисунки в мультяшном стиле, созданные для этого проекта и принадлежащие издателю. Фото и материалы третьих лиц не используются.", "Animaciones de los ejercicios: dibujos originales de estilo animado creados para este proyecto y propiedad del editor. No se incluyen fotos ni medios de terceros."],
  "about.safety": ["The teacher supervises at all times. The exercises and volumes are suggestions, not medical or training advice: adapt them to each student's ability, allow rest, and stop an exercise if there is pain or dizziness.", "המורה משגיח/ה כל הזמן. התרגילים והמינונים הם הצעות, לא ייעוץ רפואי או אימוני: התאימו אותם ליכולת של כל תלמיד/ה, אפשרו מנוחה, והפסיקו תרגיל אם יש כאב או סחרחורת.", "يشرف المعلّم طوال الوقت. التمارين والجرعات اقتراحات وليست نصيحة طبية أو تدريبية: كيِّفوها وفق قدرة كل طالب، واسمحوا بالراحة، وأوقفوا التمرين عند الشعور بألم أو دوار.", "Учитель всё время наблюдает за занятием. Упражнения и дозировки — это предложения, а не медицинские или тренировочные рекомендации: адаптируйте их к возможностям каждого ученика, давайте отдых и прекращайте упражнение при боли или головокружении.", "El docente supervisa en todo momento. Los ejercicios y volúmenes son sugerencias, no consejos médicos ni de entrenamiento: adáptalos a la capacidad de cada alumno, permite descansos y detén el ejercicio si hay dolor o mareo."],
  "about.offline": ["Works without an internet connection once the file is open. Keep the media folder next to this file.", "עובד בלי חיבור לאינטרנט אחרי שהקובץ נפתח. השאירו את תיקיית media ליד הקובץ.", "يعمل دون اتصال بالإنترنت بعد فتح الملف. أبقِ مجلد media بجانب هذا الملف.", "После открытия файла работает без интернета. Храните папку media рядом с этим файлом.", "Funciona sin conexión a internet una vez abierto el archivo. Mantén la carpeta media junto a este archivo."],
  "about.i18nH": ["Translations", "תרגומים", "الترجمات", "Переводы", "Traducciones"],
  "about.i18n": ["Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors are possible.", "התרגומים הופקו בעזרת בינה מלאכותית. התוכן המקצועי מדויק, נבדק על ידי כמה מורים ונבחן מול תוכניות הלימודים של משרד החינוך מכל הכיוונים; ייתכנו טעויות קטנות בהגהה, בתחביר או במינוח.", "أُنتجت الترجمات بمساعدة الذكاء الاصطناعي. المحتوى المهني دقيق، وقد راجعه عدد من المعلمين وتمت مطابقته مع مناهج وزارة التربية والتعليم من جميع الجوانب؛ قد توجد أخطاء صغيرة في التدقيق اللغوي أو الصياغة أو المصطلحات.", "Переводы выполнены с помощью ИИ. Профессиональное содержание точное: его проверили несколько учителей и всесторонне сверили с учебными программами Министерства образования; возможны небольшие ошибки корректуры, синтаксиса или терминологии.", "Las traducciones se han hecho con IA. El contenido profesional es correcto: lo revisaron varios docentes y se contrastó desde todos los ángulos con los currículos del Ministerio de Educación; puede haber pequeños errores de corrección, sintaxis o terminología."]
};

/* Media is keyed by exercise id (one cartoon animation per exercise, store-content/exercise-anim). */
const EQ = { "בלי ציוד": "none", "ספסל": "bench", "משקולות יד": "dumbbells", "גומיית התנגדות": "band", "מוט מתח": "bar", "קטלבל": "kettlebell" };
const PRESET_IDS = { "טבאטה": "tabata", "HIIT כיתתי": "hiit", "EMOM 10": "emom", "כוח 3 סטים": "strength", "זריז": "quick" };

function build(root) {
  const T = loadTerms(root), fit = sliceFit(root);
  const EX = literalAfter(fit, "const EX=[");
  const PRESETS = literalAfter(fit, "const PRESETS=[");
  const i18n = {}, source = {};
  for (const [k, he] of Object.entries(UI_FROM_APP)) { i18n[k] = fromApp(T, he); source[k] = "app"; }
  for (const [k, row] of Object.entries(CHANGED)) { const r = row.slice(); r[1] = i18n[k][1]; i18n[k] = r; source[k] = "changed"; }
  for (const [k, row] of Object.entries(NEW)) { if (i18n[k]) throw new Error("dup " + k); i18n[k] = row; source[k] = "new"; }
  const units = {
    s: fromApp(T, "1 שנ׳").map(x => x.replace(/^1 /, "")),
    m: fromApp(T, "1 מ׳").map(x => x.replace(/^1 /, "")),
    assisted: fromApp(T, "3 (בעזרה)").map(x => x.replace(/^3 /, ""))
  };
  const eq = {};
  for (const [he, id] of Object.entries(EQ)) eq[id] = fromApp(T, he);
  const exercises = EX.map(e => {
    const reps = {};
    for (const [k, v] of Object.entries(e.reps)) {
      const key = { "קל": "easy", "בינוני": "medium", "מתקדם": "advanced" }[k];
      if (typeof v === "number") reps[key] = [v, ""];
      else {
        const m = /^(\d+) (שנ׳|מ׳)$/.exec(v);
        if (m) reps[key] = [+m[1], m[2] === "שנ׳" ? "s" : "m"];
        else if (v === "3 (בעזרה)") reps[key] = [3, "assisted"];
        else throw new Error("unknown reps value " + v);
      }
    }
    if (!EQ[e.eq]) throw new Error("unknown equipment " + e.eq);
    return {
      id: e.id, grp: e.grp, eq: EQ[e.eq],
      name: fromApp(T, e.name), mus: fromApp(T, e.mus),
      cues: e.cues.map(c => fromApp(T, c)), mis: e.mis.map(c => fromApp(T, c)), reps
    };
  });
  const presets = PRESETS.map(p => ({ id: PRESET_IDS[p.name], sub: p.sub, w: p.w, r: p.r, n: p.n, s: p.s, sr: p.sr }));
  if (presets.some(p => !p.id)) throw new Error("unknown preset name");
  return { version: VERSION, langs: ["en", "he", "ar", "ru", "es"], i18n, source, units, eq, presets, exercises };
}

function render(data) {
  return "/*DATA-START*/\nwindow.PE_IT_DATA=" + JSON.stringify(data) + ";\n/*DATA-END*/";
}

if (require.main === module) {
  const data = build(ROOT);
  const html = fs.readFileSync(HTML, "utf8");
  const re = /\/\*DATA-START\*\/[\s\S]*?\/\*DATA-END\*\//;
  if (!re.test(html)) { console.error("DATA markers not found in " + HTML); process.exit(2); }
  const next = html.replace(re, () => render(data));
  if (process.argv.includes("--check")) {
    if (next !== html) { console.error("interval-trainer.html data block is stale; run the extractor"); process.exit(1); }
    console.log("data block up to date");
  } else {
    fs.writeFileSync(HTML, next);
    console.log("wrote data block: " + data.exercises.length + " exercises, " + Object.keys(data.i18n).length + " UI strings");
  }
}
module.exports = { build, render, lookup, splitTerm, loadTerms, sliceFit, literalAfter, appBuildPhases, ROOT, HTML, NEW, CHANGED, UI_FROM_APP };
