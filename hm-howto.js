"use strict";
/* ============================================================
   PE Ultimate — הגדרות ברירת המחדל של ענפי השיאים
   כל ענף: זיהוי, יחידת מדידה, כיוון, מגבלת זמן, מגבלת אורך סרטון,
   ופרוטוקול מלא (תקין / פוסל / צילום / סרטון הסבר).

   זהו רק ה**זרע**. ברגע שהמורה נכנס לעורך הענפים, הרשימה נשמרת
   ב-localStorage תחת rec.sports והופכת לניתנת לעריכה מלאה.

   כללי הבחירה של הרשימה הזאת:
   • רק ענפים שאפשר לאמת מסרטון — בלי מדידות שדורשות ציוד וסרט מדידה.
   • כל מאמץ מוגבל ל-60 שניות לכל היותר, כדי שהסרטונים יישארו קצרים.
   • vidMax = אורך הסרטון המרבי המותר, כולל הכרזה והתארגנות.
   ============================================================ */
window.RECDEFAULTS=(function(){

  const UNIVERSAL=[
    "צילום אחד רצוף מההתחלה ועד הסוף — בלי חיתוכים, בלי עצירה ובלי האצה.",
    "בתחילת הסרטון אומרים בקול: שם מלא, כיתה, והענף. זה מה שהופך את הסרטון להוכחה.",
    "כל הגוף בתוך הפריים לאורך כל הביצוע — כולל כפות הרגליים והרצפה.",
    "הטלפון מונח על משטח יציב או מוחזק על ידי חבר. סרטון רועד = קשה לשפוט = נדחה.",
    "האור מלפנים ולא מאחור. צילום מול השמש או מול חלון הופך את הדמות לצללית."
  ];

  /* timeSec — משך המאמץ בשניות (null = מספר ניסיונות קצוב)
     vidMax  — אורך הסרטון המרבי המותר בשניות */
  const SPORTS=[
    /* ---------- חבל ---------- */
    {id:"rope", em:"🪢", name:"קפיצה בחבל", unit:"קפיצות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות בדיוק. סופרים את מספר הקפיצות שהושלמו.",
     ok:["שתי הרגליים עוזבות את הקרקע יחד והחבל משלים סיבוב מלא — מתחת לרגליים ומעל הראש.",
         "קפיצה נספרת רק כשהחבל עבר מתחת לשתי הרגליים בלי להיתקע.",
         "מותר לעצור לסדר את החבל — אבל השעון ממשיך לרוץ."],
     no:["החבל נתקע ברגליים — אותה קפיצה לא נספרת.",
         "קפיצה בלי שהחבל עבר (״קפיצת סרק״ בין קפיצה לקפיצה) — לא נספרת.",
         "סרטון ארוך מ-90 שניות — הביצוע הוא דקה, אין סיבה ליותר."],
     film:["לצלם **מהצד**, במאונך לגוף — כך רואים בבירור את החבל עובר מתחת לרגליים ונוגע ברצפה.",
           "המצלמה בגובה המותן, במרחק 2–3 מ׳, כך שגם הראש וגם הרצפה בפריים.",
           "טיימר גלוי בפריים (טלפון שני או שעון) — או ספירה קולית ברורה של המורה."],
     yt:"קפיצה בחבל טכניקה נכונה הסבר בעברית"},

    {id:"dbl", em:"🌀", name:"קפיצה כפולה בחבל", unit:"קפיצות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים רק קפיצות כפולות (החבל עובר פעמיים בקפיצה אחת).",
     ok:["בקפיצה אחת החבל משלים **שני** סיבובים מלאים.",
         "מותר לשלב קפיצות רגילות בין הכפולות — הן פשוט לא נספרות.",
         "נחיתה על שתי רגליים."],
     no:["קפיצה שבה החבל עבר פעם אחת בלבד.",
         "החבל נתקע באמצע הסיבוב השני.",
         "סרטון ארוך מ-90 שניות."],
     film:["**מהצד**, גובה מותן, 2–3 מ׳ — חייבים לראות את שני הסיבובים.",
           "אור טוב: בקצב מהיר החבל מטושטש ובחושך אי אפשר לספור.",
           "טיימר גלוי בפריים."],
     yt:"קפיצה כפולה בחבל double unders הסבר"},

    /* ---------- כוח משקל גוף ---------- */
    {id:"push", em:"💪", name:"שכיבות סמיכה", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות תקינות. מנוחה בתוך הדקה מותרת — השעון ממשיך.",
     ok:["הגוף בקו ישר אחד מהעקבים דרך האגן ועד הראש.",
         "בירידה: המרפקים מגיעים לזווית 90° לפחות, או שהחזה כ-8 ס״מ מהרצפה.",
         "בעלייה: יישור מלא של המרפקים לפני החזרה הבאה."],
     no:["האגן צונח לרצפה או מתרומם למעלה (״תחת באוויר״).",
         "ירידה חלקית — מרפקים שלא הגיעו ל-90°.",
         "מנוחה בברכיים או בבטן — מותר לעצור בתנוחה, לא לשכב."],
     film:["לצלם **מהצד בדיוק** (90° לגוף) — זו הזווית היחידה שממנה רואים את עומק הירידה.",
           "מצלמה נמוכה, בגובה 40–50 ס״מ מהרצפה.",
           "כל הגוף בפריים — מכפות הידיים ועד קצות האצבעות."],
     yt:"שכיבות סמיכה טכניקה נכונה הסבר בעברית"},

    {id:"pull", em:"🧗", name:"מתח", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות תקינות. מותר לרדת מהמוט ולעלות שוב בתוך הדקה.",
     ok:["התחלה מתלייה מלאה — מרפקים ישרים לגמרי.",
         "הסנטר עובר **מעל** המוט (לא נוגע בו — עובר אותו).",
         "ירידה חזרה לתלייה מלאה לפני החזרה הבאה."],
     no:["נדנוד גוף ובעיטות רגליים לתנופה (קיפינג) — אלא אם סוכם מראש.",
         "הסנטר לא עבר את גובה המוט.",
         "ירידה חלקית — מרפקים שלא נפתחו עד הסוף."],
     film:["לצלם **מהצד**, כך שגם המוט וגם הסנטר נראים באותו פריים.",
           "המצלמה בגובה המוט בערך — מלמטה נראה כאילו הסנטר עבר גם כשלא.",
           "כל הגוף בפריים כדי לראות אם יש נדנוד."],
     yt:"מתח טכניקה נכונה pull up הסבר בעברית"},

    {id:"dips", em:"🤸", name:"מקבילים", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות תקינות.",
     ok:["התחלה בזרועות ישרות, גוף תלוי בין המוטות.",
         "ירידה עד זווית 90° לפחות במרפק.",
         "עלייה ליישור מלא של המרפקים."],
     no:["ירידה חלקית.","נדנוד רגליים לתנופה.","רגליים נוגעות ברצפה באמצע."],
     film:["לצלם **מהצד**, בגובה המוטות — כדי לראות את זווית המרפק.",
           "כל הגוף בפריים, כולל הרגליים (לבדיקת נדנוד).",
           "מרחק 2–3 מ׳ מהמתקן."],
     yt:"מקבילים dips טכניקה נכונה הסבר בעברית"},

    {id:"sit", em:"🔥", name:"בטן", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות מלאות.",
     ok:["ברכיים כפופות ב-90°, ידיים משוכלות על החזה.",
         "בעלייה: המרפקים או הכתפיים מגיעים עד הירכיים.",
         "בירידה: שתי הכתפיים נוגעות ברצפה."],
     no:["ידיים מאחורי הצוואר שמושכות את הראש.",
         "עלייה בתנופה עם הגב במקום בשרירי הבטן.",
         "הכתפיים לא נגעו ברצפה בירידה."],
     film:["לצלם **מהצד**, בגובה נמוך — כך רואים גם מגע כתפיים וגם גובה עלייה.",
           "כל הגוף בפריים.","טיימר גלוי או ספירה קולית."],
     yt:"כפיפות בטן טכניקה נכונה sit up הסבר בעברית"},

    {id:"squat", em:"🦵", name:"סקוואטים", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות מלאות.",
     ok:["רגליים ברוחב הכתפיים, כפות רגליים מלאות על הרצפה.",
         "ירידה עד שקו הירך מקביל לרצפה או נמוך יותר.",
         "עלייה ליישור מלא של הירכיים והברכיים."],
     no:["ירידה חלקית — הירך לא הגיעה למקביל.",
         "עקבים מתרוממים מהרצפה.",
         "ברכיים נופלות פנימה בעלייה."],
     film:["לצלם **מהצד**, בגובה המותן — הזווית שממנה רואים את עומק הירידה.",
           "כל הגוף בפריים, כולל כפות הרגליים.","טיימר גלוי."],
     yt:"סקוואט טכניקה נכונה הסבר בעברית"},

    {id:"burpee", em:"🔁", name:"ברפי", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות מלאות.",
     ok:["בירידה: החזה והירכיים נוגעים ברצפה.",
         "בעלייה: קפיצה עם שתי הרגליים ומחיאת כף מעל הראש.",
         "יישור מלא של הגוף בקפיצה."],
     no:["החזה לא נגע ברצפה.","אין קפיצה בסוף — רק עמידה.","״קיצור דרך״ בלי לרדת עד הסוף."],
     film:["לצלם **מהצד**, גוף מלא, מצלמה בגובה נמוך.",
           "הרצפה חייבת להיראות — זו הדרך היחידה לוודא מגע חזה.","טיימר גלוי."],
     yt:"ברפי טכניקה נכונה burpee הסבר בעברית"},

    {id:"jack", em:"⭐", name:"קפיצות פיסוק", unit:"חזרות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים חזרות מלאות. הענף הקל ביותר להתחיל ממנו.",
     ok:["פתיחה: רגליים מעבר לרוחב הכתפיים והידיים נוגעות מעל הראש.",
         "סגירה: רגליים צמודות וידיים לצדדים.",
         "קצב רציף — פתיחה וסגירה נחשבות חזרה אחת."],
     no:["ידיים שלא הגיעו מעל הראש.","רגליים שלא נפתחו מעבר לרוחב הכתפיים.","קפיצה חלקית בקצב מהיר מדי."],
     film:["לצלם **מלפנים**, גוף מלא, מרחק 2–3 מ׳ — כך רואים גם ידיים וגם רגליים.",
           "רקע נקי, כדי שקל יהיה לספור.","טיימר גלוי בפריים."],
     yt:"קפיצות פיסוק jumping jacks טכניקה"},

    {id:"mount", em:"⛰️", name:"מטפס הרים", unit:"חזרות ב-30 שניות", lower:false, timeSec:30, vidMax:60,
     proto:"30 שניות. סופרים כל הבאת ברך אחת קדימה כחזרה.",
     ok:["תנוחת פלאנק על הידיים, גוף בקו ישר.",
         "הברך מגיעה עד קו המרפק לפחות.",
         "החלפת רגליים רציפה."],
     no:["האגן מתרומם למעלה.","ברך שלא הגיעה לקו המרפק.","ידיים שזזות ממקומן."],
     film:["לצלם **מהצד**, בגובה נמוך — כדי לראות את גובה הברך ואת קו הגוף.",
           "כל הגוף בפריים.","טיימר גלוי."],
     yt:"מטפס הרים mountain climbers טכניקה"},

    /* ---------- קפיצות וספרינטים ---------- */
    {id:"ljump", em:"🦘", name:"קפיצה למרחק מהמקום", unit:"ס״מ", lower:false, timeSec:null, vidMax:120,
     proto:"שלושה ניסיונות, נרשם הטוב מביניהם. מודדים בסנטימטרים.",
     ok:["זינוק משתי רגליים יחד מאחורי הקו, בלי צעד ובלי ריצת התקרבות.",
         "נחיתה על שתי רגליים ושמירה על שיווי משקל.",
         "מודדים מהקו ועד **נקודת המגע האחורית ביותר** של הגוף."],
     no:["דריכה על הקו או מעבר שלו לפני הקפיצה.",
         "צעד קטן או ניתור מקדים לפני הזינוק.",
         "נפילה אחורה — נמדד מנקודת הנפילה."],
     film:["לצלם **מהצד**, כך שגם קו הזינוק וגם אזור הנחיתה בפריים אחד.",
           "סרט מדידה או מטר פרוס על הרצפה, גלוי בסרטון.",
           "שלושת הניסיונות ברצף אחד — לא סרטון נפרד לכל קפיצה."],
     yt:"קפיצה למרחק מהמקום standing long jump טכניקה"},

    {id:"hjump", em:"⬆️", name:"קפיצה לגובה מהמקום", unit:"ס״מ", lower:false, timeSec:null, vidMax:120,
     proto:"שלושה ניסיונות. התוצאה = גובה הנגיעה בקפיצה פחות גובה הושטת היד בעמידה.",
     ok:["קודם מודדים את גובה הושטת היד בעמידה — זו נקודת האפס.",
         "קפיצה משתי רגליים מהמקום, בלי צעד ובלי ריצת התקרבות.",
         "סימון ברור של נקודת הנגיעה הגבוהה ביותר."],
     no:["צעד או ניתור מקדים לפני הקפיצה.",
         "מדידה בלי גובה העמידה — בלעדיו אין תוצאה, יש רק מספר.",
         "נגיעה עם שתי ידיים אם נמדד עם יד אחת."],
     film:["לצלם **מהצד**, כשהקיר או הסקאלה המסומנת בפריים.",
           "לצלם קודם את מדידת גובה העמידה ואז את הקפיצה — באותו סרטון רצוף.",
           "המצלמה גבוהה מספיק כדי לתפוס את נקודת השיא."],
     yt:"קפיצה לגובה מהמקום vertical jump מדידה"},

    {id:"sprint30", em:"💨", name:"ריצת 30 מ׳", unit:"שניות", lower:true, timeSec:null, vidMax:60,
     proto:"מסלול ישר ומדוד של 30 מ׳. נמוך יותר = טוב יותר. הענף הקצר ביותר לצילום.",
     ok:["המסלול נמדד מראש והקווים מסומנים בבירור.",
         "זינוק מעמידה אחרי אות ברור.",
         "הזמן נעצר כשהגו חוצה את קו הסיום."],
     no:["זינוק לפני האות.","מסלול בירידה או קצר מ-30 מ׳.","מסלול לא מדוד."],
     film:["מצלמה **בקו הסיום**, בניצב למסלול, על משטח יציב.",
           "עדיף להשתמש במודול «פוטו־פיניש» — הוא מודד מהמצלמה עצמה.",
           "לתעד גם את מדידת המסלול בתחילת הסרטון."],
     yt:"ריצת 30 מטר ספרינט טכניקת זינוק"},

    {id:"sprint", em:"⚡", name:"ריצת 60 מ׳", unit:"שניות", lower:true, timeSec:null, vidMax:60,
     proto:"מסלול ישר ומדוד של 60 מ׳. נמוך יותר = טוב יותר.",
     ok:["המסלול נמדד מראש והקווים מסומנים.",
         "זינוק מעמידה או מכריעה אחרי אות ברור.",
         "הזמן נעצר בחציית הגו את קו הסיום."],
     no:["זינוק לפני האות.","רוח גבית מעל ‎+2.0‎ מ/ש.","מסלול לא מדוד או בירידה."],
     film:["**הכי מדויק: מודול «פוטו־פיניש» של האפליקציה.**",
           "אם מצלמים ידנית: מצלמה בקו הסיום, בניצב מדויק, על חצובה.",
           "הזינוק והסיום חייבים להיראות."],
     yt:"טכניקת ריצת ספרינט זינוק הסבר בעברית"},

    {id:"shuttle", em:"↔️", name:"ריצת מעבורת 4×10", unit:"שניות", lower:true, timeSec:null, vidMax:60,
     proto:"ארבע ריצות של 10 מ׳ הלוך ושוב. נמוך יותר = טוב יותר.",
     ok:["שני קווים מדודים במרחק 10 מ׳ בדיוק.",
         "בכל פנייה — כף רגל אחת חייבת לגעת בקו או לעבור אותו.",
         "השעון נעצר בחציית קו הסיום בפעם הרביעית."],
     no:["פנייה לפני הגעה לקו.","מרחק קצר מ-10 מ׳.","פחות מארבע ריצות."],
     film:["לצלם **מהצד**, כך ש**שני הקווים** בפריים אחד — זה קריטי.",
           "מצלמה יציבה במרחק, בלי לזוז בזמן הריצה.","טיימר גלוי או ספירה קולית."],
     yt:"ריצת מעבורת 4x10 שאטל ראן מבחן כושר"},

    /* ---------- כדור ---------- */
    {id:"throw", em:"🏀", name:"זריקות עונשין", unit:"קליעות מ-10", lower:false, timeSec:null, vidMax:120,
     proto:"10 זריקות מקו העונשין. נרשם מספר הקליעות.",
     ok:["שתי כפות הרגליים מאחורי הקו עד שהכדור עוזב את היד.",
         "הכדור נכנס לסל — כולל דרך הלוח.",
         "עשר זריקות ברצף, בלי החלפת מיקום."],
     no:["דריכה על הקו לפני שהכדור עזב את היד.","זריקה מקרוב יותר מהקו.","שינוי מספר הזריקות."],
     film:["זווית שבה **גם הקו וגם הסל** בפריים אחד — בדרך כלל מהצד ומאחור.",
           "לא לזוז עם המצלמה בין זריקה לזריקה.","כל עשר הזריקות ברצף אחד."],
     yt:"זריקת עונשין כדורסל טכניקה הסבר בעברית"},

    {id:"basket60", em:"🎯", name:"קליעות לסל בדקה", unit:"קליעות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים כמה קליעות נכנסו מכל מקום במגרש.",
     ok:["כל קליעה שנכנסת לסל נספרת, מכל מרחק.",
         "התלמיד אוסף את הריבאונד בעצמו וממשיך.",
         "השעון רץ ברציפות."],
     no:["הנחתה בלי לעזוב את הרצפה מתחת לסל (אלא אם סוכם).",
         "עוזר שמחזיר כדורים — התלמיד אוסף בעצמו.",
         "ספירה של כדור שלא נכנס."],
     film:["מצלמה יציבה שרואה **את הסל ואת התלמיד** לאורך כל הדקה.",
           "לא לעקוב עם הטלפון אחרי התלמיד — פריים קבוע.","טיימר גלוי."],
     yt:"קליעות לסל בדקה תרגיל כדורסל"},

    {id:"wallpass", em:"🧱", name:"מסירות לקיר", unit:"מסירות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. מוסרים כדור לקיר מ-2 מ׳ וקולטים. סופרים קליטות נקיות.",
     ok:["מרחק של 2 מ׳ לפחות מהקיר, מסומן על הרצפה.",
         "מסירה וקליטה בשתי ידיים.",
         "נספרת רק קליטה נקייה — בלי שהכדור נפל."],
     no:["הכדור נפל לרצפה — אותה מסירה לא נספרת.",
         "עמידה קרובה מדי לקיר.",
         "קליטה ביד אחת (אלא אם סוכם מראש)."],
     film:["לצלם **מהצד**, כך שגם הקיר, גם קו העמידה וגם התלמיד בפריים.",
           "מרחק העמידה מסומן בבירור על הרצפה.","טיימר גלוי."],
     yt:"מסירות לקיר תרגיל כדורסל כדוריד"},

    {id:"juggle", em:"⚽", name:"הטחות כדורגל", unit:"נגיעות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. סופרים נגיעות רצופות בלי שהכדור נוגע ברצפה.",
     ok:["כל חלקי הגוף מותרים חוץ מהידיים והזרועות.",
         "אם הכדור נפל — מרימים וממשיכים, הספירה נמשכת מהמספר שהיה.",
         "הספירה נעצרת בתום הדקה."],
     no:["מגע יד או זרוע.","הכדור נח על הגוף במקום נגיעה.","ספירת נגיעה אחרי מגע ברצפה."],
     film:["מרחק שמאפשר לראות **גם את הכדור בשיא הגובה וגם את הרצפה**.",
           "מצלמה יציבה — בלי לעקוב אחרי הכדור.","טיימר גלוי."],
     yt:"הטחות כדורגל נגיחות טכניקה freestyle"},

    {id:"toetap", em:"🦶", name:"נגיעות על הכדור", unit:"נגיעות ב-30 שניות", lower:false, timeSec:30, vidMax:60,
     proto:"30 שניות. נגיעות לסירוגין בכף הרגל על כדור מונח. קל, קצר וכיף לצלם.",
     ok:["הכדור מונח על הרצפה ולא זז ממקומו.",
         "נגיעה קלה בכף הרגל, החלפת רגליים בכל נגיעה.",
         "קצב רציף."],
     no:["דריכה על הכדור במקום נגיעה.","אותה רגל פעמיים ברצף.","הכדור מתגלגל ממקומו."],
     film:["לצלם **מלפנים או מהצד**, מקרוב, כך שהכדור והרגליים ממלאים את הפריים.",
           "מצלמה על הרצפה או בגובה הברך.","טיימר גלוי."],
     yt:"toe taps כדורגל תרגיל זריזות רגליים"},

    {id:"selfpass", em:"🏐", name:"מסירות אצבעות עצמיות", unit:"מסירות בדקה", lower:false, timeSec:60, vidMax:90,
     proto:"60 שניות. מסירות אצבעות לעצמך מעל הראש, בלי שהכדור נופל.",
     ok:["מסירת אצבעות תקינה מעל המצח, בשתי ידיים.",
         "הכדור עולה לפחות מטר מעל הראש.",
         "אם הכדור נפל — מרימים וממשיכים לספור."],
     no:["מסירה בכף יד פתוחה או באגרוף.","הכדור לא עלה מספיק גבוה.","תפיסת הכדור."],
     film:["מצלמה **מהצד**, מספיק רחוקה כדי לתפוס את הכדור בשיא הגובה.",
           "צילום בחוץ או בתקרה גבוהה.","טיימר גלוי."],
     yt:"מסירת אצבעות כדורעף טכניקה הסבר"},

    {id:"cone", em:"🔻", name:"כדרור מסלול קונוסים", unit:"שניות", lower:true, timeSec:null, vidMax:60,
     proto:"מסלול של 6 קונוסים במרווחים של 2 מ׳. הלוך ושוב. נמוך יותר = טוב יותר.",
     ok:["המסלול מסומן ומדוד לפני הצילום.",
         "כדרור סביב כל קונוס בלי לדלג.",
         "השעון נעצר כשהתלמיד וגם הכדור חוצים את קו הסיום."],
     no:["דילוג על קונוס.","הפלת קונוס — הניסיון נפסל.","איבוד שליטה על הכדור מחוץ למסלול."],
     film:["מצלמה **מהצד**, גבוה מספיק כדי לראות את **כל** המסלול בפריים אחד.",
           "לצלם את פריסת המסלול בתחילת הסרטון.","טיימר גלוי או ספירה קולית."],
     yt:"כדרור בין קונוסים תרגיל זריזות כדורסל"},

    /* ---------- שיווי משקל ---------- */
    {id:"balance", em:"🧍", name:"עמידה על רגל אחת בעיניים עצומות", unit:"שניות (עד 60)", lower:false, timeSec:60, vidMax:90,
     proto:"עד 60 שניות. הזמן נעצר ברגע שכף הרגל השנייה נוגעת ברצפה. מי שהגיע ל-60 — הגיע למקסימום.",
     ok:["עמידה על רגל אחת, הרגל השנייה לא נוגעת בקרקע ולא נשענת על רגל העמידה.",
         "עיניים עצומות לכל אורך הזמן.",
         "ידיים חופשיות לצדדים."],
     no:["פקיחת עיניים.","נגיעה של הרגל השנייה ברצפה.","היאחזות בקיר או בחפץ."],
     film:["לצלם **מלפנים**, גוף מלא — כך רואים גם את העיניים וגם את הרגליים.",
           "מרחק 2–3 מ׳, מצלמה בגובה החזה.","טיימר גלוי בפריים — הזמן הוא התוצאה."],
     yt:"מבחן שיווי משקל עמידה על רגל אחת"}
  ];

  /* ============================================================
     תרגום UNIVERSAL / SPORTS — ראה docs/i18n-glossary.md
     UNIVERSAL מוצג בזמן אמת בכל פתיחה של מסך «איך מבצעים ומצלמים»
     (howtoHtml ב-hm-app.js קורא ל-W.universal בכל קריאה), ולכן
     universal חשוף כ-getter שמחשב מחדש לפי השפה הנוכחית.
     SPORTS הוא רק ה-*זרע* הראשוני שנשמר פעם אחת ל-rec.sports —
     תרגום כאן משפיע רק על ההתחלה הראשונה של מורה חדש (או איפוס),
     לא על ענפים שכבר נשמרו/נערכו ב-localStorage.
     ============================================================ */
const UNIVERSAL_I18N={
  en:["One continuous shot from start to finish — no cuts, no pausing, and no speeding up.","At the beginning of the video say out loud: full name, class, and the sport. This makes the video proof.","The entire body in the frame throughout the performance — including the feet and the floor.","The phone is placed on a stable surface or held by a friend. Shaky video = hard to judge = rejected.","Lighting from the front, not behind. Filming facing the sun or a window turns the subject into a silhouette."],
  ar:["تصوير واحد متواصل من البداية إلى النهاية — بدون تقطيع، بدون إيقاف وبدون تسريع.","في بداية الفيديو يجب القول بصوت عالٍ: الاسم الكامل، الصف، واسم الرياضة. هذا ما يجعل الفيديو إثباتًا.","الجسم بالكامل داخل الإطار (الكادر) طوال الأداء — بما في ذلك القدمان والأرض.","وضع الهاتف على سطح ثابت أو يُمسك بواسطة صديق. فيديو مهتز = يصعب الحكم عليه = يُرفض.","الإضاءة من الأمام وليس من الخلف. التصوير مقابل الشمس أو نافذة يجعل الشخصية تظهر كظل."],
  ru:["Одно непрерывное видео от начала и до конца — без склеек, без пауз и без ускорения.","В начале видео произнесите вслух: полное имя, класс и вид спорта. Именно это делает видео доказательством.","Всё тело в кадре на протяжении всего выполнения — включая стопы и пол.","Телефон установлен на устойчивой поверхности или его держит друг. Дрожащее видео = сложно судить = отклонено.","Свет спереди, а не сзади. Съемка против солнца или окна превращает фигуру в силуэт."],
};
const universalLoc=()=>{
  const cur=window.I18N?window.I18N.lang():"he";
  return UNIVERSAL_I18N[cur]||UNIVERSAL;
};

const SPORTS_I18N={
  en:{"rope":{"name":"Jump Rope","unit":"jumps per minute","proto":"Exactly 60 seconds. Count the number of completed jumps.","ok":["Both feet leave the ground together and the rope completes a full rotation — under the feet and over the head.","A jump counts only when the rope passes under both feet without getting stuck.","It is allowed to stop to adjust the rope — but the clock keeps running."],"no":["The rope gets caught on the legs — that jump does not count.","A jump where the rope didn't pass (an \"idle jump\" between jumps) — does not count.","A video longer than 90 seconds — the performance is a minute, there's no reason for more."],"film":["Film from the side, perpendicular to the body — this clearly shows the rope passing under the feet and touching the floor.","Camera at waist height, 2–3m away, so both the head and the floor are in frame.","Visible timer in the frame (a second phone or watch) — or clear vocal counting by the teacher."]},"dbl":{"name":"Double Unders","unit":"jumps per minute","proto":"60 seconds. Count only double jumps (the rope passes twice in a single jump).","ok":["In one jump, the rope completes two full rotations.","It is allowed to mix single jumps between the doubles — they just don't count.","Landing on both feet."],"no":["A jump where the rope passed only once.","The rope gets stuck in the middle of the second rotation.","A video longer than 90 seconds."],"film":["From the side, waist height, 2–3m — must see both rotations.","Good lighting: at a fast pace the rope is blurry and in the dark it's impossible to count.","Visible timer in the frame."]},"push":{"name":"Push-ups","unit":"reps per minute","proto":"60 seconds. Count valid repetitions. Resting within the minute is allowed — the clock continues.","ok":["The body in one straight line from the heels through the pelvis to the head.","On descent: elbows reach at least a 90° angle, or the chest is about 8cm from the floor.","On ascent: full extension of the elbows before the next rep."],"no":["The pelvis drops to the floor or pikes upwards (\"butt in the air\").","Partial descent — elbows not reaching 90°.","Resting on the knees or stomach — allowed to pause in position, not to lie down."],"film":["Film exactly from the side (90° to the body) — this is the only angle from which descent depth can be seen.","Low camera, at a height of 40–50cm from the floor.","Entire body in frame — from hands to toes."]},"pull":{"name":"Pull-ups","unit":"reps per minute","proto":"60 seconds. Count valid repetitions. Dropping from the bar and getting back on within the minute is allowed.","ok":["Start from a dead hang — elbows completely straight.","The chin goes over the bar (not touching it — crossing it).","Descent back to a full dead hang before the next rep."],"no":["Body swinging and kicking legs for momentum (kipping) — unless agreed in advance.","The chin did not clear the height of the bar.","Partial descent — elbows not fully opened."],"film":["Film from the side, so both the bar and the chin are seen in the same frame.","Camera approximately at bar height — from below it looks like the chin crossed even when it didn't.","Entire body in frame to see if there is swinging."]},"dips":{"name":"Dips","unit":"reps per minute","proto":"60 seconds. Count valid repetitions.","ok":["Start with straight arms, body suspended between the bars.","Descent to at least a 90° angle at the elbow.","Ascent to full extension of the elbows."],"no":["Partial descent.","Swinging legs for momentum.","Legs touching the floor in the middle."],"film":["Film from the side, at bar height — to see the elbow angle.","Entire body in frame, including legs (to check for swinging).","Distance of 2–3m from the equipment."]},"sit":{"name":"Sit-ups","unit":"reps per minute","proto":"60 seconds. Count full repetitions.","ok":["Knees bent at 90°, arms crossed over the chest.","On ascent: elbows or shoulders touch the thighs.","On descent: both shoulders touch the floor."],"no":["Hands behind the neck pulling the head.","Rising with momentum using the back instead of the abdominal muscles.","Shoulders did not touch the floor on the descent."],"film":["Film from the side, at a low height — this way both shoulder contact and ascent height are seen.","Entire body in frame.","Visible timer or clear vocal count."]},"squat":{"name":"Squats","unit":"reps per minute","proto":"60 seconds. Count full repetitions.","ok":["Feet shoulder-width apart, full feet flat on the floor.","Descent until the thigh line is parallel to the floor or lower.","Ascent to full extension of the hips and knees."],"no":["Partial descent — thigh didn't reach parallel.","Heels lifting off the floor.","Knees caving inwards on the ascent."],"film":["Film from the side, at waist height — the angle from which descent depth can be seen.","Entire body in frame, including the feet.","Visible timer."]},"burpee":{"name":"Burpees","unit":"reps per minute","proto":"60 seconds. Count full repetitions.","ok":["On descent: chest and thighs touch the floor.","On ascent: a two-foot jump and a clap above the head.","Full extension of the body during the jump."],"no":["Chest didn't touch the floor.","No jump at the end — just standing.","\"Shortcut\" without descending all the way."],"film":["Film from the side, full body, camera at a low height.","The floor must be seen — it's the only way to verify chest contact.","Visible timer."]},"jack":{"name":"Jumping Jacks","unit":"reps per minute","proto":"60 seconds. Count full repetitions. The easiest sport to start with.","ok":["Opening: feet wider than shoulder-width and hands touch above the head.","Closing: feet together and arms to the sides.","Continuous pace — opening and closing count as one rep."],"no":["Hands that didn't reach above the head.","Feet that didn't open wider than shoulder-width.","Partial jumping at an excessively fast pace."],"film":["Film from the front, full body, 2–3m distance — so both hands and feet are seen.","Clean background, to make counting easy.","Visible timer in the frame."]},"mount":{"name":"Mountain Climbers","unit":"reps in 30 seconds","proto":"30 seconds. Count every single forward knee drive as a rep.","ok":["Plank position on the hands, body in a straight line.","The knee reaches at least the elbow line.","Continuous leg switching."],"no":["Pelvis raising upwards.","Knee didn't reach the elbow line.","Hands moving from their spot."],"film":["Film from the side, at a low height — to see the knee height and the body line.","Entire body in frame.","Visible timer."]},"ljump":{"name":"Standing Long Jump","unit":"cm","proto":"Three attempts, the best one is recorded. Measured in centimeters.","ok":["Takeoff from both feet together behind the line, without a step or approach run.","Landing on both feet and maintaining balance.","Measured from the line to the rearmost point of contact of the body."],"no":["Stepping on or over the line before the jump.","A small step or preparatory hop before takeoff.","Falling backwards — measured from the point of the fall."],"film":["Film from the side, so both the takeoff line and landing area are in a single frame.","Measuring tape laid out on the floor, visible in the video.","All three attempts in one continuous shot — not a separate video for each jump."]},"hjump":{"name":"Standing Vertical Jump","unit":"cm","proto":"Three attempts. The result = touch height on the jump minus standing reach height.","ok":["First, measure the standing arm reach height — this is the zero point.","Jump from both feet from a standstill, without a step or approach run.","Clear marking of the highest point of touch."],"no":["A step or preparatory hop before the jump.","Measuring without the standing height — without it there is no result, just a number.","Touching with two hands if measured with one hand."],"film":["Film from the side, with the wall or marked scale in frame.","First film the measurement of the standing height, then the jump — in the same continuous video.","Camera high enough to capture the peak point."]},"sprint30":{"name":"30m Sprint","unit":"seconds","proto":"A straight and measured 30m track. Lower = better. The shortest event to film.","ok":["The track is pre-measured and lines are clearly marked.","Start from a standing position after a clear signal.","Time stops when the torso crosses the finish line."],"no":["Starting before the signal.","A downhill track or shorter than 30m.","Unmeasured track."],"film":["Camera at the finish line, perpendicular to the track, on a stable surface.","Preferable to use the «Photo-Finish» module — it measures from the camera itself.","Document the track measurement at the start of the video as well."]},"sprint":{"name":"60m Sprint","unit":"seconds","proto":"A straight and measured 60m track. Lower = better.","ok":["The track is pre-measured and lines are marked.","Start from standing or crouching after a clear signal.","Time stops upon the torso crossing the finish line."],"no":["Starting before the signal.","Tailwind above +2.0 m/s.","Unmeasured track or downhill."],"film":["Most accurate: the app's «Photo-Finish» module.","If filming manually: camera at the finish line, exactly perpendicular, on a tripod.","Both start and finish must be seen."]},"shuttle":{"name":"4×10m Shuttle Run","unit":"seconds","proto":"Four runs of 10m back and forth. Lower = better.","ok":["Two lines measured exactly 10m apart.","On every turn — one foot must touch or cross the line.","The clock stops upon crossing the finish line for the fourth time."],"no":["Turning before reaching the line.","Distance shorter than 10m.","Fewer than four runs."],"film":["Film from the side, so both lines are in a single frame — this is critical.","Stable camera at a distance, without moving during the run.","Visible timer or clear vocal count."]},"throw":{"name":"Free Throws","unit":"shots made out of 10","proto":"10 shots from the free throw line. Record the number of successful shots.","ok":["Both feet behind the line until the ball leaves the hand.","The ball goes into the basket — including via the backboard.","Ten consecutive shots, without changing position."],"no":["Stepping on the line before the ball leaves the hand.","Shooting closer than the line.","Changing the number of shots."],"film":["An angle where both the line and the basket are in a single frame — usually from the side and behind.","Do not move the camera between shots.","All ten shots in one continuous take."]},"basket60":{"name":"Basketball Shooting (60 sec)","unit":"shots per minute","proto":"60 seconds. Count how many shots go in from anywhere on the court.","ok":["Any shot that goes into the basket counts, from any distance.","The student collects their own rebound and continues.","The clock runs continuously."],"no":["Dunking without leaving the floor under the basket (unless agreed).","An assistant returning balls — the student collects on their own.","Counting a ball that didn't go in."],"film":["Stable camera that sees the basket and the student throughout the entire minute.","Do not track the student with the phone — fixed frame.","Visible timer."]},"wallpass":{"name":"Wall Passes","unit":"passes per minute","proto":"60 seconds. Pass a ball to the wall from 2m and catch. Count clean catches.","ok":["A distance of at least 2m from the wall, marked on the floor.","Passing and catching with two hands.","Only a clean catch counts — without the ball dropping."],"no":["The ball dropped to the floor — that pass does not count.","Standing too close to the wall.","Catching with one hand (unless agreed in advance)."],"film":["Film from the side, so the wall, the standing line, and the student are all in frame.","Standing distance is clearly marked on the floor.","Visible timer."]},"juggle":{"name":"Soccer Juggling","unit":"touches per minute","proto":"60 seconds. Count consecutive touches without the ball touching the floor.","ok":["All body parts are allowed except hands and arms.","If the ball drops — pick it up and continue, counting continues from the previous number.","Counting stops at the end of the minute."],"no":["Hand or arm contact.","The ball rests on the body instead of being touched.","Counting a touch after contact with the floor."],"film":["Distance that allows seeing both the ball at peak height and the floor.","Stable camera — without tracking the ball.","Visible timer."]},"toetap":{"name":"Toe Taps","unit":"touches in 30 seconds","proto":"30 seconds. Alternating foot touches on a stationary ball. Easy, short, and fun to film.","ok":["The ball is placed on the floor and does not move from its spot.","Light touch with the foot, switching legs every touch.","Continuous pace."],"no":["Stepping on the ball instead of touching.","Same leg twice in a row.","The ball rolling away from its spot."],"film":["Film from the front or side, up close, so the ball and legs fill the frame.","Camera on the floor or at knee height.","Visible timer."]},"selfpass":{"name":"Overhead Self-Passes","unit":"passes per minute","proto":"60 seconds. Overhead volleyball passes (setting) to yourself, without the ball dropping.","ok":["Proper two-handed overhead pass above the forehead.","The ball goes at least one meter above the head.","If the ball drops — pick it up and continue counting."],"no":["Passing with an open palm or fist.","The ball didn't go high enough.","Catching the ball."],"film":["Camera from the side, far enough to catch the ball at peak height.","Film outdoors or with a high ceiling.","Visible timer."]},"cone":{"name":"Cone Dribbling Course","unit":"seconds","proto":"A course of 6 cones spaced 2m apart. Out and back. Lower = better.","ok":["The course is marked and measured before filming.","Dribbling around every cone without skipping.","The clock stops when both the student and the ball cross the finish line."],"no":["Skipping a cone.","Knocking over a cone — the attempt is disqualified.","Losing control of the ball outside the course."],"film":["Camera from the side, high enough to see the entire course in a single frame.","Film the layout of the course at the start of the video.","Visible timer or clear vocal count."]},"balance":{"name":"Single-Leg Blind Balance","unit":"seconds (up to 60)","proto":"Up to 60 seconds. Time stops the moment the other foot touches the floor. Reaching 60 = maximum achieved.","ok":["Standing on one leg, the other leg does not touch the ground and doesn't rest on the standing leg.","Eyes closed the entire time.","Arms free at the sides."],"no":["Opening eyes.","The other leg touching the floor.","Holding onto a wall or object."],"film":["Film from the front, full body — this way both the eyes and the legs are seen.","Distance of 2–3m, camera at chest height.","Visible timer in the frame — the time is the result."]}},
  ar:{"rope":{"name":"القفز بالحبل","unit":"قفزات في الدقيقة","proto":"60 ثانية بالضبط. عد القفزات المكتملة.","ok":["تغادر القدمان معًا الأرض ويكمل الحبل دورة كاملة — تحت القدمين وفوق الرأس.","تُحسب القفزة فقط عندما يمر الحبل تحت كلتا القدمين دون أن يعلق.","يُسمح بالتوقف لترتيب الحبل — لكن الساعة تستمر في العمل."],"no":["علق الحبل بالقدمين — تلك القفزة لا تُحسب.","قفزة دون أن يمر الحبل (\"قفزة فارغة\" بين قفزة وأخرى) — لا تُحسب.","فيديو أطول من 90 ثانية — الأداء هو دقيقة، لا مبرر للمزيد."],"film":["التصوير من الجانب، بشكل عمودي على الجسم — هكذا يُرى بوضوح الحبل وهو يمر تحت القدمين ويلمس الأرض.","الكاميرا في ارتفاع الخصر، على مسافة 2–3م، بحيث يكون الرأس والأرض في الإطار.","مؤقت مرئي في الإطار (هاتف ثانٍ أو ساعة) — أو عد صوتي واضح من المعلم."]},"dbl":{"name":"قفز مزدوج بالحبل","unit":"قفزات في الدقيقة","proto":"60 ثانية. تُحسب القفزات المزدوجة فقط (يمر الحبل مرتين في قفزة واحدة).","ok":["في القفزة الواحدة يكمل الحبل دورتين كاملتين.","يُسمح بدمج قفزات عادية بين المزدوجة — لكنها ببساطة لا تُحسب.","الهبوط على كلتا القدمين."],"no":["قفزة مر فيها الحبل مرة واحدة فقط.","علق الحبل في منتصف الدورة الثانية.","فيديو أطول من 90 ثانية."],"film":["من الجانب، ارتفاع الخصر، 2–3م — يجب رؤية الدورتين بوضوح.","إضاءة جيدة: بالسرعة العالية يكون الحبل ضبابيًا وفي الظلام يستحيل العد.","مؤقت مرئي في الإطار."]},"push":{"name":"تمارين الضغط","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الصحيحة. يُسمح بالراحة خلال الدقيقة — الساعة تستمر.","ok":["الجسم في خط مستقيم واحد من الكعبين مرورًا بالحوض وحتى الرأس.","عند النزول: يصل المرفقان لزاوية 90 درجة على الأقل، أو الصدر يبعد حوالي 8 سم عن الأرض.","عند الصعود: استقامة كاملة للمرفقين قبل التكرار التالي."],"no":["تدلي الحوض نحو الأرض أو ارتفاعه لأعلى (\"المؤخرة في الهواء\").","نزول جزئي — المرفقان لم يصلا لـ 90 درجة.","الراحة على الركبتين أو البطن — يُسمح بالتوقف في وضعية الاستعداد، لا الاستلقاء."],"film":["التصوير من الجانب تمامًا (90 درجة للجسم) — هذه هي الزاوية الوحيدة التي يُرى منها عمق النزول.","كاميرا منخفضة، على ارتفاع 40–50 سم من الأرض.","الجسم بالكامل في الإطار — من كفي اليدين وحتى أطراف الأصابع."]},"pull":{"name":"عقلة (سحب)","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الصحيحة. يُسمح بالنزول من العارضة والصعود مجددًا خلال الدقيقة.","ok":["البدء من تعلق كامل — المرفقان مستقيمان تمامًا.","الذقن يعبر فوق العارضة (لا يلمسها — يعبرها).","نزول للتعلق الكامل قبل التكرار التالي."],"no":["تأرجح الجسم ورفس الساقين للاندفاع (كيبينج) — ما لم يُتفق عليه مسبقًا.","الذقن لم يتجاوز ارتفاع العارضة.","نزول جزئي — المرفقان لم يفتحا للآخر."],"film":["التصوير من الجانب، بحيث تُرى العارضة والذقن في نفس الإطار.","الكاميرا في مستوى العارضة تقريبًا — من الأسفل يبدو وكأن الذقن تجاوزها حتى لو لم يحدث ذلك.","الجسم بالكامل في الإطار لرؤية ما إذا كان هناك تأرجح."]},"dips":{"name":"متوازي","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الصحيحة.","ok":["البداية بذراعين مستقيمتين، الجسم معلق بين القضيبين.","نزول حتى زاوية 90 درجة على الأقل في المرفق.","صعود لاستقامة المرفقين بالكامل."],"no":["نزول جزئي.","تأرجح الساقين للاندفاع.","تلمس الساقان الأرض في المنتصف."],"film":["التصوير من الجانب، في مستوى القضبان — لرؤية زاوية المرفق.","الجسم بالكامل في الإطار، بما في ذلك الساقان (لفحص التأرجح).","مسافة 2–3م من الجهاز."]},"sit":{"name":"تمارين البطن","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الكاملة.","ok":["الركبتان مثنيتان بزاوية 90 درجة، اليدان متقاطعتان على الصدر.","عند الصعود: المرفقان أو الأكتاف تصل حتى الفخذين.","عند النزول: يلمس الكتفان الأرض."],"no":["اليدان خلف الرقبة وتجذبان الرأس.","الصعود باندفاع بواسطة الظهر بدلاً من عضلات البطن.","لم يلمس الكتفان الأرض عند النزول."],"film":["التصوير من الجانب، بارتفاع منخفض — هكذا نرى ملامسة الكتفين وارتفاع الصعود معًا.","الجسم بالكامل في الإطار.","مؤقت مرئي أو عد صوتي."]},"squat":{"name":"سكوات (القرفصاء)","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الكاملة.","ok":["القدمان بعرض الأكتاف، كعب وقدم مسطحة بالكامل على الأرض.","النزول حتى يوازي خط الفخذ الأرض أو أقل منه.","الصعود لاستقامة كاملة للفخذين والركبتين."],"no":["نزول جزئي — لم يوازِ الفخذ الأرض.","ارتفاع الكعبين عن الأرض.","سقوط الركبتين للداخل عند الصعود."],"film":["التصوير من الجانب، في ارتفاع الخصر — الزاوية التي يُرى منها عمق النزول.","الجسم بالكامل في الإطار، بما في ذلك القدمين.","مؤقت مرئي."]},"burpee":{"name":"بيربي","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الكاملة.","ok":["عند النزول: يلمس الصدر والفخذان الأرض.","عند الصعود: قفزة بكلتا القدمين مع تصفيق فوق الرأس.","استقامة كاملة للجسم أثناء القفزة."],"no":["الصدر لم يلمس الأرض.","لا توجد قفزة في النهاية — مجرد وقوف.","\"اختصار الطريق\" دون النزول حتى النهاية."],"film":["التصوير من الجانب، جسم كامل، كاميرا بارتفاع منخفض.","يجب أن تُرى الأرض — هذه هي الطريقة الوحيدة للتأكد من ملامسة الصدر.","مؤقت مرئي."]},"jack":{"name":"قفزات التباعد (جامبينج جاك)","unit":"تكرارات في الدقيقة","proto":"60 ثانية. عد التكرارات الكاملة. أسهل رياضة للبدء بها.","ok":["فتح: القدمان أوسع من عرض الأكتاف واليدان تتلامسان فوق الرأس.","إغلاق: القدمان مضمومتان واليدان للجانبين.","وتيرة مستمرة — الفتح والإغلاق يُحسبان تكرارًا واحدًا."],"no":["لم تصل اليدان فوق الرأس.","لم تُفتح القدمان أوسع من عرض الأكتاف.","قفز جزئي بوتيرة سريعة جدًا."],"film":["التصوير من الأمام، جسم كامل، مسافة 2–3م — هكذا تُرى اليدان والقدمان معًا.","خلفية نظيفة، ليسهل العد.","مؤقت مرئي في الإطار."]},"mount":{"name":"متسلق الجبال","unit":"تكرارات في 30 ثانية","proto":"30 ثانية. عد كل دفع لركبة واحدة للأمام كتكرار.","ok":["وضعية بلانك على اليدين، الجسم في خط مستقيم.","الركبة تصل إلى خط المرفق على الأقل.","تبديل مستمر للساقين."],"no":["الحوض يرتفع لأعلى.","ركبة لم تصل لخط المرفق.","تحريك اليدين من مكانهما."],"film":["التصوير من الجانب، بارتفاع منخفض — لرؤية ارتفاع الركبة وخط الجسم.","الجسم بالكامل في الإطار.","مؤقت مرئي."]},"ljump":{"name":"القفز الطويل من الثبات","unit":"سم","proto":"ثلاث محاولات، تُسجل الأفضل بينها. يُقاس بالسنتيمترات.","ok":["الانطلاق بكلتا القدمين معًا من خلف الخط، بدون خطوة وبدون ركض للاقتراب.","الهبوط على كلتا القدمين والمحافظة على التوازن.","يُقاس من الخط وحتى أبعد نقطة تلامس خلفية للجسم."],"no":["الدوس على الخط أو تجاوزه قبل القفز.","خطوة صغيرة أو قفزة تمهيدية قبل الانطلاق.","السقوط للخلف — يُقاس من نقطة السقوط."],"film":["التصوير من الجانب، بحيث يكون خط الانطلاق ومنطقة الهبوط في إطار واحد.","شريط قياس أو متر ممدود على الأرض، مرئي في الفيديو.","المحاولات الثلاث متتالية — ليس فيديو منفصل لكل قفزة."]},"hjump":{"name":"القفز العمودي من الثبات","unit":"سم","proto":"ثلاث محاولات. النتيجة = ارتفاع اللمسة في القفزة ناقص ارتفاع مد اليد في الوقوف.","ok":["نقيّس أولاً ارتفاع مد اليد في حالة الوقوف — هذه نقطة الصفر.","القفز بكلتا القدمين من مكان الثبات، بدون خطوة وبدون ركض للاقتراب.","علامة واضحة لأعلى نقطة تلامس."],"no":["خطوة أو قفزة تمهيدية قبل القفز.","القياس بدون ارتفاع الوقوف — بدونه لا توجد نتيجة، هناك فقط رقم.","اللمس بكلتا اليدين إذا تم القياس بيد واحدة."],"film":["التصوير من الجانب، بحيث يكون الجدار أو المقياس في الإطار.","تصوير قياس ارتفاع الوقوف أولاً ثم القفزة — في نفس الفيديو المتصل.","الكاميرا عالية بما يكفي لالتقاط نقطة الذروة."]},"sprint30":{"name":"ركض 30م","unit":"ثوانٍ","proto":"مسار مستقيم ومقاس 30م. أقل = أفضل. أقصر رياضة للتصوير.","ok":["المسار مقاس مسبقًا والخطوط محددة بوضوح.","الانطلاق من الوقوف بعد إشارة واضحة.","يتوقف الوقت عند عبور الجذع لخط النهاية."],"no":["الانطلاق قبل الإشارة.","مسار في منحدر أو أقصر من 30م.","مسار غير مقاس."],"film":["كاميرا عند خط النهاية، متعامدة مع المسار، على سطح ثابت.","يُفضل استخدام وحدة «فوتو-فينيش» — تقيس من الكاميرا نفسها.","توثيق قياس المسار في بداية الفيديو أيضًا."]},"sprint":{"name":"ركض 60م","unit":"ثوانٍ","proto":"مسار مستقيم ومقاس 60م. أقل = أفضل.","ok":["المسار مقاس مسبقًا والخطوط محددة.","الانطلاق من الوقوف أو الانحناء بعد إشارة واضحة.","يتوقف الوقت عند عبور الجذع لخط النهاية."],"no":["الانطلاق قبل الإشارة.","رياح خلفية تزيد عن +2.0 م/ث.","مسار غير مقاس أو في منحدر."],"film":["الأكثر دقة: وحدة «فوتو-فينيش» في التطبيق.","إذا تم التصوير يدويًا: الكاميرا عند خط النهاية، متعامدة تمامًا، على حامل ثلاثي.","يجب أن يُرى الانطلاق والنهاية."]},"shuttle":{"name":"ركض مكوكي 4×10م","unit":"ثوانٍ","proto":"أربع ركضات لمسافة 10م ذهابًا وإيابًا. أقل = أفضل.","ok":["خطان مقاسان بمسافة 10م بالضبط.","في كل التفاف — يجب أن تلمس قدم واحدة الخط أو تعبره.","تتوقف الساعة عند عبور خط النهاية للمرة الرابعة."],"no":["الالتفاف قبل الوصول للخط.","مسافة أقصر من 10م.","أقل من أربع ركضات."],"film":["التصوير من الجانب، بحيث يكون كلا الخطين في إطار واحد — هذا أمر بالغ الأهمية.","كاميرا ثابتة عن بُعد، بدون تحريك أثناء الركض.","مؤقت مرئي أو عد صوتي."]},"throw":{"name":"رميات حرة","unit":"تسديدات من 10","proto":"10 رميات من خط الرمية الحرة. يُسجل عدد الإصابات.","ok":["كلتا القدمين خلف الخط حتى تترك الكرة اليد.","الكرة تدخل السلة — بما في ذلك عبر اللوحة.","عشر رميات متتالية، بدون تغيير المكان."],"no":["الدوس على الخط قبل أن تترك الكرة اليد.","الرمي من مسافة أقرب من الخط.","تغيير عدد الرميات."],"film":["زاوية تُظهر الخط والسلة معًا في إطار واحد — عادةً من الجانب والخلف.","عدم تحريك الكاميرا بين كل رمية وأخرى.","الرميات العشر متتالية في مقطع واحد."]},"basket60":{"name":"تسديدات كرة السلة في دقيقة","unit":"تسديدات في الدقيقة","proto":"60 ثانية. عد التسديدات التي تدخل من أي مكان في الملعب.","ok":["كل تسديدة تدخل السلة تُحسب، من أي مسافة.","يجمع الطالب الكرة المرتدة (ريباوند) بنفسه ويستمر.","تستمر الساعة في العمل."],"no":["الإدخال المباشر (دانك) بدون ترك الأرض تحت السلة (إلا إذا تم الاتفاق على ذلك).","مساعد يعيد الكرات — الطالب يجمع بنفسه.","حساب كرة لم تدخل."],"film":["كاميرا ثابتة ترى السلة والطالب معًا طوال الدقيقة.","عدم تتبع الطالب بالهاتف — إطار ثابت.","مؤقت مرئي."]},"wallpass":{"name":"تمريرات الحائط","unit":"تمريرات في الدقيقة","proto":"60 ثانية. تمرير كرة للحائط من مسافة 2م والتقاطها. عد الالتقاطات النظيفة.","ok":["مسافة 2م على الأقل من الحائط، محددة على الأرض.","التمرير والالتقاط بكلتا اليدين.","تُحسب فقط الالتقاطة النظيفة — دون أن تسقط الكرة."],"no":["سقطت الكرة على الأرض — تلك التمريرة لا تُحسب.","الوقوف قريبًا جدًا من الحائط.","الالتقاط بيد واحدة (إلا إذا اتفق على ذلك مسبقًا)."],"film":["التصوير من الجانب، بحيث يُرى الحائط، وخط الوقوف، والطالب في الإطار.","مسافة الوقوف محددة بوضوح على الأرض.","مؤقت مرئي."]},"juggle":{"name":"تنطيط كرة القدم (جوجلنج)","unit":"لمسات في الدقيقة","proto":"60 ثانية. عد اللمسات المتتالية دون أن تلمس الكرة الأرض.","ok":["يُسمح بجميع أجزاء الجسم عدا اليدين والذراعين.","إذا سقطت الكرة — ارفعها واستمر، يستمر العد من الرقم السابق.","يتوقف العد عند انتهاء الدقيقة."],"no":["لمسة يد أو ذراع.","الكرة تستقر على الجسم بدلاً من اللمس.","حساب لمسة بعد ملامسة الأرض."],"film":["مسافة تتيح رؤية الكرة في أقصى ارتفاع والأرض معًا.","كاميرا ثابتة — بدون تتبع الكرة.","مؤقت مرئي."]},"toetap":{"name":"لمسات بأطراف الأصابع على الكرة","unit":"لمسات في 30 ثانية","proto":"30 ثانية. لمسات متبادلة بمشط القدم على كرة موضوعة في مكانها. سهل، قصير وممتع للتصوير.","ok":["الكرة موضوعة على الأرض ولا تتحرك من مكانها.","لمسة خفيفة بمشط القدم، تبديل القدمين في كل لمسة.","وتيرة مستمرة."],"no":["الدوس على الكرة بدلاً من لمسها.","نفس القدم مرتين متتاليتين.","الكرة تتدحرج من مكانها."],"film":["التصوير من الأمام أو من الجانب، عن قرب، بحيث تملأ الكرة والقدمان الإطار.","كاميرا على الأرض أو بارتفاع الركبة.","مؤقت مرئي."]},"selfpass":{"name":"تمريرات علوية ذاتية (للنفس)","unit":"تمريرات في الدقيقة","proto":"60 ثانية. تمريرات علوية بالأصابع لنفسك فوق الرأس، دون أن تسقط الكرة.","ok":["تمريرة أصابع صحيحة فوق الجبهة، بكلتا اليدين.","ترتفع الكرة متراً واحداً على الأقل فوق الرأس.","إذا سقطت الكرة — ارفعها واستمر في العد."],"no":["التمرير براحة اليد المفتوحة أو بقبضة اليد.","لم ترتفع الكرة بما فيه الكفاية.","الإمساك بالكرة."],"film":["كاميرا من الجانب، بعيدة بما يكفي لالتقاط الكرة في أعلى ارتفاع لها.","التصوير في الخارج أو مع سقف عالٍ.","مؤقت مرئي."]},"cone":{"name":"مسار المراوغة بين الأقماع","unit":"ثوانٍ","proto":"مسار من 6 أقماع بمسافات 2م. ذهابًا وإيابًا. أقل = أفضل.","ok":["المسار محدد ومقاس قبل التصوير.","تنطيط الكرة حول كل قمع دون تخطي أي منها.","تتوقف الساعة عندما يعبر الطالب والكرة معًا خط النهاية."],"no":["تخطي قمع.","إسقاط قمع — تُلغى المحاولة.","فقدان السيطرة على الكرة خارج المسار."],"film":["كاميرا من الجانب، عالية بما يكفي لرؤية المسار بأكمله في إطار واحد.","تصوير فرد المسار في بداية الفيديو.","مؤقت مرئي أو عد صوتي."]},"balance":{"name":"الوقوف على ساق واحدة بعيون مغلقة","unit":"ثوانٍ (حتى 60)","proto":"حتى 60 ثانية. يتوقف الوقت بمجرد أن تلمس القدم الأخرى الأرض. من يصل لـ 60 — حقق الحد الأقصى.","ok":["الوقوف على ساق واحدة، الساق الأخرى لا تلمس الأرض ولا تستند على ساق الوقوف.","عيون مغلقة طوال الوقت.","اليدان حرتان للجانبين."],"no":["فتح العيون.","تلامس القدم الأخرى للأرض.","الاستناد على حائط أو جسم."],"film":["التصوير من الأمام، جسم كامل — هكذا تُرى العيون والساقان معًا.","مسافة 2–3م، كاميرا بارتفاع الصدر.","مؤقت مرئي في الإطار — الوقت هو النتيجة."]}},
  ru:{"rope":{"name":"Прыжки со скакалкой","unit":"прыжков в минуту","proto":"Ровно 60 секунд. Считаем количество выполненных прыжков.","ok":["Обе ноги отрываются от земли одновременно, и скакалка совершает полный оборот — под ногами и над головой.","Прыжок засчитывается только тогда, когда скакалка прошла под обеими ногами, не застряв.","Разрешается остановиться, чтобы поправить скакалку — но время продолжает идти."],"no":["Скакалка застревает в ногах — этот прыжок не засчитывается.","Прыжок, при котором скакалка не прошла (\"холостой прыжок\" между прыжками) — не засчитывается.","Видео длиннее 90 секунд — выполнение длится минуту, нет причин для большего."],"film":["Снимать сбоку, перпендикулярно телу — так четко видно, как скакалка проходит под ногами и касается пола.","Камера на уровне талии, на расстоянии 2–3 м, чтобы и голова, и пол были в кадре.","Видимый таймер в кадре (второй телефон или часы) — или четкий счет вслух учителем."]},"dbl":{"name":"Двойные прыжки на скакалке","unit":"прыжков в минуту","proto":"60 секунд. Считаем только двойные прыжки (скакалка проходит дважды за один прыжок).","ok":["За один прыжок скакалка совершает два полных оборота.","Разрешается чередовать обычные прыжки с двойными — они просто не засчитываются.","Приземление на обе ноги."],"no":["Прыжок, при котором скакалка прошла только один раз.","Скакалка застревает на середине второго оборота.","Видео длиннее 90 секунд."],"film":["Сбоку, на уровне талии, 2–3 м — обязательно должны быть видны оба оборота.","Хорошее освещение: при быстром темпе скакалка размыта, а в темноте невозможно посчитать.","Видимый таймер в кадре."]},"push":{"name":"Отжимания","unit":"повторений в минуту","proto":"60 секунд. Считаем правильные повторения. Отдых в течение минуты разрешен — время продолжает идти.","ok":["Тело на одной прямой линии от пяток через таз и до головы.","При опускании: локти достигают угла минимум 90°, или грудь находится на расстоянии около 8 см от пола.","При подъеме: полное выпрямление локтей перед следующим повторением."],"no":["Таз провисает к полу или поднимается вверх (\"зад в воздухе\").","Частичное опускание — локти не достигли 90°.","Отдых на коленях или на животе — разрешается сделать паузу в упоре, но не ложиться."],"film":["Снимать точно сбоку (90° к телу) — это единственный угол, с которого видна глубина опускания.","Камера низко, на высоте 40–50 см от пола.","Всё тело в кадре — от ладоней до кончиков пальцев ног."]},"pull":{"name":"Подтягивания","unit":"повторений в минуту","proto":"60 секунд. Считаем правильные повторения. Разрешается спрыгнуть с перекладины и забраться снова в течение минуты.","ok":["Старт с полного виса — локти полностью прямые.","Подбородок проходит над перекладиной (не касается её — проходит выше).","Опускание обратно в полный вис перед следующим повторением."],"no":["Раскачивание тела и махи ногами для инерции (киппинг) — если не оговорено заранее.","Подбородок не пересек высоту перекладины.","Частичное опускание — локти не раскрылись до конца."],"film":["Снимать сбоку, так чтобы и перекладина, и подбородок были видны в одном кадре.","Камера примерно на уровне перекладины — снизу кажется, что подбородок прошел выше, даже если это не так.","Всё тело в кадре, чтобы видеть, есть ли раскачивание."]},"dips":{"name":"Отжимания на брусьях","unit":"повторений в минуту","proto":"60 секунд. Считаем правильные повторения.","ok":["Старт на прямых руках, тело висит между брусьями.","Опускание до угла минимум 90° в локте.","Подъем до полного выпрямления локтей."],"no":["Частичное опускание.","Раскачивание ног для инерции.","Ноги касаются пола посередине упражнения."],"film":["Снимать сбоку, на уровне брусьев — чтобы видеть угол в локте.","Всё тело в кадре, включая ноги (для проверки раскачивания).","Расстояние 2–3 м от снаряда."]},"sit":{"name":"Скручивания на пресс","unit":"повторений в минуту","proto":"60 секунд. Считаем полные повторения.","ok":["Колени согнуты под углом 90°, руки скрещены на груди.","При подъеме: локти или плечи достигают бедер.","При опускании: оба плеча касаются пола."],"no":["Руки за шеей тянут голову.","Подъем по инерции с помощью спины вместо мышц живота.","Плечи не коснулись пола при опускании."],"film":["Снимать сбоку, на низкой высоте — так видны и касание плеч, и высота подъема.","Всё тело в кадре.","Видимый таймер или счет вслух."]},"squat":{"name":"Приседания","unit":"повторений в минуту","proto":"60 секунд. Считаем полные повторения.","ok":["Ноги на ширине плеч, стопы полностью стоят на полу.","Опускание до момента, когда линия бедра параллельна полу или ниже.","Подъем до полного выпрямления бедер и коленей."],"no":["Частичное опускание — бедро не стало параллельным полу.","Пятки отрываются от пола.","Колени заваливаются внутрь при подъеме."],"film":["Снимать сбоку, на уровне талии — с этого угла видна глубина приседания.","Всё тело в кадре, включая стопы.","Видимый таймер."]},"burpee":{"name":"Бёрпи","unit":"повторений в минуту","proto":"60 секунд. Считаем полные повторения.","ok":["При опускании: грудь и бедра касаются пола.","При подъеме: прыжок двумя ногами и хлопок над головой.","Полное выпрямление тела во время прыжка."],"no":["Грудь не коснулась пола.","Нет прыжка в конце — только вставание.","\"Срезание углов\" без полного опускания вниз."],"film":["Снимать сбоку, в полный рост, камера на низкой высоте.","Пол должен быть в кадре — это единственный способ убедиться в касании грудью.","Видимый таймер."]},"jack":{"name":"Прыжки ноги вместе, ноги врозь (Jumping Jacks)","unit":"повторений в минуту","proto":"60 секунд. Считаем полные повторения. Самый простой вид для начала.","ok":["Открытие: ноги шире плеч, а руки касаются над головой.","Закрытие: ноги вместе, руки по швам.","Непрерывный темп — открытие и закрытие считаются за одно повторение."],"no":["Руки не поднялись над головой.","Ноги не расставлены шире плеч.","Частичный прыжок в слишком быстром темпе."],"film":["Снимать спереди, в полный рост, расстояние 2–3 м — так видны и руки, и ноги.","Чистый фон, чтобы было легко считать.","Видимый таймер в кадре."]},"mount":{"name":"Скалолаз","unit":"повторений за 30 секунд","proto":"30 секунд. Считаем каждый вынос одного колена вперед как повторение.","ok":["Позиция планки на руках, тело на одной прямой линии.","Колено достигает как минимум линии локтя.","Непрерывная смена ног."],"no":["Таз поднимается вверх.","Колено не достигло линии локтя.","Руки сдвигаются с места."],"film":["Снимать сбоку, на низкой высоте — чтобы видеть высоту колена и линию тела.","Всё тело в кадре.","Видимый таймер."]},"ljump":{"name":"Прыжок в длину с места","unit":"см","proto":"Три попытки, записывается лучшая. Измеряется в сантиметрах.","ok":["Отталкивание двумя ногами одновременно из-за линии, без шага и разбега.","Приземление на две ноги и сохранение равновесия.","Измеряется от линии до самой задней точки касания тела."],"no":["Заступ на линию или за неё перед прыжком.","Небольшой шаг или предварительный подскок перед отталкиванием.","Падение назад — измеряется от точки падения."],"film":["Снимать сбоку, так чтобы линия отталкивания и зона приземления были в одном кадре.","Измерительная лента или рулетка разложена на полу, видна на видео.","Все три попытки подряд — не отдельное видео на каждый прыжок."]},"hjump":{"name":"Прыжок в высоту с места","unit":"см","proto":"Три попытки. Результат = высота касания в прыжке минус высота вытянутой руки стоя.","ok":["Сначала измеряется высота вытянутой руки стоя — это нулевая точка.","Прыжок с двух ног с места, без шага и без разбега.","Четкая отметка наивысшей точки касания."],"no":["Шаг или предварительный подскок перед прыжком.","Измерение без учета высоты стоя — без неё нет результата, есть только цифра.","Касание двумя руками, если измерение проводилось одной рукой."],"film":["Снимать сбоку, когда стена или размеченная шкала в кадре.","Снимаем сначала замер высоты стоя, а затем прыжок — на том же непрерывном видео.","Камера достаточно высоко, чтобы запечатлеть пиковую точку."]},"sprint30":{"name":"Бег на 30 м","unit":"секунды","proto":"Прямая и размеченная дистанция 30 м. Меньше = лучше. Самая короткая дистанция для съемки.","ok":["Дистанция измерена заранее, и линии четко обозначены.","Старт из положения стоя после четкого сигнала.","Время останавливается, когда туловище пересекает финишную черту."],"no":["Старт до сигнала.","Дистанция под уклон или короче 30 м.","Неизмеренная трасса."],"film":["Камера на линии финиша, перпендикулярно дорожке, на устойчивой поверхности.","Предпочтительно использовать модуль «Фотофиниш» — он измеряет с самой камеры.","Также зафиксировать измерение дистанции в начале видео."]},"sprint":{"name":"Бег на 60 м","unit":"секунды","proto":"Прямая и размеченная дистанция 60 м. Меньше = лучше.","ok":["Дистанция измерена заранее и линии размечены.","Старт стоя или с низкого старта после четкого сигнала.","Время останавливается при пересечении туловищем финишной черты."],"no":["Старт до сигнала.","Попутный ветер выше +2,0 м/с.","Неизмеренная дистанция или бег под уклон."],"film":["Наиболее точно: модуль «Фотофиниш» в приложении.","При съемке вручную: камера на линии финиша, строго перпендикулярно, на штативе.","Старт и финиш обязательно должны быть видны."]},"shuttle":{"name":"Челночный бег 4×10 м","unit":"секунды","proto":"Четыре отрезка по 10 м туда и обратно. Меньше = лучше.","ok":["Две линии отмерены ровно на расстоянии 10 м.","При каждом развороте — одна нога должна коснуться линии или заступить за неё.","Секундомер останавливается при пересечении финишной черты в четвертый раз."],"no":["Разворот до достижения линии.","Расстояние меньше 10 м.","Менее четырех пробежек."],"film":["Снимать сбоку, так чтобы обе линии были в одном кадре — это критично.","Устойчивая камера на расстоянии, без движения во время бега.","Видимый таймер или счет вслух."]},"throw":{"name":"Штрафные броски","unit":"попаданий из 10","proto":"10 бросков с линии штрафного броска. Записывается количество попаданий.","ok":["Обе стопы за линией, пока мяч не покинет руку.","Мяч попадает в корзину — в том числе от щита.","Десять бросков подряд, без смены позиции."],"no":["Заступ на линию до того, как мяч покинул руку.","Бросок с более близкого расстояния, чем линия.","Изменение количества бросков."],"film":["Ракурс, при котором и линия, и корзина в одном кадре — обычно сбоку и сзади.","Не двигать камеру между бросками.","Все десять бросков одним дублем."]},"basket60":{"name":"Броски в корзину за минуту","unit":"попаданий в минуту","proto":"60 секунд. Считаем, сколько попаданий сделано с любого места площадки.","ok":["Считается любое попадание в корзину, с любого расстояния.","Ученик сам подбирает мяч после отскока и продолжает.","Время идет непрерывно."],"no":["Бросок сверху (данк) без отрыва от пола под кольцом (если не оговорено иное).","Помощник, подающий мячи — ученик подбирает сам.","Подсчет мяча, который не попал."],"film":["Неподвижная камера, которая видит и корзину, и ученика на протяжении всей минуты.","Не следить за учеником телефоном — фиксированный кадр.","Видимый таймер."]},"wallpass":{"name":"Пасы в стену","unit":"передач в минуту","proto":"60 секунд. Передачи мяча в стену с 2 м и ловля. Считаем чистые ловли.","ok":["Расстояние не менее 2 м от стены, отмечено на полу.","Передача и ловля двумя руками.","Засчитывается только чистая ловля — когда мяч не упал."],"no":["Мяч упал на пол — эта передача не засчитывается.","Положение слишком близко к стене.","Ловля одной рукой (если не оговорено заранее)."],"film":["Снимать сбоку, чтобы и стена, и линия стояния, и ученик были в кадре.","Расстояние для стояния четко отмечено на полу.","Видимый таймер."]},"juggle":{"name":"Чеканка мяча (жонглирование)","unit":"касаний в минуту","proto":"60 секунд. Считаем непрерывные касания без падения мяча на пол.","ok":["Разрешены все части тела, кроме кистей и рук.","Если мяч упал — поднимаем и продолжаем, счет идет с предыдущего числа.","Подсчет останавливается в конце минуты."],"no":["Касание кистью или рукой.","Мяч лежит на теле вместо касания.","Подсчет касания после касания пола."],"film":["Расстояние, позволяющее видеть и мяч в верхней точке, и пол.","Неподвижная камера — без слежения за мячом.","Видимый таймер."]},"toetap":{"name":"Касания мяча носком (Toe Taps)","unit":"касаний за 30 секунд","proto":"30 секунд. Поочередные касания носком стопы лежащего мяча. Легко, быстро и весело снимать.","ok":["Мяч лежит на полу и не сдвигается с места.","Легкое касание носком стопы, смена ног при каждом касании.","Непрерывный темп."],"no":["Наступание на мяч вместо касания.","Одна и та же нога дважды подряд.","Мяч укатывается со своего места."],"film":["Снимать спереди или сбоку, крупным планом, чтобы мяч и ноги заполняли кадр.","Камера на полу или на уровне колена.","Видимый таймер."]},"selfpass":{"name":"Передачи над собой","unit":"передач в минуту","proto":"60 секунд. Волейбольные передачи сверху двумя руками над собой, не давая мячу упасть.","ok":["Правильная передача сверху над лбом, двумя руками.","Мяч поднимается как минимум на метр над головой.","Если мяч упал — поднимаем и продолжаем считать."],"no":["Передача открытой ладонью или кулаком.","Мяч не поднялся достаточно высоко.","Ловля мяча."],"film":["Камера сбоку, достаточно далеко, чтобы поймать мяч в высшей точке.","Съемка на улице или при высоком потолке.","Видимый таймер."]},"cone":{"name":"Ведение мяча между конусами","unit":"секунды","proto":"Полоса из 6 конусов с интервалом 2 м. Туда и обратно. Меньше = лучше.","ok":["Трасса размечена и измерена до съемки.","Ведение мяча вокруг каждого конуса без пропуска.","Секундомер останавливается, когда ученик и мяч пересекают финишную черту."],"no":["Пропуск конуса.","Сбивание конуса — попытка аннулируется.","Потеря контроля над мячом вне трассы."],"film":["Камера сбоку, достаточно высоко, чтобы видеть всю трассу в одном кадре.","Снять расстановку трассы в начале видео.","Видимый таймер или счет вслух."]},"balance":{"name":"Стойка на одной ноге с закрытыми глазами","unit":"секунды (до 60)","proto":"До 60 секунд. Время останавливается в тот момент, когда вторая стопа касается пола. Достигший 60 — достиг максимума.","ok":["Стойка на одной ноге, вторая нога не касается земли и не опирается на опорную ногу.","Глаза закрыты на протяжении всего времени.","Руки свободно опущены по бокам."],"no":["Открывание глаз.","Касание пола второй ногой.","Держание за стену или предмет."],"film":["Снимать спереди, в полный рост — так видны и глаза, и ноги.","Расстояние 2–3 м, камера на уровне груди.","Видимый таймер в кадре — время и есть результат."]}},
};
const spLoc=sp=>{
  const cur=window.I18N?window.I18N.lang():"he";
  const tr=SPORTS_I18N[cur]&&SPORTS_I18N[cur][sp.id];
  return tr?Object.assign({},sp,tr):sp;
};

  /* ענף שהמורה הגדיר בעצמו ולא מילא לו כללים */
  const GENERIC={
    proto:"ענף מותאם אישית — סכמו מראש עם הכיתה: כמה זמן או כמה ניסיונות, ואיך סופרים.",
    ok:["ביצוע אחיד לכל התלמידים — אותו זמן, אותו ציוד, אותם כללים."],
    no:["שינוי כללים בין תלמיד לתלמיד — הופך את ההשוואה לחסרת משמעות."],
    film:["לצלם מהצד, כל הגוף בפריים, בצילום רצוף אחד.",
          "אם התוצאה היא זמן — טיימר גלוי בפריים."],
    yt:""
  };

  const ytUrl=q=>"https://www.youtube.com/results?search_query="+encodeURIComponent(q);
  return {
    sports:()=>JSON.parse(JSON.stringify(SPORTS)).map(spLoc),
    get universal(){ return universalLoc(); },
    generic:GENERIC,
    ytUrl,
    /* ענפים שהוסרו מברירת המחדל — נשמרים רק כדי לא לאבד שיאים קיימים */
    retired:{plank:"פלאנק",wallsit:"כיסא קיר",run1000:"ריצת 1000 מ׳",beep:"ביפ טסט",
             medball:"הטלת כדור מדיסין",flex:"גמישות",sprint100:"ריצת 100 מ׳"}
  };
})();
