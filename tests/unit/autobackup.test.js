"use strict";
/* Android Auto Backup is a teacher choice, default OFF. Static checks that the manifest, the BackupAgent and the plugin stay wired together
   (the Java itself is built by the Android CI; this guards the contract between the pieces). */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const R=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");
const J="native/android/app/src/main/java/io/github/osher15/peultimate/";

test("manifest registers the BackupAgent as full-backup-only",()=>{
  const m=R("native/android/app/src/main/AndroidManifest.xml");
  assert.match(m,/android:backupAgent="\.PEBackupAgent"/);
  assert.match(m,/android:fullBackupOnly="true"/);
});
test("BackupAgent copies nothing unless the flag is on, and the flag defaults to false",()=>{
  const a=R(J+"PEBackupAgent.java");
  assert.match(a,/getBoolean\(KEY_AUTO,\s*false\)/);
  assert.match(a,/if\s*\(!isEnabled\(this\)\)\s*\{\s*return;\s*\}\s*super\.onFullBackup\(data\)/);
});
test("plugin name and methods match what hm-native.js calls, and it is registered before super.onCreate",()=>{
  const p=R(J+"PEBackupPlugin.java"), n=R("hm-native.js"), a=R(J+"MainActivity.java");
  assert.match(p,/@CapacitorPlugin\(name = "PEBackup"\)/);
  for(const meth of ["getAutoBackup","setAutoBackup"]){
    assert.match(p,new RegExp("public void "+meth+"\\("));
    assert.ok(n.includes('"PEBackup","'+meth+'"'),meth+" called from JS");
  }
  assert.ok(a.indexOf("registerPlugin(PEBackupPlugin.class)")>-1&&a.indexOf("registerPlugin")<a.indexOf("super.onCreate"));
  assert.match(p,/PEBackupAgent\.PREFS/);
});
