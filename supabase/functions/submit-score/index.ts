import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {createSubmitScoreHandler,type ScoreReceipt} from '../_shared/submitScoreHandler.ts';

function key(modern:string,legacy:string){const raw=Deno.env.get(modern);return raw?JSON.parse(raw).default:Deno.env.get(legacy);}
const options={auth:{persistSession:false,autoRefreshToken:false}};
const url=Deno.env.get('SUPABASE_URL')!;
const auth=createClient(url,key('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY'),options);
const admin=createClient(url,key('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'),options);

Deno.serve(createSubmitScoreHandler({
 async authenticate(token){
  const {data:{user},error}=await auth.auth.getUser(token);
  return error||!user?null:user.id;
 },
 async prepare(owner,runId){
  const {data,error}=await admin.rpc('prepare_score_verification',{p_owner:owner,p_run:runId});
  if(error)throw error;
  return data as ScoreReceipt|null;
 },
 async store(owner,score){
  const {data,error}=await admin.rpc('submit_verified_score',{p_owner:owner,p_score:score});
  if(error)throw error;
  return data as ScoreReceipt;
 },
}));
