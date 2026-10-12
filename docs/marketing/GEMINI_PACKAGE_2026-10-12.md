# PE Ultimate App — package for Gemini (self-contained)
Date: 2026-10-12. You do not need access to any repository: everything you need is in this file. Do all six tasks (G1-G6) and send the result back in the format at the end.

## Who you are working for
The owner of "PE Ultimate App", a free offline Android app (iOS later) for **adults working in sport**: physical-education teachers first, and also fitness trainers and coaches of sports clubs and classes. It is **not** for children or families and must not be marketed to them. Languages in the app: Hebrew, English, Arabic, Russian, Spanish. Launch plan: closed test on Google Play for 14 days with 12+ testers, then public. Your text must be ready for the owner to paste into the Play Console and into outreach messages.

## Hard rules
1. You write text only. Do not invent features. If a fact is not in this file, write `ASK OWNER: <question>` instead of guessing.
2. Allowed facts: free; works offline; no account; pupil data stays on the device; optional contact form; timetable and lesson planner; live lesson timer; attendance; fitness tests with norms; beep test; photo-finish (camera-based timing); class and pupil tracking; grades with manual override; Excel/CSV export; encrypted backup and restore to a file; games library; demo mode; five languages.
3. **Never** claim: accuracy or precision ("to the millisecond", "accurate"), certification, "official norms", "validated", medical or health-risk judgement, grade prediction, "AI", competitor comparison, prices, ratings, user counts or testimonials. Say "practical field tool". Lesson-bank plans are drafts: never call them validated, certified or official.
4. Keep Google Play limits: app name "PE Ultimate App" (fixed, 15 chars), short description max 80 characters, full description max 4000. Count characters and write the count next to each text.
5. Hebrew, Arabic, Russian and Spanish are written by you as a first pass. Mark every sentence you are not fully sure of with `[NATIVE REVIEW]` so a human native speaker can check it.
6. Tone: plain, honest, practical, no hype, no fake urgency, no pressure.

## Tasks

### G1 — Review and correct the store listing in 5 languages
Input: "SOURCE A" below. For each language correct grammar, tone and PE-teacher terminology for that country, keep every fact, and widen "PE teachers" to "PE teachers, fitness trainers and sports coaches" where it fits (the app says "classes" and "pupils"; do not claim a feature that does not exist). Replace any accuracy claim by the safe wording in rule 3. Output per language: name, short description (with count), full description (with count), then a list of every change with the reason.

### G2 — Positioning and landing-page copy (5 languages)
One sentence, three benefits (offline in the gym; fast during the lesson; you keep your data), a short "Get the app" section, and a 6-question FAQ: Is it free? Do I need internet? Where is my data? Can I move to a new phone? Which devices? How do I contact you? Answers must agree with "SOURCE B" (privacy facts) below; name the part of SOURCE B each answer relies on.

### G3 — Screenshot captions (5 languages)
Five screenshots exist: (1) Today / timetable with the next lesson and a Start button, (2) fitness tests during an active lesson, (3) beep test running, (4) class hub with student and measurement counts, (5) live lesson screen with attendance, measure, beep test and photo-finish buttons. Give 5 captions per language, max 6 words each, as a table. Also propose 3 further captions for screens not yet captured: pupil progress, backup/restore, games library.

### G4 — Demo video script (30-45 seconds)
Shot list with exact taps and timing for a screen recording, using only: open Today -> start the next lesson -> mark everyone present -> open fitness tests -> run the beep test for a few seconds -> open the class hub. On-screen text in Hebrew and English. No voice-over needed. Use only features listed in rule 2.

### G5 — Outreach messages
Under 600 characters each, Hebrew first then English, honest tone ("a free tool I built, I would like feedback"), with the placeholder `[LINK]` for the closed-test join page: (a) a PE-teachers WhatsApp/Facebook group, (b) a group of fitness trainers or sports-club coaches, (c) a mentor/inspector, (d) a teacher-training college, (e) a colleague asked to be one of the 12 testers (explain they must stay opted in for 14 days and not uninstall).

### G6 — Search keywords
Per language, 10 phrases a PE teacher or coach would type in the store, grouped by intent, and where each should appear (short description, first 250 characters of the full description). Do not invent search volumes: write "unknown" unless you cite a source with its date.

## SOURCE A — current store listing drafts (5 languages)
# Store listing pack — Google Play (and App Store text base)

Status: **draft for the owner**. Nothing here is uploaded or published, and no app code was changed. Texts describe only what exists in the app today (see README.md and `docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md`). Translations are drafts, not reviewed by native speakers (same status as the app itself).

App name is **PE Ultimate App** in every language (a brand name, 15 characters, no keywords or emoji, which keeps it inside Play's naming rules). Google Play limits used: app name 30 characters, short description 80, full description 4000. Counts below were measured with a script.

## Before you paste anything

- **Package ID and audience are still owner decisions** (`docs/NATIVE_RELEASE_CHECKLIST.md` §3). Audience decided 2026-10-12: adults only (PE teachers, fitness trainers, sports coaches); Gemini task G1 widens the wording.
- The lesson bank is not mentioned on purpose: its import and expansion are on hold and its plans are marked draft in the app.
- "Estimated VO₂max" and the closing note keep fitness figures framed as education, as the Health apps declaration requires (readiness doc §5).
- Screenshots must come from the real app on a device after the device pass; none exist yet.
- Default language for the listing: English (matches the app's default for new installs).

> 2026-10-12: the photo-finish line no longer claims millisecond accuracy. Per `docs/handoffs/2026-10-09-report-review-claude-action-plan.md` there is no certification or controlled accuracy study, so listing text must not promise precise or certified timing. Character counts below are from before this edit: re-measure.

## Counts

| Language | Name (≤30) | Short (≤80) | Full (≤4000) |
|---|---|---|---|
| English (default) | 15 | 72 | 1258 |
| עברית | 15 | 65 | 953 |
| العربية | 15 | 68 | 1057 |
| Русский | 15 | 67 | 1308 |
| Español | 15 | 80 | 1340 |

## English (default) (`en`)

**App name**

PE Ultimate App

**Short description**

Fitness tests, beep test, photo-finish and lesson plans for PE teachers.

**Full description**

```text
PE Ultimate is a field kit for physical education teachers. Everything runs on your phone or tablet, with no account and no internet needed in the gym or on the field.

WHAT YOU CAN DO
• 30 fitness tests with several attempts per student, student cards and school norms
• Beep test (Léger) with an estimated VO₂max and FITNESSGRAM-based norms
• Photo-finish: time runners with the phone camera (a practical field tool, not certified timing)
• Lesson plans: a quick generator, plus a manual step-by-step builder
• Class lists, grades, grade structure and teaching groups
• Records boards, games and a cited knowledge base
• Student mode: pupils see the records board and add a record on your device
• Export results to Excel/CSV and print or save as PDF

YOUR DATA STAYS WITH YOU
There is no sign-up and no server of our own. Students, results and grades are stored on your device. Back up to a file (optionally encrypted) to keep a copy or move to another device.

FIVE LANGUAGES
English, Hebrew, Arabic, Russian and Spanish, with automatic right-to-left or left-to-right layout. Some translations are drafts that have not yet been reviewed by native speakers.

NOTE
Fitness and VO₂max figures are estimates for education and teaching. They are not medical advice and not a medical device.
```

## עברית (`he`)

**App name**

PE Ultimate App

**Short description**

מבחני כושר, ביפ טסט, פוטו־פיניש ומערכי שיעור למורים לחינוך גופני.

**Full description**

```text
PE Ultimate היא ערכת שטח למורים לחינוך גופני. הכול רץ בטלפון או בטאבלט, בלי חשבון ובלי אינטרנט, בחדר הכושר ובמגרש.

מה אפשר לעשות
• 30 מבחני כושר עם כמה ניסיונות לכל תלמיד, כרטיס תלמיד ונורמות בית־ספריות
• ביפ טסט (Léger) עם הערכת VO₂max ונורמות על בסיס FITNESSGRAM
• פוטו־פיניש: מדידת זמנים במצלמה — כלי שטח מעשי, לא מדידה מוסמכת
• מערכי שיעור: מחולל מהיר ובונה ידני שלב אחר שלב
• רשימות כיתה, ציונים, מבנה ציון וקבוצות הוראה
• לוחות שיאים, משחקים ומאגר ידע מצוטט
• מצב תלמיד: התלמידים רואים את לוח השיאים ומוסיפים שיא במכשיר שלך
• ייצוא תוצאות ל־Excel/CSV, והדפסה או שמירה כ־PDF

הנתונים נשארים אצלך
אין הרשמה ואין שרת משלנו. תלמידים, תוצאות וציונים נשמרים במכשיר שלך. אפשר לגבות לקובץ (עם הצפנה לבחירה) כדי לשמור עותק או לעבור למכשיר אחר.

חמש שפות
עברית, אנגלית, ערבית, רוסית וספרדית, עם כיוון כתיבה אוטומטי. חלק מהתרגומים הם טיוטה שטרם נבדקה על ידי דוברי שפת אם.

שימו לב
נתוני כושר ו־VO₂max הם הערכות לצורכי לימוד והוראה. הם אינם ייעוץ רפואי ואינם מכשיר רפואי.
```

## العربية (`ar`)

**App name**

PE Ultimate App

**Short description**

اختبارات لياقة وبيب تست وفوتو فينش وخطط دروس لمعلمي التربية البدنية.

**Full description**

```text
PE Ultimate أداة ميدانية لمعلمي التربية البدنية. يعمل كل شيء على الهاتف أو الجهاز اللوحي، دون حساب ودون إنترنت، في الصالة أو في الملعب.

ماذا يمكنك أن تفعل
• 30 اختبار لياقة مع عدة محاولات لكل طالب، وبطاقة طالب ومعايير مدرسية
• اختبار البيب (Léger) مع تقدير VO₂max ومعايير مبنية على FITNESSGRAM
• فوتو فينش: قياس الأزمنة بالكاميرا — أداة ميدانية عملية وليست قياسًا معتمدًا
• خطط الدروس: مولّد سريع ومنشئ يدوي خطوة بخطوة
• قوائم الصفوف والعلامات وهيكل العلامة ومجموعات التدريس
• لوحات الأرقام القياسية وألعاب وقاعدة معرفة موثّقة بالمصادر
• وضع الطالب: يرى الطلاب لوحة الأرقام القياسية ويضيفون رقمًا على جهازك
• تصدير النتائج إلى Excel/CSV والطباعة أو الحفظ بصيغة PDF

بياناتك تبقى معك
لا تسجيل ولا خادم خاص بنا. تُحفظ أسماء الطلاب والنتائج والعلامات على جهازك. يمكنك النسخ الاحتياطي إلى ملف (مع تشفير اختياري) للاحتفاظ بنسخة أو للانتقال إلى جهاز آخر.

خمس لغات
العربية والعبرية والإنجليزية والروسية والإسبانية، مع اتجاه كتابة تلقائي. بعض الترجمات مسودات لم يراجعها بعد متحدثون أصليون.

ملاحظة
أرقام اللياقة وVO₂max تقديرات لأغراض التعليم والتدريس، وليست نصيحة طبية ولا جهازًا طبيًا.
```

## Русский (`ru`)

**App name**

PE Ultimate App

**Short description**

Тесты, бип-тест, фотофиниш и планы уроков для учителей физкультуры.

**Full description**

```text
PE Ultimate — полевой набор для учителей физической культуры. Всё работает на телефоне или планшете, без аккаунта и без интернета, в зале и на стадионе.

ЧТО МОЖНО ДЕЛАТЬ
• 30 тестов физической подготовки: несколько попыток на ученика, карточка ученика, школьные нормативы
• Бип-тест (Léger) с оценкой VO₂max и нормативами на основе FITNESSGRAM
• Фотофиниш: хронометраж камерой — практичный полевой инструмент, не сертифицированный хронометраж
• Планы уроков: быстрый генератор и пошаговый ручной конструктор
• Списки классов, оценки, структура оценки и учебные группы
• Таблицы рекордов, игры и база знаний со ссылками на источники
• Режим ученика: ученики видят таблицу рекордов и добавляют рекорд на вашем устройстве
• Экспорт результатов в Excel/CSV, печать или сохранение в PDF

ДАННЫЕ ОСТАЮТСЯ У ВАС
Без регистрации и без нашего сервера. Ученики, результаты и оценки хранятся на вашем устройстве. Резервную копию можно сохранить в файл (при желании с шифрованием), чтобы иметь копию или перенести данные на другое устройство.

ПЯТЬ ЯЗЫКОВ
Русский, английский, иврит, арабский и испанский, с автоматическим направлением текста. Часть переводов — черновики, ещё не проверенные носителями языка.

ВАЖНО
Показатели физической подготовки и VO₂max — оценки для обучения и преподавания. Это не медицинская рекомендация и не медицинское устройство.
```

## Español (`es`)

**App name**

PE Ultimate App

**Short description**

Tests físicos, test del pitido, foto-finish y planes de clase para profes de EF.

**Full description**

```text
PE Ultimate es un kit de campo para profesores de educación física. Todo funciona en tu teléfono o tableta, sin cuenta y sin internet, en el gimnasio o en la pista.

QUÉ PUEDES HACER
• 30 tests de condición física con varios intentos por alumno, ficha del alumno y baremos del centro
• Test del pitido (Léger) con estimación de VO₂max y baremos basados en FITNESSGRAM
• Foto-finish: cronometra con la cámara — herramienta práctica de campo, no cronometraje certificado
• Planes de clase: un generador rápido y un constructor manual paso a paso
• Listas de clase, notas, estructura de la nota y grupos de enseñanza
• Tablas de récords, juegos y una base de conocimiento con fuentes citadas
• Modo alumno: los alumnos ven la tabla de récords y añaden un récord en tu dispositivo
• Exporta resultados a Excel/CSV e imprime o guarda en PDF

TUS DATOS SE QUEDAN CONTIGO
Sin registro y sin servidor propio. Alumnos, resultados y notas se guardan en tu dispositivo. Haz una copia de seguridad en un archivo (con cifrado opcional) para conservarla o pasar a otro dispositivo.

CINCO IDIOMAS
Español, inglés, hebreo, árabe y ruso, con dirección de texto automática. Algunas traducciones son borradores aún no revisados por hablantes nativos.

AVISO
Los datos de condición física y el VO₂max son estimaciones con fines educativos y docentes. No son consejo médico ni un producto sanitario.
```

## Graphic assets (this folder: `assets/`)

| File | Size | Use |
|---|---|---|
| `icon.svg` | vector | Source of the new logo |
| `icon-512.png` | 512×512, opaque | Google Play app icon (Play applies its own rounded mask) |
| `icon-1024.png` | 1024×1024, opaque, no alpha | App Store icon base (iOS requires no transparency) |
| `feature-graphic.svg` / `feature-graphic-1024x500.png` | 1024×500 | Play feature graphic |

The new logo keeps the idea of the current icon (stopwatch with a check mark) and adds a basketball, a volleyball and a football (soccer ball) with color: a white stopwatch with a green check on a blue gradient, yellow speed lines, an orange basketball, a blue-and-yellow volleyball and a black-and-white football. The shoe from the old icon is dropped because it did not read at small sizes. The icon has no text, so it needs no translation.

**Applied on draft PR #44 and extracted into the packaging-only proposal, not merged or deployed:** the new logo replaces the web/PWA, maskable, Android legacy/round/adaptive and iOS icon assets. Android foreground/background sources are already split in `native/assets/icon-foreground.png` and `native/assets/icon-background.png`. Owner review of the logo and physical-device checks of adaptive masks and small-size legibility remain pending. Splash screens are unchanged. The earlier store-listing handoff's future-icon wording is superseded by `docs/handoffs/2026-10-05-icons-package-id.md`.

The feature graphic text is English only and uses a system font; a Hebrew/Arabic/Russian/Spanish variant is not made. Review the artwork yourself, including trademark and similarity checks, before use.

## Still needed from the owner

1. Confirm the proposed `io.github.osher15.peultimate` package ID and intended audience before store submission. The ID is implemented on draft PR #44 and in the packaging-only proposal; owner approval, release signing and submission are not claimed.
2. Approve or edit the wording (especially claims such as "30 fitness tests", which come from README.md).
3. Real-device screenshots (phone, and tablet if offered).
4. Store privacy sentence and Data safety answers (readiness doc §6).
5. Native-speaker review of the four non-English texts before production.


## SOURCE B — privacy facts (English section of the live privacy page, 2026-10-12)
## PE Ultimate — Privacy policy

Updated: 12 October 2026 · Terms of use

App operator: Osher Shalev. Questions and requests, including deletion requests, go through the in-app contact form (About → Leave contact details).

## Who the app is for

PE Ultimate is for adults (18 and over): physical-education teachers, fitness trainers, coaches of sports clubs and classes, and teaching and coaching staff. It is not directed at children and is not meant for students to sign up on their own, and it has no user accounts.

## Data kept only on the device

Student rosters, attendance, grades, measurements, lesson plans, timetable, settings, the teacher code and record videos are stored in the device's browser (localStorage and IndexedDB). They are not sent to the app's operator, who has no access to them.

## Contact details sent to the operator

- What: the request type (contact or deletion request), first name, last name, email, phone, a message if you wrote one, interface language and app version. For a deletion request — only email or phone, no names. No student data.

- When: only when you choose “Send” in the contact form. Skipping sends nothing.

- Why: to get in touch and send a feedback survey about the app. Not for marketing, not sold, not passed on.

- Where: in PE Ultimate's dedicated form on Netlify Forms, in the operator's account. Netlify processes the data on the operator's behalf.

- How long: up to 24 months from receipt, or less if you ask for deletion. The operator reviews submissions at least every six months and, at each review, deletes every submission received more than 18 months earlier — so none is kept beyond 24 months. Deletion is manual; nothing is deleted automatically.

- Deletion: in the app: About → “Request deletion of my contact details”, or open the request directly. Your email or phone as you gave them is enough. The operator deletes the submission and the deletion request from Netlify.

## External services

- Netlify (hosting): each load creates standard server logs — IP address, browser details and the requested URL. Netlify also adds its own “Powered by Netlify” badge to the pages.

- Fonts: served with the app itself; no request to Google Fonts.

- Records sync — optional: only if the teacher sets a URL and code, student name, event, result and status are sent to the teacher's own Google Sheet.

- Google Drive backup — optional: only on request, a password-encrypted backup file goes to the teacher's own Drive.

- External links (YouTube, sources, a video-upload form set by the teacher) open only when tapped.

The app has no ads, analytics or tracking.

## Device permissions

- Camera: for photo-finish and to record or choose a record video. Images are processed on the device.

- Microphone: only to detect a start signal (shot or clap) live. Audio is not recorded or sent.

- Screen wake, copy and share: only during use or when tapped. No access to location, contacts or notifications.

## Students

Student mode lets a student view the records board and submit a record for the teacher's approval on the same device. No contact details are collected from students. The teacher or school is responsible for having permission for the student data they enter and for any sharing they set up.

These are three different things: (1) contact details on Netlify — deleted on a deletion request, as above; (2) data on the device — individual items and all records can be deleted in the app, and clearing the site’s data in the browser deletes all data on the device (removing the app icon alone may leave it in the browser); (3) backups you saved as a file or to your own Google Drive — they are yours alone, the operator cannot see them, and you delete them there.

## Security

The site is served over HTTPS. File backups can be password-encrypted (AES-GCM with a key derived on the device; the password is not stored), and Drive backups are always encrypted. The teacher code protects against casual use of the device — it is not an account.

## Changes

This page is updated when what the app sends off the device changes. It describes how the app works and is not a certification of compliance with any particular law.

## SOURCE C — README (feature overview, Hebrew)
# PE Ultimate

ערכת שטח למורה לחינוך גופני — אפליקציית דפדפן אחת, בלי התקנה ובלי שרת.
נתוני העבודה נשמרים במכשיר (`localStorage` + `IndexedDB` לסרטונים). אין
לאפליקציה שרת או חשבון משלה; מה שכן יוצא מהמכשיר (גופנים, טופס קשר רשות,
סנכרון/דרייב רשות) מפורט ב-[`privacy.html`](privacy.html).

> **שכפול עצמאי.** PE Ultimate הוא שכפול (fork) עצמאי ומלא של
> [`osher15/Pro-sport-pa`](https://github.com/osher15/Pro-sport-pa)
> (המגרש PRO) — קוד כמעט זהה, היסטוריה משותפת, אבל **ריפו נפרד,
> זהות נתונים נפרדת, אירוח נפרד.** שינוי כאן לא נוגע במגרש PRO,
> ולהפך. ראו [`docs/ORIGIN_VISION.md`](docs/ORIGIN_VISION.md) לניתוח
> השוק והחזון שממנו הפרויקט הזה יצא לדרך.

---

## מה יש כאן

- **‎30‎ מבחני כושר** — ריבוי ניסיונות, כרטיס תלמיד, מדד כושר, נורמות בית־ספריות
- **פוטו־פיניש** — מדידת זמנים מהמצלמה (כלי שטח מעשי; אין הסמכה או מחקר דיוק)
- **ביפ טסט** — פרוטוקול Léger מלא, VO₂max, נורמות FITNESSGRAM
- **מערכי שיעור** — מחולל מהיר + בונה ידני בחמישה שלבים
- **ציונים ותלמידים** — רשימות כיתה, מבנה ציון, קבוצות הוראה
- **שיאים, משחקים, מאגר ידע** — ותוכן מקצועי מצוטט, לא "בערך"
- **PWA אופליין מלא** — נפתח במגרש בלי קליטה, גם כקובץ יחיד (`Hamegrash.html`) וגם כאפליקציה מותקנת
- **חמש שפות** — English (ברירת המחדל בהתקנה חדשה) · עברית · العربية · Русский · Español, עם RTL/LTR אוטומטי. בחירה שמורה תמיד גוברת; מכשיר שכבר יש בו נתונים ואין בו בחירה (משתמש קיים, שראה עברית כברירת מחדל) נשאר בעברית. אין ניחוש משפת המכשיר. בוחר שפה בטופס הפתיחה, במסך הכניסה, בכותרת ובהגדרות. מצב הדגמה זורע שמות באנגלית בכל ממשק שאינו עברי (עברית — שמות עבריים); הדגמה ישנה בשפה אחרת נטענת מחדש רק בכפתור מפורש בפס ההדגמה, שמחליף את רשומות ההדגמה בלבד (אותם מזהים). המעטפת והתוכן המובנה — תיאורי משחקים, שלבי מערכים, הסברי תרגילים, מאגר הידע, הודעות, תעודות, הדפסות וכותרות CSV — מתורגמים (`hm-terms.js`, `hm-texts.js`); טקסט שהמורה מקליד נשאר כפי שנכתב. התרגום הוא **טיוטה שעוד לא עברה בדיקת דוברי שפה**; «כיסוי» בהגדרות הוא כיסוי מפתחות, לא איכות לשונית. ההקראה לכיתה נשמעת בשפת הממשק

## פרטיות וגיבוי

אין חשבון ואין שרת משלנו. נתוני העבודה חיים ב-`localStorage`/`IndexedDB`
של המכשיר. יציאות מהמכשיר — טופס פרטי קשר (רשות,
אפשר לדלג ל-7 ימים; נשמר בטופס ייעודי ב-Netlify Forms), סנכרון שיאים וגיבוי לדרייב (רשות, דורשים הגדרה) — מפורטות
ב-[`privacy.html`](privacy.html) ובדוח הביקורת `docs/PE_ULTIMATE_RELEASE_AUDIT_2026-09-29.md`. גיבוי לקובץ (מוצפן, רשות) הוא הדרך
היחידה להעביר נתונים בין מכשירים או לגבות אותם — ראו את ה-README המקורי
של המגרש PRO לפירוט המלא של מנגנון ההצפנה וההתקנה כ-PWA; ההתנהגות זהה
כאן אחד לאחד.

**גיבוי לגוגל דרייב (רשות):** אותו מנגנון בדיוק, לתיקייה נפרדת —
`"PE Ultimate – Backups"` ולא `"המגרש PRO – גיבויים"`. אם אתם מגדירים
Client ID משלכם ל-OAuth, זכרו להוסיף את הכתובת שבה PE Ultimate מתארח
(למשל `https://pe-ultimate.netlify.app`) תחת **Authorized JavaScript
origins** — לא את הכתובת של המגרש PRO.

## למה זה ריפו נפרד, לא רק שם אחר

שתי אפליקציות שחולקות origin (כתובת-בסיס) חולקות גם את `localStorage`,
`IndexedDB` ואת מטמון האופליין של הדפדפן — **גם אם הקוד יושב בשני
ריפואים שונים.** PE Ultimate פותר את זה בשתי שכבות:

1. **origin נפרד** — מתארח בנפרד מהמגרש PRO (לא תחת אותו דומיין),
   כדי שההפרדה תהיה מובטחת גם בלי תלות בקוד.
2. **מזהים שונים בקוד**, גם ליתר ביטחון וגם למקרה שבו שתי האפליקציות
   ירוצו אי־פעם מקובץ מקומי על אותו מכשיר: תחילית `localStorage` שונה
   (`peultimate.` ולא `pehub.`), מסד `IndexedDB` שונה, תחילית מטמון
   שונה ב-service worker, ותיקיית דרייב נפרדת. כל אלה מרוכזים בקובץ
   אחד — `hm-brand.js` — כדי ששינוי עתידי לא יצטרך לגעת בעשר

## How to send the result back
Reply with ONE message in this structure. Every file starts with a line `=== FILE: <path> ===` and ends with `=== END FILE ===` so it can be split automatically:
- `=== FILE: docs/marketing/listing-review.md ===` (G1)
- `=== FILE: docs/marketing/landing-copy.md ===` (G2)
- `=== FILE: docs/marketing/screenshot-captions.md ===` (G3)
- `=== FILE: docs/marketing/video-script.md ===` (G4)
- `=== FILE: docs/marketing/outreach.md ===` (G5)
- `=== FILE: docs/marketing/keywords.md ===` (G6)
- `=== FILE: docs/handoffs/2026-10-12-gemini-launch-result.md ===` — a short list of: what you produced, every `ASK OWNER` question, every `[NATIVE REVIEW]` item, and anything you could not do.
Write documentation headings in English; the texts themselves are in the language each task names.
