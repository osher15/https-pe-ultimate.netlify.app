'use strict';
// Optional local browser executable adapter. Tests and product assertions stay unchanged.
// With no PE_CHROMIUM_BIN, Playwright uses its usual installed/pinned executable.
if(process.env.PE_CHROMIUM_BIN){
 const {chromium}=require('playwright'),launch=chromium.launch.bind(chromium);
 const extra=process.env.PE_CHROMIUM_ARGS?JSON.parse(process.env.PE_CHROMIUM_ARGS):[];
 if(!Array.isArray(extra)||extra.some(x=>typeof x!=='string'))throw Error('PE_CHROMIUM_ARGS must be a JSON array of strings');
 chromium.launch=options=>launch({...options,executablePath:process.env.PE_CHROMIUM_BIN,args:[...(options?.args||[]),...extra]});
}
