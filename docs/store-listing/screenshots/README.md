# Store screenshots (draft set)

Generated 2026-10-12 by `node tools/store-screenshots.js docs/store-listing/screenshots home ft beep cls live` from the real single-file app (`Hamegrash.html`) in **demo mode, English**, with invented pupils (ids `demoN`). A fixed clock (07:30) is used so the timetable shows upcoming lessons. No real data is read or written.

| File | Screen | Size |
|---|---|---|
| `phone-*.png` | Android phone, portrait | 1080x1920 (360x640 CSS px at 3x) |
| `tablet10-*.png` | 10-inch tablet, portrait | 1600x2560 (800x1280 at 2x) |

Screens: `home` Today/timetable, `ft` fitness tests during an active lesson, `beep` beep test running, `cls` class hub, `live` live lesson.

**Evidence level: desktop Chromium emulation, not a physical device.** Play accepts any matching screenshot, but the owner should replace or confirm them from a real phone after the device pass (`docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md`). The Hebrew, Arabic, Russian and Spanish sets are not generated yet (the script is English only; pass another language by editing `I18N.set`). Photo-finish was left out: the emulated camera is a black frame.
