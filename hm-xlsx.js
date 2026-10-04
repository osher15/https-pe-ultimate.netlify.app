"use strict";
// Minimal offline SpreadsheetML package. Text is always literal, never a formula.
// Format reference: learn.microsoft.com/office/open-xml/spreadsheet/structure-of-a-spreadsheetml-document
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory();
  else window.HMXlsx=factory();
})(function(){
  const enc=new TextEncoder(),NS="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const xml=s=>String(s??"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
  function col(n){let s="";for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;}
  const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xEDB88320^(n>>>1):n>>>1;return n>>>0;});
  function crc(bytes){let n=0xFFFFFFFF;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return (n^0xFFFFFFFF)>>>0;}
  function header(size){const bytes=new Uint8Array(size),v=new DataView(bytes.buffer);return {bytes,u16:(at,n)=>v.setUint16(at,n,true),u32:(at,n)=>v.setUint32(at,n,true)};}
  function concat(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;}
  // ZIP stored entries: no compression dependency or online download is required.
  function zip(files){
    const local=[],central=[];let offset=0;
    for(const [path,content] of Object.entries(files)){
      const name=enc.encode(path),data=enc.encode(content),sum=crc(data);
      const h=header(30);h.u32(0,0x04034B50);h.u16(4,20);h.u16(6,0x800);h.u16(12,33);h.u32(14,sum);h.u32(18,data.length);h.u32(22,data.length);h.u16(26,name.length);
      local.push(h.bytes,name,data);
      const c=header(46);c.u32(0,0x02014B50);c.u16(4,20);c.u16(6,20);c.u16(8,0x800);c.u16(14,33);c.u32(16,sum);c.u32(20,data.length);c.u32(24,data.length);c.u16(28,name.length);c.u32(42,offset);central.push(c.bytes,name);
      offset+=30+name.length+data.length;
    }
    const end=header(22),count=Object.keys(files).length;end.u32(0,0x06054B50);end.u16(8,count);end.u16(10,count);end.u32(12,central.reduce((n,p)=>n+p.length,0));end.u32(16,offset);
    return concat([...local,...central,end.bytes]);
  }
  function worksheet(rows,rtl){
    if(!Array.isArray(rows)||rows.length>1048576||rows.some(r=>!Array.isArray(r)||r.length>16384))throw new Error("worksheet-size");
    const width=rows.reduce((n,r)=>Math.max(n,r.length),1),last=col(width-1)+Math.max(1,rows.length);
    const data=rows.map((r,i)=>`<row r="${i+1}">${r.map((v,j)=>{
      const ref=col(j)+(i+1),style=i===0?' s="1"':"";
      if(v===null||v===undefined||v==="")return `<c r="${ref}"${style}/>`;
      if(typeof v==="number"){if(!Number.isFinite(v))throw new Error("non-finite-number");return `<c r="${ref}"${style}><v>${v}</v></c>`;}
      const text=String(v);if(text.length>32767)throw new Error("cell-too-long");
      return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xml(text)}</t></is></c>`;
    }).join("")}</row>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="${NS}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0" rightToLeft="${rtl?1:0}"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="${width}" width="22" customWidth="1"/></cols><sheetData>${data}</sheetData>${rows.length?`<autoFilter ref="A1:${last}"/>`:""}</worksheet>`;
  }
  function workbook(sheets,{rtl=false}={}){
    if(!Array.isArray(sheets)||!sheets.length||sheets.length>20)throw new Error("sheets");
    const names=new Set();for(const s of sheets){if(!s.name||s.name.length>31||/[\\/?*\[\]:]/.test(s.name)||/^'|'$/.test(s.name)||names.has(s.name.toLowerCase()))throw new Error("sheet-name");names.add(s.name.toLowerCase());}
    const REL="http://schemas.openxmlformats.org/officeDocument/2006/relationships",PKG="http://schemas.openxmlformats.org/package/2006/relationships";
    const files={
      "[Content_Types].xml":`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
      "_rels/.rels":`<Relationships xmlns="${PKG}"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      "xl/workbook.xml":`<workbook xmlns="${NS}" xmlns:r="${REL}"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets></workbook>`,
      "xl/_rels/workbook.xml.rels":`<Relationships xmlns="${PKG}">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${REL}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}<Relationship Id="styles" Type="${REL}/styles" Target="styles.xml"/></Relationships>`,
      "xl/styles.xml":`<styleSheet xmlns="${NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
    };
    sheets.forEach((s,i)=>files[`xl/worksheets/sheet${i+1}.xml`]=worksheet(s.rows,rtl));return zip(files);
  }
  function csv(rows){
    const safe=v=>{let s=String(v??"");if(typeof v!=="number"&&/^[\s]*[=+\-@]|^[\t\r]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
    return "\uFEFF"+rows.map(r=>r.map(safe).join(",")).join("\r\n");
  }
  return {workbook,csv};
});
