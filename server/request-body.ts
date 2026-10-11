export async function boundedBody(request:Request,limit:number){
 if(Number(request.headers.get('content-length'))>limit)throw new Error('上传内容过大。');
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();
 const chunks:Uint8Array[]=[];let total=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw new Error('上传内容过大。');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return bytes;
}
export async function readJson(request:Request,limit=2*1024*1024){let data;try{data=JSON.parse(new TextDecoder().decode(await boundedBody(request,limit)));}catch(e){if(e instanceof SyntaxError)throw new Error('请求格式无效。');throw e;}if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('请求格式无效。');return data;}
export async function readForm(request:Request,limit=11*1024*1024){const bytes=await boundedBody(request,limit);try{return await new Response(bytes.buffer as ArrayBuffer,{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData();}catch{throw new Error('上传格式无效。');}}
