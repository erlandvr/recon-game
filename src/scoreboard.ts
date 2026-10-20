import type {SupabaseClient} from '@supabase/supabase-js';
import {useSyncExternalStore} from 'react';
import {SCORE_RULES,validSubmission,validStoredSubmission,type StoredScoreSubmission,type ScorePage} from '../supabase/functions/_shared/scoreboard.ts';
export {resultSubmission} from './scoreResult.ts';
export {SCORE_RULES,scoreTime,validName} from '../supabase/functions/_shared/scoreboard.ts';
export type {ScoreSubmission,ScoreRow,ScorePage} from '../supabase/functions/_shared/scoreboard.ts';

const url=import.meta.env.VITE_SUPABASE_URL??'',key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY??'';
export const scoreboardConfigured=!!url&&!!key;
const STORAGE='recon-scoreboard-pending-v1';
type Pending={score:StoredScoreSubmission;ownerId:string|null};
type Receipt={run_id:string;display_name:string;finish_ms:number;submitted_at:string};
type State={pending:Pending[];saved:Record<string,Receipt>;busy:Record<string,boolean>;errors:Record<string,string>;durable:boolean};
let state:State={pending:[],saved:{},busy:{},errors:{},durable:true};
try{const raw=JSON.parse(localStorage.getItem(STORAGE)??'[]');if(Array.isArray(raw))state.pending=raw.filter(p=>validStoredSubmission(p?.score)&&(p.ownerId===null||typeof p.ownerId==='string'));}catch{state.durable=false;}
const listeners=new Set<()=>void>();
function emit(){state={...state};for(const listener of listeners)listener();}
function persist(){try{if(state.pending.length)localStorage.setItem(STORAGE,JSON.stringify(state.pending));else localStorage.removeItem(STORAGE);state.durable=true;}catch{state.durable=false;}emit();}
export function useScores(){return useSyncExternalStore(callback=>{listeners.add(callback);return()=>{listeners.delete(callback);};},()=>state);}
export function discardScore(runId:string){if(state.busy[runId])return;state.pending=state.pending.filter(p=>p.score.runId!==runId);delete state.errors[runId];persist();}

let client:Promise<SupabaseClient>|undefined;
async function authClient(){
 if(!scoreboardConfigured)throw new Error('Scoreboard is not connected yet. Your result can be kept here for retry.');
 // Auth initializes only after the player explicitly chooses Save/Retry.
 return client??=import('@supabase/supabase-js').then(({createClient})=>createClient(url,key,{auth:{storageKey:'recon-scoreboard-auth-v1',persistSession:true,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:boundedFetch}})).catch(error=>{client=undefined;throw error;});
}
async function boundedFetch(input:RequestInfo|URL,init?:RequestInit){const timeout=AbortSignal.timeout(12000);return fetch(input,{...init,signal:init?.signal?AbortSignal.any([init.signal,timeout]):timeout});}
export async function saveScore(score:StoredScoreSubmission){
 const id=score.runId;if(state.busy[id]||state.saved[id])return;
 if(!validSubmission(score)){state.errors={...state.errors,[id]:'This result uses unsupported game rules and cannot be saved. You can discard it.'};emit();return;}
 // Persist intent before any network operation; never automatically retry.
 let pending=state.pending.find(p=>p.score.runId===id);
 if(!pending){pending={score,ownerId:null};state.pending=[...state.pending,pending];}
 state.busy={...state.busy,[id]:true};delete state.errors[id];persist();
 try{
  const auth=await authClient();
  const {data:{session},error:sessionError}=await auth.auth.getSession();if(sessionError)throw sessionError;
  let active=session;
  if(active&&active.expires_at&&active.expires_at*1000<Date.now()+30000){const renewed=await auth.auth.refreshSession();if(renewed.error)throw new Error('Your browser sign-in could not be refreshed. Please retry.');active=renewed.data.session;}
  if(!active){
   if(pending.ownerId)throw new Error('The original browser sign-in is no longer available. This pending result can only be discarded.');
   const signed=await auth.auth.signInAnonymously();if(signed.error)throw new Error('Could not connect to save your score. Please retry.');active=signed.data.session;
  }
  if(!active)throw new Error('Could not connect to save your score. Please retry.');
  if(pending.ownerId&&pending.ownerId!==active.user.id)throw new Error('This pending result belongs to another browser sign-in.');
  pending.ownerId=active.user.id;persist();
  const response=await boundedFetch(`${url}/functions/v1/submit-score`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${active.access_token}`},body:JSON.stringify(pending.score)});
  const body=await response.json();if(!response.ok)throw new Error(typeof body.error==='string'?body.error:'Saving failed. Please retry.');
  const saved=body.saved as Receipt;
  if(!saved||saved.run_id!==id||saved.display_name!==pending.score.name||saved.finish_ms!==pending.score.finishMs||!Number.isFinite(Date.parse(saved.submitted_at)))throw new Error('Could not confirm this result. Please retry safely.');
  state.saved={...state.saved,[id]:saved};state.pending=state.pending.filter(p=>p.score.runId!==id);persist();
 }catch(error){state.errors={...state.errors,[id]:error instanceof Error&&!['TypeError','TimeoutError','AbortError'].includes(error.name)?error.message:'Could not reach the scoreboard. Your score is ready to retry.'};}
 finally{state.busy={...state.busy,[id]:false};emit();}
}
export async function getScorePage(page:number,highlight:string|null,signal?:AbortSignal,version:string=SCORE_RULES.id):Promise<ScorePage>{
 if(!scoreboardConfigured)throw new Error('The shared scoreboard is not connected yet. Please try again later.');
 const response=await boundedFetch(`${url}/rest/v1/rpc/scoreboard_page`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key},body:JSON.stringify({p_version:version,p_page:page,p_highlight:highlight}),signal});
 if(!response.ok)throw new Error('Could not load the scoreboard. Please try again.');
 const result=await response.json();if(!Array.isArray(result.entries)||typeof result.total!=='number')throw new Error('Could not read the scoreboard. Please try again.');
 return result;
}
