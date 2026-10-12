// Local standalone preview only. Does not launch, build or modify PE Ultimate.
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const files=new Set(['index.html','PE_Ultimate_Scoreboard.html','PE_Coach_Board.html']);
const port=Number(process.env.PE_BOARDS_PORT||5179);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid PE_BOARDS_PORT');
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=new URL(req.url,'http://127.0.0.1').pathname;}catch(e){res.writeHead(400);res.end();return;}
 const file=pathname==='/'?'index.html':pathname.slice(1);
 if(!['GET','HEAD'].includes(req.method)||!files.has(file)){res.writeHead(404);res.end('Not found');return;}
 fs.readFile(path.join(__dirname,file),(error,data)=>{
  if(error){res.writeHead(500);res.end('File unavailable');return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:data);
 });
});
server.on('error',e=>{console.error('Preview could not start:',e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Standalone boards: http://127.0.0.1:'+port+'/ — Ctrl+C to stop'));
