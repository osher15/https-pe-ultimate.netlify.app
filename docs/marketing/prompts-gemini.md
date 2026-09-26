# פרומפטים ל־Gemini Omni: 10 שניות לקטע, 2 קטעים ביום

**למה Gemini מייצר רק את הקטעים האלה:** אלה צילומי «קולנוע» בלי טקסט ובלי ממשק. מודל וידאו מצייר ממשק מזויף ומשובש, ולכן את האפליקציה עצמה מראות הקלטות המסך האמיתיות.
כל קטע משמש את כל חמש השפות, כי אין בו דיבור ואין בו טקסט.

## איך מריצים (חשוב, כדי שלא יתבזבז קטע)
1. **מעתיקים את כל הפרומפט באנגלית כמו שהוא,** מתוך הבלוק. לא מקצרים ולא מתרגמים: המודל מדייק יותר באנגלית.
2. **ב־Gemini בוחרים יחס 9:16 ואיכות 1080p, אם יש אפשרות כזו.** הקטע הראשון חזר 1280×720 אופקי למרות הבקשה בטקסט. זה עובד, כי הנושא נשאר במרכז ואני חותך ל־9:16 מהמרכז, אבל התמונה יוצאת רכה יותר.
3. **אם אפשר לצרף תמונה, מצרפים ב־B פריים מתוך A,** כדי שזה ייראה כמו אותו מורה. הלבוש מתואר זהה בשני הפרומפטים.
4. **הסאונד לא משנה.** אני משתיק אותו ושם את הקריינות שלנו.
5. **שמירה:** `gemini_A.mp4`, `gemini_B.mp4` וכן הלאה. שולחים לי כקובץ בצ'אט, או כקישור לגוגל דרייב.

| יום | קטעים | למה |
|---|---|---|
| 1 | **A + B** | משלימים את שני הסרטונים שכבר אושרו: מורים, 30 ו־60 שנ׳ |
| 2 | **E + D** | גרסת המאמנים |
| 3 | **C** (+ **F** אם תרצה) | גרסת המנהלים, וצילום אמיתי לפוטו־פיניש |

**מה נכנס לפרסומת מכל קטע:**
- **A:** 5–6 השניות הראשונות. לכן הבעיה (ניירת שנופלת) קורית כבר ב־0–6.
- **B:** כ־3 שניות. הרגע החשוב (הקשה על הטלפון וחיוך) קורה ב־0–4.
- **שאר הקטעים:** 3–5 שניות, ואני בוחר את החלון הטוב ביותר.

---

## Grok או Gemini?
- **Grok** יוצר קטעים של 6 שניות. הקטע הראשון היה בחינם, ומהשני כבר בתשלום. 6 שניות מספיקות לפתיח (A) ולרגע הרגוע (B), כי מכל אחד מהם נכנסות 3–6 שניות.
- **GPT/Sora** (2–3 ביום במנוי): חלופה טובה ל־B כשהמכסה של Gemini נגמרה.
  - הקטע הראשון מ־Grok היה טוב מזה של Gemini, ועם הכתוביות הוא עובד יפה בפרסומת.
- **Gemini** נשאר לקטעים שצריכים 10 שניות, או כשרוצים 1080p.
- **הכיוון עכשיו: מציאותי, לא מבוים.**
  - רגע שכל מורה חווה, מצולם כאילו מישהו צילם בטלפון במקרה.
  - בלי גאגים ובלי מבט למצלמה. ההומור בא מזה שמזהים את עצמך.

### A ל־Meta: מתוסכלת ומצחיקה (5 שנ׳), אותה דמות מהקטע הקודם
בקטע האנכי הקודם המורה חייכה, ובפתיח היא צריכה להיות מתוסכלת. גם ההומור נעלם.
מבקשים מ־Meta לשמור על אותה דמות ואותה חדות, ומדביקים את זה:
```
Keep the exact same teacher, same face, same navy striped tracksuit, same gym, same image sharpness and lighting as the previous video — only the action changes.
Vertical 9:16, 5 seconds, candid documentary look with a light comedic tone, like a relatable moment from a TV comedy.
She is FRUSTRATED and overwhelmed the whole time — she does NOT smile at any moment.
0–1.5 s: she writes fast on her clipboard, the pen suddenly stops working; she shakes it hard, scribbles again, nothing — she frowns at the pen in disbelief.
1.5–3.5 s: three sweaty students crowd in from both sides at once, all pointing at the clipboard and talking over each other, each asking about their own result; one leans right over her papers; she looks from one to the other, eyebrows raised, completely overwhelmed.
3.5–5 s: a loose sheet slides off the clipboard to the floor; she freezes, closes her eyes, lets out a long exasperated breath, then gives a quick dry, deadpan glance straight at the camera — "this is my life".
The papers show only faint unreadable pencil lines. No text, no letters, no numbers, no logos. No smiling, no slapstick, no slow motion, no cuts.
```

### A ל־Grok: סוף שיעור אמיתי (6 שנ׳)
```
Vertical 9:16, 6 seconds, candid handheld documentary footage, as if filmed on a phone by a colleague, realistic and unstaged.
A real school gym at the end of a PE lesson: worn wooden floor, mixed fluorescent and window light, school bags and water bottles dumped on a bench.
A PE teacher in her mid-40s, dark hair tied back loosely, navy zip-up tracksuit, silver stopwatch on a black cord, stands by the bench holding a clipboard with a thick stack of papers.
0–3 s: five out-of-breath teenage students crowd around her at once, talking over each other and pointing at the clipboard, each asking what result they got; she flips through the pages searching for a name, crosses something out and rewrites it.
3–6 s: the bell rings off-screen; the students keep asking; she glances at the wall clock and lets out a quiet, tired breath, still writing.
Natural, unposed movement, nobody looks at the camera. The papers show only faint unreadable pencil lines.
No text, no letters, no numbers, no logos anywhere. No slapstick, no slow motion, no cuts.
```

### B ל־Grok: תלמיד רואה שהשתפר (6 שנ׳)
```
Vertical 9:16, 6 seconds, candid handheld documentary footage, as if filmed on a phone, realistic and unstaged, bright daylight in a school gym.
The same PE teacher in her mid-40s, dark hair tied back loosely, navy zip-up tracksuit, silver stopwatch on a black cord, holds a smartphone; next to her a 14-year-old student, sweaty and out of breath after a run, plain grey T-shirt.
0–3 s: the teacher taps the phone once and turns the screen toward the student; we only see the back of the phone, never the screen.
3–6 s: the student leans in, reads, and breaks into a shy, proud smile, trying not to show it too much; a friend behind him nudges his shoulder and grins; the teacher gives a small approving nod.
Natural, unposed, nobody looks at the camera.
No visible phone screen, no text, no letters, no numbers, no logos anywhere. No slow motion, no cuts.
```

**שמירה:** גם קטעי Grok נשמרים בשם `gemini_A.mp4` / `gemini_B.mp4`, כי הסקריפט מחפש את השמות האלה.
הפרומפטים ל־Gemini שלמטה ממשיכים לעבוד. מי שמשתמש בהם יכול לקחת משם את כיוון ה«מציאותי»: להוסיף `candid handheld documentary, unstaged` ולהוריד את המבט למצלמה.

---

## A: «עוד יום רגיל», הומור מזוהה (פתיח לגרסת המורים)
הגרסה הקודמת יצאה נכונה אבל יבשה: המורה כותבת, ושום דבר לא קורה.
כאן יש שלושה «אסונות קטנים» שכל מורה מכיר, ומבט יבש למצלמה בסוף. זה הרגע שנכנס לפרסומת (0–6 שנ׳).
```
Portrait orientation, 9:16 vertical video, 10 seconds, photorealistic, warm documentary look with a light comedic tone, like a relatable moment from a TV comedy, 24 fps.
Setting: an indoor school gymnasium in the late afternoon, warm sunlight through high windows, wooden floor with painted court lines, basketball hoops.
Main subject, always centered in the frame: a physical education teacher in her mid-30s, dark hair tied back, plain navy tracksuit with no logos, silver whistle on a black cord and a stopwatch around her neck, holding a clipboard stacked high with loose white paper sheets and a pen.
Background: about fifteen lively teenage students (13–15, mixed boys and girls, plain grey T-shirts and navy shorts, no logos, no numbers) running, laughing and chatting.
Timing:
0–2 s: she writes fast on the clipboard — the pen suddenly stops working; she shakes it hard and scribbles again, nothing comes out; she stares at the pen in disbelief.
2–4 s: two sweaty students jog up to her at the same time from both sides, both eagerly pointing at the clipboard, each clearly asking about their own result; she looks from one to the other, overwhelmed.
4–6 s: a basketball rolls in and bumps her leg; the stack of papers slides off the clipboard and the sheets flutter to the floor all around her. She freezes and turns her head slowly to look straight into the camera with a dry, deadpan "this is my life" expression.
6–10 s: she lets out a long breath, gives a small resigned shrug and a tired half-smile to the camera; the students behind her crack up laughing.
Camera: eye level, 40 mm lens, shallow depth of field, slow push-in from a medium shot to a medium close-up that ends on her deadpan look. Stable camera, one single continuous shot.
The teacher does not speak. Students may chat and laugh in the background.
The paper sheets show only faint, unreadable grey pencil lines — no letters, no numbers.
Avoid: any readable text, letters or numbers anywhere, logos, brand names, scoreboards, jersey numbers, exaggerated slapstick or falling down, extra or missing fingers, distorted hands or faces, cartoon or 3D-render look, slow motion, camera cuts.
```

## B: תלמיד רואה שהשתפר, מציאותי (רגע רגוע: מורים ומנהלים)
**עובד ב־Gemini, ב־GPT/Sora וב־Grok.** אם הכלי מאפשר לצרף תמונה, מצרפים את `ref_teacher.png`: המורה מהפתיח, שנשלחה בצ'אט.
רגע השיא, שנכנס לפרסומת, הוא ב־0–4 שנ׳. אם הכלי יוצר רק 5–6 שנ׳, זה מספיק.
```
Portrait orientation, 9:16 vertical video, 10 seconds, candid handheld documentary footage, as if filmed on a phone by a colleague, realistic and unstaged, 24 fps.
Setting: the same school gym, bright daylight through high windows, worn wooden floor, school bags on a bench.
Main subjects, centered: a PE teacher in her mid-40s with dark hair tied back loosely, navy zip-up tracksuit, a silver stopwatch on a black cord around her neck, holding a smartphone in a plain black case. Next to her, a 14-year-old boy, sweaty and out of breath after a run, plain grey T-shirt and navy shorts, no logos.
The phone screen faces the boy; from the camera we only ever see the back or the edge of the phone, never the screen.
Timing:
0–2 s: the boy, hands on his hips and breathing hard, looks at the teacher with a hopeful face; she taps the phone once and turns it toward him.
2–4 s: he leans in, reads, and breaks into a shy, proud smile he tries to hide; she gives a small, warm approving nod.
4–7 s: a friend behind him nudges his shoulder and grins; the boy laughs a little, embarrassed and happy.
7–10 s: the teacher turns back to the class, relaxed, a slight smile on her face; students jog in the background.
Natural, unposed movement, nobody looks at the camera. The teacher does not speak; students may chat quietly.
Avoid: a visible phone screen, any readable text, letters or numbers, logos, brand names, jersey numbers, exaggerated celebration, extra or missing fingers, distorted hands or faces, cartoon or 3D-render look, slow motion, camera cuts.
```

## E: מאמן כושר ואתלטים (פתיח לגרסת המאמנים)
```
Portrait orientation, 9:16 vertical video, 10 seconds, photorealistic, energetic sports-commercial look, 24 fps.
Setting: an outdoor athletics track at golden hour, low warm sun behind the runners, red track with white lane lines, green field beside it.
Main subject, centered: four teenage athletes (15–17 years old, mixed boys and girls, plain black and white running gear with no logos and no bib numbers) sprinting side by side in separate lanes toward the camera.
At the side of the track, near the finish line, a fitness coach in their 40s (plain grey hoodie, no logos) holds a stopwatch up in one hand and a phone in the other, the phone screen facing away from the camera.
Timing:
0–4 s: the athletes explode forward and sprint toward the camera at full speed.
4–7 s: they cross the finish line; the coach clicks the stopwatch at that exact moment, looks at it, and pumps his fist with a big grin.
7–10 s: one athlete, breathing hard, looks at the coach hopefully; the coach points at her and nods — a new personal best; she jumps and hugs a teammate.
Camera: low angle near the track surface, 35 mm lens, the camera tracks slowly backward as the runners approach. Real speed, not slow motion. Stable, no cuts.
The coach does not speak. Athletes may cheer.
Avoid: bib numbers, any readable text, letters or numbers, logos, brand names, scoreboards, a visible phone screen, extra or missing fingers, distorted limbs, faces or running motion, cartoon or 3D-render look, camera cuts.
```

## D: מאמן כדורסל מרוצה (רגע רגוע בגרסת המאמנים)
```
Portrait orientation, 9:16 vertical video, 10 seconds, photorealistic, warm cinematic look, 24 fps.
Setting: an indoor basketball court in the evening after practice, warm arena lights, polished wooden floor, basketballs resting near the bench.
Main subject, always centered: a youth basketball coach in their 40s (plain dark polo shirt with no logos) standing near the sideline, holding a phone in a plain black case whose screen faces away from the camera.
Timing:
0–4 s: a teenage player (about 16, plain white practice jersey with no numbers and no logos) walks up; the coach turns the phone toward the player (we see only the back of the phone); the player's eyebrows rise and a slow, proud smile spreads across his face.
4–7 s: the coach and the player share a knowing smile and a firm fist bump.
7–10 s: the player jogs back to his teammates, energized; the coach watches, pleased.
Camera: chest height, 50 mm lens, shallow depth of field, slow sideways tracking shot following the coach. Stable, no cuts.
The coach does not speak.
Avoid: a visible phone screen, jersey numbers, any readable text, letters or numbers, logos, brand names, scoreboards, extra or missing fingers, distorted hands or faces, cartoon or 3D-render look, slow motion, camera cuts.
```

## C: מנהל ומורה עוברים על נתונים (פתיח לגרסת המנהלים)
```
Portrait orientation, 9:16 vertical video, 10 seconds, photorealistic, clean corporate-documentary look, 24 fps.
Setting: a bright, modern school staff room in the morning, large window in the background showing students playing basketball outside, softly out of focus.
Main subjects, centered: a school principal in their 50s (plain light-blue shirt, no logos) sitting at a table holding a tablet in a plain grey case, and a physical education teacher in their mid-30s (plain navy tracksuit, no logos, silver whistle on a black cord) standing beside them.
The tablet screen always faces away from the camera, or is so out of focus that nothing on it can be read.
Timing:
0–4 s: seen slightly over the principal's shoulder, the principal scrolls on the tablet, pauses, raises an eyebrow in pleasant surprise and slowly smiles.
4–7 s: the principal looks up at the teacher and gives an impressed nod, as if to say 'well done'.
7–10 s: the teacher smiles back and gives a small confident nod; both look relaxed and pleased.
Camera: seated eye level, 50 mm lens, shallow depth of field, slow dolly-in. Stable, no cuts.
Nobody speaks, mouths stay closed.
Avoid: a readable tablet screen, charts with text, any readable text, letters or numbers, logos, brand names, extra or missing fingers, distorted hands or faces, cartoon or 3D-render look, slow motion, camera cuts.
```

## F (רשות): צילום אמיתי לפוטו־פיניש
אם יש קטע כזה, אני מזין אותו כ«מצלמה» לפוטו־פיניש האמיתי של האפליקציה. זו החלופה לסימולציה עם הנקודות הצבעוניות.
המנוע יזהה את הרצים שחוצים את הקו, וכך בפרסומת רואים את המערכת האמיתית עובדת על צילום אמיתי.
כאן, בשונה משאר הקטעים, המצלמה חייבת להיות **קבועה לגמרי**, והרצים צריכים לנוע **מימין לשמאל**.
```
Horizontal 16:9 video, 10 seconds, photorealistic, 30 fps.
A completely static camera on a tripod, side view, placed exactly perpendicular to the finish line of a red school running track, about 8 meters from the lanes. The camera does not move, pan, zoom or shake at any moment.
Four teenage runners (15–17, mixed, plain black and white running gear, no logos, no bib numbers) in four separate lanes sprint across the frame from the right edge to the left edge at slightly different speeds, and all four cross the middle of the frame between 3 and 7 seconds.
Bright even daylight, no strong shadows, plain green grass in the background, nothing else moving in the background.
Real speed, not slow motion. No cuts. Nobody speaks.
Avoid: camera movement of any kind, people or objects moving in the background, bib numbers, any readable text, letters or numbers, logos, distorted limbs or running motion, cartoon or 3D-render look, slow motion.
```

---

## אם משהו יוצא לא טוב, מה לשנות בניסיון הבא

| מה קרה | מה מוסיפים או משנים בפרומפט |
|---|---|
| הופיע טקסט, לוגו או מספרים | להוסיף בהתחלה: `Absolutely no text, letters, numbers or logos anywhere in the frame.` |
| ידיים או אצבעות מעוותות | להחליף את המצלמה ב־`medium-wide shot, hands small in frame` |
| מסך הטלפון נראה | להוסיף: `The phone is always seen from behind; its screen is never visible.` |
| המורה או המאמן מדברים | להוסיף: `The teacher keeps her mouth closed; only background students talk.` |
| יצא יבש, בלי רגש | לחזק את רגע השיא: `Exaggerate the facial expression slightly, like a TV comedy / sports commercial.` |
| יצא בהילוך איטי | להוסיף: `Real-time speed, no slow motion, no speed ramps.` |
| יצאו חיתוכים או כמה שוטים | להוסיף: `One single continuous shot.` |
| הנושא בצד הפריים | להוסיף: `The main subject stays exactly in the horizontal center of the frame.` |
| ב־B זה לא נראה אותו מורה | לצרף פריים מ־A כתמונת רפרנס, או להשתמש ב־B כמו שהוא. זה פחות קריטי, כי B נמשך רק 3 שניות |

**הקבצים נכנסים לבד:** `tools/marketing-assemble.js` מחפש `gemini/gemini_A.mp4` וכן הלאה. אם הקובץ קיים, הוא נכנס במקום כרטיס ממלא המקום. אם הפורמט לא אנכי, הקטע נחתך ל־9:16 מהמרכז.
