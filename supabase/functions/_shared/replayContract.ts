import type {Action} from './engine/game.ts';

// Bound both transport size and deterministic simulation work before replaying.
export const REPLAY_LIMITS = {maxBytes:262144,maxActions:2000,maxFinishMs:1800000,maxReplayMs:1000} as const;
export type ReplayEvent = {atMs:number;action:Action};
const record = (v:unknown):v is Record<string,unknown> => !!v && typeof v==='object' && !Array.isArray(v);
const keys = (v:Record<string,unknown>,allowed:string[]) => Object.keys(v).every(k=>allowed.includes(k));
const service = (v:unknown) => typeof v==='string' && /^(backend|frontend|auth|repo-([4-9]|1[0-5]))$/.test(v);

// Explicit wire allowlist: never pass arbitrary browser objects to the engine.
export function validReplayAction(v:unknown):v is Action {
 if(!record(v))return false;
 switch(v.type){
  case 'speed-pause': return keys(v,['type','paused']) && typeof v.paused==='boolean';
  case 'scan': return keys(v,['type','serviceId']) && (v.serviceId===undefined || service(v.serviceId));
  case 'repair-repository': return keys(v,['type','serviceId']) && service(v.serviceId);
  case 'repair': return keys(v,['type','findingId']) && Number.isSafeInteger(v.findingId) && (v.findingId as number)>0;
  case 'model': return keys(v,['type','model']) && ['scout','specialist','scanner','master'].includes(v.model as string);
  case 'upgrade': return keys(v,['type','upgrade']) && v.upgrade==='capacity';
  case 'scope': return keys(v,['type','scope','operation']) && ['scan','repair'].includes(v.operation as string) && record(v.scope) && keys(v.scope,['level','id']) && typeof v.scope.id==='string' && (v.scope.level==='module' && /^module-[1-3]$/.test(String(v.scope.id)) || v.scope.level==='project' && v.scope.id==='project-1');
  default: return false;
 }
}
export function validReplay(value:unknown,finishMs:number):value is ReplayEvent[] {
 if(!Number.isSafeInteger(finishMs)||finishMs<=0||finishMs>REPLAY_LIMITS.maxFinishMs||finishMs%250!==0||!Array.isArray(value)||!value.length||value.length>REPLAY_LIMITS.maxActions)return false;
 let previous=0;
 for(const event of value){
  if(!record(event)||!keys(event,['atMs','action'])||!Number.isSafeInteger(event.atMs)||(event.atMs as number)<previous||(event.atMs as number)>finishMs||(event.atMs as number)%250!==0||!validReplayAction(event.action))return false;
  previous=event.atMs as number;
 }
 return true;
}
