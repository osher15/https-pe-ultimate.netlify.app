> **Draft for owner and lawyer review.** Version 0.1 · 2026-10-16 · Task C22 (G4/T3). Not approved for publication.
> This is the only copy file that states what has been checked and on which devices (article 4). Keep it true:
> update article 4 after any device test. Placeholders in `{{CURLY_CAPS}}` are owner decisions or unknown values.

# {{STORE_NAME}} — Support articles

Contact for anything below: {{CONTACT_EMAIL}}. Please include your order number and the product name, and never include
pupils' names.

## Contents
1. I cannot open the file on a computer
2. Opening on an Android phone or tablet
3. Opening on an iPhone or iPad
4. Which devices and browsers have been checked?
5. How do I change the language?
6. A tool is in English after I deleted data
7. My saved data disappeared after I cleared my browser
8. Moving my data to another device or browser
9. How to delete all data
10. My data is different when I open the file from another place
11. Can my colleagues use my licence?
12. I bought the same product twice
13. How do I ask for a refund?
14. My download link did not arrive or has stopped working
15. The beeps or sounds are not playing
16. The screen goes to sleep during a timer or test
17. Printing
18. The Scoreboard stopped saving after I reloaded
19. The Shuttle Run shows no VO₂max estimate
20. Exercise animations look still, or voice announcements are silent
21. I found an accessibility problem
22. I found a mistake in a lesson, drill or translation

---

### 1. I cannot open the file on a computer
**What you should see:** a single `.html` file. If the download is a `.zip`, extract it first, then open the `.html`
file.
**Try this:**
1. Double-click the file, or right-click and choose "Open with" and then your browser (Chrome, Edge, Firefox,
   Safari).
2. If it opens as text or in an editor, drag the file into an open browser window instead.
3. Keep JavaScript enabled and do not open the file from inside an e-mail preview; save it to a folder first.
**Still stuck?** Write to {{CONTACT_EMAIL}} with your browser name and version.

### 2. Opening on an Android phone or tablet
**Try this:** download the file, open your **Files** app, tap the file and choose a browser (for example Chrome).
`{{ANDROID_OPEN_STEPS}}` (exact steps to be confirmed after a device test.)
**If it opens as plain text or as a download only:** open your browser first, then use its menu to open the file
from your Downloads folder, or choose a different browser.

### 3. Opening on an iPhone or iPad
**Honest note:** we have **not** tested the products on an iPhone or iPad (see article 4). iOS can show a downloaded
HTML file as a preview that does not run it.
**Try this:** `{{IOS_OPEN_STEPS}}` (to be written after a test on a real device). Until then, if the file shows as a
preview with buttons that do nothing, open it from a computer, or write to us and tell us your iOS version so we can
help and learn from it.

### 4. Which devices and browsers have been checked?
**What has been checked:** each of the four tools was checked in desktop Chromium (a headless test browser) and in
the same browser set to phone and tablet screen sizes (360×740, 390×844 and 768×1024 pixels, with touch
emulation). The checks included the page layout in all five languages, saving and loading, file export, the delete
and restore flow, and that the tool opens and runs from a file with the network switched off and makes no network
requests. A set of automated logic tests also passes for each tool.
**What has not been checked:** a physical phone or tablet, iPhone / iPad Safari, Android WebView, Firefox, real
speaker output and beep timing, a locked or backgrounded screen, real phone download and share menus, and a
projector. We do not claim that the products work on any particular device until that is done.
**Supported browsers:** `{{SUPPORTED_BROWSERS}}`. `{{DEVICE_TEST_STATUS}}`

### 5. How do I change the language?
Every tool has a language selector (Hebrew, English, Arabic, Russian, Spanish). Choose a language and the screen
changes immediately. Hebrew and Arabic switch to right-to-left. Your choice is remembered in that browser on that
device. Lesson packs and the activity pack have one document per language; open the file for the language you want.

### 6. A tool is in English after I deleted data
English is the default language. Deleting all data also removes the saved language choice, so the tool starts in
English again. Choose your language again with the language selector.

### 7. My saved data disappeared after I cleared my browser
**Why:** the tools keep your settings and entries only in that browser's local storage on that device. Clearing
the browser's site data, using a private window, or switching to another browser or profile removes access to it.
Nothing is sent to us, so we cannot recover it.
**If you made a backup:** open the tool, choose **"Delete all data on this device"** to reach the data panel, then
**"Restore from backup file"**, and pick the backup file (`<tool>-backup-YYYY-MM-DD.json`). The tool checks the file
before it writes anything, and shows what it will restore.
**To avoid this next time:** use the backup download before you clear your browser, and export your boards, results or
match records from time to time.

### 8. Moving my data to another device or browser
1. On the old device, open the tool and choose **"Delete all data on this device"**, then **"Download backup
   (JSON)"**. Then cancel; you do not have to delete anything.
2. Copy the backup file to the new device.
3. Open the same tool there, choose **"Restore from backup file"**, and pick the file.
A backup from one tool cannot be restored into another tool; the tool rejects it and changes nothing.

### 9. How to delete all data
1. Open the tool and choose **"Delete all data on this device"**.
2. The tool offers **"Download backup (JSON)"** first. We recommend taking it. "Delete without backup" is available as
   a small link.
3. Type the confirmation word shown on screen (it is in the language of the tool). Then confirm.
Only that tool's own data is removed, and the page reloads with default settings. Lesson packs and the activity pack
store nothing on your device. If you cannot open the tool at all, clearing this site's data in your browser settings
removes the data of every tool in that browser.

### 10. My data is different when I open the file from another place
Browsers keep local data separately for each place a page is opened from. The same tool opened from a different folder,
from a web address, or in a different browser can show different (or empty) data. Open the tool from one place, and use
the backup file to move data between places.

### 11. Can my colleagues use my licence?
- A **Single-Teacher** licence is for one named teacher. Colleagues need their own licence (extra licences for
  colleagues are {{EXTRA_LICENCE_DISCOUNT}} off). A substitute covering your classes may use the materials for those
  classes only.
- A **School** licence covers all PE staff employed at one campus, including substitutes, on an internal drive that only
  they can access. A further campus needs its own licence.
Neither licence allows sharing outside the licence, reselling, or uploading to a public site or an open drive. If you
shared a file by mistake, write to us and we will help you put it right. Terms: {{TERMS_URL}}.

### 12. I bought the same product twice
A duplicate purchase (the same product with the same licence, twice) is refunded in full. Write to {{CONTACT_EMAIL}} with
both order numbers. After a refund the licence for that order ends, so keep the copy you want and delete the other.

### 13. How do I ask for a refund?
Write to {{CONTACT_EMAIL}} with your order number **within 30 days of purchase** (or within any longer period the law
gives you). There is no administration fee. In short: once you have downloaded or opened a product, the purchase is
final, except for a duplicate purchase, a product you have not downloaded or opened (asked within 14 days), a billing
error, a faulty product or one that does not match its description, and your rights under the law. Read the full
policy: {{REFUND_POLICY_URL}}. Do not delete your files before you write to us if you think the product is faulty;
send us a screenshot or a description of what happens.

### 14. My download link did not arrive or has stopped working
Check your spam folder for the e-mail from {{MOR_NAME}}. `{{MOR_DOWNLOAD_RETRY_STEPS}}` (how to open the order again
from the receipt). If it still does not work, write to {{CONTACT_EMAIL}} with your order number. If the file never
worked, we will fix it or send a replacement first, and refund you if we cannot ({{FIX_DAYS}} days).

### 15. The beeps or sounds are not playing
1. **Tap Start (or Test sound).** Browsers allow sound only after a tap on the page. The tools start their sound
   engine on your first tap, so a timer that was started some other way may be silent.
2. **Check the volume and mute.** Raise the device volume and the volume of the tab. On an iPhone or iPad, the side
   ring / silent switch can silence web sound; try turning it off. `{{IOS_AUDIO_NOTE_AFTER_TEST}}`
3. **Use the Sound button.** Make sure the sound toggle in the tool is on.
4. **Voice announcements** use the voices installed on your device. If your device has no voice for the language, the
   tool stays silent instead of using a different language. Beeps still play.
5. **Bluetooth speakers** can add a delay or clip the first beep. Use a wired speaker for the Shuttle Run if you can.
6. **If the tool says the test was paused because audio stopped,** your device interrupted the sound (for example a
   call or another app). Resume with the Start button.
**Not verified:** we have not measured beep timing on real speakers or phones (article 4). Before you run a test with
a class, run a short trial and compare it with a stopwatch.

### 16. The screen goes to sleep during a timer or test
The Shuttle Run and the Interval Trainer ask the browser to keep the screen awake while they run, where the browser
supports it. Not every browser or device does. The Scoreboard and the Coach Board do not ask for it. To be safe:
1. Set your device's screen timeout to a longer time before the lesson.
2. Plug the device in.
3. Keep the tab in front; do not switch apps during a test.
If the screen locked during a test, the beeps may stop; press Resume if the tool paused, and check the time.

### 17. Printing
- **Coach Board:** prints the court with its title (the background is dark, so it uses a lot of ink; export a PNG and
  print that if you prefer).
- **Scoreboard, Shuttle Run, Interval Trainer:** these have no print layout. The Shuttle Run exports a CSV file, and the
  Scoreboard exports a JSON file. You can also take a screenshot.
- **Lesson packs and the activity pack:** documents meant for printing (`{{LESSON_PACK_FORMAT}}`). If the diagrams look
  grey or pale on your printer, choose "black and white" or "high quality" in the print dialog.

### 18. The Scoreboard stopped saving after I reloaded
**What happens:** in the current build, if you reload the page, automatic saving can stop for the rest of that session,
and the status line may say that another tab changed the board. Your score on screen is still correct.
**What to do:** after a reload, do not rely on autosave. Export the result with the export button before you close the
tab. `{{SCOREBOARD_AUTOSAVE_FIX_STATUS}}`
Closing and reopening the file (instead of reloading) is not affected.

### 19. The Shuttle Run shows no VO₂max estimate
The estimate is shown only for the standard **20 m** course, because the equation (Léger et al., 1988) is for 20 m.
The adapted **15 m** course is for younger pupils or pupils with disabilities and shows no estimate; its results are
not comparable with the 20 m course. If you changed the starting speed, a "Modified protocol" badge appears. The value
is always an estimate, not a medical test.

### 20. Exercise animations look still, or voice announcements are silent
- **Still pictures instead of animation:** your device is set to "reduce motion" (an accessibility setting). The
  Interval Trainer follows it and shows a still image of the key pose. Turn the setting off in your device's
  accessibility settings if you want the animations. In the exercise list, small still pictures are used on purpose to
  save battery.
- **No voice:** the voice toggle is off, or your browser has no speech support or no voice for the language. Beeps
  still work.

### 21. I found an accessibility problem
Please tell us: {{ACCESSIBILITY_EMAIL}}. Include the product, your browser and device, and what you were trying to do.
We can send content in another format (for example plain text): {{ALTERNATIVE_FORMATS}}. Known today: in the Coach Board
some control labels read by a screen reader stay in English when another language is chosen, and on small phone screens
some buttons are small. We aim to answer within {{RESPONSE_DAYS}} days. Statement: {{ACCESSIBILITY_URL}}.

### 22. I found a mistake in a lesson, drill or translation
Thank you. Write to {{CONTACT_EMAIL}} with:
- the product and the language;
- the lesson or item code (for example BB-01, DR-012) and the step;
- the sentence as written and what it should say.
> Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and
> checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors
> are possible.
We correct confirmed mistakes, and corrections to the version you bought are free. Please never send pupils' names or
other personal data.
