import {validSubmission} from './scoreboard.ts';
import {REPLAY_LIMITS} from './replayContract.ts';
import {verifyScore,ReplayBudgetExceeded,type VerifiedScore} from './verifyScore.ts';

export type ScoreReceipt={run_id:string;display_name:string;finish_ms:number;submitted_at:string};
export type ScoreBackend={
 authenticate:(token:string)=>Promise<string|null>;
 prepare:(owner:string,runId:string)=>Promise<ScoreReceipt|null>;
 store:(owner:string,score:VerifiedScore)=>Promise<ScoreReceipt>;
};
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});

// The same HTTP handler runs in Supabase and in isolated integration tests.
export function createSubmitScoreHandler(backend:ScoreBackend){return async(req:Request):Promise<Response>=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return respond({error:'Method not allowed'},405);
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
 if(!token)return respond({error:'Sign in to save a score'},401);
 if(Number(req.headers.get('content-length'))>REPLAY_LIMITS.maxBytes)return respond({error:'Result too large'},413);
 try {
  const reader=req.body?.getReader();if(!reader)return respond({error:'Missing result'},400);
  const chunks:Uint8Array[]=[];let length=0;
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>REPLAY_LIMITS.maxBytes){await reader.cancel();return respond({error:'Result too large'},413);}chunks.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let score:unknown;try{score=JSON.parse(new TextDecoder().decode(bytes));}catch{return respond({error:'Invalid result'},400);}
  if(!validSubmission(score))return respond({error:'This run cannot be verified. Start a new run on the latest game. Verified scores allow up to 30 active minutes and 2,000 actions.'},400);
  const owner=await backend.authenticate(token);
  if(!owner)return respond({error:'Your sign-in has expired. Please retry.'},401);
  // Ownership, existing receipts and attempt caps are checked before expensive replay.
  const existing=await backend.prepare(owner,score.runId);
  if(existing)return respond({saved:existing});
  const verified=verifyScore(score);
  if(!verified)return respond({error:'The submitted result does not match its gameplay. Start a new run to save a verified score.'},400);
  return respond({saved:await backend.store(owner,verified)});
 }catch(error){
  if(error instanceof ReplayBudgetExceeded)return respond({error:'This run exceeded the server verification time limit. Please retry; unusually complex runs may not qualify for the scoreboard.'},422);
  const code=(error as {code?:string})?.code;
  if(code==='P0001')return respond({error:'Too many score attempts right now. Please retry later.'},429);
  if(code==='42501')return respond({error:'This result belongs to a different browser sign-in.'},409);
  if(['22023','23514','22P02','22003'].includes(code??''))return respond({error:'This result cannot be saved. Its rules may no longer be accepted.'},400);
  console.error('Score verification unavailable',code??'unknown');
  return respond({error:'Scoreboard temporarily unavailable. Please retry.'},503);
 }
};}
