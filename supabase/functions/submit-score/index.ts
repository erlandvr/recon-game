import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {validSubmission} from '../_shared/scoreboard.ts';

const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
function key(modern:string,legacy:string){const raw=Deno.env.get(modern);return raw?JSON.parse(raw).default:Deno.env.get(legacy);}

Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return respond({error:'Method not allowed'},405);
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
 if(!token)return respond({error:'Sign in to save a score'},401);
 if(Number(req.headers.get('content-length'))>4096)return respond({error:'Result too large'},413);
 try{
  // Bound even chunked requests, rather than trusting Content-Length.
  const reader=req.body?.getReader();if(!reader)return respond({error:'Missing result'},400);
  const chunks:Uint8Array[]=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>4096){await reader.cancel();return respond({error:'Result too large'},413);}chunks.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let score:unknown;try{score=JSON.parse(new TextDecoder().decode(bytes));}catch{return respond({error:'Invalid result'},400);}
  if(!validSubmission(score))return respond({error:'Invalid result or unsupported game version. Start a new run on the latest game.'},400);
  const url=Deno.env.get('SUPABASE_URL')!;
  const auth=createClient(url,key('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await auth.auth.getUser(token);
  if(authError||!user)return respond({error:'Your sign-in has expired. Please retry.'},401);
  const admin=createClient(url,key('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:id,error}=await admin.rpc('submit_scoreboard_score',{p_owner:user.id,p_score:score});
  if(error){
   if(error.code==='P0001')return respond({error:'Too many scores right now. Please retry later.'},429);
   if(error.code==='42501')return respond({error:'This result belongs to a different browser sign-in.'},409);
   if(['22023','23514','22P02','22003'].includes(error.code))return respond({error:'This result cannot be saved. Its rules may no longer be accepted.'},400);
   console.error('Score write failed',error.code);return respond({error:'Scoreboard temporarily unavailable. Please retry.'},503);
  }
  const {data:row,error:readError}=await admin.from('scoreboard_scores').select('run_id,display_name,finish_ms,submitted_at').eq('run_id',id).single();
  if(readError||!row)return respond({error:'Could not confirm the saved score. Please retry safely.'},503);
  return respond({saved:row});
 }catch{return respond({error:'Scoreboard temporarily unavailable. Please retry.'},503);}
});
