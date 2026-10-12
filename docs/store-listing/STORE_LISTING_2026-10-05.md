# Store listing pack — Google Play (and App Store text base)

Status: **draft for the owner**. Nothing here is uploaded or published, and no app code was changed. Texts describe only what exists in the app today (see README.md and `docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md`). Translations are drafts, not reviewed by native speakers (same status as the app itself).

App name is **PE Ultimate App** in every language (a brand name, 15 characters, no keywords or emoji, which keeps it inside Play's naming rules). Google Play limits used: app name 30 characters, short description 80, full description 4000. Counts below were measured with a script.

## Before you paste anything

- **Package ID and audience are still owner decisions** (`docs/NATIVE_RELEASE_CHECKLIST.md` §3). Audience decided 2026-10-12: adults only (PE teachers, fitness trainers, sports coaches); Gemini task G1 widens the wording.
- The lesson bank is not mentioned on purpose: its import and expansion are on hold and its plans are marked draft in the app.
- "Estimated VO₂max" and the closing note keep fitness figures framed as education, as the Health apps declaration requires (readiness doc §5).
- Screenshots must come from the real app on a device after the device pass; none exist yet.
- Default language for the listing: English (matches the app's default for new installs).

> 2026-10-12: the English full description was reviewed by Gemini (audience widened, draft lesson plans, timer/timetable/attendance and games added) and the test count corrected from 30 to 31 (31 tests in `hm-tests.js`). Hebrew was reviewed by Gemini the same way (audience, draft plans, 31 tests). Arabic was reviewed by Gemini too (first pass, needs a human native speaker). Russian too (first pass, needs a human native speaker). Spanish is NOT yet reviewed; their test count was corrected to 31 mechanically.

> 2026-10-12: the photo-finish line no longer claims millisecond accuracy. Per `docs/handoffs/2026-10-09-report-review-claude-action-plan.md` there is no certification or controlled accuracy study, so listing text must not promise precise or certified timing. Character counts below are from before this edit: re-measure.

## Counts

| Language | Name (≤30) | Short (≤80) | Full (≤4000) |
|---|---|---|---|
| English (default) | 15 | 81 | 1460 |
| עברית | 15 | 61 | 1042 |
| العربية | 15 | 64 | 1175 |
| Русский | 15 | 66 | 1471 |
| Español | 15 | 80 | 1340 |

## English (default) (`en`)

**App name**

PE Ultimate App

**Short description**

Fitness tests, beep test, photo-finish and lesson plans for teachers and coaches.

**Full description**

```text
PE Ultimate is a free, offline field kit for physical education teachers, fitness trainers, and sports coaches. Everything runs on your phone or tablet, with no account and no internet needed in the gym or on the field.

WHAT YOU CAN DO
• 31 fitness tests with several attempts per student, student cards and school norms
• Beep test (Léger) with an estimated VO₂max and FITNESSGRAM-based norms
• Photo-finish: time runners with the phone camera (a practical field tool, not certified timing)
• Lesson plans: a quick generator, plus a manual step-by-step builder with draft lesson plans
• Class lists, grades with manual override, grade structure, and teaching groups
• Live lesson timer, timetable, and attendance tracking
• Records boards, games library, and a cited knowledge base
• Student mode: pupils see the records board and add a record on your device
• Export results to Excel/CSV and print or save as PDF

YOUR DATA STAYS WITH YOU
There is no sign-up and no server of our own. Students, results and grades are stored locally on your device. Back up to a file (optionally encrypted) to keep a copy or move to another device.

FIVE LANGUAGES
English, Hebrew, Arabic, Russian and Spanish, with automatic right-to-left or left-to-right layout. Some translations are drafts that have not yet been reviewed by native speakers.

NOTE
Fitness and VO₂max figures are estimates for education and teaching. They are not medical advice and not a medical device.
```

## עברית (`he`)

**App name**

PE Ultimate App

**Short description**

מבחני כושר, ביפ טסט, פוטו־פיניש ומערכי שיעור למורים ולמאמנים.

**Full description**

```text
PE Ultimate היא ערכת שטח חינמית למורים לחינוך גופני, מאמני כושר ומדריכי ספורט. הכול רץ בטלפון או בטאבלט, בלי חשבון ובלי אינטרנט, בחדר הכושר ובמגרש.

מה אפשר לעשות
• 31 מבחני כושר עם כמה ניסיונות לכל תלמיד, כרטיס תלמיד ונורמות בית־ספריות
• ביפ טסט (Léger) עם הערכת VO₂max ונורמות על בסיס FITNESSGRAM
• פוטו־פיניש: מדידת זמנים במצלמה — כלי שטח מעשי, לא מדידה מוסמכת
• מערכי שיעור: מחולל מהיר ובונה ידני עם טיוטות של מערכים
• רשימות כיתה, ציונים (עם עריכה ידנית), נוכחות, מערכת שעות וטיימר שיעור חי
• לוחות שיאים, ספריית משחקים ומאגר ידע מצוטט
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

اختبارات لياقة وبيب تست وفوتو فينش وخطط دروس للمعلمين والمدربين.

**Full description**

```text
PE Ultimate أداة ميدانية مجانية لمعلمي التربية البدنية، مدربي اللياقة، والمدربين الرياضيين. يعمل كل شيء على الهاتف أو الجهاز اللوحي، دون حساب ودون إنترنت، في الصالة أو في الملعب.

ماذا يمكنك أن تفعل
• 31 اختبار لياقة مع عدة محاولات لكل طالب، وبطاقة طالب ومعايير مدرسية
• اختبار البيب (Léger) مع تقدير VO₂max ومعايير مبنية على FITNESSGRAM
• فوتو فينش: قياس الأزمنة بالكاميرا — أداة ميدانية عملية وليست قياسًا معتمدًا
• خطط الدروس: مولّد سريع ومنشئ يدوي مع مسودات لخطط الدروس
• قوائم الصفوف، العلامات (مع تعديل يدوي)، الحضور، جدول الحصص، ومؤقت الدرس المباشر
• لوحات الأرقام القياسية، مكتبة ألعاب، وقاعدة معرفة موثّقة بالمصادر
• وضع الطالب: يرى الطلاب لوحة الأرقام القياسية ويضيفون رقمًا على جهازك
• تصدير النتائج إلى Excel/CSV والطباعة أو الحفظ بصيغة PDF

بياناتك تبقى معك
لا تسجيل ولا خادم خاص بنا. تُحفظ أسماء الطلاب والنتائج والعلامات محليًا على جهازك. يمكنك النسخ الاحتياطي إلى ملف (مع تشفير اختياري) للاحتفاظ بنسخة أو للانتقال إلى جهاز آخر.

خمس لغات
العربية والعبرية والإنجليزية والروسية والإسبانية، مع اتجاه كتابة تلقائي. بعض الترجمات مسودات لم يراجعها بعد متحدثون أصليون.

ملاحظة
أرقام اللياقة وVO₂max تقديرات لأغراض التعليم والتدريس، وليست نصيحة طبية ولا جهازًا طبيًا.
```

## Русский (`ru`)

**App name**

PE Ultimate App

**Short description**

Тесты, бип-тест, фотофиниш и планы уроков для учителей и тренеров.

**Full description**

```text
PE Ultimate — бесплатный полевой набор для учителей физической культуры, фитнес-тренеров и спортивных инструкторов. Всё работает на телефоне или планшете, без аккаунта и без интернета, в зале и на стадионе.

ЧТО МОЖНО ДЕЛАТЬ
• 31 тест физической подготовки: несколько попыток на ученика, карточка ученика, школьные нормативы
• Бип-тест (Léger) с оценкой VO₂max и нормативами на основе FITNESSGRAM
• Фотофиниш: хронометраж камерой — практичный полевой инструмент, не сертифицированный хронометраж
• Планы уроков: быстрый генератор и пошаговый конструктор с черновиками уроков
• Списки классов, оценки (с ручным редактированием), посещаемость, расписание и таймер живого урока
• Таблицы рекордов, библиотека игр и база знаний со ссылками на источники
• Режим ученика: ученики видят таблицу рекордов и добавляют рекорд на вашем устройстве
• Экспорт результатов в Excel/CSV, печать или сохранение в PDF

ДАННЫЕ ОСТАЮТСЯ У ВАС
Без регистрации и без нашего сервера. Ученики, результаты и оценки хранятся локально на вашем устройстве. Резервную копию можно сохранить в файл (при желании с шифрованием), чтобы иметь копию или перенести данные на другое устройство.

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
• 31 tests de condición física con varios intentos por alumno, ficha del alumno y baremos del centro
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
2. Approve or edit the wording (especially claims such as "31 fitness tests", which come from README.md).
3. Real-device screenshots (phone, and tablet if offered).
4. Store privacy sentence and Data safety answers (readiness doc §6).
5. Native-speaker review of the four non-English texts before production.
