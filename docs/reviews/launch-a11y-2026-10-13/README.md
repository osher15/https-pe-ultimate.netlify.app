# Launch accessibility / small-screen spot check — 2026-10-13

Status: **BLOCKED in this execution environment; no screenshots claimed.**

Required C4 procedure from Issue #55: Playwright at 360x640 and 390x844, root font-size 200%, eight main screens, screenshots and issue-ready clipping/unreachable-control findings.

## What was attempted

The real packaged web app was extracted from the unsigned AAB from GitHub Actions run `38270990317`. The environment has `/usr/bin/chromium`, but neither Node Playwright nor Selenium is installed. A local Python HTTP server and Chromium DevTools Protocol were then attempted as a dependency-free fallback.

Commands / checks:

```text
node -e "try{console.log(require.resolve('playwright'))}catch(e){console.log('NO_PLAYWRIGHT')}"
# => NO_PLAYWRIGHT

which chromium
# => /usr/bin/chromium

python3 -m http.server 8765 --directory <extracted base/assets/public>
chromium --headless=new --no-sandbox --disable-gpu --remote-debugging-port=9223 --window-size=390,844 http://127.0.0.1:8765/index.html
```

Chromium loaded an organization-policy block page instead of localhost: `127.0.0.1 is blocked / Your organization doesn't allow you to view this site`. A `file://` fallback was also blocked (`“file” links are blocked`). Therefore the app DOM was never executed in this environment and any screenshots would have been screenshots of the policy block page, not PE Ultimate.

## Why this is not marked passed

A static CSS reading cannot replace the requested font-scale/touch-reachability check, and fabricated screenshots would be misleading. No clipping/unreachable-control findings are asserted from an app that could not be rendered.

## Exact next execution

Run from a normal checkout where Playwright can launch localhost:

1. Build/current-main app normally.
2. Use the existing Playwright harness and set viewport 360x640, then 390x844.
3. Inject `document.documentElement.style.fontSize = '32px'` (assuming 16px root = 200%) before each screen measurement; do not use CSS `zoom`.
4. Check eight field-critical screens: Today/Home, Live Lesson, Classes, Fitness Tests, Beep Test, Photo Finish, Records, Lesson Prep. If the launch owner prefers another screen set, record the substitution explicitly.
5. For each screen, verify: no horizontal page overflow; primary buttons can be reached by normal scroll; fixed bottom navigation does not cover the final control; modal close/confirm buttons remain reachable; text is not clipped by fixed-height containers.
6. Save 16 screenshots (8 screens x 2 viewports) under this directory and record issue-ready findings with screen + element + observed problem.

No product fix should be made in the same C4 review unless separately reserved.
