"use strict";
// Synchronous storage replacement with a verified, in-memory recovery snapshot.
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory();
  else window.HMBackupRestore=factory();
})(function(){
  const owns=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  function replace(be,prefix,skip,data){
    const included=k=>k.startsWith(prefix)&&!owns(skip,k.slice(prefix.length));
    function capture(){
      const out=Object.create(null),length=be.length;
      for(let i=0;i<length;i++){
        const key=be.key(i);
        if(typeof key!=="string")throw new Error("Storage enumeration failed");
        if(!included(key))continue;
        const value=be.getItem(key);
        if(typeof value!=="string"||owns(out,key.slice(prefix.length)))throw new Error("Storage snapshot changed");
        out[key.slice(prefix.length)]=value;
      }
      if(be.length!==length)throw new Error("Storage snapshot changed");
      return out;
    }
    function equal(a,b){return Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>owns(b,k)&&a[k]===b[k]);}
    const incoming=Object.create(null);
    if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("Invalid backup data");
    for(const key of Object.keys(data)){
      if(typeof data[key]!=="string")throw new Error("Invalid backup value");
      if(!owns(skip,key))incoming[key]=data[key];
    }
    // Any unreadable current value aborts before the first mutation.
    const previous=capture();
    if(!equal(previous,capture()))throw new Error("Storage snapshot changed");
    const touched=new Set();
    try{
      // Write changed values first: a first-write quota error preserves old data.
      for(const key of Object.keys(incoming))if(previous[key]!==incoming[key]){
        touched.add(key);be.setItem(prefix+key,incoming[key]);
        if(be.getItem(prefix+key)!==incoming[key])throw new Error("Storage write verification failed");
      }
      for(const key of Object.keys(previous))if(!owns(incoming,key)){
        touched.add(key);be.removeItem(prefix+key);
        if(be.getItem(prefix+key)!==null)throw new Error("Storage deletion verification failed");
      }
      if(!equal(incoming,capture()))throw new Error("Storage restore verification failed");
      return {keys:Object.keys(incoming).length,failed:0};
    }catch(error){
      // Attempt every affected key, even if the backend rejects another one.
      for(const key of touched){
        try{
          if(owns(previous,key)){
            if(be.getItem(prefix+key)!==previous[key])be.setItem(prefix+key,previous[key]);
          }else be.removeItem(prefix+key);
        }catch(e){}
      }
      let rolledBack=false;
      try{rolledBack=equal(previous,capture());}catch(e){}
      return {keys:0,failed:1,rolledBack,recovery:previous,error};
    }
  }
  return {replace};
});
