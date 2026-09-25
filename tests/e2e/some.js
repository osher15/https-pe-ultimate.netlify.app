"use strict";
/* הרצה של חבילות נבחרות: node tests/e2e/some.js field20 i18n15
   (הריצה המלאה — node tests/e2e/run.js — לוקחת כ-20 דקות) */
const {run}=require("./harness.js");
const names=process.argv.slice(2);
run(names.map(n=>require("./"+n+".e2e.js"))).then(f=>process.exit(f?1:0));
