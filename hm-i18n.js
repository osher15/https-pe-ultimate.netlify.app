"use strict";
/* ============================================================
   מודול 0 — שפות (I18N)
   ------------------------------------------------------------
   האפליקציה נכתבה עברית, והמחרוזות יושבות ישירות בקוד ובמרקאפ.
   כ-5,600 מהן. תרגום מכונה של כולן היה מייצר מינוח מקצועי שגוי
   בחינוך גופני, ולכן הגישה כאן היא הדרגתית ובטוחה:

     · מפתח שאין לו תרגום נופל חזרה לעברית, ולא לטקסט ריק.
     · המעטפת (ניווט, בית, הגדרות, כפתורים, מסך כניסה) מתורגמת
       במלואה — זה מה שמשתמש חדש פוגש.
     · הכותרות במסכים המקצועיים (שמות מבחנים, משחקים, תרגילים,
       לשוניות וכפתורים) מתורגמות דרך מילון המונחים ב-hm-terms.js,
       שנבנה מחיפוש מינוח בשטח בכל שפה — ראו applyTerms למטה.
     · כל שאר התוכן (תיאורי משחקים, שלבי מערך, הסברי תרגילים, הודעות)
       מתורגם ב-hm-texts.js באותו מנגנון — כולל משפטים עם ערכים משתנים,
       חלונות alert/confirm, טקסט על קנבס וחלונות הדפסה. מי שבוחר שפה
       אחרת לא אמור לראות עברית. התרגום הוא טיוטה לעריכת שפת־אם.

   אין ספרייה ואין שלב בנייה: הכול בקובץ אחד כדי שהאפליקציה
   תמשיך לעבוד גם כקובץ יחיד מ-file:// ובלי רשת.
   ============================================================ */
window.I18N=(function(){

const LANGS=[
  {code:"he", name:"עברית",   native:"עברית",    dir:"rtl", flag:"🇮🇱"},
  {code:"en", name:"אנגלית",  native:"English",  dir:"ltr", flag:"🇬🇧"},
  {code:"ar", name:"ערבית",   native:"العربية",  dir:"rtl", flag:"🇸🇦"},
  {code:"ru", name:"רוסית",   native:"Русский",  dir:"ltr", flag:"🇷🇺"},
  {code:"es", name:"ספרדית",  native:"Español",  dir:"ltr", flag:"🇪🇸"}
];

/* ---------- מילון המעטפת ----------
   מפתח = נתיב קצר ויציב. עברית היא מקור האמת: מפתח שחסר בשפה
   אחרת נופל אליה אוטומטית. */
const DICT={
he:{},   /* ריק בכוונה — עברית היא ברירת המחדל שבמרקאפ עצמו */

en:{
  /* ux-redesign */
  "pf.tRace":"🏁 Race",
  "pf.tSetup":"📐 Setup",
  "pfw.s0":"Position",
  "pfw.s1":"Finish line",
  "pfw.s2":"Start",
  "pfw.s3":"Detection",
  "pfw.s4":"Race details",
  "pfw.lineHint":"Line up the red line in the image above. ⇋ flips the image, ＋/－ zoom in and out — and zooming also improves accuracy.",
  "pfw.metaP":"The distance decides which test the times go into when you save to the class (60 m → 60 m run). The name, round and wind appear on the board, the certificates and the report.",
  "pfw.done":"✓ Ready — to the race",
  "pf.saveCls":"🏅 Save to class",
  "pf.saveTo":"🏅 Save to {0}",
  "pf.share":"📤 Share / export",
  "pf.arcFold":"🗄 Race archive",
  "bt.saveCls":"🏅 Save to class",
  /* ux-redesign */
  "prep.today":"today",
  "prep.tomorrow":"tomorrow",
  "prep.title":"To prepare",
  "prep.sub":"Upcoming lessons without a plan yet",
  "prep.btn":"Prepare plan",
  "ui.day":"Day",
  "asg.btn":"📌 Assign to lesson",
  "asg.title":"Assign to a lesson",
  "asg.hint":"The plan will appear on «Today» and open by itself when the lesson starts.",
  "asg.this":"assigned",
  "asg.other":"replaces a plan",
  "asg.noSlots":"This class has no lessons in the timetable in the next two weeks — pick a date.",
  "asg.toDate":"Assign to date",
  "asg.pickCls":"Pick a class.",
  "asg.done":"Plan assigned to ",
  "pe.newStep":"New step",
  "pe.edit":"✎ Edit steps",
  "pe.done":"✓ Done editing",
  "pe.add":"+ Step",
  "pe.total":"Total",
  "ls.ready":"⚡ Plan ready — edit it, assign it to a lesson or save it",
  "gm.added":"added to the plan on screen",
  /* ux-redesign */
  "area.cls":"Class hub",
  "hub.title":"Class hub",
  "hub.class":"Class",
  "hub.group":"Group",
  "hub.fit":"Fitness",
  "hub.meas":"measurements",
  "hub.testsN":"different tests",
  "hub.lastMeas":"last",
  "hub.groupNote":"The full screens (students, grades, fitness tests) work per class — open them through the classes in the group.",
  "hub.students":"Students",
  "hub.inList":"on the list",
  "hub.openList":"Student list",
  "hub.att":"Attendance",
  "hub.lessonsMarked":"lessons with attendance",
  "hub.noAtt":"No attendance marked yet",
  "hub.partPct":"participation",
  "hub.openAtt":"Attendance and report",
  "hub.openIdx":"Fitness index",
  "hub.openCov":"What's missing",
  "hub.openProg":"Progress",
  "hub.grades":"Grades",
  "hub.graded":"with a final grade",
  "hub.openGrades":"Grade table",
  "hub.assess":"Assessments",
  "hub.peerN":"peer assessments",
  "hub.openPeer":"Peer assessment",
  "hub.openRub":"Rubrics",
  "hub.empty":"No classes yet. Add a class here — grade and number — and then its student list.",
  "hub.addCls":"New class",
  "hub.addBtn":"Add class",
  "hub.inLesson":"in a lesson now",
  /* ux-redesign */
  "end.attDone":"Attendance marked",
  "end.attPart":"Attendance: marked",
  "end.attRest":"Everyone else is present",
  "info.live.s":"▶ Lesson mode",
  "info.live.w":"The screen you hold on the field — everything in view, and the class already known.",
  "info.live.l":"<li><b>Tap a class</b> to open a lesson. The class that's on your timetable right now is offered first.</li><li><b>The tiles</b> — attendance, measure, beep, photo finish, timer, teams and random pick — save everything to the lesson's class, without picking it again.</li><li><b>✓ Everyone's here</b> marks the whole class in one tap. Mark the exceptions in the attendance tile.</li><li><b>Leave</b> doesn't end the lesson — the middle button in the bar brings you back. <b>⏹ End lesson</b> saves a rating and a note.</li>",
  /* ux-redesign */
  "u.m":"m",
  "u.kmh":"km/h",
  "bt.sumStd":"standard",
  "bt.sumCustom":"⚠ custom",
  /* ux-redesign */
  "nav.today":"Today",
  "nav.prep":"Prep",
  "nav.live":"Lesson",
  "nav.classes":"Classes",
  "ui.lang":"Interface language",
  "ui.min":"min",
  "area.plans":"Plans",
  "area.games":"Games",
  "area.fit":"Exercises & timers",
  "area.know":"Knowledge",
  "area.nut":"Nutrition",
  "area.stu":"Students and grades",
  "area.ft":"Fitness tests",
  "area.tools":"Class tools",
  "home.quick":"Measuring tools — no lesson needed",
  "home.qFt":"Fitness tests",
  "home.qBeep":"Beep test",
  "home.qPhoto":"Photo finish",
  "home.qTimer":"Timer",
  "home.more":"Weekly challenge, numbers and a field tip",
  "set.guide":"Guide to the screen you came from",
  "set.secGeneral":"General",
  "set.secGeneralSub":"Language, school, look and sounds",
  "set.secYear":"Start of the year",
  "set.secYearSub":"Timetable, teaching groups and class names",
  "set.secBackup":"Backup and sync",
  "set.secBackupSub":"Backup file, Google Drive and records sync",
  "set.secAdv":"Advanced",
  "set.secAdvSub":"Install, data clean-up, update and about",
  "live.blocked":"A lesson is already open with",
  "live.cantStart":"Couldn't open the lesson",
  "live.started":"Lesson started",
  "live.sugNow":"now in timetable",
  "live.sugNext":"next in timetable",
  "live.which":"Which class?",
  "live.whichHint":"Tap a class to open a lesson. Attendance, measurements and teams will be saved to that class.",
  "live.planWill":"The plan on screen will open with it:",
  "live.students":"students",
  "live.noClasses":"No classes yet. Pick a grade and number below — the class will be registered and saved.",
  "live.other":"Another class — grade and number",
  "live.startCls":"Start lesson",
  "live.noClassTools":"Tools without a class",
  "live.tMeas":"Measure",
  "live.tMeasSub":"31 fitness tests",
  "live.tBeep":"Beep test",
  "live.tBeepSub":"Start and record drop-outs",
  "live.tPhoto":"Photo finish",
  "live.tPhotoSub":"Camera and lanes",
  "live.tTimer":"Timer",
  "live.tTimerSub":"Intervals · stations",
  "live.tTeams":"Teams",
  "live.tTeamsSub":"Balanced, from those present",
  "live.tPick":"Random pick",
  "live.tPickSub":"No repeats in a round",
  "live.tGames":"Games",
  "live.tGamesSub":"Rules and explanation",
  "live.tAtt":"Attendance",
  "live.step":"Step",
  "live.next":"Next:",
  "live.last":"Last step",
  "live.planBtn":"Full plan",
  "live.nextBtn":"Next step",
  "live.noPlan":"No plan for this lesson.",
  "live.choosePlan":"Choose or build a plan",
  "live.present":"present",
  "live.absent":"absent",
  "live.notMarked":"Not marked yet",
  "live.noRoster":"No class list",
  "live.measDone":"measurements this lesson",
  "live.allIn":"Everyone's here",
  "live.leave":"Leave — lesson keeps running",
  "live.end":"End lesson",
  "live.markedIn":"marked present. Mark the exceptions in Attendance",
  "live.continues":"The lesson keeps running. ▶ in the bar brings you back",
  /* --- מסך כניסה --- */
  "brand.word":"PE", "brand.full":"PE Ultimate", "about.title":"📘 About PE Ultimate",
  /* --- ביפ טסט --- */
  "bt.setup":"Test setup", "bt.dist":"Shuttle length", "bt.speed":"Stage 1 speed (km/h)",
  "bt.std":"↺ Standard (8.0)", "bt.proto":"Standard protocol", "bt.protoOff":"Modified protocol",
  "bt.saveProf":"💾 Save profile", "bt.profDel":"Delete profile", "bt.prof":"— profile —",
  "bt.age":"Class age", "bt.sex":"Sex (for norms)",
  "bt.voice":"Voice announcements", "bt.beeps":"Beeps",
  "bt.warn":"⚠️ The protocol differs from the standard (20 m, start ≥ 8.0 km/h) — VO₂max values are shown as an estimate only.",
  "bt.live":"Test running", "bt.ready":"Ready to start", "bt.paused":"Paused", "bt.ended":"Finished",
  "bt.metres":"m", "bt.stage":"Stage · shuttle", "bt.time":"Time", "bt.speedNow":"Speed",
  "bt.inStage":"Progress within stage", "bt.vo2":"Current VO₂max",
  "bt.start":"▶ Start", "bt.reset":"↺ Reset",
  "bt.drop":"🛑 Record drop-out · student stopped",
  "bt.laneMode":"Record by lane number", "bt.laneN":"How many lanes",
  "bt.undo":"↩ Undo last entry",
  "bt.keys":"Shortcuts: Space = start/pause · Enter = record",
  "bt.heat":"Heat roster", "bt.loadCls":"👥 Load class", "bt.clearCls":"✕ Clear",
  "bt.heatHint":"Load a class and tap the student who stopped instead of the big button — the name lands in the board exactly, with no typing afterwards.",
  "bt.board":"Results", "bt.byOrder":"By order", "bt.byDist":"By distance",
  "bt.toTrack":"⇧ Save to tracking", "bt.toFt":"🏅 Send to fitness tests",
  "bt.cRank":"Rank", "bt.cName":"Name", "bt.cStage":"Stage·shuttle", "bt.cDist":"Distance",
  "bt.cCat":"Category",
  "bt.empty":"No entries yet.", "bt.emptyHint":"During the run — when a student stops, press the record button and they enter the board.",
  "bt.refTable":"📋 Full stage and distance table",
  "bt.normTable":"📚 VO₂max norms table (FITNESSGRAM®)",

  /* --- פוטו־פיניש --- */
  "pf.tLive":"🎯 Live lane", "pf.tStrip":"🎞 Finish image", "pf.tRes":"🏁 Results",
  "pf.tLaps":"🔄 Laps", "pf.tArc":"🗄 Archive", "pf.tMeta":"📋 Race details",
  "pf.sim":"Simulation", "pf.cam":"Camera", "pf.simMode":"Simulation mode",
  "pf.gun":"🔫 Start", "pf.stop":"⏹ Stop race", "pf.resetRace":"↺ Reset race",
  "pf.line":"Finish-line position", "pf.sens":"Detection sensitivity ·",
  "pf.slit":"Slit width ·", "pf.minT":"Min. gap (s)",
  "pf.autoDetect":"Automatic motion detection at the finish line",
  "pf.micStart":"Audio start — gun / hand clap (microphone)",
  "pf.gunDist":"Microphone distance from the starter (m)", "pf.noOffset":"no offset",
  "pf.lanes":"Lanes and competitors", "pf.loadCls":"👥 Load class",
  "pf.paste":"📋 Paste list", "pf.editNames":"✎ Edit names",
  "pf.laneCount":"Number of lanes ·",
  "pf.tapHint":"Tapping a lane records a crossing now · keys 1–9 do the same from the keyboard.",
  "pf.sanity":"✅ One-minute sanity check — before every race",
  "pf.board":"Official results", "pf.cLane":"Lane", "pf.cTime":"Time",
  "pf.cGap":"Gap", "pf.cSrc":"Source",
  "pf.emptyRes":"No results yet. Run a race or import a CSV.",
  "pf.ai":"🎙️ Commentary report", "pf.arcSave":"💾 Save to archive",
  "pf.csv":"⬇ Export CSV", "pf.sheet":"🖼 Image + table",
  "pf.cert":"🖨 Winner certificate", "pf.mail":"✉ Send results",
  "pf.addRow":"＋ Row", "pf.numbers":"🔢 Bib numbers",

  /* --- תלמידים --- */
  "stu.tabList":"👥 My students", "stu.tabGrades":"📊 Grades", "stu.tabPeer":"🤝 Peer assessment",
  "stu.title":"My students", "stu.search":"Search", "stu.searchPh":"Student name",
  "stu.sort":"Sort", "stu.sName":"By name", "stu.sCls":"By class",
  "stu.sVo2":"VO₂max — high to low", "stu.sVo2a":"VO₂max — low to high",
  "stu.sTrend":"Declining first", "stu.sTests":"Fewest measurements",
  "stu.add":"+ Add students", "stu.fromBeep":"⇩ From the beep board", "stu.csv":"⬇ Class CSV",
  "stu.count":"Students", "stu.avg":"Average VO₂max",
  "stu.below":"Health risk", "stu.falling":"Declining",
  "stu.allCls":"All classes",
  "stu.empty":"No students yet.", "stu.emptyHint":"Add a list manually, or import names from the beep test board.",
  "lock.sub":"Teacher area — enter your code",
  "lock.enter":"Teacher sign-in",
  "lock.or":"or",
  "lock.student":"👦 Student entry — no code",
  "lock.studentNote":"Student mode: view the records board and the games page, and submit a new record for teacher approval. No access to students, tests, settings or record approval.",
  "lock.demo":"🎬 Demo mode — take a tour, no code",
  "lock.demoNote":"Demo: a sample class with results, so you can see how everything works before entering real students. You can clear the demo data with one tap.",
  "lock.aboutQ":"What is this?",
  "lock.aboutA":"A field toolkit for PE teachers: fitness tests, beep test, camera photo-finish, lesson plans, records and grades.",
  "lock.dataQ":"Where is the data?",
  "lock.dataA":"On this device only. No server, no account, nothing is sent anywhere.",
  "lock.newCode":"Set a teacher code — pick one only you know",
  "lock.setCode":"Set code and enter",
  "lock.newCodePh":"New code",
  "lock.welcome":"Welcome back, coach 👋",
  "lock.wrong":"Wrong code",
  "lock.tooShort":"Pick a code of at least 4 digits",
  "lead.title":"Just before you start",
  "lead.sub":"The app is completely free — no credit card, no payment, no commitment. Leave a few details so we can send you a short feedback questionnaire — it will help us improve the app and make it more professional going forward.",
  "lead.contactHint":"Mobile or email — either one is enough. It's just a way to reach you, nothing more.",
  "lead.first":"First name",
  "lead.last":"Last name",
  "lead.phone":"Mobile",
  "lead.email":"Email",
  "lead.send":"Send and continue",
  "lead.note":"No cost and no credit card — the app is free. These details are sent directly to us just to get in touch with you. Everything else — students, grades, measurements — stays on your device only, as always.",

  /* --- ניווט --- */
  "nav.home":"Home", "nav.tests":"Tests", "nav.lesson":"Lesson",
  "nav.beep":"Beep", "nav.photo":"Finish", "nav.records":"Records",
  "nav.games":"Games", "nav.more":"More", "nav.back":"Back",

  /* --- דף הבית --- */
  "home.greet":"Good day,", "home.coach":"Coach.",
  "home.statRuns":"races timed", "home.statBeep":"best beep",
  "home.statRecs":"records approved", "home.statStu":"students tracked",
  "home.today":"My lessons today", "home.schedEdit":"🗓 Timetable",
  "home.lastLesson":"Last lesson", "home.allLessons":"📖 All lessons",
  "home.ft":"Fitness tests",
  "home.ftSub":"31 tests · stopwatch and counter · class roster · fitness index",
  "home.lesson":"Lesson plans",
  "home.lessonSub":"warm-up → stations → measurement · fast or hand-built",
  "home.beep":"Beep test",
  "home.beepSub":"audio-clock accurate beeps · VO₂max · FITNESSGRAM norms",
  "home.photo":"Photo-finish",
  "home.photoSub":"camera timing · sprints · laps · certificates",
  "home.know":"Knowledge",
  "home.knowSub":"official sources · evidence-informed programs · games",
  "home.more":"More options",
  "home.moreSub":"school champions · students and grades · knowledge · class tools · nutrition",
  "home.challenge":"Challenge of the week",
  "home.chPlus":"+ add count", "home.chEdit":"✎ new challenge",
  "home.tip":"Field tip",

  /* --- תפריט «עוד» --- */
  "more.title":"\u2630 Menu",
  "more.home":"What now \u2014 home", "more.sched":"Timetable", "more.groups":"Teaching groups",
  "more.ft":"Fitness tests", "more.lesson":"Lesson plans", "more.beep":"Beep test", "more.photo":"Photo finish",
  "more.guide":"Screen guide", "more.settings":"Settings and backup",
  "more.records":"School champions", "more.students":"Students and grades",
  "more.knowledge":"Knowledge", "more.tools":"Class tools", "more.nutrition":"Nutrition corner",

  /* --- הגדרות --- */
  "set.title":"Settings",
  "set.school":"School name (appears in the header, on certificates and in TV mode)",
  "set.theme":"Colour theme",
  "set.themeHint":"«Day» and «Bright sun» are made for outdoor use — a light background and high contrast that stay readable in direct sunlight.",
  "set.sound":"Sounds", "set.voice":"Voice announcements",
  "set.wake":"Keep the screen awake during activity",
  "set.lock":"Lock the teacher area on entry",
  "set.touch":"Large buttons (one-handed use during a lesson)",
  "set.save":"Save", "set.saved":"Settings saved",
  "set.clsTitle":"🏷 Class names",
  "set.clsHint":"Renaming only changes the name. Students, measurements and lessons of the class stay with it — they are identified by a fixed id, not by the name.",
  "set.clsPick":"Class", "set.clsCurLbl":"Current name", "set.clsNewLbl":"New name",
  "set.clsNewPh":"e.g. 9th grade, section 3 — Honors", "set.clsSaveBtn":"Save",
  "set.lang":"Language", "set.langHint":"The interface changes language immediately. All content — screens, tests, games, lesson plans, the knowledge base and messages — is translated. The translation is a professional draft awaiting native-speaker review.",
  "set.about":"📘 About, version and credits",
  "set.purge":"🧹 Clear old data",
  "set.install":"📲 Install as an app: in Chrome — menu ⋮ then \"Add to Home screen\". On iPhone — Share then \"Add to Home Screen\". Saved as a file, the app works without internet too (only the fonts load from the network).",

  /* --- גיבוי --- */
  "bk.title":"💾 Backup and restore",
  "bk.body":"All your data — students, results, records, grades, norms and settings — is stored <b>on this device only</b>. A broken device or clearing site data means it is gone, with no way back. One backup file solves that, and also moves everything to a new device or another teacher.",
  "bk.export":"⬇ Back up everything to a file",
  "bk.import":"⬆ Restore from a file",
  "bk.encrypt":"🔐 Encrypt the backup with a password",
  "bk.encryptHint":"An encrypted file can be kept in Drive or sent by email without anyone — not even the storage service — being able to read it. <b>No password recovery:</b> lose the password, lose the file. That is what real encryption means. Without this checkbox — a plain, unencrypted file that any JSON-reading tool can open.",
  "bk.pass":"Password", "bk.passAgain":"Again, to confirm",
  "bk.passTitleNew":"🔐 Backup password", "bk.passTitleOpen":"🔐 This file is encrypted",
  "bk.passHintNew":"Choose a password. <b>There is no way to recover it</b> — save it somewhere you will remember, or the file is lost.",
  "bk.passHintOpen":"This file is encrypted. Enter the password it was created with.",
  "bk.passShort":"Password must be at least 8 characters.",
  "bk.passMismatch":"The two passwords do not match.",
  "bk.passWrongLeft":"Wrong password — {n} attempts left",
  "bk.passWrongFinal":"Wrong password. The file was not opened.",
  "bk.never":"never backed up",
  "bk.lastAt":"last backup",
  "bk.groups":"data groups",
  "bk.restoreTitle":"⬆ Restore from a backup file",
  "bk.restoreHint":"This is what the file contains. Restoring <b>replaces</b> the data on this device — so back up the current state first.",
  "bk.colItem":"Data", "bk.colFile":"In file", "bk.colHere":"On device now",
  "bk.safety":"⬇ Back up the current state first",
  "bk.go":"✓ Restore and replace",
  "bk.cancel":"Cancel",
  "bk.confirm":"Restore? All data on this device will be replaced by the data in the file.",
  "bk.done":"✓ Restored — reloading",
  "bk.bad":"That file is not a PE Ultimate backup",

  /* --- כללי --- */
  "thm.dark":"Night", "thm.turf":"Turf", "thm.slate":"Slate", "thm.day":"Day", "thm.sun":"Bright sun",
  "i18n.partial":"Fully translated (draft awaiting native-speaker review).",
  "ui.close":"Close", "ui.cancel":"Cancel", "ui.save":"Save", "ui.delete":"Delete",
  "ui.edit":"Edit", "ui.add":"Add", "ui.export":"Export", "ui.import":"Import",
  "ui.search":"Search", "ui.sort":"Sort", "ui.class":"Class", "ui.grade":"Year",
  "ui.name":"Name", "ui.date":"Date", "ui.result":"Result", "ui.score":"Score",
  "ui.boys":"Boys", "ui.girls":"Girls", "ui.all":"All", "ui.none":"None",
  "ui.yes":"Yes", "ui.no":"No", "ui.back":"Back", "ui.next":"Next", "ui.done":"Done",
  "ui.sun":"Bright-sun mode — high contrast for daylight",
  "ui.sunOff":"Back to the normal theme",
  "ui.menu":"Menu \u2014 every screen",
  "ui.settings":"Settings",
  "ui.info":"Quick guide — what this screen does",
  "ui.demoBar":"Demo mode", "ui.demoNote":"— the data here is a sample",
  "ui.demoClear":"Clear demo data",
  "ui.explain":"Explanation",

  /* --- תזונה --- */
  "nut.daily":"Tip of the day",
  "nut.say":"🔊 Read to the class",
  "nut.shuffle":"🔀 Another tip",
  "nut.all":"All tips",
  "nut.c.all":"All",
  "nut.c.before":"Before activity",
  "nut.c.after":"After activity",
  "nut.c.water":"Hydration",
  "nut.c.food":"Athlete's plate",
  "nut.c.myth":"Myth busters",
  "nut.tip.0":"1.5–2 hours before an intense lesson: an easy-to-digest carbohydrate — a slice of bread with honey, a banana, porridge. Nothing fried, nothing fatty.",
  "nut.tip.1":"Half an hour before a beep test or an exam — water only. Eating too close to effort = side stitches and heaviness.",
  "nut.tip.2":"Lesson in first period? A small breakfast beats nothing: yoghurt, fruit, a slice of bread. A fasting body tires faster.",
  "nut.tip.3":"The recovery window: within an hour after effort — carbohydrate + protein. Chocolate milk and a cheese sandwich are a great, simple combination.",
  "nut.tip.4":"Stiff muscles the next day? That's natural DOMS. Water, protein at meals and light movement beat complete rest.",
  "nut.tip.5":"Rule of thumb for a lesson: a glass of water before, a sip every 15 min, a glass at the end. In summer — double it.",
  "nut.tip.6":"Urine colour = the easiest dehydration gauge. Darker than pale lemonade? You're short of fluids even before you feel thirsty.",
  "nut.tip.7":"Energy drinks are off-limits before sport for teenagers — caffeine raises the heart rate and masks signs of overload. Water always wins.",
  "nut.tip.8":"A balanced plate: half vegetables, a quarter protein (chicken/fish/legumes/egg), a quarter whole-grain carbohydrate. Simple — and that's 80% of the job.",
  "nut.tip.9":"Iron is especially important for active adolescents (and especially for girls): lean meat, legumes, tahini. Iron deficiency = fatigue in the beep test.",
  "nut.tip.10":"Calcium + vitamin D during adolescence build the peak bone mass of a lifetime. Dairy, tahini, sunshine outdoors — exactly what a PE lesson provides.",
  "nut.tip.11":"«Protein = muscle»? The amount of protein the body can use is limited. A training teenager needs ~1.2–1.6 g per kg from ordinary food — powders are unnecessary at school age.",
  "nut.tip.12":"«Sweating = losing weight»: sweat is fluid loss, not fat. The weight comes back with a glass of water. What counts is the energy balance over time.",
  "nut.tip.13":"«Carbs make you fat»: for a young athlete, carbohydrate is fuel. No fuel — no good beep test. The question is which carbohydrate and how much, not whether.",
  "nut.tip.14":"Extreme diets during adolescence harm growth and performance. A student talking about fasting or a harsh diet deserves a quiet conversation and a referral to the school counsellor.",

  /* --- טיפי שטח בדף הבית --- */
  "home.tip.0":"Beep test: stand at the end of the track so the whole class hears the speaker — and turn the volume up before the start.",
  "home.tip.1":"Photo-finish: enter the runners in lane order from fastest to slowest — detection assigns times in list order.",
  "home.tip.2":"TV mode on the records board is great for the school entrance — connect a computer to a screen via HDMI and press 📺.",
  "home.tip.3":"The fitness dice works great as a warm-up: 3 rolls = a full warm-up, and no student argues with a dice.",
  "home.tip.4":"The phone screen won't switch off mid-activity — keep-awake is active while a timer runs (you can turn it off in Settings).",
  "home.tip.5":"You can install the app on your home screen — browser menu, then «Add to Home screen».",
  "home.onboard":"New here? Tap 🎬 «Demo mode» on the sign-in screen — a sample class with real results, so you can see how everything works before entering real students.",

  /* --- פוטו־פיניש: הדרכת פתיחה --- */
  "pfg.title":"📷 Photo-finish — 4 steps",
  "pfg.prev":"← Previous",
  "pfg.next":"Next →",
  "pfg.go":"Let's measure",
  "pfg.skip":"Don't show again",
  "pfg.0.h":"Mount the phone — not in your hand",
  "pfg.0.p":"The camera must see the <b>finish line from the side</b>, at roughly chest height. A tripod, a fence, a bench or a bag — anything stable. A one-centimetre shift moves the line, and every time moves with it.",
  "pfg.1.h":"Align the red line with the finish line",
  "pfg.1.p":"Move «Finish-line position» until the red line on the screen sits <b>exactly</b> on the finish line on the field. This is the one setting where a mistake invalidates the whole heat.",
  "pfg.2.h":"If there is a starting gun — enter the distance from it",
  "pfg.2.p":"Sound travels 343 m per second. A camera standing 34 m from the start hears the shot a tenth of a second late, and every time comes out short by exactly that tenth. Entering the distance cancels it out.",
  "pfg.3.h":"For a close finish — tap the runner in the image",
  "pfg.3.p":"After the heat, in «🎞 Finish image», tapping the runner's torso gives a time interpolated between the columns. <b>More accurate than the automatic trigger</b> — this is how to work a final.",

  /* --- פוטו־פיניש: בדיקת שפיות --- */
  "pfs.title":"✅ One-minute sanity check",
  "pfs.hint":"Do this once at every new location. It is what separates a measurement from a number that only looks like one.",
  "pfs.list":"<li><b>The phone is stable.</b> Tripod, fence or bag — not in your hand. A one-centimetre shift moves the finish line.</li><li><b>The status line is green:</b> «🟢 Camera active · detection armed». Stuck on «Calibrating background…» = something is moving or the lighting is changing.</li><li><b>A student walks across.</b> The beep must sound <b>exactly</b> when they are on the line. Too early — the red line is not on the finish line; fix it in «Finish-line position».</li><li><b>After the heat</b> — «🎞 Finish image» shows a time resolution of ±X ms. That is a real measurement from your phone, not a promise.</li><li><b>For a close finish:</b> tap the runner in the strip. Interpolating between columns is more accurate than the automatic trigger.</li>",
  "pfs.ok":"Got it — let's go",

  /* --- פוטו־פיניש: מספרי חזה --- */
  "pfn.title":"🔢 Bib numbers",
  "pfn.hint":"When runners wear bib numbers rather than following a list — enter the number for each lane here. It appears on the board, in exports and on the certificate. Leave a lane empty if nobody runs in it.",

  /* --- מדריך מהיר (ℹ) --- */
  "info.title":"ℹ️ Quick guide",
  "info.top":"One field kit: fitness tests, beep test, photo-finish, lesson plans, records, attendance and grades. It works without reception too, and all data is stored <b>on this device only</b> — so back up to a file from time to time (⚙ Settings → «Back up everything to a file»).",
  "info.home.s":"🚀 Where to start",
  "info.home.w":"Three steps, once, and you're ready to work.",
  "info.home.l":"<li><b>Teacher code</b> is set on first sign-in, and protects the teacher area when the phone changes hands.</li><li><b>🎬 Demo mode</b> on the sign-in screen — a sample class with results, so you can see how everything works before entering real students. Clear it with one tap.</li><li><b>One real class</b> — «Fitness tests» → pick year and number → «👥 Roster». From then on the same roster is available on every other screen.</li>",
  "info.ft.s":"🏅 Fitness tests",
  "info.ft.w":"The heart of the app: 31 tests with a stopwatch and counter. Pick a class and a test, and enter a result for each student.",
  "info.ft.l":"<li><b>🏅 Tests</b> the screen where you actually measure. Every result is saved to the student and never deleted.</li><li><b>📊 Fitness index</b> an overall fitness score for each student against the norms.</li><li><b>🏅 PE badge</b> who meets the requirements and what they still need.</li><li><b>📋 What the class is missing</b> who has already been measured in each test and who hasn't — instead of searching through lists.</li><li><b>📈 Progress insights</b> for each test: how many improved, how many declined, how many unchanged.</li>",
  "info.lesson.s":"📋 Lesson plans",
  "info.lesson.w":"A complete plan — warm-up, stations, game and cool-down — in one tap or built by hand.",
  "info.lesson.l":"<li><b>⚡ Quick</b> pick a topic, year, length and venue — the plan builds itself, linked to the standards.</li><li><b>🧩 Manual builder</b> assemble the lesson yourself from ready-made stages.</li><li><b>▶ Start lesson</b> opens an «active lesson», and every measurement from then on is logged to it. If the button asks for a class — «🏷 Pick class» next to it.</li><li><b>💾 Save · 🖨 Print</b> the plan is saved to the library for reuse next year.</li>",
  "info.fit.s":"⏱ Fitness",
  "info.fit.w":"The tools that run the lesson itself, with nothing to prepare in advance.",
  "info.fit.l":"<li><b>⏱ Interval timer</b> work/rest with voice announcements.</li><li><b>🔁 Class stations</b> a ready station rotation to project.</li><li><b>📖 Exercise library · 🎲 Fitness dice</b> an exercise by need, or a random draw when you want variety.</li><li><b>🏋️ Gym programme</b> for the older years.</li>",
  "info.games.s":"🎮 Games",
  "info.games.w":"Games for free time and the end of a lesson — with an objective, variations and safety points.",
  "info.games.l":"<li>Search by name, equipment or objective.</li><li>Any game can go straight into a lesson plan.</li>",
  "info.beep.s":"🎵 Beep test",
  "info.beep.w":"Runs the beep test with audio-clock accuracy, calculates VO₂max and compares it with FITNESSGRAM norms.",
  "info.beep.l":"<li><b>Load class</b> pulls in the roster you already entered — no retyping names.</li><li><b>Record drop-out</b> tap the student the moment they stop, and their stage is recorded.</li><li><b>Send to fitness tests</b> the result goes to the student's card and to the fitness index.</li>",
  "info.photo.s":"📷 Photo-finish",
  "info.photo.w":"Times races with the phone camera and shows in the image who crossed first.",
  "info.photo.l":"<li><b>🏁 Race</b> clock, start and lanes — only what you need at the line.</li><li><b>📐 Setup</b> once beforehand: camera position, finish line, gun distance and detection sensitivity.</li><li><b>🎞 Finish image · 🏁 Results</b> the moment of crossing and the precise time for each lane; «Save to class» puts the times into the fitness tests.</li><li><b>🔄 Laps</b> longer races. Earlier heats are in the archive under the results board.</li>",
  "info.rec.s":"🏆 School champions",
  "info.rec.w":"A school records board compared with the national and world records.",
  "info.rec.l":"<li>A student submits a record with a proof video — and it goes on the board <b>only after your approval</b>.</li><li><b>📺 TV mode</b> for the screen at the gym entrance · <b>🔗 Link / QR</b> to share with students.</li>",
  "info.stu.s":"👥 Students and grades",
  "info.stu.w":"The student list, a grade table by assessment period, and peer assessment.",
  "info.stu.l":"<li><b>⬇ Fill from attendance</b> fills the participation grade from attendance data — only in empty cells, never overwriting a grade you entered.</li><li><b>⬇ CSV</b> exports the table to a spreadsheet.</li>",
  "info.tools.s":"🧰 Class tools",
  "info.tools.w":"Four tools for the moments that come up in every lesson.",
  "info.tools.l":"<li><b>👥 Teams</b> a balanced split based on the latest result — no team without a chance.</li><li><b>🎯 Random pick</b> chooses a random student.</li><li><b>✅ Attendance</b> daily register — the participation grade is filled from it.</li><li><b>📋 Rubrics</b> assessment by criteria.</li>",
  "info.know.s":"📚 Knowledge",
  "info.know.w":"Professional backing for decisions — sources, programmes and numbers.",
  "info.know.l":"<li><b>📚 Official sources</b> every item links to the live document.</li><li><b>🏋️ Evaluated programmes · 📌 Numbers worth remembering</b> for the moment you need to back a decision with a parent or principal.</li>",
  "info.nut.s":"🥗 Nutrition corner",
  "info.nut.w":"A short daily tip to read to the class, and a bank of tips by topic.",
  "info.data.s":"💾 Your data",
  "info.data.w":"No server and no account — that is both the advantage and the responsibility.",
  "info.data.l":"<li><b>Backup</b> ⚙ Settings → «⬇ Back up everything to a file». «⬆ Restore from a file» brings everything back on a new device.</li><li><b>Encryption</b> you can encrypt the backup with a password — but there is no password recovery. Lose the password, lose the file.</li><li><b>Wrong class name?</b> ⚙ Settings → «🏷 Class names». Renaming does not disconnect any student or measurement.</li><li><b>Hard to read in the sun?</b> ☀ in the top bar, and «Large buttons» in Settings for one-handed use.</li>",

  /* --- אודות --- */
  "ab.p":"A field kit for PE teachers: fitness tests, beep test, camera photo-finish, lesson plans, records board, class tools and grades — all on one screen, and without sending anything out.",
  "ab.privT":"🔒 Privacy",
  "ab.priv":"Student data — rosters, grades and measurements — is stored in this device's localStorage only. <b>No server, no account, and nothing is sent anywhere.</b> This is data about minors, so it is a design decision, not an accident. CSV export or backup is always an action you initiate. Clearing site data in the browser deletes everything — that is why there is a backup. The only thing that leaves the device is your (the teacher's) contact details entered on the first welcome screen — not data about any student — sent once only.",
  "ab.srcT":"📚 Professional sources",
  "ab.src":"Léger protocol (beep test) · FITNESSGRAM® norms by The Cooper Institute · «PE badge — standards for assessing student achievement», Israeli Ministry of Education, Pedagogical Secretariat · the physical education curriculum. School norms are the teacher's data and are stored on the device.",
  "ab.builtT":"🛠 Built with",
  "ab.built":"JavaScript, HTML and CSS only — no external libraries and no build step in the browser, so the app opens fast and works in the field without a network. Developed together with Claude Code.",
  "ab.warnT":"⚠️ Disclaimer",
  "ab.warn":"A teaching aid. Camera and stopwatch measurements are as good as field conditions allow, and are not a substitute for certified timing equipment in official competition. The educational decision and the grade are yours."
},

ar:{
  /* ux-redesign */
  "pf.tRace":"🏁 السباق",
  "pf.tSetup":"📐 التجهيز",
  "pfw.s0":"الموضع",
  "pfw.s1":"خط النهاية",
  "pfw.s2":"الانطلاق",
  "pfw.s3":"الكشف",
  "pfw.s4":"تفاصيل السباق",
  "pfw.lineHint":"حاذوا الخط الأحمر في الصورة أعلاه. ⇋ يقلب الصورة، و＋/－ للتكبير والتصغير — والتكبير يحسّن الدقة أيضًا.",
  "pfw.metaP":"تحدّد المسافة الاختبار الذي تدخل إليه الأزمنة عند الحفظ للصف (60 م ← جري 60 م). يظهر الاسم والمرحلة والرياح في اللوحة والشهادات والتقرير.",
  "pfw.done":"✓ جاهز — إلى السباق",
  "pf.saveCls":"🏅 حفظ للصف",
  "pf.saveTo":"🏅 حفظ لـ {0}",
  "pf.share":"📤 مشاركة / تصدير",
  "pf.arcFold":"🗄 أرشيف السباقات",
  "bt.saveCls":"🏅 حفظ للصف",
  /* ux-redesign */
  "prep.today":"اليوم",
  "prep.tomorrow":"غدًا",
  "prep.title":"للتحضير",
  "prep.sub":"دروس قريبة ليس لها خطة بعد",
  "prep.btn":"حضّر خطة",
  "ui.day":"يوم",
  "asg.btn":"📌 اربط بدرس",
  "asg.title":"ربط بدرس",
  "asg.hint":"ستظهر الخطة في «اليوم» وتُفتح تلقائيًا عند بدء الدرس.",
  "asg.this":"مرتبط",
  "asg.other":"يستبدل خطة",
  "asg.noSlots":"لا توجد لهذا الصف دروس في الجدول خلال الأسبوعين القادمين — اختر تاريخًا.",
  "asg.toDate":"اربط بتاريخ",
  "asg.pickCls":"اختر صفًا.",
  "asg.done":"رُبطت الخطة بـ",
  "pe.newStep":"مرحلة جديدة",
  "pe.edit":"✎ عدّل المراحل",
  "pe.done":"✓ انتهى التعديل",
  "pe.add":"+ مرحلة",
  "pe.total":"المجموع",
  "ls.ready":"⚡ الخطة جاهزة — يمكنك تعديلها أو ربطها بدرس أو حفظها",
  "gm.added":"أُضيفت إلى الخطة المعروضة",
  /* ux-redesign */
  "area.cls":"مركز الصف",
  "hub.title":"مركز الصف",
  "hub.class":"الصف",
  "hub.group":"المجموعة",
  "hub.fit":"اللياقة",
  "hub.meas":"قياسات",
  "hub.testsN":"اختبارات مختلفة",
  "hub.lastMeas":"الأخير",
  "hub.groupNote":"الشاشات الكاملة (الطلاب، العلامات، اختبارات اللياقة) تعمل حسب الصف — افتحها من خلال صفوف المجموعة.",
  "hub.students":"الطلاب",
  "hub.inList":"في القائمة",
  "hub.openList":"قائمة الطلاب",
  "hub.att":"الحضور",
  "hub.lessonsMarked":"دروس مع حضور",
  "hub.noAtt":"لم يُسجَّل حضور بعد",
  "hub.partPct":"مشاركة",
  "hub.openAtt":"الحضور والتقرير",
  "hub.openIdx":"مؤشر اللياقة",
  "hub.openCov":"ما الناقص",
  "hub.openProg":"التقدّم",
  "hub.grades":"العلامات",
  "hub.graded":"لديهم علامة نهائية",
  "hub.openGrades":"جدول العلامات",
  "hub.assess":"التقييمات",
  "hub.peerN":"تقييمات الأقران",
  "hub.openPeer":"تقييم الأقران",
  "hub.openRub":"سلالم التقدير",
  "hub.empty":"لا توجد صفوف بعد. أضف صفًا هنا — الطبقة والرقم — ثم قائمة طلابه.",
  "hub.addCls":"صف جديد",
  "hub.addBtn":"أضف صفًا",
  "hub.inLesson":"في درس الآن",
  /* ux-redesign */
  "end.attDone":"تم تسجيل الحضور",
  "end.attPart":"الحضور: تم تسجيل",
  "end.attRest":"جميع الباقين حاضرون",
  "info.live.s":"▶ وضع الدرس",
  "info.live.w":"الشاشة التي تحملها في الملعب — كل شيء ظاهر، والصف معروف مسبقًا.",
  "info.live.l":"<li><b>اضغط على صف</b> لفتح درس. يُعرض أولًا الصف الموجود الآن في جدول الحصص.</li><li><b>المربعات</b> — الحضور، القياس، الصافرة، صورة النهاية، المؤقّت، الفرق والسحب — تحفظ كل شيء لصف الدرس، من دون اختياره مرة أخرى.</li><li><b>✓ الجميع حاضرون</b> يسجّل الصف كله بضغطة واحدة. سجّل الاستثناءات في مربع الحضور.</li><li><b>الخروج</b> لا يُنهي الدرس — الزر الأوسط في الشريط يعيدك إليه. <b>⏹ إنهاء الدرس</b> يحفظ تقييمًا وملاحظة.</li>",
  /* ux-redesign */
  "u.m":"م",
  "u.kmh":"كم/س",
  "bt.sumStd":"قياسي",
  "bt.sumCustom":"⚠ معدّل",
  /* ux-redesign */
  "nav.today":"اليوم",
  "nav.prep":"التحضير",
  "nav.live":"الدرس",
  "nav.classes":"الصفوف",
  "ui.lang":"لغة الواجهة",
  "ui.min":"د",
  "area.plans":"الخطط",
  "area.games":"ألعاب",
  "area.fit":"تمارين ومؤقّتات",
  "area.know":"المعرفة",
  "area.nut":"التغذية",
  "area.stu":"الطلاب والعلامات",
  "area.ft":"اختبارات اللياقة",
  "area.tools":"أدوات الصف",
  "home.quick":"أدوات القياس — حتى من دون درس",
  "home.qFt":"اختبارات اللياقة",
  "home.qBeep":"اختبار الصافرة",
  "home.qPhoto":"صورة النهاية",
  "home.qTimer":"مؤقّت",
  "home.more":"تحدّي الأسبوع، أرقام ونصيحة ميدانية",
  "set.guide":"دليل الشاشة التي جئت منها",
  "set.secGeneral":"عام",
  "set.secGeneralSub":"اللغة، المدرسة، المظهر والأصوات",
  "set.secYear":"بداية السنة",
  "set.secYearSub":"جدول الحصص، مجموعات التدريس وأسماء الصفوف",
  "set.secBackup":"النسخ الاحتياطي والمزامنة",
  "set.secBackupSub":"ملف النسخ الاحتياطي، Google Drive ومزامنة الأرقام",
  "set.secAdv":"متقدّم",
  "set.secAdvSub":"التثبيت، تنظيف البيانات، التحديث وحول",
  "live.blocked":"هناك درس مفتوح بالفعل مع الصف",
  "live.cantStart":"تعذّر فتح الدرس",
  "live.started":"بدأ الدرس",
  "live.sugNow":"الآن في الجدول",
  "live.sugNext":"التالي في الجدول",
  "live.which":"لأيّ صف؟",
  "live.whichHint":"اضغط على صف لفتح درس. تُحفظ الحضور والقياسات والفرق لهذا الصف.",
  "live.planWill":"ستُفتح معه الخطة المعروضة:",
  "live.students":"طلاب",
  "live.noClasses":"لا توجد صفوف بعد. اختر الطبقة والرقم في الأسفل — سيُسجَّل الصف ويُحفظ.",
  "live.other":"صف آخر — الطبقة والرقم",
  "live.startCls":"ابدأ الدرس",
  "live.noClassTools":"أدوات من دون صف",
  "live.tMeas":"قياس",
  "live.tMeasSub":"31 اختبار لياقة",
  "live.tBeep":"اختبار الصافرة",
  "live.tBeepSub":"الانطلاق وتسجيل الانسحاب",
  "live.tPhoto":"صورة النهاية",
  "live.tPhotoSub":"الكاميرا والمسارات",
  "live.tTimer":"مؤقّت",
  "live.tTimerSub":"فترات · محطات",
  "live.tTeams":"الفرق",
  "live.tTeamsSub":"متوازنة، من الحاضرين",
  "live.tPick":"سحب عشوائي",
  "live.tPickSub":"من دون تكرار في الجولة",
  "live.tGames":"ألعاب",
  "live.tGamesSub":"القواعد والشرح",
  "live.tAtt":"الحضور",
  "live.step":"المرحلة",
  "live.next":"التالي:",
  "live.last":"المرحلة الأخيرة",
  "live.planBtn":"الخطة الكاملة",
  "live.nextBtn":"إلى المرحلة التالية",
  "live.noPlan":"لا توجد خطة لهذا الدرس.",
  "live.choosePlan":"اختر خطة أو ابنِها",
  "live.present":"حاضرون",
  "live.absent":"غائبون",
  "live.notMarked":"لم يُسجَّل بعد",
  "live.noRoster":"لا توجد قائمة للصف",
  "live.measDone":"قياسات في هذا الدرس",
  "live.allIn":"الجميع حاضرون",
  "live.leave":"خروج — الدرس مستمر",
  "live.end":"إنهاء الدرس",
  "live.markedIn":"سُجّلوا حاضرين. سجّل الاستثناءات في الحضور",
  "live.continues":"الدرس مستمر. ▶ في الشريط يعيدك إليه",
  "brand.word":"PE", "brand.full":"PE Ultimate", "about.title":"📘 حول PE Ultimate",
  "bt.setup":"إعداد الاختبار", "bt.dist":"طول المسار", "bt.speed":"سرعة المرحلة 1 (كم/س)",
  "bt.age":"عمر الصف", "bt.sex":"الجنس (للمعايير)",
  "bt.voice":"إعلانات صوتية", "bt.beeps":"نبضات",
  "bt.live":"الاختبار جارٍ", "bt.ready":"جاهز للانطلاق", "bt.paused":"موقوف مؤقتًا", "bt.ended":"انتهى",
  "bt.metres":"م", "bt.stage":"مرحلة · شوط", "bt.time":"الزمن", "bt.speedNow":"السرعة",
  "bt.vo2":"VO₂max الحالي",
  "bt.start":"▶ انطلاق", "bt.reset":"↺ تصفير",
  "bt.drop":"🛑 تسجيل انسحاب · الطالب توقّف",
  "bt.heat":"قائمة السباق", "bt.loadCls":"👥 تحميل صف", "bt.clearCls":"✕ مسح",
  "bt.board":"لوحة النتائج", "bt.cRank":"الترتيب", "bt.cName":"الاسم", "bt.cDist":"المسافة",
  "bt.cCat":"الفئة", "bt.empty":"لا تسجيلات بعد.",
  "pf.tLive":"🎯 المسار المباشر", "pf.tStrip":"🎞 صورة النهاية", "pf.tRes":"🏁 النتائج",
  "pf.tLaps":"🔄 اللفّات", "pf.tArc":"🗄 الأرشيف", "pf.tMeta":"📋 تفاصيل السباق",
  "pf.sim":"محاكاة", "pf.cam":"كاميرا", "pf.gun":"🔫 انطلاق", "pf.stop":"⏹ إيقاف السباق",
  "pf.line":"موضع خط النهاية", "pf.lanes":"المسارات والمتسابقون", "pf.loadCls":"👥 تحميل صف",
  "pf.board":"النتائج الرسمية", "pf.cLane":"المسار", "pf.cTime":"الزمن", "pf.cGap":"الفارق",
  "stu.tabList":"👥 طلابي", "stu.tabGrades":"📊 العلامات", "stu.title":"طلابي",
  "stu.search":"بحث", "stu.sort":"ترتيب", "stu.add":"+ إضافة طلاب",
  "stu.count":"طلاب", "stu.avg":"متوسط VO₂max", "stu.allCls":"كل الصفوف",
  "lock.sub":"منطقة المعلّم — أدخل رمزك",
  "lock.enter":"دخول المعلّم",
  "lock.or":"أو",
  "lock.student":"👦 دخول الطالب — بدون رمز",
  "lock.studentNote":"وضع الطالب: عرض لوحة الأرقام القياسية وصفحة الألعاب، وإرسال رقم قياسي جديد لموافقة المعلّم. بدون وصول إلى الطلاب أو الاختبارات أو الإعدادات أو الموافقات.",
  "lock.demo":"🎬 وضع العرض التوضيحي — جولة بدون رمز",
  "lock.demoNote":"عرض توضيحي: صف نموذجي مع نتائج، لترى كيف يعمل كل شيء قبل إدخال طلاب حقيقيين. يمكن مسح بيانات العرض بضغطة واحدة.",
  "lock.aboutQ":"ما هذا؟",
  "lock.aboutA":"عدّة ميدانية لمعلّمي التربية الرياضية: اختبارات لياقة، اختبار البيب، تصوير خط النهاية بالكاميرا، خطط دروس، أرقام قياسية وعلامات.",
  "lock.dataQ":"أين البيانات؟",
  "lock.dataA":"على هذا الجهاز فقط. لا خادم، لا حساب، ولا يُرسل أي شيء إلى أي مكان.",
  "lock.newCode":"عيّن رمز المعلّم — اختر رمزًا تعرفه أنت وحدك",
  "lock.setCode":"تعيين الرمز والدخول",
  "lock.newCodePh":"رمز جديد",
  "lock.welcome":"أهلًا بعودتك، أيها المدرّب 👋",
  "lock.wrong":"رمز غير صحيح",
  "lock.tooShort":"اختر رمزًا من 4 أرقام على الأقل",
  "lead.title":"قبل أن نبدأ",
  "lead.sub":"التطبيق مجاني تمامًا — بدون بطاقة ائتمان، بدون دفع وبدون أي التزام. اتركوا بعض التفاصيل حتى نتمكن من إرسال استبيان قصير لرأيكم — سيساعدنا ذلك على تحسين التطبيق وجعله أكثر احترافية لاحقًا.",
  "lead.contactHint":"الجوال أو البريد الإلكتروني — يكفي واحد منهما. هذه فقط طريقة للتواصل معكم، لا أكثر.",
  "lead.first":"الاسم الأول",
  "lead.last":"اسم العائلة",
  "lead.phone":"الجوال",
  "lead.email":"البريد الإلكتروني",
  "lead.send":"إرسال ومتابعة",
  "lead.note":"بدون تكلفة وبدون بطاقة ائتمان — التطبيق مجاني. هذه التفاصيل تُرسل إلينا مباشرة فقط للتواصل معكم. كل شيء آخر — الطلاب والعلامات والقياسات — يبقى على جهازكم فقط، كما كان دائمًا.",

  "nav.home":"الرئيسية", "nav.tests":"اختبارات", "nav.lesson":"الدرس",
  "nav.beep":"البيب", "nav.photo":"النهاية", "nav.records":"الأرقام",
  "nav.games":"ألعاب", "nav.more":"المزيد", "nav.back":"رجوع",

  "home.greet":"يوم طيب،", "home.coach":"أيها المدرّب.",
  "home.statRuns":"سباقات مقيسة", "home.statBeep":"أفضل بيب",
  "home.statRecs":"أرقام معتمدة", "home.statStu":"طلاب قيد المتابعة",
  "home.today":"حصصي اليوم", "home.schedEdit":"🗓 الجدول",
  "home.lastLesson":"الحصة الأخيرة", "home.allLessons":"📖 كل الحصص",
  "home.ft":"اختبارات اللياقة",
  "home.ftSub":"31 اختبارًا · ساعة إيقاف وعدّاد · قائمة الصف · مؤشر اللياقة",
  "home.lesson":"خطط الدروس",
  "home.lessonSub":"إحماء ← محطات ← قياس · سريع أو بناء يدوي",
  "home.beep":"اختبار البيب",
  "home.beepSub":"نبضات بدقة الساعة الصوتية · VO₂max · معايير FITNESSGRAM",
  "home.photo":"تصوير خط النهاية",
  "home.photoSub":"توقيت بالكاميرا · سباقات سرعة · لفّات · شهادات",
  "home.know":"المعرفة",
  "home.knowSub":"مصادر رسمية · برامج تدريب مبنية على الأدلة · ألعاب",
  "home.more":"خيارات أخرى",
  "home.moreSub":"أبطال المدرسة · الطلاب والعلامات · المعرفة · أدوات الصف · التغذية",
  "home.challenge":"تحدّي الأسبوع",
  "home.chPlus":"+ أضف عدًّا", "home.chEdit":"✎ تحدٍّ جديد",
  "home.tip":"نصيحة ميدانية",

  "more.title":"\u2630 القائمة",
  "more.home":"ماذا الآن — الصفحة الرئيسية", "more.sched":"جدول الحصص", "more.groups":"مجموعات التدريس",
  "more.ft":"اختبارات اللياقة", "more.lesson":"خطط الدروس", "more.beep":"اختبار الصافرة", "more.photo":"صورة النهاية",
  "more.guide":"دليل الشاشة", "more.settings":"الإعدادات والنسخ الاحتياطي",
  "more.records":"أبطال المدرسة", "more.students":"الطلاب والعلامات",
  "more.knowledge":"المعرفة", "more.tools":"أدوات الصف", "more.nutrition":"ركن التغذية",

  "set.title":"الإعدادات",
  "set.school":"اسم المدرسة (يظهر في الترويسة وعلى الشهادات وفي وضع التلفاز)",
  "set.theme":"سِمة الألوان",
  "set.themeHint":"«نهار» و«شمس ساطعة» مخصّصتان للاستخدام في الخارج — خلفية فاتحة وتباين عالٍ يبقيان مقروءين تحت أشعة الشمس المباشرة.",
  "set.sound":"الأصوات", "set.voice":"الإعلانات الصوتية",
  "set.wake":"إبقاء الشاشة مضاءة أثناء النشاط",
  "set.lock":"قفل منطقة المعلّم عند الدخول",
  "set.touch":"أزرار كبيرة (استخدام بيد واحدة أثناء الدرس)",
  "set.save":"حفظ", "set.saved":"تم حفظ الإعدادات",
  "set.clsTitle":"🏷 أسماء الصفوف",
  "set.clsHint":"تغيير الاسم يغيّر الاسم فقط. الطلاب والقياسات والحصص الخاصة بالصف يبقون معه — يُعرَّفون بمعرّف ثابت، لا بالاسم.",
  "set.clsPick":"الصف", "set.clsCurLbl":"الاسم الحالي", "set.clsNewLbl":"اسم جديد",
  "set.clsNewPh":"مثال: تاسع 3 — متفوقين", "set.clsSaveBtn":"حفظ",
  "set.lang":"اللغة", "set.langHint":"تتغيّر لغة الواجهة فورًا. كل المحتوى مترجم — الشاشات والاختبارات والألعاب وخطط الدروس وقاعدة المعرفة والرسائل. الترجمة مسودة مهنية بانتظار مراجعة متحدث أصلي.",
  "set.about":"📘 حول، الإصدار والاعتمادات",
  "set.purge":"🧹 مسح البيانات القديمة",
  "set.install":"📲 التثبيت كتطبيق: في كروم — القائمة ⋮ ثم \"إضافة إلى الشاشة الرئيسية\". في آيفون — مشاركة ثم \"إضافة إلى الشاشة الرئيسية\". التطبيق يعمل بدون إنترنت أيضًا (الخطوط فقط تُحمّل من الشبكة).",

  "bk.title":"💾 النسخ الاحتياطي والاستعادة",
  "bk.body":"كل بياناتك — الطلاب، النتائج، الأرقام القياسية، العلامات، المعايير والإعدادات — محفوظة <b>على هذا الجهاز فقط</b>. جهاز يتعطّل أو مسح بيانات الموقع يعني ضياع كل شيء بلا رجعة. ملف نسخ احتياطي واحد يحلّ ذلك، وينقل كل شيء إلى جهاز جديد أو إلى معلّم آخر.",
  "bk.export":"⬇ انسخ كل شيء إلى ملف",
  "bk.import":"⬆ استعادة من ملف",
  "bk.encrypt":"🔐 تشفير النسخة الاحتياطية بكلمة مرور",
  "bk.encryptHint":"يمكن حفظ الملف المشفّر في درايف أو إرساله بالبريد دون أن يتمكن أحد — ولا حتى خدمة التخزين — من قراءة محتواه. <b>لا استعادة لكلمة المرور:</b> إن ضاعت كلمة المرور ضاع الملف. هذا هو معنى التشفير الحقيقي. بدون تحديد هذا المربع — ملف عادي غير مشفّر يمكن لأي أداة تقرأ JSON فتحه.",
  "bk.pass":"كلمة المرور", "bk.passAgain":"مرة أخرى للتأكيد",
  "bk.passTitleNew":"🔐 كلمة مرور النسخة الاحتياطية", "bk.passTitleOpen":"🔐 هذا الملف مشفّر",
  "bk.passHintNew":"اختر كلمة مرور. <b>لا توجد طريقة لاستعادتها</b> — احفظها في مكان تتذكره، وإلا فُقد الملف.",
  "bk.passHintOpen":"هذا الملف مشفّر. أدخل كلمة المرور التي أُنشئ بها.",
  "bk.passShort":"كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
  "bk.passMismatch":"كلمتا المرور غير متطابقتين.",
  "bk.passWrongLeft":"كلمة مرور خاطئة — تبقّت {n} محاولات",
  "bk.passWrongFinal":"كلمة مرور خاطئة. لم يُفتح الملف.",
  "bk.never":"لم يُنسخ احتياطيًا قط",
  "bk.lastAt":"آخر نسخة",
  "bk.groups":"مجموعات بيانات",
  "bk.restoreTitle":"⬆ استعادة من ملف نسخ احتياطي",
  "bk.restoreHint":"هذا ما يحتويه الملف. الاستعادة <b>تستبدل</b> البيانات الموجودة على الجهاز — لذا انسخ الحالة الحالية أولًا.",
  "bk.colItem":"البيانات", "bk.colFile":"في الملف", "bk.colHere":"على الجهاز الآن",
  "bk.safety":"⬇ انسخ الحالة الحالية أولًا",
  "bk.go":"✓ استعادة واستبدال",
  "bk.cancel":"إلغاء",
  "bk.confirm":"استعادة؟ ستُستبدل كل البيانات على هذا الجهاز ببيانات الملف.",
  "bk.done":"✓ تمت الاستعادة — يُعاد التحميل",
  "bk.bad":"هذا الملف ليس نسخة احتياطية لـ PE Ultimate",

  "thm.dark":"ليل", "thm.turf":"عشب", "thm.slate":"رمادي", "thm.day":"نهار", "thm.sun":"شمس ساطعة",
  "i18n.partial":"مترجم بالكامل (مسودة بانتظار مراجعة متحدث أصلي).",
  "ui.close":"إغلاق", "ui.cancel":"إلغاء", "ui.save":"حفظ", "ui.delete":"حذف",
  "ui.edit":"تحرير", "ui.add":"إضافة", "ui.export":"تصدير", "ui.import":"استيراد",
  "ui.search":"بحث", "ui.sort":"ترتيب", "ui.class":"الصف", "ui.grade":"المرحلة",
  "ui.name":"الاسم", "ui.date":"التاريخ", "ui.result":"النتيجة", "ui.score":"العلامة",
  "ui.boys":"بنون", "ui.girls":"بنات", "ui.all":"الكل", "ui.none":"لا شيء",
  "ui.yes":"نعم", "ui.no":"لا", "ui.back":"رجوع", "ui.next":"التالي", "ui.done":"تم",
  "ui.sun":"وضع الشمس — تباين عالٍ لضوء النهار",
  "ui.sunOff":"العودة إلى السِمة العادية",
  "ui.menu":"القائمة — كل الشاشات",
  "ui.settings":"الإعدادات",
  "ui.info":"دليل سريع — ماذا تفعل هذه الشاشة",
  "ui.demoBar":"وضع العرض التوضيحي", "ui.demoNote":"— البيانات هنا نموذجية",
  "ui.demoClear":"مسح بيانات العرض",
  "ui.explain":"شرح",

  /* --- השלמה: מפתחות שהיו חסרים בערבית --- */
  "bt.std":"↺ قياسي (8.0)",
  "bt.proto":"البروتوكول القياسي",
  "bt.protoOff":"بروتوكول معدّل",
  "bt.saveProf":"💾 حفظ الملف الشخصي",
  "bt.profDel":"حذف الملف الشخصي",
  "bt.prof":"— ملف شخصي —",
  "bt.warn":"⚠️ البروتوكول يختلف عن القياسي (20 م، بداية ≥ 8.0 كم/س) — قيم VO₂max تُعرض كتقدير فقط.",
  "bt.inStage":"التقدّم داخل المرحلة",
  "bt.laneMode":"التسجيل حسب رقم المسار",
  "bt.laneN":"كم مسارًا",
  "bt.undo":"↩ تراجع عن آخر تسجيل",
  "bt.keys":"اختصارات: مسافة = انطلاق/إيقاف مؤقت · Enter = تسجيل",
  "bt.heatHint":"حمّل صفًا واضغط على الطالب الذي توقّف بدل الزر الكبير — يدخل الاسم إلى اللوحة بدقة، بلا كتابة لاحقًا.",
  "bt.byOrder":"حسب الترتيب",
  "bt.byDist":"حسب المسافة",
  "bt.toTrack":"⇧ حفظ في المتابعة",
  "bt.toFt":"🏅 إرسال إلى اختبارات اللياقة",
  "bt.cStage":"مرحلة·شوط",
  "bt.emptyHint":"أثناء الجري — عندما يتوقّف طالب، اضغط زر التسجيل فيدخل إلى اللوحة.",
  "bt.refTable":"📋 جدول المراحل والمسافات الكامل",
  "bt.normTable":"📚 جدول معايير VO₂max (FITNESSGRAM®)",
  "pf.simMode":"وضع المحاكاة",
  "pf.resetRace":"↺ تصفير السباق",
  "pf.sens":"حساسية الكشف ·",
  "pf.slit":"عرض الشقّ ·",
  "pf.minT":"أدنى فاصل (ث)",
  "pf.autoDetect":"كشف تلقائي للحركة عند خط النهاية",
  "pf.micStart":"انطلاق صوتي — مسدس / تصفيق (ميكروفون)",
  "pf.gunDist":"بُعد الميكروفون عن مُطلِق السباق (م)",
  "pf.noOffset":"بلا تعويض",
  "pf.paste":"📋 لصق قائمة",
  "pf.editNames":"✎ تعديل الأسماء",
  "pf.laneCount":"عدد المسارات ·",
  "pf.tapHint":"الضغط على مسار يسجّل عبورًا الآن · المفاتيح 1–9 تفعل الشيء نفسه من لوحة المفاتيح.",
  "pf.sanity":"✅ فحص سلامة لمدة دقيقة — قبل كل سباق",
  "pf.cSrc":"المصدر",
  "pf.emptyRes":"لا نتائج بعد. شغّل سباقًا أو استورد ملف CSV.",
  "pf.ai":"🎙️ تقرير تعليق",
  "pf.arcSave":"💾 حفظ في الأرشيف",
  "pf.csv":"⬇ تصدير CSV",
  "pf.sheet":"🖼 صورة + جدول",
  "pf.cert":"🖨 شهادة الفائز",
  "pf.mail":"✉ إرسال النتائج",
  "pf.addRow":"＋ صف",
  "pf.numbers":"🔢 أرقام الصدر",
  "stu.tabPeer":"🤝 تقييم الأقران",
  "stu.searchPh":"اسم الطالب",
  "stu.sName":"حسب الاسم",
  "stu.sCls":"حسب الصف",
  "stu.sVo2":"VO₂max — من الأعلى إلى الأدنى",
  "stu.sVo2a":"VO₂max — من الأدنى إلى الأعلى",
  "stu.sTrend":"المتراجعون أولًا",
  "stu.sTests":"الأقل قياسات",
  "stu.fromBeep":"⇩ من لوحة اختبار البيب",
  "stu.csv":"⬇ ملف CSV للصف",
  "stu.below":"خطر صحي",
  "stu.falling":"في تراجع",
  "stu.empty":"لا يوجد طلاب بعد.",
  "stu.emptyHint":"أضف قائمة يدويًا، أو استورد الأسماء من لوحة اختبار البيب.",

  /* --- תזונה --- */
  "nut.daily":"نصيحة اليوم",
  "nut.say":"🔊 اقرأ للصف",
  "nut.shuffle":"🔀 نصيحة أخرى",
  "nut.all":"كل النصائح",
  "nut.c.all":"الكل",
  "nut.c.before":"قبل النشاط",
  "nut.c.after":"بعد النشاط",
  "nut.c.water":"الشرب",
  "nut.c.food":"طبق الرياضي",
  "nut.c.myth":"نكسر الخرافات",
  "nut.tip.0":"قبل درس مكثّف بساعة ونصف إلى ساعتين: كربوهيدرات سهلة الهضم — شريحة خبز بالعسل، موزة، عصيدة. لا مقليات ولا دهون.",
  "nut.tip.1":"قبل اختبار البيب أو امتحان بنصف ساعة — ماء فقط. الأكل القريب جدًا من الجهد = وخز في الجنب وثِقَل.",
  "nut.tip.2":"الدرس في الحصة الأولى؟ فطور صغير أفضل من لا شيء: لبن، فاكهة، شريحة خبز. الجسم الصائم يتعب أسرع.",
  "nut.tip.3":"نافذة الاستشفاء: خلال ساعة بعد الجهد — كربوهيدرات + بروتين. حليب بالشوكولاتة وشطيرة جبن مزيج ممتاز وبسيط.",
  "nut.tip.4":"عضلات متيبّسة في اليوم التالي؟ هذا ألم عضلي متأخر (DOMS) طبيعي. الماء والبروتين في الوجبات والحركة الخفيفة أفضل من الراحة التامة.",
  "nut.tip.5":"قاعدة بسيطة للدرس: كوب ماء قبله، رشفة كل 15 دقيقة، كوب في النهاية. في الصيف — ضاعِف.",
  "nut.tip.6":"لون البول = أسهل مقياس للجفاف. أغمق من عصير الليمون الفاتح؟ ينقصك السائل حتى قبل أن تشعر بالعطش.",
  "nut.tip.7":"مشروبات الطاقة ممنوعة قبل الرياضة للمراهقين — الكافيين يرفع النبض ويخفي علامات الإجهاد. الماء يفوز دائمًا.",
  "nut.tip.8":"طبق متوازن: نصفه خضار، ربعه بروتين (دجاج/سمك/بقوليات/بيض)، ربعه كربوهيدرات كاملة. بسيط — وهذا 80% من العمل.",
  "nut.tip.9":"الحديد مهم خصوصًا للمراهقين النشيطين (وخاصة للفتيات): لحم قليل الدهن، بقوليات، طحينة. نقص الحديد = تعب في اختبار البيب.",
  "nut.tip.10":"الكالسيوم + فيتامين D في سن المراهقة يبنيان ذروة كتلة العظم مدى الحياة. منتجات الألبان، الطحينة، الشمس في الخارج — تمامًا ما يقدّمه درس التربية البدنية.",
  "nut.tip.11":"«البروتين = عضلات»؟ كمية البروتين التي يستفيد منها الجسم محدودة. يحتاج المراهق المتدرّب نحو 1.2–1.6 غ لكل كغ من الطعام العادي — المساحيق غير ضرورية في سن المدرسة.",
  "nut.tip.12":"«التعرّق = خسارة الوزن»: العرق فقدان سوائل وليس دهونًا. يعود الوزن مع كوب ماء. ما يحسم هو توازن الطاقة على المدى الطويل.",
  "nut.tip.13":"«الكربوهيدرات تُسمِّن»: للرياضي الصغير الكربوهيدرات وقود. بلا وقود — لا اختبار بيب جيدًا. السؤال أيّ كربوهيدرات وكم، لا هل.",
  "nut.tip.14":"الحميات القاسية في سن المراهقة تضرّ بالنمو والأداء. الطالب الذي يتحدّث عن صيام أو حمية حادّة يستحق حديثًا هادئًا وتحويلًا إلى المرشدة.",

  /* --- טיפי שטח בדף הבית --- */
  "home.tip.0":"في اختبار البيب: قفوا في طرف المسار بحيث يسمع الصف كله السمّاعة — وارفعوا الصوت قبل الانطلاق.",
  "home.tip.1":"في تصوير خط النهاية: سجّلوا المتسابقين حسب ترتيب المسارات من الأسرع إلى الأبطأ — الكشف يوزّع الأزمنة حسب ترتيب القائمة.",
  "home.tip.2":"وضع التلفاز في لوحة الأرقام القياسية ممتاز لمدخل المدرسة — صِلوا حاسوبًا بشاشة عبر HDMI واضغطوا 📺.",
  "home.tip.3":"نرد اللياقة ممتاز للإحماء: 3 رميات = إحماء كامل، ولا يجادل أي طالب النرد.",
  "home.tip.4":"شاشة الهاتف لن تنطفئ أثناء النشاط — منع إطفاء الشاشة يعمل عندما يعمل مؤقّت (يمكن إيقافه في الإعدادات).",
  "home.tip.5":"يمكن تثبيت التطبيق على الشاشة الرئيسية — قائمة المتصفح ثم «إضافة إلى الشاشة الرئيسية».",
  "home.onboard":"جديد هنا؟ اضغط 🎬 «وضع العرض التوضيحي» في شاشة الدخول — صف نموذجي بنتائج حقيقية، لترى كيف يعمل كل شيء قبل إدخال طلاب حقيقيين.",

  /* --- פוטו־פיניש: הדרכת פתיחה --- */
  "pfg.title":"📷 تصوير خط النهاية — 4 خطوات",
  "pfg.prev":"→ السابق",
  "pfg.next":"التالي ←",
  "pfg.go":"هيا نقيس",
  "pfg.skip":"لا تعرض مرة أخرى",
  "pfg.0.h":"ثبّت الهاتف — لا تمسكه بيدك",
  "pfg.0.p":"يجب أن ترى الكاميرا <b>خط النهاية من الجانب</b>، على ارتفاع الصدر تقريبًا. حامل ثلاثي، سياج، مقعد أو حقيبة — أي شيء ثابت. انزياح سنتيمتر واحد يحرّك الخط، وتتحرّك معه كل الأزمنة.",
  "pfg.1.h":"طابِق الخط الأحمر مع خط النهاية",
  "pfg.1.p":"حرّك «موضع خط النهاية» حتى يقع الخط الأحمر على الشاشة <b>تمامًا</b> على خط النهاية في الملعب. هذا هو الإعداد الوحيد الذي يُبطل الخطأ فيه السباق كله.",
  "pfg.2.h":"إن كان هناك مسدس انطلاق — أدخل المسافة منه",
  "pfg.2.p":"ينتقل الصوت 343 م في الثانية. كاميرا تقف على بُعد 34 م من الانطلاق تسمع الطلقة متأخرة عُشر ثانية، فتخرج كل الأزمنة أقصر بهذا العُشر بالضبط. إدخال المسافة يعوّض ذلك.",
  "pfg.3.h":"للنهاية المتقاربة — اضغط على العدّاء في الصورة",
  "pfg.3.p":"بعد السباق، في «🎞 صورة النهاية»، الضغط على جذع العدّاء يعطي زمنًا بالاستيفاء بين الأعمدة. <b>أدقّ من المُشغِّل التلقائي</b> — هكذا يُعمل في النهائي.",

  /* --- פוטו־פיניש: בדיקת שפיות --- */
  "pfs.title":"✅ فحص سلامة لمدة دقيقة",
  "pfs.hint":"افعل ذلك مرة واحدة في كل مكان جديد. هذا ما يفرّق بين قياس حقيقي ورقم يبدو كأنه قياس.",
  "pfs.list":"<li><b>الهاتف ثابت.</b> حامل ثلاثي أو سياج أو حقيبة — لا في اليد. انزياح سنتيمتر يحرّك خط النهاية.</li><li><b>سطر الحالة أخضر:</b> «🟢 الكاميرا تعمل · الكشف مُفعَّل». عالق على «معايرة الخلفية…» = شيء ما يتحرّك أو الإضاءة تتغيّر.</li><li><b>طالب يعبر مشيًا.</b> يجب أن تُسمع الصافرة <b>تمامًا</b> عندما يكون على الخط. مبكرًا جدًا — الخط الأحمر ليس على خط النهاية؛ صحّحه في «موضع خط النهاية».</li><li><b>بعد السباق</b> — «🎞 صورة النهاية» تعرض دقّة زمنية ±X م.ث. هذا قياس حقيقي من هاتفك، لا وعد.</li><li><b>للنهاية المتقاربة:</b> اضغط على العدّاء نفسه في الشريط. الاستيفاء بين الأعمدة أدقّ من المُشغِّل التلقائي.</li>",
  "pfs.ok":"فهمت — هيا بنا",

  /* --- פוטו־פיניש: מספרי חזה --- */
  "pfn.title":"🔢 أرقام الصدر",
  "pfn.hint":"عندما يحمل العدّاؤون أرقام صدر بدل الجري حسب قائمة — سجّل هنا الرقم لكل مسار. سيظهر في اللوحة وفي التصدير وفي الشهادة. يمكن ترك المسار الفارغ بلا رقم.",

  /* --- מדריך מהיר (ℹ) --- */
  "info.title":"ℹ️ دليل سريع",
  "info.top":"عُدّة ميدانية واحدة: اختبارات اللياقة، اختبار البيب، تصوير خط النهاية، خطط الدروس، الأرقام القياسية، الحضور والعلامات. تعمل أيضًا بلا تغطية، وكل البيانات محفوظة <b>على هذا الجهاز فقط</b> — لذا يُستحسن النسخ الاحتياطي إلى ملف من حين لآخر (⚙ الإعدادات ← «انسخ كل شيء إلى ملف»).",
  "info.home.s":"🚀 من أين نبدأ",
  "info.home.w":"ثلاث خطوات، مرة واحدة، وتصبح جاهزًا للعمل.",
  "info.home.l":"<li><b>رمز المعلّم</b> يُحدَّد عند الدخول الأول، ويحمي منطقة المعلّم حين ينتقل الهاتف بين الأيدي.</li><li><b>🎬 وضع العرض التوضيحي</b> في شاشة الدخول — صف نموذجي بنتائج، لترى كيف يعمل كل شيء قبل إدخال طلاب حقيقيين. يُمسح بضغطة واحدة.</li><li><b>صف حقيقي واحد</b> — «اختبارات اللياقة» ← اختر الطبقة والرقم ← «👥 القائمة». من هنا تتوفّر القائمة نفسها في كل الشاشات الأخرى.</li>",
  "info.ft.s":"🏅 اختبارات اللياقة",
  "info.ft.w":"قلب التطبيق: 31 اختبارًا مع ساعة إيقاف وعدّاد. اختر صفًا واختبارًا، وأدخل نتيجة لكل طالب.",
  "info.ft.l":"<li><b>🏅 الاختبارات</b> الشاشة التي تقيس فيها فعلًا. كل نتيجة تُحفظ للطالب ولا تُحذف.</li><li><b>📊 مؤشّر اللياقة</b> علامة لياقة شاملة لكل طالب مقابل المعايير.</li><li><b>🏅 شارة التربية البدنية</b> من يستوفي المتطلبات وما الذي ينقصه.</li><li><b>📋 ما ينقص الصف</b> من قيس في كل اختبار ومن لم يُقَس بعد — بدل البحث في القوائم.</li><li><b>📈 مؤشّرات التقدّم</b> لكل اختبار: كم تحسّن، كم تراجع، كم بلا تغيير.</li>",
  "info.lesson.s":"📋 خطط الدروس",
  "info.lesson.w":"خطة كاملة — إحماء، محطات، لعبة وختام — بضغطة واحدة أو ببناء يدوي.",
  "info.lesson.l":"<li><b>⚡ سريع</b> اختر موضوعًا وطبقة ومدّة ومكانًا — وتُبنى الخطة وحدها، مرتبطة بالمعايير.</li><li><b>🧩 بناء يدوي</b> ركّب الدرس بنفسك من مراحل جاهزة.</li><li><b>▶ ابدأ الدرس</b> يفتح «درسًا نشطًا»، وكل قياس من هنا يُسجَّل فيه. إن طلب الزر صفًا — «🏷 اختر صفًا» بجانبه.</li><li><b>💾 حفظ · 🖨 طباعة</b> تُحفظ الخطة في المكتبة لإعادة استخدامها في السنة القادمة.</li>",
  "info.fit.s":"⏱ اللياقة",
  "info.fit.w":"الأدوات التي تدير الدرس نفسه، دون تحضير مسبق.",
  "info.fit.l":"<li><b>⏱ مؤقّت فترات</b> عمل/راحة مع إعلان صوتي.</li><li><b>🔁 محطات للصف</b> دورة محطات جاهزة للعرض.</li><li><b>📖 مكتبة التمارين · 🎲 نرد اللياقة</b> تمرين حسب الحاجة، أو قرعة حين تريد التنويع.</li><li><b>🏋️ برنامج صالة اللياقة</b> للطبقات الكبرى.</li>",
  "info.games.s":"🎮 ألعاب",
  "info.games.w":"ألعاب لأوقات الفراغ ولنهاية الدرس — مع هدف وتنويعات ونقاط سلامة.",
  "info.games.l":"<li>ابحث بالاسم أو الأدوات أو الهدف.</li><li>يمكن نقل أي لعبة مباشرة إلى خطة درس.</li>",
  "info.beep.s":"🎵 اختبار البيب",
  "info.beep.w":"يشغّل اختبار البيب بدقّة ساعة الصوت، ويحسب VO₂max ويقارنه بمعايير FITNESSGRAM.",
  "info.beep.l":"<li><b>تحميل صف</b> يجلب القائمة التي أدخلتها مسبقًا — بلا إعادة كتابة الأسماء.</li><li><b>تسجيل انسحاب</b> اضغط على الطالب لحظة توقّفه، فتُسجَّل مرحلته.</li><li><b>إرسال إلى اختبارات اللياقة</b> تدخل النتيجة إلى بطاقة الطالب وإلى مؤشّر اللياقة.</li>",
  "info.photo.s":"📷 تصوير خط النهاية",
  "info.photo.w":"يقيس أزمنة الجري بكاميرا الهاتف، ويُظهر في الصورة من عبر أولًا.",
  "info.photo.l":"<li><b>🏁 السباق</b> الساعة والانطلاق والمسارات — فقط ما تحتاجه عند الخط.</li><li><b>📐 التجهيز</b> مرة واحدة مسبقًا: موضع الكاميرا وخط النهاية ومسافة المسدس وحساسية الكشف.</li><li><b>🎞 صورة النهاية · 🏁 النتائج</b> لحظة العبور والزمن الدقيق لكل مسار؛ «حفظ للصف» يُدخل الأزمنة إلى اختبارات اللياقة.</li><li><b>🔄 اللفّات</b> سباقات طويلة. السباقات السابقة في الأرشيف أسفل لوحة النتائج.</li>",
  "info.rec.s":"🏆 أبطال المدرسة",
  "info.rec.w":"لوحة أرقام قياسية مدرسية مقابل الرقم الوطني والعالمي.",
  "info.rec.l":"<li>يرسل الطالب رقمًا قياسيًا مع فيديو إثبات — ويظهر في اللوحة <b>فقط بعد موافقتك</b>.</li><li><b>📺 وضع التلفاز</b> لشاشة مدخل القاعة · <b>🔗 رابط / QR</b> للمشاركة مع الطلاب.</li>",
  "info.stu.s":"👥 الطلاب والعلامات",
  "info.stu.w":"قائمة الطلاب، جدول علامات حسب فترات التقييم، وتقييم الأقران.",
  "info.stu.l":"<li><b>⬇ املأ حسب الحضور</b> يملأ علامة المشاركة من بيانات الحضور — في الخانات الفارغة فقط، دون الكتابة فوق علامة أدخلتها.</li><li><b>⬇ CSV</b> يصدّر الجدول إلى جدول بيانات.</li>",
  "info.tools.s":"🧰 أدوات الصف",
  "info.tools.w":"أربع أدوات للّحظات التي تتكرّر في كل درس.",
  "info.tools.l":"<li><b>👥 مجموعات</b> تقسيم متوازن حسب آخر نتيجة — بلا مجموعة لا فرصة لها.</li><li><b>🎯 قرعة</b> تختار طالبًا عشوائيًا.</li><li><b>✅ الحضور</b> تسجيل يومي — ومنه تُملأ علامة المشاركة.</li><li><b>📋 سلالم التقييم</b> تقييم حسب معايير.</li>",
  "info.know.s":"📚 المعرفة",
  "info.know.w":"سند مهني للقرارات — مصادر وبرامج وأرقام.",
  "info.know.l":"<li><b>📚 مصادر رسمية</b> كل بند مرتبط بالوثيقة الحيّة.</li><li><b>🏋️ برامج مُقيَّمة · 📌 أرقام تستحق التذكّر</b> للّحظة التي تحتاج فيها إلى دعم قرار أمام وليّ أمر أو مدير.</li>",
  "info.nut.s":"🥗 ركن التغذية",
  "info.nut.w":"نصيحة يومية قصيرة لقراءتها للصف، ومجموعة نصائح حسب الموضوع.",
  "info.data.s":"💾 بياناتك",
  "info.data.w":"لا خادم ولا حساب — وهذه هي الميزة والمسؤولية معًا.",
  "info.data.l":"<li><b>النسخ الاحتياطي</b> ⚙ الإعدادات ← «⬇ انسخ كل شيء إلى ملف». «⬆ استعادة من ملف» تعيد كل شيء على جهاز جديد.</li><li><b>التشفير</b> يمكن تشفير النسخة الاحتياطية بكلمة مرور — لكن لا توجد استعادة لكلمة المرور. ضاعت كلمة المرور، ضاع الملف.</li><li><b>اسم صف خاطئ؟</b> ⚙ الإعدادات ← «🏷 أسماء الصفوف». تغيير الاسم لا يفصل أي طالب ولا أي قياس.</li><li><b>صعب القراءة في الشمس؟</b> ☀ في الشريط العلوي، و«أزرار كبيرة» في الإعدادات للاستخدام بيد واحدة.</li>",

  /* --- אודות --- */
  "ab.p":"عُدّة ميدانية لمعلّم التربية البدنية: اختبارات اللياقة، اختبار البيب، تصوير خط النهاية بالكاميرا، خطط الدروس، لوحة الأرقام القياسية، أدوات الصف والعلامات — كل ذلك في شاشة واحدة، ودون إرسال أي شيء إلى الخارج.",
  "ab.privT":"🔒 الخصوصية",
  "ab.priv":"بيانات الطلاب — القوائم والعلامات والقياسات — محفوظة في localStorage على هذا الجهاز فقط. <b>لا خادم، لا حساب، ولا إرسال إلى أي مكان.</b> هذه بيانات عن قاصرين، ولذلك هذا قرار تصميمي وليس صدفة. تصدير CSV أو النسخ الاحتياطي فعلٌ تبادر إليه أنت دائمًا. مسح بيانات الموقع في المتصفح يحذف كل شيء — لذلك يوجد نسخ احتياطي. الشيء الوحيد الذي يخرج من الجهاز هو بيانات الاتصال الخاصة بك (المعلّم) التي أُدخلت في شاشة الترحيب الأولى — لا بيانات عن أي طالب — وتُرسل مرة واحدة فقط.",
  "ab.srcT":"📚 مصادر مهنية",
  "ab.src":"بروتوكول Léger (اختبار البيب) · معايير FITNESSGRAM® من Cooper Institute · «شارة التربية البدنية — معايير تقييم تحصيل الطلاب»، وزارة التربية والتعليم الإسرائيلية، السكرتارية التربوية · منهاج التربية البدنية. المعايير المدرسية بيانات المعلّم وتُحفظ على الجهاز.",
  "ab.builtT":"🛠 بُني باستخدام",
  "ab.built":"JavaScript وHTML وCSS فقط — بلا مكتبات خارجية وبلا مرحلة بناء في المتصفح، ليفتح التطبيق بسرعة ويعمل في الميدان بلا شبكة. طُوِّر بالتعاون مع Claude Code.",
  "ab.warnT":"⚠️ إخلاء مسؤولية",
  "ab.warn":"أداة مساعدة للتدريس. قياسات الكاميرا والساعة جيدة بقدر ما تسمح ظروف الميدان، وليست بديلًا عن معدات توقيت معتمدة للمنافسات الرسمية. القرار التربوي والعلامة لك."
},

ru:{
  /* ux-redesign */
  "pf.tRace":"🏁 Забег",
  "pf.tSetup":"📐 Установка",
  "pfw.s0":"Позиция",
  "pfw.s1":"Линия финиша",
  "pfw.s2":"Старт",
  "pfw.s3":"Распознавание",
  "pfw.s4":"О забеге",
  "pfw.lineHint":"Совместите красную линию на изображении выше. ⇋ отражает изображение, ＋/－ меняют масштаб — и увеличение тоже повышает точность.",
  "pfw.metaP":"Дистанция определяет, в какой тест попадут времена при сохранении для класса (60 м → бег 60 м). Название, этап и ветер видны в таблице, грамотах и отчёте.",
  "pfw.done":"✓ Готово — к забегу",
  "pf.saveCls":"🏅 Сохранить для класса",
  "pf.saveTo":"🏅 Сохранить для {0}",
  "pf.share":"📤 Поделиться / экспорт",
  "pf.arcFold":"🗄 Архив забегов",
  "bt.saveCls":"🏅 Сохранить для класса",
  /* ux-redesign */
  "prep.today":"сегодня",
  "prep.tomorrow":"завтра",
  "prep.title":"Подготовить",
  "prep.sub":"Ближайшие уроки без плана",
  "prep.btn":"Подготовить план",
  "ui.day":"День",
  "asg.btn":"📌 Привязать к уроку",
  "asg.title":"Привязка к уроку",
  "asg.hint":"План появится на экране «Сегодня» и откроется сам, когда начнётся урок.",
  "asg.this":"привязан",
  "asg.other":"заменит план",
  "asg.noSlots":"У этого класса нет уроков в расписании на ближайшие две недели — выберите дату.",
  "asg.toDate":"Привязать к дате",
  "asg.pickCls":"Выберите класс.",
  "asg.done":"План привязан к ",
  "pe.newStep":"Новый этап",
  "pe.edit":"✎ Править ход урока",
  "pe.done":"✓ Готово",
  "pe.add":"+ Этап",
  "pe.total":"Итого",
  "ls.ready":"⚡ План готов — можно править, привязать к уроку или сохранить",
  "gm.added":"добавлена в план на экране",
  /* ux-redesign */
  "area.cls":"Центр класса",
  "hub.title":"Центр класса",
  "hub.class":"Класс",
  "hub.group":"Группа",
  "hub.fit":"Физподготовка",
  "hub.meas":"замеров",
  "hub.testsN":"разных тестов",
  "hub.lastMeas":"последний",
  "hub.groupNote":"Полные экраны (ученики, оценки, тесты) работают по классам — открывайте их через классы группы.",
  "hub.students":"Ученики",
  "hub.inList":"в списке",
  "hub.openList":"Список учеников",
  "hub.att":"Посещаемость",
  "hub.lessonsMarked":"уроков с посещаемостью",
  "hub.noAtt":"Посещаемость ещё не отмечалась",
  "hub.partPct":"участие",
  "hub.openAtt":"Посещаемость и отчёт",
  "hub.openIdx":"Индекс физподготовки",
  "hub.openCov":"Чего не хватает",
  "hub.openProg":"Прогресс",
  "hub.grades":"Оценки",
  "hub.graded":"с итоговой оценкой",
  "hub.openGrades":"Таблица оценок",
  "hub.assess":"Оценивание",
  "hub.peerN":"взаимных оценок",
  "hub.openPeer":"Взаимное оценивание",
  "hub.openRub":"Рубрики",
  "hub.empty":"Классов пока нет. Добавьте класс здесь — параллель и номер, — а затем список учеников.",
  "hub.addCls":"Новый класс",
  "hub.addBtn":"Добавить класс",
  "hub.inLesson":"сейчас на уроке",
  /* ux-redesign */
  "end.attDone":"Посещаемость отмечена",
  "end.attPart":"Посещаемость: отмечено",
  "end.attRest":"Остальные присутствуют",
  "info.live.s":"▶ Режим урока",
  "info.live.w":"Экран, который держишь в руке на площадке: всё на виду, класс уже выбран.",
  "info.live.l":"<li><b>Нажмите на класс</b> — откроется урок. Первым предлагается класс, который сейчас стоит в расписании.</li><li><b>Плитки</b> — посещаемость, замер, бип, фотофиниш, таймер, команды и жребий — сохраняют всё для класса урока, без повторного выбора.</li><li><b>✓ Все на месте</b> отмечает весь класс одним нажатием. Исключения отмечайте в плитке посещаемости.</li><li><b>Выйти</b> не завершает урок — средняя кнопка на панели вернёт к нему. <b>⏹ Завершить урок</b> сохраняет оценку и заметку.</li>",
  /* ux-redesign */
  "u.m":"м",
  "u.kmh":"км/ч",
  "bt.sumStd":"стандарт",
  "bt.sumCustom":"⚠ изменён",
  /* ux-redesign */
  "nav.today":"Сегодня",
  "nav.prep":"Подготовка",
  "nav.live":"Урок",
  "nav.classes":"Классы",
  "ui.lang":"Язык интерфейса",
  "ui.min":"мин",
  "area.plans":"Планы",
  "area.games":"Игры",
  "area.fit":"Упражнения и таймеры",
  "area.know":"Знания",
  "area.nut":"Питание",
  "area.stu":"Ученики и оценки",
  "area.ft":"Тесты физподготовки",
  "area.tools":"Инструменты класса",
  "home.quick":"Инструменты измерений — и без урока",
  "home.qFt":"Тесты",
  "home.qBeep":"Бип-тест",
  "home.qPhoto":"Фотофиниш",
  "home.qTimer":"Таймер",
  "home.more":"Вызов недели, цифры и полевой совет",
  "set.guide":"Гид по экрану, с которого вы пришли",
  "set.secGeneral":"Общие",
  "set.secGeneralSub":"Язык, школа, вид и звуки",
  "set.secYear":"Начало года",
  "set.secYearSub":"Расписание, учебные группы и названия классов",
  "set.secBackup":"Резервная копия и синхронизация",
  "set.secBackupSub":"Файл копии, Google Drive и синхронизация рекордов",
  "set.secAdv":"Дополнительно",
  "set.secAdvSub":"Установка, очистка данных, обновление и о приложении",
  "live.blocked":"Уже открыт урок в классе",
  "live.cantStart":"Не удалось открыть урок",
  "live.started":"Урок начался",
  "live.sugNow":"сейчас по расписанию",
  "live.sugNext":"следующий по расписанию",
  "live.which":"Какой класс?",
  "live.whichHint":"Нажмите на класс, чтобы открыть урок. Посещаемость, замеры и команды сохранятся для этого класса.",
  "live.planWill":"Вместе с ним откроется план на экране:",
  "live.students":"учеников",
  "live.noClasses":"Классов пока нет. Выберите параллель и номер ниже — класс будет зарегистрирован и сохранён.",
  "live.other":"Другой класс — параллель и номер",
  "live.startCls":"Начать урок",
  "live.noClassTools":"Инструменты без класса",
  "live.tMeas":"Замер",
  "live.tMeasSub":"31 тест физподготовки",
  "live.tBeep":"Бип-тест",
  "live.tBeepSub":"Старт и отметка выбывших",
  "live.tPhoto":"Фотофиниш",
  "live.tPhotoSub":"Камера и дорожки",
  "live.tTimer":"Таймер",
  "live.tTimerSub":"Интервалы · станции",
  "live.tTeams":"Команды",
  "live.tTeamsSub":"Сбалансированные, из присутствующих",
  "live.tPick":"Жребий",
  "live.tPickSub":"Без повторов в круге",
  "live.tGames":"Игры",
  "live.tGamesSub":"Правила и объяснение",
  "live.tAtt":"Посещаемость",
  "live.step":"Этап",
  "live.next":"Далее:",
  "live.last":"Последний этап",
  "live.planBtn":"Весь план",
  "live.nextBtn":"Следующий этап",
  "live.noPlan":"Для этого урока нет плана.",
  "live.choosePlan":"Выбрать или составить план",
  "live.present":"присутствуют",
  "live.absent":"отсутствуют",
  "live.notMarked":"Ещё не отмечена",
  "live.noRoster":"Нет списка класса",
  "live.measDone":"замеров на уроке",
  "live.allIn":"Все на месте",
  "live.leave":"Выйти — урок продолжается",
  "live.end":"Завершить урок",
  "live.markedIn":"отмечены присутствующими. Исключения отмечайте в посещаемости",
  "live.continues":"Урок продолжается. ▶ на панели вернёт к нему",
  "brand.word":"PE", "brand.full":"PE Ultimate", "about.title":"📘 О PE Ultimate",
  "bt.setup":"Настройка теста", "bt.dist":"Длина отрезка", "bt.speed":"Скорость 1-й ступени (км/ч)",
  "bt.std":"↺ Стандарт (8.0)", "bt.proto":"Стандартный протокол",
  "bt.saveProf":"💾 Сохранить профиль", "bt.age":"Возраст класса", "bt.sex":"Пол (для норм)",
  "bt.voice":"Голосовые объявления", "bt.beeps":"Сигналы",
  "bt.live":"Тест идёт", "bt.ready":"Готов к старту", "bt.paused":"Пауза", "bt.ended":"Завершён",
  "bt.metres":"м", "bt.stage":"Ступень · отрезок", "bt.time":"Время", "bt.speedNow":"Скорость",
  "bt.inStage":"Прогресс в ступени", "bt.vo2":"Текущий VO₂max",
  "bt.start":"▶ Старт", "bt.reset":"↺ Сброс",
  "bt.drop":"🛑 Сход · ученик остановился",
  "bt.laneMode":"Запись по номеру дорожки", "bt.laneN":"Сколько дорожек",
  "bt.undo":"↩ Отменить последнюю запись",
  "bt.heat":"Состав забега", "bt.loadCls":"👥 Загрузить класс", "bt.clearCls":"✕ Очистить",
  "bt.board":"Результаты", "bt.byOrder":"По порядку", "bt.byDist":"По дистанции",
  "bt.cRank":"Место", "bt.cName":"Имя", "bt.cDist":"Дистанция", "bt.cCat":"Категория",
  "bt.empty":"Записей пока нет.",
  "pf.tLive":"🎯 Живая дорожка", "pf.tStrip":"🎞 Снимок финиша", "pf.tRes":"🏁 Результаты",
  "pf.tLaps":"🔄 Круги", "pf.tArc":"🗄 Архив", "pf.tMeta":"📋 О забеге",
  "pf.sim":"Симуляция", "pf.cam":"Камера", "pf.gun":"🔫 Старт", "pf.stop":"⏹ Остановить",
  "pf.line":"Положение линии финиша", "pf.sens":"Чувствительность ·",
  "pf.lanes":"Дорожки и участники", "pf.loadCls":"👥 Загрузить класс",
  "pf.board":"Официальные результаты", "pf.cLane":"Дорожка", "pf.cTime":"Время",
  "pf.cGap":"Отставание", "pf.cSrc":"Источник",
  "stu.tabList":"👥 Мои ученики", "stu.tabGrades":"📊 Оценки", "stu.title":"Мои ученики",
  "stu.search":"Поиск", "stu.sort":"Сортировка", "stu.add":"+ Добавить учеников",
  "stu.count":"Учеников", "stu.avg":"Средний VO₂max", "stu.allCls":"Все классы",
  "stu.below":"Зона риска", "stu.falling":"Спад",
  "lock.sub":"Зона учителя — введите код",
  "lock.enter":"Вход учителя",
  "lock.or":"или",
  "lock.student":"👦 Вход ученика — без кода",
  "lock.studentNote":"Режим ученика: просмотр таблицы рекордов и страницы игр, отправка нового рекорда на подтверждение учителю. Без доступа к ученикам, тестам, настройкам и подтверждению рекордов.",
  "lock.demo":"🎬 Демо-режим — обзор без кода",
  "lock.demoNote":"Демо: учебный класс с результатами, чтобы посмотреть, как всё работает, до ввода реальных учеников. Демо-данные удаляются одним нажатием.",
  "lock.aboutQ":"Что это?",
  "lock.aboutA":"Полевой набор для учителя физкультуры: тесты, бип-тест, фотофиниш с камеры, планы уроков, рекорды и оценки.",
  "lock.dataQ":"Где данные?",
  "lock.dataA":"Только на этом устройстве. Нет сервера, нет аккаунта, ничего никуда не отправляется.",
  "lock.newCode":"Задайте код учителя — тот, что знаете только вы",
  "lock.setCode":"Задать код и войти",
  "lock.newCodePh":"Новый код",
  "lock.welcome":"С возвращением, тренер 👋",
  "lock.wrong":"Неверный код",
  "lock.tooShort":"Выберите код минимум из 4 цифр",
  "lead.title":"Прежде чем начать",
  "lead.sub":"Приложение полностью бесплатное — без банковской карты, без оплаты и без обязательств. Оставьте немного данных, чтобы мы могли прислать вам короткую анкету отзыва — это поможет нам улучшить приложение и сделать его более профессиональным в дальнейшем.",
  "lead.contactHint":"Телефон или email — достаточно одного. Это просто способ связаться с вами, не более того.",
  "lead.first":"Имя",
  "lead.last":"Фамилия",
  "lead.phone":"Телефон",
  "lead.email":"Email",
  "lead.send":"Отправить и продолжить",
  "lead.note":"Бесплатно и без банковской карты — приложение бесплатное. Эти данные отправляются напрямую нам только для связи с вами. Всё остальное — ученики, оценки, замеры — остаётся только на вашем устройстве, как и раньше.",

  "nav.home":"Главная", "nav.tests":"Тесты", "nav.lesson":"Урок",
  "nav.beep":"Бип", "nav.photo":"Финиш", "nav.records":"Рекорды",
  "nav.games":"Игры", "nav.more":"Ещё", "nav.back":"Назад",

  "home.greet":"Добрый день,", "home.coach":"тренер.",
  "home.statRuns":"забегов замерено", "home.statBeep":"лучший бип",
  "home.statRecs":"рекордов подтверждено", "home.statStu":"учеников в наблюдении",
  "home.today":"Мои уроки сегодня", "home.schedEdit":"🗓 Расписание",
  "home.lastLesson":"Последний урок", "home.allLessons":"📖 Все уроки",
  "home.ft":"Тесты физподготовки",
  "home.ftSub":"31 тестов · секундомер и счётчик · список класса · индекс формы",
  "home.lesson":"Планы уроков",
  "home.lessonSub":"разминка → станции → замер · быстро или вручную",
  "home.beep":"Бип-тест",
  "home.beepSub":"сигналы по аудиочасам · VO₂max · нормы FITNESSGRAM",
  "home.photo":"Фотофиниш",
  "home.photoSub":"замер с камеры · спринт · круги · грамоты",
  "home.know":"Знания",
  "home.knowSub":"официальные источники · проверенные программы тренировок · игры",
  "home.more":"Другие возможности",
  "home.moreSub":"чемпионы школы · ученики и оценки · знания · инструменты класса · питание",
  "home.challenge":"Вызов недели",
  "home.chPlus":"+ добавить", "home.chEdit":"✎ новый вызов",
  "home.tip":"Полевой совет",

  "more.title":"\u2630 Меню",
  "more.home":"Что сейчас — главная", "more.sched":"Расписание", "more.groups":"Учебные группы",
  "more.ft":"Тесты физподготовки", "more.lesson":"Планы уроков", "more.beep":"Бип-тест", "more.photo":"Фотофиниш",
  "more.guide":"Гид по экрану", "more.settings":"Настройки и резервная копия",
  "more.records":"Чемпионы школы", "more.students":"Ученики и оценки",
  "more.knowledge":"Знания", "more.tools":"Инструменты класса", "more.nutrition":"Уголок питания",

  "set.title":"Настройки",
  "set.school":"Название школы (в шапке, на грамотах и в режиме ТВ)",
  "set.theme":"Цветовая тема",
  "set.themeHint":"«День» и «Яркое солнце» — для улицы: светлый фон и высокий контраст, читаемые под прямым солнцем.",
  "set.sound":"Звуки", "set.voice":"Голосовые объявления",
  "set.wake":"Не гасить экран во время активности",
  "set.lock":"Блокировать зону учителя при входе",
  "set.touch":"Крупные кнопки (управление одной рукой во время урока)",
  "set.save":"Сохранить", "set.saved":"Настройки сохранены",
  "set.clsTitle":"🏷 Названия классов",
  "set.clsHint":"Переименование меняет только название. Ученики, измерения и уроки класса остаются с ним — они определяются по постоянному id, а не по названию.",
  "set.clsPick":"Класс", "set.clsCurLbl":"Текущее название", "set.clsNewLbl":"Новое название",
  "set.clsNewPh":"например: 9 класс, группа 3 — с углублённым изучением", "set.clsSaveBtn":"Сохранить",
  "set.lang":"Язык", "set.langHint":"Язык интерфейса меняется сразу. Переведено всё содержимое — экраны, тесты, игры, планы уроков, база знаний и сообщения. Перевод — профессиональный черновик, ожидающий проверки носителем языка.",
  "set.about":"📘 О программе, версия и благодарности",
  "set.purge":"🧹 Очистить старые данные",
  "set.install":"📲 Установка как приложение: в Chrome — меню ⋮ и «Добавить на главный экран». На iPhone — «Поделиться» и «На экран «Домой»». Сохранённое как файл, приложение работает и без интернета (из сети грузятся только шрифты).",

  "bk.title":"💾 Резервная копия и восстановление",
  "bk.body":"Все ваши данные — ученики, результаты, рекорды, оценки, нормы и настройки — хранятся <b>только на этом устройстве</b>. Сломанное устройство или очистка данных сайта — и всё пропало без возврата. Один файл копии решает это, а заодно переносит всё на новое устройство или другому учителю.",
  "bk.export":"⬇ Сохранить всё в файл",
  "bk.import":"⬆ Восстановить из файла",
  "bk.encrypt":"🔐 Зашифровать копию паролем",
  "bk.encryptHint":"Зашифрованный файл можно хранить на Диске или отправлять по почте — никто, даже сам сервис хранения, не прочитает содержимое. <b>Восстановить пароль нельзя:</b> забыли пароль — потеряли файл. В этом смысл настоящего шифрования. Без этой галочки — обычный незашифрованный файл, который откроет любая программа, читающая JSON.",
  "bk.pass":"Пароль", "bk.passAgain":"Ещё раз, для проверки",
  "bk.passTitleNew":"🔐 Пароль для копии", "bk.passTitleOpen":"🔐 Этот файл зашифрован",
  "bk.passHintNew":"Выберите пароль. <b>Восстановить его нельзя</b> — сохраните там, где не забудете, иначе файл будет потерян.",
  "bk.passHintOpen":"Этот файл зашифрован. Введите пароль, с которым он был создан.",
  "bk.passShort":"Пароль должен быть не короче 8 символов.",
  "bk.passMismatch":"Пароли не совпадают.",
  "bk.passWrongLeft":"Неверный пароль — осталось попыток: {n}",
  "bk.passWrongFinal":"Неверный пароль. Файл не открыт.",
  "bk.never":"копия ещё не создавалась",
  "bk.lastAt":"последняя копия",
  "bk.groups":"групп данных",
  "bk.restoreTitle":"⬆ Восстановление из файла копии",
  "bk.restoreHint":"Вот что в файле. Восстановление <b>заменяет</b> данные на устройстве — сначала сохраните текущее состояние.",
  "bk.colItem":"Данные", "bk.colFile":"В файле", "bk.colHere":"На устройстве сейчас",
  "bk.safety":"⬇ Сначала сохранить текущее состояние",
  "bk.go":"✓ Восстановить и заменить",
  "bk.cancel":"Отмена",
  "bk.confirm":"Восстановить? Все данные на устройстве будут заменены данными из файла.",
  "bk.done":"✓ Восстановлено — перезагрузка",
  "bk.bad":"Этот файл не является резервной копией PE Ultimate",

  "thm.dark":"Ночь", "thm.turf":"Газон", "thm.slate":"Сланец", "thm.day":"День", "thm.sun":"Яркое солнце",
  "i18n.partial":"Переведено полностью (черновик, ожидает проверки носителем языка).",
  "ui.close":"Закрыть", "ui.cancel":"Отмена", "ui.save":"Сохранить", "ui.delete":"Удалить",
  "ui.edit":"Изменить", "ui.add":"Добавить", "ui.export":"Экспорт", "ui.import":"Импорт",
  "ui.search":"Поиск", "ui.sort":"Сортировка", "ui.class":"Класс", "ui.grade":"Параллель",
  "ui.name":"Имя", "ui.date":"Дата", "ui.result":"Результат", "ui.score":"Балл",
  "ui.boys":"Мальчики", "ui.girls":"Девочки", "ui.all":"Все", "ui.none":"Нет",
  "ui.yes":"Да", "ui.no":"Нет", "ui.back":"Назад", "ui.next":"Далее", "ui.done":"Готово",
  "ui.sun":"Режим солнца — высокий контраст для дневного света",
  "ui.sunOff":"Вернуться к обычной теме",
  "ui.menu":"Меню — все экраны",
  "ui.settings":"Настройки",
  "ui.info":"Краткое руководство — что делает этот экран",
  "ui.demoBar":"Демо-режим", "ui.demoNote":"— данные здесь учебные",
  "ui.demoClear":"Очистить демо-данные",
  "ui.explain":"Пояснение",

  /* --- השלמה: מפתחות שהיו חסרים ברוסית --- */
  "bt.protoOff":"Изменённый протокол",
  "bt.profDel":"Удалить профиль",
  "bt.prof":"— профиль —",
  "bt.warn":"⚠️ Протокол отличается от стандартного (20 м, старт ≥ 8.0 км/ч) — значения VO₂max показаны только как оценка.",
  "bt.keys":"Клавиши: Пробел = старт/пауза · Enter = запись",
  "bt.heatHint":"Загрузите класс и нажимайте на остановившегося ученика вместо большой кнопки — имя попадёт в таблицу точно, без набора потом.",
  "bt.toTrack":"⇧ Сохранить в мониторинг",
  "bt.toFt":"🏅 Отправить в тесты физподготовки",
  "bt.cStage":"Ступень·отрезок",
  "bt.emptyHint":"Во время бега — когда ученик останавливается, нажмите кнопку записи, и он попадёт в таблицу.",
  "bt.refTable":"📋 Полная таблица ступеней и дистанций",
  "bt.normTable":"📚 Таблица норм VO₂max (FITNESSGRAM®)",
  "pf.simMode":"Режим симуляции",
  "pf.resetRace":"↺ Сбросить забег",
  "pf.slit":"Ширина щели ·",
  "pf.minT":"Мин. интервал (с)",
  "pf.autoDetect":"Автоматическое обнаружение движения на линии финиша",
  "pf.micStart":"Звуковой старт — пистолет / хлопок (микрофон)",
  "pf.gunDist":"Расстояние микрофона от стартёра (м)",
  "pf.noOffset":"без поправки",
  "pf.paste":"📋 Вставить список",
  "pf.editNames":"✎ Изменить имена",
  "pf.laneCount":"Число дорожек ·",
  "pf.tapHint":"Нажатие на дорожку фиксирует пересечение сейчас · клавиши 1–9 делают то же с клавиатуры.",
  "pf.sanity":"✅ Проверка за одну минуту — перед каждым забегом",
  "pf.emptyRes":"Результатов пока нет. Проведите забег или импортируйте CSV.",
  "pf.ai":"🎙️ Комментаторский отчёт",
  "pf.arcSave":"💾 Сохранить в архив",
  "pf.csv":"⬇ Экспорт CSV",
  "pf.sheet":"🖼 Снимок + таблица",
  "pf.cert":"🖨 Грамота победителю",
  "pf.mail":"✉ Отправить результаты",
  "pf.addRow":"＋ Строка",
  "pf.numbers":"🔢 Стартовые номера",
  "stu.tabPeer":"🤝 Взаимооценка",
  "stu.searchPh":"Имя ученика",
  "stu.sName":"По имени",
  "stu.sCls":"По классу",
  "stu.sVo2":"VO₂max — по убыванию",
  "stu.sVo2a":"VO₂max — по возрастанию",
  "stu.sTrend":"Сначала со спадом",
  "stu.sTests":"Меньше всего измерений",
  "stu.fromBeep":"⇩ Из таблицы бип-теста",
  "stu.csv":"⬇ CSV класса",
  "stu.empty":"Учеников пока нет.",
  "stu.emptyHint":"Добавьте список вручную или импортируйте имена из таблицы бип-теста.",

  /* --- תזונה --- */
  "nut.daily":"Совет дня",
  "nut.say":"🔊 Прочитать классу",
  "nut.shuffle":"🔀 Другой совет",
  "nut.all":"Все советы",
  "nut.c.all":"Все",
  "nut.c.before":"До нагрузки",
  "nut.c.after":"После нагрузки",
  "nut.c.water":"Питьё",
  "nut.c.food":"Тарелка спортсмена",
  "nut.c.myth":"Разрушаем мифы",
  "nut.tip.0":"За 1,5–2 часа до интенсивного урока: легкоусвояемые углеводы — ломтик хлеба с мёдом, банан, каша. Ничего жареного и жирного.",
  "nut.tip.1":"За полчаса до бип-теста или зачёта — только вода. Еда слишком близко к нагрузке = колики в боку и тяжесть.",
  "nut.tip.2":"Урок первым? Маленький завтрак лучше, чем ничего: йогурт, фрукт, ломтик хлеба. Голодный организм устаёт быстрее.",
  "nut.tip.3":"Окно восстановления: в течение часа после нагрузки — углеводы + белок. Какао и бутерброд с сыром — отличное и простое сочетание.",
  "nut.tip.4":"Мышцы забиты на следующий день? Это естественная отсроченная боль (DOMS). Вода, белок в еде и лёгкое движение лучше полного покоя.",
  "nut.tip.5":"Простое правило для урока: стакан воды до, глоток каждые 15 мин, стакан в конце. Летом — вдвое больше.",
  "nut.tip.6":"Цвет мочи = самый доступный индикатор обезвоживания. Темнее светлого лимонада? Жидкости не хватает ещё до того, как появилась жажда.",
  "nut.tip.7":"Энергетические напитки подросткам перед спортом запрещены — кофеин повышает пульс и скрывает признаки перегрузки. Вода всегда выигрывает.",
  "nut.tip.8":"Сбалансированная тарелка: половина — овощи, четверть — белок (курица/рыба/бобовые/яйцо), четверть — цельнозерновые углеводы. Просто — и это 80% дела.",
  "nut.tip.9":"Железо особенно важно для активных подростков (и особенно для девочек): нежирное мясо, бобовые, тхина. Нехватка железа = усталость на бип-тесте.",
  "nut.tip.10":"Кальций + витамин D в подростковом возрасте формируют пиковую костную массу на всю жизнь. Молочные продукты, тхина, солнце на улице — ровно то, что даёт урок физкультуры.",
  "nut.tip.11":"«Белок = мышцы»? Организм усваивает ограниченное количество белка. Тренирующемуся подростку нужно ~1,2–1,6 г на кг из обычной еды — порошки в школьном возрасте не нужны.",
  "nut.tip.12":"«Потеть = худеть»: пот — это потеря жидкости, а не жира. Вес возвращается со стаканом воды. Решает энергетический баланс на длинной дистанции.",
  "nut.tip.13":"«Углеводы полнят»: для юного спортсмена углеводы — топливо. Нет топлива — нет хорошего бип-теста. Вопрос в том, какие углеводы и сколько, а не нужны ли они.",
  "nut.tip.14":"Жёсткие диеты в подростковом возрасте вредят росту и результатам. Ученик, который говорит о голодании или строгой диете, заслуживает спокойного разговора и направления к школьному психологу.",

  /* --- טיפי שטח בדף הבית --- */
  "home.tip.0":"Бип-тест: встаньте в конце дорожки, чтобы весь класс слышал динамик, — и прибавьте громкость перед стартом.",
  "home.tip.1":"Фотофиниш: вносите бегунов по порядку дорожек от самого быстрого к самому медленному — распознавание раздаёт время по порядку списка.",
  "home.tip.2":"Режим ТВ в таблице рекордов отлично подходит для входа в школу — подключите компьютер к экрану через HDMI и нажмите 📺.",
  "home.tip.3":"Кубик физподготовки — отличная разминка: 3 броска = полная разминка, и ни один ученик не спорит с кубиком.",
  "home.tip.4":"Экран телефона не погаснет посреди занятия — запрет выключения экрана активен, пока идёт таймер (можно отключить в настройках).",
  "home.tip.5":"Приложение можно установить на главный экран — меню браузера, затем «Добавить на главный экран».",
  "home.onboard":"Впервые здесь? Нажмите 🎬 «Демо-режим» на экране входа — учебный класс с настоящими результатами, чтобы увидеть, как всё работает, до ввода реальных учеников.",

  /* --- פוטו־פיניש: הדרכת פתיחה --- */
  "pfg.title":"📷 Фотофиниш — 4 шага",
  "pfg.prev":"← Назад",
  "pfg.next":"Далее →",
  "pfg.go":"Поехали, измеряем",
  "pfg.skip":"Больше не показывать",
  "pfg.0.h":"Закрепите телефон — не держите в руке",
  "pfg.0.p":"Камера должна видеть <b>линию финиша сбоку</b>, примерно на высоте груди. Штатив, забор, скамейка или сумка — что угодно устойчивое. Сдвиг на сантиметр смещает линию, а вместе с ней и все времена.",
  "pfg.1.h":"Совместите красную линию с линией финиша",
  "pfg.1.p":"Двигайте «Положение линии финиша», пока красная линия на экране не ляжет <b>точно</b> на линию финиша на площадке. Это единственный параметр, ошибка в котором обесценивает весь забег.",
  "pfg.2.h":"Если есть стартовый пистолет — введите расстояние до него",
  "pfg.2.p":"Звук проходит 343 м в секунду. Камера в 34 м от старта слышит выстрел на десятую долю секунды позже, и все времена получаются короче ровно на эту десятую. Ввод расстояния это компенсирует.",
  "pfg.3.h":"При плотном финише — нажмите на бегуна на снимке",
  "pfg.3.p":"После забега, в «🎞 Снимок финиша», нажатие на корпус бегуна даёт время с интерполяцией между столбцами. <b>Точнее автоматического триггера</b> — так работают в финале.",

  /* --- פוטו־פיניש: בדיקת שפיות --- */
  "pfs.title":"✅ Проверка за одну минуту",
  "pfs.hint":"Делайте это один раз на каждом новом месте. Именно это отличает измерение от числа, которое только похоже на измерение.",
  "pfs.list":"<li><b>Телефон неподвижен.</b> Штатив, забор или сумка — не в руке. Сдвиг на сантиметр смещает линию финиша.</li><li><b>Строка состояния зелёная:</b> «🟢 Камера активна · распознавание включено». Застряло на «Калибровка фона…» = что-то двигается или меняется освещение.</li><li><b>Ученик проходит шагом.</b> Сигнал должен прозвучать <b>ровно</b> в момент, когда он на линии. Слишком рано — красная линия не на линии финиша; исправьте в «Положение линии финиша».</li><li><b>После забега</b> — «🎞 Снимок финиша» показывает временное разрешение ±X мс. Это реальное измерение с вашего телефона, а не обещание.</li><li><b>При плотном финише:</b> нажмите на самого бегуна на ленте. Интерполяция между столбцами точнее автоматического триггера.</li>",
  "pfs.ok":"Понятно — поехали",

  /* --- פוטו־פיניש: מספרי חזה --- */
  "pfn.title":"🔢 Стартовые номера",
  "pfn.hint":"Когда бегуны с нагрудными номерами, а не по списку, — впишите здесь номер для каждой дорожки. Он появится в таблице, в экспорте и в грамоте. Дорожку без бегуна можно оставить пустой.",

  /* --- מדריך מהיר (ℹ) --- */
  "info.title":"ℹ️ Краткое руководство",
  "info.top":"Один полевой набор: тесты физподготовки, бип-тест, фотофиниш, планы уроков, рекорды, посещаемость и оценки. Работает и без связи, а все данные хранятся <b>только на этом устройстве</b> — поэтому время от времени делайте резервную копию в файл (⚙ Настройки → «Сохранить всё в файл»).",
  "info.home.s":"🚀 С чего начать",
  "info.home.w":"Три шага, один раз — и можно работать.",
  "info.home.l":"<li><b>Код учителя</b> задаётся при первом входе и защищает зону учителя, когда телефон переходит из рук в руки.</li><li><b>🎬 Демо-режим</b> на экране входа — учебный класс с результатами, чтобы увидеть, как всё работает, до ввода реальных учеников. Очищается одним нажатием.</li><li><b>Один настоящий класс</b> — «Тесты физподготовки» → выберите параллель и номер → «👥 Список». С этого момента тот же список доступен на всех остальных экранах.</li>",
  "info.ft.s":"🏅 Тесты физподготовки",
  "info.ft.w":"Сердце приложения: 31 тест с секундомером и счётчиком. Выберите класс и тест и введите результат каждому ученику.",
  "info.ft.l":"<li><b>🏅 Тесты</b> экран, где идут реальные измерения. Каждый результат сохраняется за учеником и не удаляется.</li><li><b>📊 Индекс физподготовки</b> общая оценка физподготовки каждого ученика относительно норм.</li><li><b>🏅 Значок по физкультуре</b> кто выполняет требования и чего ему не хватает.</li><li><b>📋 Чего не хватает классу</b> кто уже прошёл каждый тест, а кто ещё нет, — вместо поиска по спискам.</li><li><b>📈 Динамика</b> по каждому тесту: сколько улучшились, сколько ухудшились, сколько без изменений.</li>",
  "info.lesson.s":"📋 Планы уроков",
  "info.lesson.w":"Полный план — разминка, станции, игра и заключение — одним нажатием или вручную.",
  "info.lesson.l":"<li><b>⚡ Быстро</b> выберите тему, параллель, длительность и место — план соберётся сам, со связью со стандартами.</li><li><b>🧩 Ручной конструктор</b> соберите урок сами из готовых этапов.</li><li><b>▶ Начать урок</b> открывает «активный урок», и каждое измерение с этого момента записывается в него. Если кнопка просит класс — «🏷 Выбрать класс» рядом.</li><li><b>💾 Сохранить · 🖨 Печать</b> план сохраняется в библиотеке для повторного использования в следующем году.</li>",
  "info.fit.s":"⏱ Фитнес",
  "info.fit.w":"Инструменты, которые ведут сам урок, без подготовки заранее.",
  "info.fit.l":"<li><b>⏱ Интервальный таймер</b> работа/отдых с голосовыми объявлениями.</li><li><b>🔁 Станции для класса</b> готовая круговая тренировка для показа на экране.</li><li><b>📖 Библиотека упражнений · 🎲 Кубик физподготовки</b> упражнение по задаче или жеребьёвка, когда нужно разнообразие.</li><li><b>🏋️ Программа тренажёрного зала</b> для старших классов.</li>",
  "info.games.s":"🎮 Игры",
  "info.games.w":"Игры для перемен и конца урока — с целью, вариациями и правилами безопасности.",
  "info.games.l":"<li>Поиск по названию, инвентарю или цели.</li><li>Любую игру можно сразу перенести в план урока.</li>",
  "info.beep.s":"🎵 Бип-тест",
  "info.beep.w":"Проводит бип-тест с точностью аудиочасов, рассчитывает VO₂max и сравнивает с нормами FITNESSGRAM.",
  "info.beep.l":"<li><b>Загрузить класс</b> подтягивает уже введённый список — без повторного набора имён.</li><li><b>Записать сход</b> нажмите на ученика в момент остановки, и его ступень будет записана.</li><li><b>Отправить в тесты физподготовки</b> результат попадает в карточку ученика и в индекс физподготовки.</li>",
  "info.photo.s":"📷 Фотофиниш",
  "info.photo.w":"Измеряет время забега камерой телефона и показывает на снимке, кто пересёк линию первым.",
  "info.photo.l":"<li><b>🏁 Забег</b> часы, старт и дорожки — только то, что нужно у линии.</li><li><b>📐 Установка</b> один раз заранее: положение камеры, линия финиша, расстояние до пистолета и чувствительность распознавания.</li><li><b>🎞 Снимок финиша · 🏁 Результаты</b> момент пересечения и точное время по каждой дорожке; «Сохранить для класса» заносит времена в тесты физподготовки.</li><li><b>🔄 Круги</b> длинные забеги. Прошлые забеги — в архиве под таблицей результатов.</li>",
  "info.rec.s":"🏆 Чемпионы школы",
  "info.rec.w":"Таблица школьных рекордов в сравнении с рекордами страны и мира.",
  "info.rec.l":"<li>Ученик отправляет рекорд с видео-доказательством — и он появляется в таблице <b>только после вашего подтверждения</b>.</li><li><b>📺 Режим ТВ</b> для экрана у входа в зал · <b>🔗 Ссылка / QR</b> чтобы поделиться с учениками.</li>",
  "info.stu.s":"👥 Ученики и оценки",
  "info.stu.w":"Список учеников, таблица оценок по периодам и взаимооценка.",
  "info.stu.l":"<li><b>⬇ Заполнить по посещаемости</b> ставит оценку за участие по данным посещаемости — только в пустые ячейки, не затирая введённую вами оценку.</li><li><b>⬇ CSV</b> выгружает таблицу в электронную таблицу.</li>",
  "info.tools.s":"🧰 Инструменты класса",
  "info.tools.w":"Четыре инструмента для моментов, которые повторяются на каждом уроке.",
  "info.tools.l":"<li><b>👥 Команды</b> сбалансированное деление по последнему результату — без команды, у которой нет шансов.</li><li><b>🎯 Жребий</b> выбирает случайного ученика.</li><li><b>✅ Посещаемость</b> ежедневная отметка — из неё заполняется оценка за участие.</li><li><b>📋 Рубрики</b> оценивание по критериям.</li>",
  "info.know.s":"📚 Знания",
  "info.know.w":"Профессиональная опора для решений — источники, программы и цифры.",
  "info.know.l":"<li><b>📚 Официальные источники</b> каждый пункт связан с актуальным документом.</li><li><b>🏋️ Проверенные программы · 📌 Цифры, которые стоит помнить</b> для момента, когда решение нужно обосновать перед родителем или директором.</li>",
  "info.nut.s":"🥗 Уголок питания",
  "info.nut.w":"Короткий совет дня, чтобы прочитать классу, и подборка советов по темам.",
  "info.data.s":"💾 Ваши данные",
  "info.data.w":"Нет сервера и нет аккаунта — это и преимущество, и ответственность.",
  "info.data.l":"<li><b>Резервная копия</b> ⚙ Настройки → «⬇ Сохранить всё в файл». «⬆ Восстановить из файла» возвращает всё на новом устройстве.</li><li><b>Шифрование</b> резервную копию можно зашифровать паролем — но восстановления пароля нет. Потерян пароль — потерян файл.</li><li><b>Неверное название класса?</b> ⚙ Настройки → «🏷 Названия классов». Переименование не отвязывает ни одного ученика и ни одного измерения.</li><li><b>Трудно читать на солнце?</b> ☀ в верхней панели, а в настройках — «Крупные кнопки» для работы одной рукой.</li>",

  /* --- אודות --- */
  "ab.p":"Полевой набор для учителя физкультуры: тесты физподготовки, бип-тест, фотофиниш с камеры, планы уроков, таблица рекордов, инструменты класса и оценки — всё на одном экране и без отправки чего-либо наружу.",
  "ab.privT":"🔒 Конфиденциальность",
  "ab.priv":"Данные учеников — списки, оценки и измерения — хранятся только в localStorage этого устройства. <b>Нет сервера, нет аккаунта, ничего никуда не отправляется.</b> Это данные о несовершеннолетних, поэтому так задумано, а не случайно. Экспорт CSV или резервная копия — всегда ваше собственное действие. Очистка данных сайта в браузере удаляет всё — поэтому есть резервная копия. Единственное, что покидает устройство, — ваши (учителя) контактные данные, введённые на первом приветственном экране, — не данные об учениках, — и отправляются они один раз.",
  "ab.srcT":"📚 Профессиональные источники",
  "ab.src":"Протокол Léger (бип-тест) · нормы FITNESSGRAM® от Cooper Institute · «Значок по физкультуре — стандарты оценки достижений учащихся», Министерство образования Израиля, Педагогический секретариат · учебная программа по физической культуре. Школьные нормы — данные учителя и хранятся на устройстве.",
  "ab.builtT":"🛠 Сделано с помощью",
  "ab.built":"Только JavaScript, HTML и CSS — без внешних библиотек и без шага сборки в браузере, чтобы приложение быстро открывалось и работало в поле без сети. Разработано совместно с Claude Code.",
  "ab.warnT":"⚠️ Ограничение ответственности",
  "ab.warn":"Вспомогательный инструмент для преподавания. Измерения камерой и секундомером настолько хороши, насколько позволяют условия на площадке, и не заменяют сертифицированное хронометражное оборудование для официальных соревнований. Педагогическое решение и оценка — за вами."
},

es:{
  /* ux-redesign */
  "pf.tRace":"🏁 Carrera",
  "pf.tSetup":"📐 Colocación",
  "pfw.s0":"Posición",
  "pfw.s1":"Línea de meta",
  "pfw.s2":"Salida",
  "pfw.s3":"Detección",
  "pfw.s4":"Datos de la carrera",
  "pfw.lineHint":"Alinead la línea roja en la imagen de arriba. ⇋ voltea la imagen, ＋/－ acercan y alejan — y el zoom también mejora la precisión.",
  "pfw.metaP":"La distancia decide a qué prueba van los tiempos al guardarlos para la clase (60 m → carrera de 60 m). El nombre, la ronda y el viento aparecen en la tabla, los diplomas y el informe.",
  "pfw.done":"✓ Listo — a la carrera",
  "pf.saveCls":"🏅 Guardar para la clase",
  "pf.saveTo":"🏅 Guardar para {0}",
  "pf.share":"📤 Compartir / exportar",
  "pf.arcFold":"🗄 Archivo de carreras",
  "bt.saveCls":"🏅 Guardar para la clase",
  /* ux-redesign */
  "prep.today":"hoy",
  "prep.tomorrow":"mañana",
  "prep.title":"Por preparar",
  "prep.sub":"Próximas sesiones sin plan",
  "prep.btn":"Preparar plan",
  "ui.day":"día",
  "asg.btn":"📌 Asignar a sesión",
  "asg.title":"Asignar a una sesión",
  "asg.hint":"El plan aparecerá en «Hoy» y se abrirá solo cuando empiece la sesión.",
  "asg.this":"asignado",
  "asg.other":"sustituye un plan",
  "asg.noSlots":"Este grupo no tiene sesiones en el horario en las próximas dos semanas: elige una fecha.",
  "asg.toDate":"Asignar a fecha",
  "asg.pickCls":"Elige un grupo.",
  "asg.done":"Plan asignado a ",
  "pe.newStep":"Fase nueva",
  "pe.edit":"✎ Editar fases",
  "pe.done":"✓ Terminar edición",
  "pe.add":"+ Fase",
  "pe.total":"Total",
  "ls.ready":"⚡ Plan listo: puedes editarlo, asignarlo a una sesión o guardarlo",
  "gm.added":"añadido al plan en pantalla",
  /* ux-redesign */
  "area.cls":"Centro del grupo",
  "hub.title":"Centro del grupo",
  "hub.class":"Grupo",
  "hub.group":"Agrupación",
  "hub.fit":"Condición física",
  "hub.meas":"mediciones",
  "hub.testsN":"pruebas distintas",
  "hub.lastMeas":"última",
  "hub.groupNote":"Las pantallas completas (alumnado, calificaciones, pruebas) funcionan por grupo: ábrelas desde los grupos que forman la agrupación.",
  "hub.students":"Alumnado",
  "hub.inList":"en la lista",
  "hub.openList":"Lista del alumnado",
  "hub.att":"Asistencia",
  "hub.lessonsMarked":"sesiones con asistencia",
  "hub.noAtt":"Aún no se ha pasado lista",
  "hub.partPct":"participación",
  "hub.openAtt":"Asistencia e informe",
  "hub.openIdx":"Índice de condición física",
  "hub.openCov":"Qué falta",
  "hub.openProg":"Progreso",
  "hub.grades":"Calificaciones",
  "hub.graded":"con nota final",
  "hub.openGrades":"Tabla de calificaciones",
  "hub.assess":"Evaluaciones",
  "hub.peerN":"evaluaciones entre iguales",
  "hub.openPeer":"Evaluación entre iguales",
  "hub.openRub":"Rúbricas",
  "hub.empty":"Aún no hay grupos. Añade uno aquí (curso y número) y después su lista de alumnado.",
  "hub.addCls":"Grupo nuevo",
  "hub.addBtn":"Añadir grupo",
  "hub.inLesson":"en sesión ahora",
  /* ux-redesign */
  "end.attDone":"Asistencia registrada",
  "end.attPart":"Asistencia: marcados",
  "end.attRest":"El resto, presentes",
  "info.live.s":"▶ Modo sesión",
  "info.live.w":"La pantalla que llevas en la mano en la pista: todo a la vista y el grupo ya elegido.",
  "info.live.l":"<li><b>Toca un grupo</b> para abrir la sesión. Primero se ofrece el grupo que ahora está en tu horario.</li><li><b>Los mosaicos</b> — asistencia, medición, bip, foto-finish, temporizador, equipos y sorteo — guardan todo en el grupo de la sesión, sin volver a elegirlo.</li><li><b>✓ Están todos</b> marca todo el grupo con un toque. Las excepciones se marcan en el mosaico de asistencia.</li><li><b>Salir</b> no termina la sesión: el botón central de la barra te devuelve a ella. <b>⏹ Terminar sesión</b> guarda una valoración y una nota.</li>",
  /* ux-redesign */
  "u.m":"m",
  "u.kmh":"km/h",
  "bt.sumStd":"estándar",
  "bt.sumCustom":"⚠ personalizado",
  /* ux-redesign */
  "nav.today":"Hoy",
  "nav.prep":"Preparar",
  "nav.live":"Sesión",
  "nav.classes":"Grupos",
  "ui.lang":"Idioma de la interfaz",
  "ui.min":"min",
  "area.plans":"Planes",
  "area.games":"Juegos",
  "area.fit":"Ejercicios y temporizadores",
  "area.know":"Conocimiento",
  "area.nut":"Nutrición",
  "area.stu":"Alumnado y calificaciones",
  "area.ft":"Pruebas de condición física",
  "area.tools":"Herramientas de clase",
  "home.quick":"Herramientas de medición, también sin sesión",
  "home.qFt":"Pruebas",
  "home.qBeep":"Test de la bip",
  "home.qPhoto":"Foto-finish",
  "home.qTimer":"Temporizador",
  "home.more":"Reto de la semana, cifras y consejo de campo",
  "set.guide":"Guía de la pantalla de la que vienes",
  "set.secGeneral":"General",
  "set.secGeneralSub":"Idioma, centro, aspecto y sonidos",
  "set.secYear":"Inicio de curso",
  "set.secYearSub":"Horario, grupos y nombres de los grupos",
  "set.secBackup":"Copia de seguridad y sincronización",
  "set.secBackupSub":"Archivo de copia, Google Drive y sincronización de récords",
  "set.secAdv":"Avanzado",
  "set.secAdvSub":"Instalación, limpieza de datos, actualización y acerca de",
  "live.blocked":"Ya hay una sesión abierta con",
  "live.cantStart":"No se pudo abrir la sesión",
  "live.started":"La sesión ha empezado",
  "live.sugNow":"ahora en el horario",
  "live.sugNext":"siguiente en el horario",
  "live.which":"¿Qué grupo?",
  "live.whichHint":"Toca un grupo para abrir la sesión. La asistencia, las mediciones y los equipos se guardarán para ese grupo.",
  "live.planWill":"Se abrirá con el plan que tienes en pantalla:",
  "live.students":"alumnos",
  "live.noClasses":"Aún no hay grupos. Elige curso y número abajo: el grupo quedará registrado y guardado.",
  "live.other":"Otro grupo: curso y número",
  "live.startCls":"Empezar sesión",
  "live.noClassTools":"Herramientas sin grupo",
  "live.tMeas":"Medir",
  "live.tMeasSub":"31 pruebas de condición física",
  "live.tBeep":"Test de la bip",
  "live.tBeepSub":"Salida y registro de abandonos",
  "live.tPhoto":"Foto-finish",
  "live.tPhotoSub":"Cámara y calles",
  "live.tTimer":"Temporizador",
  "live.tTimerSub":"Intervalos · estaciones",
  "live.tTeams":"Equipos",
  "live.tTeamsSub":"Equilibrados, entre los presentes",
  "live.tPick":"Sorteo",
  "live.tPickSub":"Sin repetir en la ronda",
  "live.tGames":"Juegos",
  "live.tGamesSub":"Reglas y explicación",
  "live.tAtt":"Asistencia",
  "live.step":"Fase",
  "live.next":"Siguiente:",
  "live.last":"Última fase",
  "live.planBtn":"Plan completo",
  "live.nextBtn":"Siguiente fase",
  "live.noPlan":"Esta sesión no tiene plan.",
  "live.choosePlan":"Elegir o crear un plan",
  "live.present":"presentes",
  "live.absent":"ausentes",
  "live.notMarked":"Aún sin marcar",
  "live.noRoster":"Sin lista del grupo",
  "live.measDone":"mediciones en la sesión",
  "live.allIn":"Están todos",
  "live.leave":"Salir: la sesión sigue",
  "live.end":"Terminar sesión",
  "live.markedIn":"marcados como presentes. Marca las excepciones en Asistencia",
  "live.continues":"La sesión sigue. ▶ en la barra te devuelve a ella",
  "brand.word":"PE",
  "brand.full":"PE Ultimate",
  "about.title":"📘 Acerca de PE Ultimate",
  "bt.setup":"Configuración de la prueba",
  "bt.dist":"Longitud del tramo",
  "bt.speed":"Velocidad del nivel 1 (km/h)",
  "bt.std":"↺ Estándar (8.0)",
  "bt.proto":"Protocolo estándar",
  "bt.protoOff":"Protocolo modificado",
  "bt.saveProf":"💾 Guardar perfil",
  "bt.profDel":"Eliminar perfil",
  "bt.prof":"— perfil —",
  "bt.age":"Edad del grupo",
  "bt.sex":"Sexo (para baremos)",
  "bt.voice":"Anuncios por voz",
  "bt.beeps":"Pitidos",
  "bt.warn":"⚠️ El protocolo difiere del estándar (20 m, inicio ≥ 8.0 km/h) — los valores de VO₂max se muestran solo como estimación.",
  "bt.live":"Prueba en curso",
  "bt.ready":"Listo para empezar",
  "bt.paused":"En pausa",
  "bt.ended":"Finalizada",
  "bt.metres":"m",
  "bt.stage":"Nivel · tramo",
  "bt.time":"Tiempo",
  "bt.speedNow":"Velocidad",
  "bt.inStage":"Progreso dentro del nivel",
  "bt.vo2":"VO₂max actual",
  "bt.start":"▶ Empezar",
  "bt.reset":"↺ Reiniciar",
  "bt.drop":"🛑 Registrar abandono · el alumno se detuvo",
  "bt.laneMode":"Registrar por número de calle",
  "bt.laneN":"Cuántas calles",
  "bt.undo":"↩ Deshacer el último registro",
  "bt.keys":"Atajos: Espacio = empezar/pausa · Enter = registrar",
  "bt.heat":"Lista de la serie",
  "bt.loadCls":"👥 Cargar grupo",
  "bt.clearCls":"✕ Borrar",
  "bt.heatHint":"Carga un grupo y toca al alumno que se detuvo en lugar del botón grande — el nombre entra en la tabla con exactitud, sin teclear después.",
  "bt.board":"Resultados",
  "bt.byOrder":"Por orden",
  "bt.byDist":"Por distancia",
  "bt.toTrack":"⇧ Guardar en el seguimiento",
  "bt.toFt":"🏅 Enviar a las pruebas de condición física",
  "bt.cRank":"Puesto",
  "bt.cName":"Nombre",
  "bt.cStage":"Nivel·tramo",
  "bt.cDist":"Distancia",
  "bt.cCat":"Categoría",
  "bt.empty":"Aún no hay registros.",
  "bt.emptyHint":"Durante la carrera — cuando un alumno se detiene, pulsa el botón de registro y entra en la tabla.",
  "bt.refTable":"📋 Tabla completa de niveles y distancias",
  "bt.normTable":"📚 Tabla de baremos de VO₂max (FITNESSGRAM®)",
  "pf.tLive":"🎯 Calle en directo",
  "pf.tStrip":"🎞 Imagen de llegada",
  "pf.tRes":"🏁 Resultados",
  "pf.tLaps":"🔄 Vueltas",
  "pf.tArc":"🗄 Archivo",
  "pf.tMeta":"📋 Datos de la carrera",
  "pf.sim":"Simulación",
  "pf.cam":"Cámara",
  "pf.simMode":"Modo simulación",
  "pf.gun":"🔫 Salida",
  "pf.stop":"⏹ Detener carrera",
  "pf.resetRace":"↺ Reiniciar carrera",
  "pf.line":"Posición de la línea de meta",
  "pf.sens":"Sensibilidad de detección ·",
  "pf.slit":"Ancho de la ranura ·",
  "pf.minT":"Separación mín. (s)",
  "pf.autoDetect":"Detección automática de movimiento en la línea de meta",
  "pf.micStart":"Salida por sonido — pistola / palmada (micrófono)",
  "pf.gunDist":"Distancia del micrófono al juez de salida (m)",
  "pf.noOffset":"sin compensación",
  "pf.lanes":"Calles y participantes",
  "pf.loadCls":"👥 Cargar grupo",
  "pf.paste":"📋 Pegar lista",
  "pf.editNames":"✎ Editar nombres",
  "pf.laneCount":"Número de calles ·",
  "pf.tapHint":"Tocar una calle registra un paso ahora · las teclas 1–9 hacen lo mismo desde el teclado.",
  "pf.sanity":"✅ Comprobación de un minuto — antes de cada carrera",
  "pf.board":"Resultados oficiales",
  "pf.cLane":"Calle",
  "pf.cTime":"Tiempo",
  "pf.cGap":"Diferencia",
  "pf.cSrc":"Origen",
  "pf.emptyRes":"Aún no hay resultados. Haz una carrera o importa un CSV.",
  "pf.ai":"🎙️ Informe narrado",
  "pf.arcSave":"💾 Guardar en el archivo",
  "pf.csv":"⬇ Exportar CSV",
  "pf.sheet":"🖼 Imagen + tabla",
  "pf.cert":"🖨 Diploma del ganador",
  "pf.mail":"✉ Enviar resultados",
  "pf.addRow":"＋ Fila",
  "pf.numbers":"🔢 Dorsales",
  "stu.tabList":"👥 Mi alumnado",
  "stu.tabGrades":"📊 Calificaciones",
  "stu.tabPeer":"🤝 Coevaluación",
  "stu.title":"Mi alumnado",
  "stu.search":"Buscar",
  "stu.searchPh":"Nombre del alumno",
  "stu.sort":"Ordenar",
  "stu.sName":"Por nombre",
  "stu.sCls":"Por grupo",
  "stu.sVo2":"VO₂max — de mayor a menor",
  "stu.sVo2a":"VO₂max — de menor a mayor",
  "stu.sTrend":"Primero los que bajan",
  "stu.sTests":"Menos mediciones",
  "stu.add":"+ Añadir alumnado",
  "stu.fromBeep":"⇩ Desde la tabla del test de la bip",
  "stu.csv":"⬇ CSV del grupo",
  "stu.count":"Alumnos",
  "stu.avg":"VO₂max medio",
  "stu.below":"Riesgo para la salud",
  "stu.falling":"En descenso",
  "stu.allCls":"Todos los grupos",
  "stu.empty":"Aún no hay alumnado.",
  "stu.emptyHint":"Añade una lista a mano o importa los nombres desde la tabla del test de la bip.",
  "lock.sub":"Zona docente — introduce tu código",
  "lock.enter":"Entrada docente",
  "lock.or":"o",
  "lock.student":"👦 Entrada de alumnado — sin código",
  "lock.studentNote":"Modo alumnado: ver la tabla de récords y la página de juegos, y enviar un nuevo récord para que el docente lo apruebe. Sin acceso al alumnado, las pruebas, los ajustes ni la aprobación de récords.",
  "lock.demo":"🎬 Modo demostración — un recorrido, sin código",
  "lock.demoNote":"Demostración: un grupo de ejemplo con resultados, para ver cómo funciona todo antes de introducir alumnado real. Puedes borrar los datos de demostración con un toque.",
  "lock.aboutQ":"¿Qué es esto?",
  "lock.aboutA":"Un kit de campo para docentes de Educación Física: pruebas de condición física, test de la bip, foto-finish con la cámara, planes de sesión, récords y calificaciones.",
  "lock.dataQ":"¿Dónde están los datos?",
  "lock.dataA":"Solo en este dispositivo. Sin servidor, sin cuenta, no se envía nada a ninguna parte.",
  "lock.newCode":"Crea un código docente — elige uno que solo tú conozcas",
  "lock.setCode":"Guardar código y entrar",
  "lock.newCodePh":"Código nuevo",
  "lock.welcome":"¡Hola de nuevo, profe! 👋",
  "lock.wrong":"Código incorrecto",
  "lock.tooShort":"Elige un código de al menos 4 dígitos",
  "lead.title":"Justo antes de empezar",
  "lead.sub":"La aplicación es totalmente gratuita — sin tarjeta, sin pago, sin compromiso. Déjanos unos datos para enviarte un breve cuestionario de opinión — nos ayudará a mejorar la aplicación y hacerla más profesional.",
  "lead.contactHint":"Móvil o correo — con uno basta. Es solo una forma de contactarte, nada más.",
  "lead.first":"Nombre",
  "lead.last":"Apellidos",
  "lead.phone":"Móvil",
  "lead.email":"Correo electrónico",
  "lead.send":"Enviar y continuar",
  "lead.note":"Sin coste y sin tarjeta — la aplicación es gratuita. Estos datos nos llegan directamente solo para ponernos en contacto contigo. Todo lo demás — alumnado, calificaciones, mediciones — sigue solo en tu dispositivo, como siempre.",
  "nav.home":"Inicio",
  "nav.tests":"Pruebas",
  "nav.lesson":"Sesión",
  "nav.beep":"Bip",
  "nav.photo":"Meta",
  "nav.records":"Récords",
  "nav.games":"Juegos",
  "nav.more":"Más",
  "nav.back":"Atrás",
  "home.greet":"Buenos días,",
  "home.coach":"profe.",
  "home.statRuns":"carreras cronometradas",
  "home.statBeep":"mejor bip",
  "home.statRecs":"récords aprobados",
  "home.statStu":"alumnos en seguimiento",
  "home.today":"Mis sesiones de hoy",
  "home.schedEdit":"🗓 Horario",
  "home.lastLesson":"Última sesión",
  "home.allLessons":"📖 Todas las sesiones",
  "home.ft":"Pruebas de condición física",
  "home.ftSub":"31 pruebas · cronómetro y contador · lista del grupo · índice de condición física",
  "home.lesson":"Planes de sesión",
  "home.lessonSub":"calentamiento → estaciones → medición · rápido o a mano",
  "home.beep":"Test de la bip",
  "home.beepSub":"pitidos con precisión de reloj de audio · VO₂max · baremos FITNESSGRAM",
  "home.photo":"Foto-finish",
  "home.photoSub":"cronometraje con cámara · velocidad · vueltas · diplomas",
  "home.know":"Conocimiento",
  "home.knowSub":"fuentes oficiales · programas basados en evidencia · juegos",
  "home.more":"Más opciones",
  "home.moreSub":"campeones del centro · alumnado y calificaciones · conocimiento · herramientas de clase · nutrición",
  "home.challenge":"Reto de la semana",
  "home.chPlus":"+ sumar",
  "home.chEdit":"✎ nuevo reto",
  "home.tip":"Consejo de campo",
  "more.title":"☰ Menú",
  "more.home":"¿Y ahora qué? — inicio",
  "more.sched":"Horario",
  "more.groups":"Grupos de clase",
  "more.ft":"Pruebas de condición física",
  "more.lesson":"Planes de sesión",
  "more.beep":"Test de la bip",
  "more.photo":"Foto-finish",
  "more.guide":"Guía de pantallas",
  "more.settings":"Ajustes y copia de seguridad",
  "more.records":"Campeones del centro",
  "more.students":"Alumnado y calificaciones",
  "more.knowledge":"Conocimiento",
  "more.tools":"Herramientas de clase",
  "more.nutrition":"Rincón de nutrición",
  "set.title":"Ajustes",
  "set.school":"Nombre del centro (aparece en la cabecera, en los diplomas y en el modo TV)",
  "set.theme":"Tema de color",
  "set.themeHint":"«Día» y «Sol intenso» están pensados para exteriores — fondo claro y alto contraste que se leen bien a pleno sol.",
  "set.sound":"Sonidos",
  "set.voice":"Anuncios por voz",
  "set.wake":"Mantener la pantalla encendida durante la actividad",
  "set.lock":"Bloquear la zona docente al entrar",
  "set.touch":"Botones grandes (uso con una mano durante la sesión)",
  "set.save":"Guardar",
  "set.saved":"Ajustes guardados",
  "set.clsTitle":"🏷 Nombres de los grupos",
  "set.clsHint":"Renombrar solo cambia el nombre. El alumnado, las mediciones y las sesiones del grupo siguen con él — se identifican por un id fijo, no por el nombre.",
  "set.clsPick":"Grupo",
  "set.clsCurLbl":"Nombre actual",
  "set.clsNewLbl":"Nombre nuevo",
  "set.clsNewPh":"p. ej. 3.º ESO B — Deportivo",
  "set.clsSaveBtn":"Guardar",
  "set.lang":"Idioma",
  "set.langHint":"La interfaz cambia de idioma al instante. Todo el contenido está traducido: pantallas, pruebas, juegos, planes de sesión, base de conocimiento y mensajes. La traducción es un borrador profesional pendiente de revisión por hablantes nativos.",
  "set.about":"📘 Acerca de, versión y créditos",
  "set.purge":"🧹 Borrar datos antiguos",
  "set.install":"📲 Instalar como aplicación: en Chrome — menú ⋮ y luego «Añadir a pantalla de inicio». En iPhone — Compartir y luego «Añadir a pantalla de inicio». Guardada como archivo, la aplicación funciona también sin internet (solo las fuentes se cargan de la red).",
  "bk.title":"💾 Copia de seguridad y restauración",
  "bk.body":"Todos tus datos — alumnado, resultados, récords, calificaciones, baremos y ajustes — se guardan <b>solo en este dispositivo</b>. Un dispositivo roto o borrar los datos del sitio significa perderlos, sin vuelta atrás. Un archivo de copia lo resuelve, y además lo traslada todo a un dispositivo nuevo o a otro docente.",
  "bk.export":"⬇ Copiar todo a un archivo",
  "bk.import":"⬆ Restaurar desde un archivo",
  "bk.encrypt":"🔐 Cifrar la copia con una contraseña",
  "bk.encryptHint":"Un archivo cifrado puede guardarse en Drive o enviarse por correo sin que nadie — ni siquiera el servicio de almacenamiento — pueda leerlo. <b>No hay recuperación de contraseña:</b> si pierdes la contraseña, pierdes el archivo. Eso es un cifrado de verdad. Sin esta casilla — un archivo normal, sin cifrar, que cualquier herramienta que lea JSON puede abrir.",
  "bk.pass":"Contraseña",
  "bk.passAgain":"Otra vez, para confirmar",
  "bk.passTitleNew":"🔐 Contraseña de la copia",
  "bk.passTitleOpen":"🔐 Este archivo está cifrado",
  "bk.passHintNew":"Elige una contraseña. <b>No hay forma de recuperarla</b> — guárdala donde la recuerdes, o el archivo se pierde.",
  "bk.passHintOpen":"Este archivo está cifrado. Introduce la contraseña con la que se creó.",
  "bk.passShort":"La contraseña debe tener al menos 8 caracteres.",
  "bk.passMismatch":"Las dos contraseñas no coinciden.",
  "bk.passWrongLeft":"Contraseña incorrecta — quedan {n} intentos",
  "bk.passWrongFinal":"Contraseña incorrecta. El archivo no se abrió.",
  "bk.never":"nunca se ha hecho copia",
  "bk.lastAt":"última copia",
  "bk.groups":"grupos de datos",
  "bk.restoreTitle":"⬆ Restaurar desde un archivo de copia",
  "bk.restoreHint":"Esto es lo que contiene el archivo. Restaurar <b>sustituye</b> los datos de este dispositivo — así que haz primero una copia del estado actual.",
  "bk.colItem":"Datos",
  "bk.colFile":"En el archivo",
  "bk.colHere":"En el dispositivo ahora",
  "bk.safety":"⬇ Copiar primero el estado actual",
  "bk.go":"✓ Restaurar y sustituir",
  "bk.cancel":"Cancelar",
  "bk.confirm":"¿Restaurar? Todos los datos de este dispositivo se sustituirán por los del archivo.",
  "bk.done":"✓ Restaurado — recargando",
  "bk.bad":"Ese archivo no es una copia de PE Ultimate",
  "thm.dark":"Noche",
  "thm.turf":"Césped",
  "thm.slate":"Pizarra",
  "thm.day":"Día",
  "thm.sun":"Sol intenso",
  "i18n.partial":"Traducción completa (borrador pendiente de revisión nativa).",
  "ui.close":"Cerrar",
  "ui.cancel":"Cancelar",
  "ui.save":"Guardar",
  "ui.delete":"Eliminar",
  "ui.edit":"Editar",
  "ui.add":"Añadir",
  "ui.export":"Exportar",
  "ui.import":"Importar",
  "ui.search":"Buscar",
  "ui.sort":"Ordenar",
  "ui.class":"Grupo",
  "ui.grade":"Curso",
  "ui.name":"Nombre",
  "ui.date":"Fecha",
  "ui.result":"Resultado",
  "ui.score":"Puntuación",
  "ui.boys":"Chicos",
  "ui.girls":"Chicas",
  "ui.all":"Todos",
  "ui.none":"Ninguno",
  "ui.yes":"Sí",
  "ui.no":"No",
  "ui.back":"Atrás",
  "ui.next":"Siguiente",
  "ui.done":"Hecho",
  "ui.sun":"Modo sol intenso — alto contraste para la luz del día",
  "ui.sunOff":"Volver al tema normal",
  "ui.menu":"Menú — todas las pantallas",
  "ui.settings":"Ajustes",
  "ui.info":"Guía rápida — qué hace esta pantalla",
  "ui.demoBar":"Modo demostración",
  "ui.demoNote":"— los datos aquí son de ejemplo",
  "ui.demoClear":"Borrar datos de demostración",
  "ui.explain":"Explicación",

  /* --- תזונה --- */
  "nut.daily":"Consejo del día",
  "nut.say":"🔊 Leer a la clase",
  "nut.shuffle":"🔀 Otro consejo",
  "nut.all":"Todos los consejos",
  "nut.c.all":"Todos",
  "nut.c.before":"Antes de la actividad",
  "nut.c.after":"Después de la actividad",
  "nut.c.water":"Hidratación",
  "nut.c.food":"Plato del deportista",
  "nut.c.myth":"Rompiendo mitos",
  "nut.tip.0":"1,5–2 horas antes de una sesión intensa: un hidrato de carbono fácil de digerir — una rebanada de pan con miel, un plátano, unas gachas. Nada frito ni graso.",
  "nut.tip.1":"Media hora antes del test de la bip o de un examen — solo agua. Comer demasiado cerca del esfuerzo = flato y pesadez.",
  "nut.tip.2":"¿Sesión a primera hora? Un desayuno pequeño es mejor que nada: yogur, fruta, una rebanada de pan. Un cuerpo en ayunas se cansa antes.",
  "nut.tip.3":"La ventana de recuperación: hasta una hora después del esfuerzo — hidratos + proteína. Un batido de cacao y un bocadillo de queso son una combinación excelente y sencilla.",
  "nut.tip.4":"¿Agujetas al día siguiente? Es DOMS, algo natural. Agua, proteína en las comidas y movimiento suave son mejores que el reposo absoluto.",
  "nut.tip.5":"Regla práctica para la sesión: un vaso de agua antes, un sorbo cada 15 min, un vaso al final. En verano — el doble.",
  "nut.tip.6":"El color de la orina = el indicador de deshidratación más a mano. ¿Más oscuro que una limonada clara? Faltan líquidos incluso antes de tener sed.",
  "nut.tip.7":"Las bebidas energéticas están prohibidas antes del deporte para adolescentes — la cafeína sube el pulso y oculta los signos de sobrecarga. El agua siempre gana.",
  "nut.tip.8":"Un plato equilibrado: la mitad verduras, un cuarto proteína (pollo/pescado/legumbres/huevo), un cuarto hidratos integrales. Sencillo — y es el 80 % del trabajo.",
  "nut.tip.9":"El hierro es especialmente importante para adolescentes activos (y sobre todo para las chicas): carne magra, legumbres, tahini. Falta de hierro = cansancio en el test de la bip.",
  "nut.tip.10":"Calcio + vitamina D en la adolescencia construyen el pico de masa ósea de toda la vida. Lácteos, tahini, sol al aire libre — justo lo que da una sesión de Educación Física.",
  "nut.tip.11":"«¿Proteína = músculo?» La cantidad de proteína que el cuerpo aprovecha es limitada. Un adolescente que entrena necesita ~1,2–1,6 g por kg de comida normal — los batidos de proteína sobran en edad escolar.",
  "nut.tip.12":"«Sudar = adelgazar»: el sudor es pérdida de líquido, no de grasa. El peso vuelve con un vaso de agua. Lo que cuenta es el balance energético a lo largo del tiempo.",
  "nut.tip.13":"«Los hidratos engordan»: para un deportista joven, los hidratos son combustible. Sin combustible — no hay buen test de la bip. La cuestión es qué hidrato y cuánto, no si tomarlo.",
  "nut.tip.14":"Las dietas extremas en la adolescencia perjudican el crecimiento y el rendimiento. Un alumno que habla de ayunos o de una dieta estricta merece una conversación tranquila y una derivación al departamento de orientación.",

  /* --- טיפי שטח בדף הבית --- */
  "home.tip.0":"Test de la bip: colocaos al final de la pista para que toda la clase oiga el altavoz — y subid el volumen antes de la salida.",
  "home.tip.1":"Foto-finish: introduce a los corredores por orden de calles, del más rápido al más lento — la detección asigna los tiempos según el orden de la lista.",
  "home.tip.2":"El modo TV de la tabla de récords es ideal para la entrada del centro — conecta un ordenador a una pantalla por HDMI y pulsa 📺.",
  "home.tip.3":"El dado de condición física funciona genial como calentamiento: 3 tiradas = un calentamiento completo, y nadie discute con un dado.",
  "home.tip.4":"La pantalla del móvil no se apagará en plena actividad — el bloqueo de apagado está activo mientras corre un temporizador (se puede desactivar en Ajustes).",
  "home.tip.5":"Puedes instalar la aplicación en la pantalla de inicio — menú del navegador y luego «Añadir a pantalla de inicio».",
  "home.onboard":"¿Eres nuevo aquí? Pulsa 🎬 «Modo demostración» en la pantalla de entrada — un grupo de ejemplo con resultados reales, para ver cómo funciona todo antes de introducir alumnado real.",

  /* --- פוטו־פיניש: הדרכת פתיחה --- */
  "pfg.title":"📷 Foto-finish — 4 pasos",
  "pfg.prev":"← Anterior",
  "pfg.next":"Siguiente →",
  "pfg.go":"¡Vamos a medir!",
  "pfg.skip":"No volver a mostrar",
  "pfg.0.h":"Fija el móvil — no en la mano",
  "pfg.0.p":"La cámara debe ver <b>la línea de meta de lado</b>, más o menos a la altura del pecho. Trípode, valla, banco o mochila — cualquier cosa estable. Un desplazamiento de un centímetro mueve la línea, y todos los tiempos se mueven con ella.",
  "pfg.1.h":"Alinea la línea roja con la línea de meta",
  "pfg.1.p":"Mueve «Posición de la línea de meta» hasta que la línea roja de la pantalla quede <b>exactamente</b> sobre la línea de meta de la pista. Es el único ajuste en el que un error invalida toda la serie.",
  "pfg.2.h":"Si hay pistola de salida — introduce la distancia a ella",
  "pfg.2.p":"El sonido recorre 343 m por segundo. Una cámara a 34 m de la salida oye el disparo una décima de segundo tarde, y todos los tiempos salen cortos exactamente en esa décima. Introducir la distancia lo compensa.",
  "pfg.3.h":"En una llegada ajustada — toca al corredor en la imagen",
  "pfg.3.p":"Tras la serie, en «🎞 Imagen de llegada», tocar el tronco del corredor da un tiempo interpolado entre columnas. <b>Más preciso que el disparador automático</b> — así se trabaja una final.",

  /* --- פוטו־פיניש: בדיקת שפיות --- */
  "pfs.title":"✅ Comprobación de un minuto",
  "pfs.hint":"Hazlo una vez en cada lugar nuevo. Es lo que separa una medición de un número que solo lo parece.",
  "pfs.list":"<li><b>El móvil está fijo.</b> Trípode, valla o mochila — no en la mano. Un centímetro de desplazamiento mueve la línea de meta.</li><li><b>La línea de estado está en verde:</b> «🟢 Cámara activa · detección armada». ¿Atascado en «Calibrando fondo…»? = algo se mueve o la luz está cambiando.</li><li><b>Un alumno cruza andando.</b> El pitido debe sonar <b>justo</b> cuando está sobre la línea. ¿Demasiado pronto? — la línea roja no está sobre la meta; corrígelo en «Posición de la línea de meta».</li><li><b>Tras la serie</b> — «🎞 Imagen de llegada» muestra una resolución temporal de ±X ms. Es una medición real de tu móvil, no una promesa.</li><li><b>En una llegada ajustada:</b> toca al propio corredor en la tira. La interpolación entre columnas es más precisa que el disparador automático.</li>",
  "pfs.ok":"Entendido — ¡vamos!",

  /* --- פוטו־פיניש: מספרי חזה --- */
  "pfn.title":"🔢 Dorsales",
  "pfn.hint":"Cuando los corredores llevan dorsal en lugar de ir por lista — escribe aquí el número de cada calle. Aparecerá en la tabla, en la exportación y en el diploma. Puedes dejar vacía una calle sin corredor.",

  /* --- מדריך מהיר (ℹ) --- */
  "info.title":"ℹ️ Guía rápida",
  "info.top":"Un solo kit de campo: pruebas de condición física, test de la bip, foto-finish, planes de sesión, récords, asistencia y calificaciones. Funciona también sin cobertura, y todos los datos se guardan <b>solo en este dispositivo</b> — por eso conviene hacer una copia en archivo de vez en cuando (⚙ Ajustes → «Copiar todo a un archivo»).",
  "info.home.s":"🚀 Por dónde empezar",
  "info.home.w":"Tres pasos, una sola vez, y a trabajar.",
  "info.home.l":"<li><b>El código docente</b> se crea en la primera entrada y protege la zona docente cuando el móvil pasa de mano en mano.</li><li><b>🎬 Modo demostración</b> en la pantalla de entrada — un grupo de ejemplo con resultados, para ver cómo funciona todo antes de introducir alumnado real. Se borra con un toque.</li><li><b>Un grupo real</b> — «Pruebas de condición física» → elige curso y número → «👥 Lista». Desde ese momento la misma lista está disponible en todas las demás pantallas.</li>",
  "info.ft.s":"🏅 Pruebas de condición física",
  "info.ft.w":"El corazón de la aplicación: 31 pruebas con cronómetro y contador. Elige un grupo y una prueba, e introduce un resultado para cada alumno.",
  "info.ft.l":"<li><b>🏅 Pruebas</b> la pantalla donde se mide de verdad. Cada resultado se guarda en el alumno y no se borra.</li><li><b>📊 Índice de condición física</b> una puntuación global de condición física de cada alumno frente a los baremos.</li><li><b>🏅 Insignia de Educación Física</b> quién cumple los requisitos y qué le falta.</li><li><b>📋 Qué le falta al grupo</b> quién ya ha hecho cada prueba y quién no — en lugar de buscar en listas.</li><li><b>📈 Evolución</b> por prueba: cuántos mejoraron, cuántos empeoraron, cuántos sin cambios.</li>",
  "info.lesson.s":"📋 Planes de sesión",
  "info.lesson.w":"Un plan completo — calentamiento, estaciones, juego y vuelta a la calma — con un toque o construido a mano.",
  "info.lesson.l":"<li><b>⚡ Rápido</b> elige tema, curso, duración y espacio — el plan se construye solo, vinculado a los estándares.</li><li><b>🧩 Constructor manual</b> monta la sesión tú mismo con fases ya preparadas.</li><li><b>▶ Empezar sesión</b> abre una «sesión activa», y cada medición desde ese momento queda registrada en ella. Si el botón pide un grupo — «🏷 Elegir grupo» al lado.</li><li><b>💾 Guardar · 🖨 Imprimir</b> el plan se guarda en la biblioteca para reutilizarlo el curso que viene.</li>",
  "info.fit.s":"⏱ Condición física",
  "info.fit.w":"Las herramientas que hacen funcionar la sesión, sin preparar nada de antemano.",
  "info.fit.l":"<li><b>⏱ Temporizador de intervalos</b> trabajo/descanso con anuncios por voz.</li><li><b>🔁 Estaciones para la clase</b> un circuito listo para proyectar.</li><li><b>📖 Biblioteca de ejercicios · 🎲 Dado de condición física</b> un ejercicio según la necesidad, o un sorteo cuando toca variar.</li><li><b>🏋️ Programa de gimnasio</b> para los cursos mayores.</li>",
  "info.games.s":"🎮 Juegos",
  "info.games.w":"Juegos para el recreo y el final de la sesión — con objetivo, variantes y pautas de seguridad.",
  "info.games.l":"<li>Busca por nombre, material u objetivo.</li><li>Cualquier juego puede pasar directamente a un plan de sesión.</li>",
  "info.beep.s":"🎵 Test de la bip",
  "info.beep.w":"Ejecuta el test de la bip con la precisión de un reloj de audio, calcula el VO₂max y lo compara con los baremos FITNESSGRAM.",
  "info.beep.l":"<li><b>Cargar grupo</b> trae la lista que ya introdujiste — sin volver a teclear nombres.</li><li><b>Registrar abandono</b> toca al alumno en cuanto se detiene, y se registra su nivel.</li><li><b>Enviar a las pruebas de condición física</b> el resultado entra en la ficha del alumno y en el índice de condición física.</li>",
  "info.photo.s":"📷 Foto-finish",
  "info.photo.w":"Cronometra carreras con la cámara del móvil y muestra en la imagen quién cruzó primero.",
  "info.photo.l":"<li><b>🏁 Carrera</b> reloj, salida y calles — solo lo que necesitas junto a la línea.</li><li><b>📐 Colocación</b> una vez antes: posición de la cámara, línea de meta, distancia a la pistola y sensibilidad de detección.</li><li><b>🎞 Imagen de llegada · 🏁 Resultados</b> el momento del cruce y el tiempo exacto de cada calle; «Guardar para la clase» pasa los tiempos a las pruebas de condición física.</li><li><b>🔄 Vueltas</b> carreras largas. Las series anteriores están en el archivo bajo la tabla de resultados.</li>",
  "info.rec.s":"🏆 Campeones del centro",
  "info.rec.w":"Una tabla de récords del centro frente al récord nacional y mundial.",
  "info.rec.l":"<li>Un alumno envía un récord con un vídeo como prueba — y entra en la tabla <b>solo cuando tú lo apruebas</b>.</li><li><b>📺 Modo TV</b> para la pantalla de la entrada del pabellón · <b>🔗 Enlace / QR</b> para compartir con el alumnado.</li>",
  "info.stu.s":"👥 Alumnado y calificaciones",
  "info.stu.w":"La lista del alumnado, una tabla de calificaciones por periodos de evaluación y la coevaluación.",
  "info.stu.l":"<li><b>⬇ Rellenar según asistencia</b> completa la nota de participación con los datos de asistencia — solo en celdas vacías, sin sobrescribir una nota que hayas puesto.</li><li><b>⬇ CSV</b> exporta la tabla a una hoja de cálculo.</li>",
  "info.tools.s":"🧰 Herramientas de clase",
  "info.tools.w":"Cuatro herramientas para los momentos que se repiten en cada sesión.",
  "info.tools.l":"<li><b>👥 Equipos</b> un reparto equilibrado según el último resultado — ningún equipo sin opciones.</li><li><b>🎯 Sorteo</b> elige a un alumno al azar.</li><li><b>✅ Asistencia</b> registro diario — de ahí sale la nota de participación.</li><li><b>📋 Rúbricas</b> evaluación por criterios.</li>",
  "info.know.s":"📚 Conocimiento",
  "info.know.w":"Respaldo profesional para las decisiones — fuentes, programas y cifras.",
  "info.know.l":"<li><b>📚 Fuentes oficiales</b> cada elemento enlaza al documento vigente.</li><li><b>🏋️ Programas evaluados · 📌 Cifras que conviene recordar</b> para cuando necesitas respaldar una decisión ante una familia o la dirección.</li>",
  "info.nut.s":"🥗 Rincón de nutrición",
  "info.nut.w":"Un consejo diario breve para leer a la clase, y un banco de consejos por tema.",
  "info.data.s":"💾 Tus datos",
  "info.data.w":"Sin servidor ni cuenta — esa es la ventaja y también la responsabilidad.",
  "info.data.l":"<li><b>Copia de seguridad</b> ⚙ Ajustes → «⬇ Copiar todo a un archivo». «⬆ Restaurar desde un archivo» lo recupera todo en un dispositivo nuevo.</li><li><b>Cifrado</b> puedes cifrar la copia con una contraseña — pero no hay recuperación de contraseña. Si pierdes la contraseña, pierdes el archivo.</li><li><b>¿Nombre de grupo incorrecto?</b> ⚙ Ajustes → «🏷 Nombres de los grupos». Cambiar el nombre no desvincula a ningún alumno ni ninguna medición.</li><li><b>¿Cuesta leer al sol?</b> ☀ en la barra superior, y «Botones grandes» en Ajustes para usarla con una mano.</li>",

  /* --- אודות --- */
  "ab.p":"Un kit de campo para docentes de Educación Física: pruebas de condición física, test de la bip, foto-finish con la cámara, planes de sesión, tabla de récords, herramientas de clase y calificaciones — todo en una sola pantalla y sin enviar nada fuera.",
  "ab.privT":"🔒 Privacidad",
  "ab.priv":"Los datos del alumnado — listas, calificaciones y mediciones — se guardan solo en el localStorage de este dispositivo. <b>Sin servidor, sin cuenta y sin envíos a ninguna parte.</b> Son datos de menores, así que es una decisión de diseño, no una casualidad. Exportar a CSV o hacer una copia es siempre una acción que inicias tú. Borrar los datos del sitio en el navegador lo elimina todo — por eso existe la copia de seguridad. Lo único que sale del dispositivo son tus datos de contacto (del docente) introducidos en la primera pantalla de bienvenida — ningún dato de alumnado — y se envían una sola vez.",
  "ab.srcT":"📚 Fuentes profesionales",
  "ab.src":"Protocolo de Léger (test de la bip) · baremos FITNESSGRAM® de The Cooper Institute · «Insignia de Educación Física — estándares para evaluar el rendimiento del alumnado», Ministerio de Educación de Israel, Secretaría Pedagógica · el currículo de Educación Física. Los baremos del centro son datos del docente y se guardan en el dispositivo.",
  "ab.builtT":"🛠 Hecho con",
  "ab.built":"Solo JavaScript, HTML y CSS — sin bibliotecas externas ni paso de compilación en el navegador, para que la aplicación abra rápido y funcione en la pista sin red. Desarrollada junto con Claude Code.",
  "ab.warnT":"⚠️ Aviso",
  "ab.warn":"Una herramienta de apoyo a la docencia. Las mediciones con cámara y cronómetro son tan buenas como lo permitan las condiciones de la pista, y no sustituyen a un equipo de cronometraje homologado para competición oficial. La decisión educativa y la calificación son tuyas."
}
};

const KEY=(window.BRAND&&window.BRAND.ns||"pehub.")+"lang";
let cur=(function(){
  try{ const v=localStorage.getItem(KEY); if(v&&DICT[v.replace(/"/g,"")]!==undefined)return v.replace(/"/g,""); }catch(e){}
  /* בכוונה בלי ניחוש משפת הדפדפן. התוכן המקצועי עדיין עברית, ולכן
     מורה ישראלי עם טלפון מוגדר באנגלית היה מקבל ממשק אנגלי מעל תוכן
     עברי — גרוע משתי השפות. ברירת המחדל היא עברית, והבחירה מפורשת. */
  return "he";
})();

const info=c=>LANGS.find(l=>l.code===c)||LANGS[0];

/* t(key) — מפתח חסר מחזיר את ברירת המחדל שנמסרה, ואם אין — את המפתח
   עצמו. אף פעם לא מחרוזת ריקה: טקסט חסר גרוע מטקסט בשפה הלא נכונה. */
function t(key,def){
  const d=DICT[cur];
  if(d&&d[key]!=null)return d[key];
  return def!=null?def:(DICT.he[key]!=null?DICT.he[key]:key);
}

/* המרקאפ נכתב עברית, ולכן data-i18n שומר את המקור העברי כברירת מחדל
   בפעם הראשונה — וכך מעבר חזרה לעברית מחזיר בדיוק את הטקסט המקורי. */
function applyDom(root){
  const scope=root||document;
  scope.querySelectorAll("[data-i18n]").forEach(el=>{
    const k=el.dataset.i18n;
    if(el.dataset.i18nHe==null)el.dataset.i18nHe=el.innerHTML;
    el.innerHTML=cur==="he"?el.dataset.i18nHe:t(k,el.dataset.i18nHe);
  });
  ["placeholder","title","aria-label"].forEach(attr=>{
    scope.querySelectorAll("[data-i18n-"+attr+"]").forEach(el=>{
      const k=el.getAttribute("data-i18n-"+attr);
      const memo="i18nHe_"+attr.replace("-","");
      if(el.dataset[memo]==null)el.dataset[memo]=el.getAttribute(attr)||"";
      el.setAttribute(attr,cur==="he"?el.dataset[memo]:t(k,el.dataset[memo]));
    });
  });
}

/* כיוון: ערבית ועברית מימין לשמאל, אנגלית, רוסית וספרדית משמאל לימין.
   ה-CSS משתמש בתכונות לוגיות (inset-inline, margin-inline) ולכן
   החלפת dir לבדה מספיקה כדי להפוך את הפריסה. */
function applyDir(){
  const d=info(cur).dir;
  document.documentElement.setAttribute("lang",cur);
  document.documentElement.setAttribute("dir",d);
  const app=document.querySelector(".app");
  if(app)app.setAttribute("dir",d);
  document.body.dataset.lang=cur;
  document.body.dataset.dir=d;
}

/* ---------- מונחים: כותרות המסכים המקצועיים ----------
   כמעט אלף כותרות — שמות מבחנים, משחקים, תרגילים, לשוניות, כפתורים —
   חלקן במרקאפ וחלקן נבנות ב-JS. במקום לסמן כל אחת, המילון ב-hm-terms.js
   ממופה לפי הטקסט העברי עצמו, וכל צומת טקסט שתואם מונח מתורגם במקום.
   MutationObserver תופס גם מה שנצייר אחר כך (מעבר מסך, רשימה שמתרעננת).

   השוואה מדויקת בלבד: משפט שמכיל מונח לא מתורגם חלקית, כי חצי משפט
   בעברית וחצי באנגלית גרוע משני המשפטים השלמים. */
const TERM_COL={en:0,ar:1,ru:2,es:3};
const HEB=/[֐-׿]/;
const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,NOSCRIPT:1,CODE:1,PRE:1};
const T_SRC=new WeakMap(), T_OUT=new WeakMap();   /* צומת → המקור העברי / מה שכתבנו בו */
const T_ATTRS=["placeholder","title","aria-label"];
/* מפרק טקסט לקידומת (אימוג׳י, סמלים), ליבה, וסיומת (נקודתיים, חצים) —
   בדיוק כפי שהמונחים נאספו. */
function splitTerm(s){
  const m=/^([^\p{L}\p{N}_«"(]*)([\s\S]*?)([\s:·…←→⇩⇧▾▸]*)$/u.exec(s);
  return m?[m[1],m[2].replace(/[‎‏]/g,"").replace(/\s+/g," ").trim(),m[3]]:["",s,""];
}
/* תבניות: מספר + יחידה («300 מ׳», «10–15 דק׳»), «שלב 7», ושכבות
   («ז׳–ט׳ · 10–30 משתתפים»). מאות הכותרות האלה נבנות ממספרים, ולכן
   הן לא יכולות לשבת במילון כמונחים. */
const UNITS={"מ׳":["m","م","м","m"],"שנ׳":["s","ث","с","s"],"דק׳":["min","د","мин","min"],
  "ס״מ":["cm","سم","см","cm"],"מ״ש":["ms","م.ث","мс","ms"],"קמ״ש":["km/h","كم/س","км/ч","km/h"],
  "ק״מ":["km","كم","км","km"],"ק״ג":["kg","كغ","кг","kg"],"נק׳":["pts","نقاط","б.","pts"],
  "מקטעים":["shuttles","أشواط","отрезков","tramos"],"משתתפים":["participants","مشاركًا","участников","participantes"],
  "משחקים":["games","لعبة","игр","juegos"],"חזרות":["reps","تكرارات","повт.","rep."],
  "קפיצות":["jumps","قفزات","прыжков","saltos"],"שיעורים":["lessons","دروس","уроков","sesiones"],
  "תלמידים":["students","طالبًا","учеников","alumnos"]};
const NUMBERED={"שלב":["Stage","المرحلة","Ступень","Nivel"],"מסלול":["Lane","المسار","Дорожка","Calle"],
  "סבב":["Round","الجولة","Раунд","Ronda"],"תחנה":["Station","المحطة","Станция","Estación"],
  "הקפה":["Lap","اللفّة","Круг","Vuelta"],"קבוצה":["Team","الفريق","Команда","Equipo"]};
const GRADE={"א׳":1,"ב׳":2,"ג׳":3,"ד׳":4,"ה׳":5,"ו׳":6,"ז׳":7,"ח׳":8,"ט׳":9,"י׳":10,"י״א":11,"י״ב":12};
const GR="(י״[אב]|[א-י]׳)";
function termCore(core,col,noTpl){
  const T=window.I18N_TERMS, row=T&&T[core];
  if(row&&row[col])return row[col];
  if(UNITS[core])return UNITS[core][col];
  let m=/^([\d.,:±–\-‎ ]*\d)\s*(\S+)$/.exec(core);
  if(m&&UNITS[m[2]])return m[1].replace(/‎/g,"").trim()+" "+UNITS[m[2]][col];
  m=/^(\S+) (\d+)$/.exec(core);
  if(m&&NUMBERED[m[1]])return NUMBERED[m[1]][col]+" "+m[2];
  /* שם כיתה אוטומטי («ז׳1») — שכבה ומספר, כמו «7-1» בכל השפות */
  m=new RegExp("^"+GR+"(\\d{1,2})$").exec(core);
  if(m)return GRADE[m[1]]+"-"+m[2];
  m=new RegExp("^"+GR+"–"+GR+"(?: · (.+))?$").exec(core);
  if(m){
    const a=GRADE[m[1]], b=GRADE[m[2]];
    const g=[`Gr. ${a}–${b}`,`الصفوف ${a}–${b}`,`${a}–${b} кл.`,`${a}.º–${b}.º`][col];
    if(!m[3])return g;
    const rest=m[3].replace(/ \(בקבוצות\)$/,""), grp=rest!==m[3];
    let tail=termCore(rest,col);
    const pc=/^([\d–]+) בכל מגרש$/.exec(rest);
    if(!tail&&pc)tail=pc[1]+" "+["per court","في كل ملعب","на площадку","por pista"][col];
    if(!tail)return null;
    return g+" · "+tail+(grp?" ("+["in groups","في مجموعات","в группах","en grupos"][col]+")":"");
  }
  return noTpl?null:tplMatch(core,col);
}
/* תבניות: משפט שנבנה בקוד מחלקים קבועים וערכים משתנים («{0} זמנים ייכנסו
   למבחן «{1} מטר»»). המילון מחזיק את המשפט עם {0},{1}; כאן הוא הופך
   לביטוי רגולרי, והערכים שנתפסו מתורגמים בעצמם אם הם מונחים (שם מבחן,
   שם משחק) — אחרת נשארים כמות שהם (מספר, שם תלמיד). */
let TPL=null;
function tplIndex(){
  TPL=[];
  const T=window.I18N_TERMS||{};
  Object.keys(T).forEach(k=>{
    if(k.indexOf("{0}")<0)return;
    const parts=k.split(/\{\d+\}/);
    const lit=parts.reduce((a,b)=>b.length>a.length?b:a,"").trim();
    if(!HEB.test(lit))return;
    /* תבנית שהחלק הקבוע שלה זעיר («מ{0}» — תווית מסלול) הייתה בולעת כל
       מילה שמתחילה באותה אות. לתבניות כאלה המשתנה חייב להיות מספר. */
    const tiny=parts.join("").replace(/[^\p{L}]/gu,"").length<4;
    const any=tiny?"([\\d.,:+\\-–]+)":"([\\s\\S]*?)";   /* ערך יכול להיות ריק (תוספת מותנית) */
    const re=new RegExp("^"+parts.map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join(any)+"$","u");
    TPL.push({k,lit,re});
  });
  /* הארוך קודם — תבנית ספציפית גוברת על כללית */
  TPL.sort((a,b)=>b.k.length-a.k.length);
}
function tplMatch(core,col){
  if(!TPL)tplIndex();
  const T=window.I18N_TERMS;
  for(const t of TPL){
    if(core.indexOf(t.lit)<0)continue;
    const m=t.re.exec(core); if(!m)continue;
    const row=T[t.k]; if(!row||!row[col])continue;
    /* ערך שנתפס ונשאר עברית: שם (תלמיד, כיתה) — תקין; משפט שלם — סימן
       שהתבנית נתפסה על טקסט אחר, ולכן מוותרים עליה */
    let bad=false;
    const vals=m.slice(1).map(v=>{
      const lead=v.match(/^\s*/)[0], trail=v.match(/\s*$/)[0], c=v.trim();
      if(!HEB.test(c))return v;
      const tt=termCore(c,col);
      if(!tt&&(c.split(/\s+/).length>3||/[.!?]/.test(c)))bad=true;
      return lead+(tt||c)+trail;
    });
    if(bad)continue;
    return row[col].replace(/\{(\d+)\}/g,(_,i)=>vals[+i]==null?"":vals[+i]);
  }
  return null;
}
function term(src){
  const col=TERM_COL[cur];
  if(col==null||!window.I18N_TERMS||!HEB.test(src))return null;
  const [pre,core,post]=splitTerm(src);
  const out=termCore(core,col,true);
  if(out)return heQ(pre)+out+heQ(post);
  /* טקסט מורכב — שורת מקור «כותרת — ארגון», משחק שהוכנס למערך
     («צעד. צעד. · מטרה: …»), סעיף ממוספר. מפרקים לחלקים שכל אחד מהם
     מוכר במילון; מתרגמים רק אם אף חלק לא נשאר עברית. */
  const cp=composite(core,col);
  if(cp)return heQ(pre)+cp+heQ(post);
  /* טקסט רב־שורתי (הודעות, מסמכי מערך) — שורה אחרי שורה */
  if(/\n/.test(src)){
    let hit=false;
    const lines=src.split("\n").map(l=>{ const t=HEB.test(l)?term(l):null; if(t){hit=true;return t;} return l; });
    if(hit)return lines.join("\n");
  }
  const tp=tplMatch(core,col);
  return tp?heQ(pre)+tp+heQ(post):null;
}
function piece(p,col){
  p=p.trim(); if(!p)return p; if(!HEB.test(p))return p;
  let t=termCore(p,col,true); if(t)return t;
  const [pre,core,post]=splitTerm(p);
  if(core!==p){ t=termCore(core,col,true); if(t)return heQ(pre)+t+heQ(post); }
  let m=/^(\d+[.)])\s+([\s\S]+)$/.exec(p);
  if(m){ t=piece(m[2],col); if(t)return m[1]+" "+t; }
  m=/^([^:.!?]{1,30}):\s+([\s\S]+)$/.exec(p);
  if(m&&HEB.test(m[1])){ const a=termCore(m[1].trim(),col,true), b2=piece(m[2],col); if(a&&b2)return a+": "+b2; }
  t=headOf(p,col); if(t)return t;
  /* כמה משפטים ברצף (שני צעדי משחק שהודבקו יחד) — הרצף הארוך ביותר
     שקיים במילון, ואז משפט־משפט */
  const SENT=/(?<=[.!?;])\s+(?=\S)/;
  if(SENT.test(p)){ const r=joinRuns(p,col," ",SENT); if(r)return r; }
  for(const sep of [" — "," – "]){
    if(p.indexOf(sep)>0){ const r=joinRuns(p,col,sep); if(r)return r; }
  }
  t=tplMatch(p,col); if(t&&!HEB.test(t))return t;
  return null;
}
/* «שם — הסבר» במילון, כשבמסך מוצג רק השם: החלק הראשון של המפתח מול
   החלק הראשון של התרגום — רק כשהתרגום מתפצל באותו אופן */
let HEADS=null;
function headOf(p,col){
  if(!HEADS){ HEADS={}; const T=window.I18N_TERMS||{};
    Object.keys(T).forEach(k=>{ const i=k.indexOf(" — "); if(i<0)return;
      const h=k.slice(0,i); if(T[h]||HEADS[h])return;
      const row=T[k].map(x=>{ const m=/\s[—–]\s|:\s/.exec(x); return m&&m.index>0?x.slice(0,m.index):null; });
      if(row.every(Boolean))HEADS[h]=row; }); }
  const r=HEADS[p]; return r?r[col]:null;
}
/* התאמה מדויקת, גם כשסביב הרצף יש גרשיים/סמלים שנחתכו מהמפתח */
function exactish(k,col){
  const t=termCore(k,col,true); if(t)return t;
  const [pre,core,post]=splitTerm(k);
  if(core===k)return null;
  const u=termCore(core,col,true); return u?heQ(pre)+u+heQ(post):null;
}
function joinRuns(core,col,sep,splitRe){
  const parts=splitRe?core.split(splitRe):core.split(sep), out=[];
  for(let i=0;i<parts.length;){
    let j=parts.length, t=null;
    for(;j>i;j--){ const k=parts.slice(i,j).join(sep); t=j-i>1?exactish(k,col):piece(k,col); if(t)break; }
    if(!t)return null;
    out.push(t); i=j;
  }
  const r=out.join(sep); return HEB.test(r)?null:r;
}
function composite(core,col){
  if(core.indexOf(" · ")>0){ const r=joinRuns(core,col," · "); if(r)return r; }
  const r=piece(core,col); return r&&!HEB.test(r)?r:null;
}
/* גרשיים ומרכאות עבריים (״ ׳) שנשארו סביב טקסט מתורגם */
function heQ(x){ return x.replace(/״/g,'"').replace(/׳/g,"'"); }
/* תרגום של מחרוזת שלמה לשימוש בקוד (הודעות, קול, קנבס) — תמיד מחזיר טקסט */
function tr(s){ return (s==null||cur==="he")?s:(term(String(s))||s); }
function skipped(n){
  for(let e=n.parentElement;e;e=e.parentElement){
    if(SKIP[e.tagName]||e.isContentEditable||e.hasAttribute("data-no-t"))return true;
  }
  return false;
}
function termText(n){
  const v=n.nodeValue;
  let src=T_SRC.get(n);
  if(src==null||v!==T_OUT.get(n)){ if(!HEB.test(v))return; src=v; T_SRC.set(n,v); }
  if(skipped(n))return;
  const out=cur==="he"?src:(term(src)||src);
  if(out!==v){ T_OUT.set(n,out); n.nodeValue=out; } else T_OUT.set(n,out);
}
function termAttrs(el){
  T_ATTRS.forEach(a=>{
    if(!el.hasAttribute(a)||el.hasAttribute("data-i18n-"+a))return;
    const memo=el.__tAttr||(el.__tAttr={}), v=el.getAttribute(a);
    let m=memo[a];
    if(!m||v!==m.out){ if(!HEB.test(v))return; m=memo[a]={src:v,out:v}; }
    const out=cur==="he"?m.src:(term(m.src)||m.src);
    m.out=out; if(out!==v)el.setAttribute(a,out);
  });
}
function applyTerms(root){
  const scope=root||document.body; if(!scope)return;
  if(scope.nodeType===3){ termText(scope); return; }
  if(scope.nodeType!==1)return;
  const w=(scope.ownerDocument||document).createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  for(let n=w.nextNode();n;n=w.nextNode())termText(n);
  termAttrs(scope);
  scope.querySelectorAll("[placeholder],[title],[aria-label]").forEach(termAttrs);
}
let termObs=null;
function watchTerms(){
  if(typeof MutationObserver==="undefined"||!document.body)return;
  if(!termObs)termObs=new MutationObserver(list=>{
    list.forEach(m=>{
      if(m.type==="childList")m.addedNodes.forEach(applyTerms);
      else if(m.type==="characterData")termText(m.target);
      else if(m.type==="attributes")termAttrs(m.target);
    });
  });
  /* בעברית אין מה לתרגם — לא מאזינים בכלל, כדי שלא לשלם על זה כלום */
  termObs.disconnect();
  if(cur!=="he")termObs.observe(document.body,{childList:true,subtree:true,characterData:true,
    attributes:true,attributeFilter:T_ATTRS});
}

function set(code){
  if(DICT[code]===undefined)return false;
  cur=code;
  try{ localStorage.setItem(KEY,code); }catch(e){}
  applyDir(); applyDom(); applyTerms(); watchTerms();
  document.dispatchEvent(new CustomEvent("i18n:change",{detail:{lang:code}}));
  return true;
}

/* מה שלא עובר דרך ה-DOM של הדף: חלונות alert/confirm/prompt, טקסט שמצויר
   על קנבס (תמונת סיום, תעודות), וחלונות הדפסה שנפתחים ונכתבים ב-JS.
   בעברית כל אלה עוברים ישירות, בלי שום שינוי. */
function hookOutside(){
  if(hookOutside.done)return; hookOutside.done=true;
  ["alert","confirm"].forEach(fn=>{
    const orig=window[fn]; if(typeof orig!=="function")return;
    window[fn]=function(msg){ return orig.call(window,tr(msg)); };
  });
  const op=window.prompt;
  if(typeof op==="function")window.prompt=function(msg,def){ return op.call(window,tr(msg),def); };
  const C=window.CanvasRenderingContext2D&&window.CanvasRenderingContext2D.prototype;
  if(C)["fillText","strokeText","measureText"].forEach(fn=>{
    const orig=C[fn]; if(typeof orig!=="function")return;
    C[fn]=function(text,...rest){ return orig.call(this,typeof text==="string"?tr(text):text,...rest); };
  });
  const wo=window.open;
  if(typeof wo==="function")window.open=function(url,...rest){
    const w=wo.call(window,url,...rest);
    if(w&&!url&&cur!=="he")try{
      const d=w.document, dw=d.write, dc=d.close;
      const fix=()=>{ try{ applyTerms(d.body||d.documentElement);
        d.documentElement.setAttribute("dir",info(cur).dir); d.documentElement.setAttribute("lang",cur);
        if(d.title)d.title=tr(d.title); }catch(e){} };
      d.write=function(...a){ const r=dw.apply(d,a); fix(); return r; };
      d.close=function(){ const r=dc.call(d); fix(); return r; };
    }catch(e){}
    return w;
  };
}

function init(){ applyDir(); applyDom(); applyTerms(); watchTerms(); hookOutside(); }

return {t,set,init,applyDom,applyDir,applyTerms,term,tr,langs:()=>LANGS.slice(),
        lang:()=>cur, dir:()=>info(cur).dir, info:()=>info(cur),
        /* כמה מפתחות תורגמו לכל שפה — לשקיפות במסך ההגדרות */
        coverage:()=>{ const base=Object.keys(DICT.en).length;
          const out={}; Object.keys(DICT).forEach(c=>{
            out[c]=c==="he"?base:Object.keys(DICT[c]).length; });
          return {base,out}; }};
})();
