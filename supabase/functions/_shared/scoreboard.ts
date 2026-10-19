import {validReplay,type ReplayEvent} from './replayContract.ts';
// Verification gets a separate board; historical self-reported scores remain readable.
export const LEGACY_SCORE_RULES = {id:'speed-d129-v1',label:'Previous scores · unverified'} as const;
export const SCORE_RULES = {id:'speed-d129-verified-v1',label:'Speed Game · verified finishes',repositories:15,modules:3,trialSeconds:5,seed:1,goldMs:420000,silverMs:450000,bronzeMs:480000} as const;
export type ScoreFacts = {runId:string;name:string;mode:'speed';rulesVersion:string;finishMs:number;seed:number;covered:number;modules:number;health:number;trialSeconds:number;autoScans:number;autoRepairs:number;credits:number;netIncome:number;practice:false};
export type StoredScoreSubmission = ScoreFacts & {replay?:ReplayEvent[]};
export type ScoreSubmission = ScoreFacts & {replay:ReplayEvent[]};
export type ScoreRow = {run_id:string;display_name:string;finish_ms:number;submitted_at:string;rank:number;medal:'gold'|'silver'|'bronze'|null};
export type ScorePage = {entries:ScoreRow[];total:number;page:number;pageSize:number;highlight:ScoreRow|null};
export function scoreName(value:string){return value.trim();}
export function validName(value:unknown):value is string{return typeof value==='string'&&value===value.trim()&&[...value].length>=1&&[...value].length<=30&&!/[\p{Cc}\p{Cf}]/u.test(value);}
export function validSubmission(value:unknown):value is ScoreSubmission{
 if(!validStoredSubmission(value))return false;
 return value.rulesVersion===SCORE_RULES.id&&validReplay(value.replay,value.finishMs)&&value.trialSeconds>=SCORE_RULES.trialSeconds&&value.trialSeconds*1000<=value.finishMs&&value.trialSeconds*1000%250===0&&value.health>=90&&value.autoScans>0&&value.autoRepairs>0&&value.credits>=35&&value.netIncome>=0;
}
export function scoreTime(ms:number){const seconds=Math.floor(ms/1000);return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}.${String(ms%1000).padStart(3,'0').slice(0,2).replace(/0$/,'')}`;}
// Retain opted-in historical results without applying current victory thresholds.
export function validStoredSubmission(value:unknown):value is StoredScoreSubmission{
 if(!value||typeof value!=='object')return false;
 const s=value as ScoreSubmission;
 return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s.runId)&&validName(s.name)&&s.mode==='speed'&&typeof s.rulesVersion==='string'&&s.rulesVersion.length<=100&&Number.isSafeInteger(s.finishMs)&&s.finishMs>0&&s.finishMs<=2147483500&&s.finishMs%250===0&&s.seed===SCORE_RULES.seed&&s.covered===SCORE_RULES.repositories&&s.modules===SCORE_RULES.modules&&Number.isFinite(s.health)&&s.health>=0&&s.health<=100&&Number.isFinite(s.trialSeconds)&&s.trialSeconds>=0&&Number.isSafeInteger(s.autoScans)&&s.autoScans>=0&&Number.isSafeInteger(s.autoRepairs)&&s.autoRepairs>=0&&Number.isFinite(s.credits)&&s.credits>=0&&Number.isFinite(s.netIncome)&&s.practice===false;
}
