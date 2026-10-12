#!/usr/bin/env bash
# C5: fail-closed checks before an Android store upload. Run from repository root.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo "node missing" >&2; exit 1; }
command -v npm >/dev/null || { echo "npm missing" >&2; exit 1; }
if command -v sha256sum >/dev/null; then HASH=(sha256sum)
elif command -v shasum >/dev/null; then HASH=(shasum -a 256)
else echo "SHA-256 tool missing" >&2; exit 1; fi
echo "[1/5] npm test"
npm test
echo "[2/5] standalone build"
node build-standalone.js
hashes_before="$("${HASH[@]}" index.html Hamegrash.html sw.js)"
echo "[3/5] repeated standalone build"
node build-standalone.js
hashes_after="$("${HASH[@]}" index.html Hamegrash.html sw.js)"
if [[ "$hashes_before" != "$hashes_after" ]]; then
  echo "ERROR: standalone build is nondeterministic" >&2
  diff <(printf '%s\n' "$hashes_before") <(printf '%s\n' "$hashes_after") || true
  exit 1
fi
echo "[4/5] native web copy"
node native/build-web.js
echo "[5/5] old package ID in native configuration"
if grep -RIn --include='*.gradle' --include='*.gradle.kts' --include='*.json' --include='*.xml' --include='*.plist' --include='*.pbxproj' 'app\.netlify\.peultimate' native/android/app native/ios native/capacitor.config.*; then
  echo "ERROR: old package ID remains in native config" >&2
  exit 1
fi
echo "PASS: prelaunch static/build/test checks. Physical device and signed AAB checks remain separate."
