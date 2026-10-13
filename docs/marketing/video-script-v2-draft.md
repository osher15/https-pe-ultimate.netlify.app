# Demo video script v2 (draft, 2026-10-13)

Status: DRAFT for the owner. Builds on `video-script.md` (v1, 40-45 s). Nothing here has been recorded. Every new tap sequence below must be checked on the real app before recording.

## Decision: upgrade, do not restart
Keep the real screen recordings and the v1 structure. Upgrade them in post-production:
- The app screens must stay real recordings. Never generate or fake app UI with AI (store listings must show the real product).
- Use the Google credits only for the parts that are not the app: a short humor hook (0-4 s) and an end card. Use no generated children's faces or real pupil names.
- Redo only the clips that are weak (shaky, slow, wrong clock, old UI). Check each v1 clip against the current build before reusing it.

## Structure (target 45-50 s, no voice-over, captions in EN and HE)
| Time | Content | Source | Caption EN | Caption HE |
|---|---|---|---|---|
| 0:00-0:04 | Humor hook: a whistle, a clipboard, a paper register falling on the floor, then a phone saves the day. | AI-generated or stock, no faces of minors | Still using paper? | עדיין על דף נייר? |
| 0:04-0:09 | Today screen, tap **Start lesson** | real recording (v1) | Run your day offline | ניהול היום, גם בלי אינטרנט |
| 0:09-0:14 | **Everyone's here** | real recording (v1) | Attendance in one tap | נוכחות בלחיצה אחת |
| 0:14-0:20 | Fitness tests list, scroll | real recording (v1) | 35 fitness tests | 35 מבחני כושר |
| 0:20-0:30 | Beep test Start, 6-8 s, then Pause | real recording (v1) | Built-in beep test | ביפ טסט מובנה |
| 0:30-0:38 | Photo finish: load the whole class, run it heat by heat (OWNER DECISION, see below) | real recording, new | Whole class, heat by heat | כיתה שלמה, מקצה אחרי מקצה |
| 0:38-0:44 | Classes hub, then Settings > Backup: "Delete all data from this device" (show the dialog, do not confirm) | real recording, new | Your data stays yours | הנתונים נשארים שלך |
| 0:44-0:50 | End card: app name. Play badge only after the app is live. | graphic | Free. No account needed. | חינם. בלי הרשמה. |

## Humor, kept small
Dry and short, never at the expense of pupils or teachers. Options for the hook (pick one):
1. A stopwatch around a teacher's neck is replaced by a phone. Caption: "Retire the stopwatch."
2. A paper register slides off a desk. Caption: "Where did I put the register?"
3. A whistle blows and a small "Everyone's here" tap sound. Caption: "One tap. Everyone's here."
Hebrew captions get their own wording, not a literal translation. Have a native reader check them.

## Owner decisions needed before recording
1. Photo finish: v1 says do not show it ("no accuracy study"). The 0:30-0:38 slot shows only class loading and heats, with no accuracy claim. Keep it, or drop it and extend the Beep test or Classes segment?
2. Delete-all dialog: show it in the video (privacy selling point) or leave it out?
3. Which humor hook (1-3), or none?
4. Which clips from v1 exist and are good enough to reuse? (The repo has no video files; they live on the owner's computer.)

## Rules that still apply
- Record in demo mode, English interface, invented pupils only.
- Same clock trick as the screenshots (`tools/store-screenshots.js`, 07:30) or record in the morning.
- Mute or lower the beep if there is music.
- No accuracy or "norms" claims; "35 fitness tests" is the verified wording.
- The Google Play badge only after the store page exists, following Google's badge guidelines.
- Do not put any API key in the repo or in this document. Keep it in an environment variable on the owner's machine.
