import {writeFileSync,mkdirSync} from 'node:fs';
import {act,advance,newSpeedGame,knownFindings,openFindings,scanReason,repairReason,modelReason,autonomyStatus,health,type Action} from '../src/game.ts';
import {serviceOf} from '../src/campaign.ts';
import {SPEED_MODELS,type SpeedModel} from '../src/speedRules.ts';
/** Paid policy: one manual command per reaction interval; upgrades can be planned while paused. */
export function playSpeed({route='scanner',reaction=2,beforeModel=4,beforeFinal=7,capacity=2,startDelay=0,maxSeconds=900,seed=1}:{route?:SpeedModel|'combined'|'all';reaction?:number;beforeModel?:number;beforeFinal?:number;earlyAutomation?:boolean;capacity?:number;startDelay?:number;maxSeconds?:number;seed?:number}={}){
 let s=act(newSpeedGame(seed),{type:'speed-pause',paused:false}).state;s=advance(s,startDelay);
 const actions:{at:number;action:Action;credits:number}[]=[],milestones:{at:number;kind:string;count?:number}[]=[];let lastDecision=-Infinity;
 function issue(action:Action){const r=act(s,action);if(!r.ok)return false;actions.push({at:s.time,action,credits:r.state.credits});s=r.state;return true;}
 function purchase(action:Action){issue({type:'speed-pause',paused:true});const ok=issue(action);if(!s.speed!.result)issue({type:'speed-pause',paused:false});return ok;}
 while(!s.speed!.result&&s.time<maxSeconds){
  if(s.time-lastDecision>=reaction){lastDecision=s.time;
   const order:Exclude<SpeedModel,'base'>[]=route==='base'?[]:route==='combined'?['scout','specialist']:route==='all'?['scout','specialist','scanner','master']:route==='scanner'?['scout','scanner','specialist','master']:['specialist','master','scout','scanner'];
   const next=order.find(id=>!s.speed!.models.includes(id));
   const threshold=s.speed!.models.length===1?beforeModel:beforeFinal;
   if(next&&s.speed!.owned.length>=threshold&&s.credits>=SPEED_MODELS[next].cost+35&&!modelReason(s,next)){purchase({type:'model',model:next});milestones.push({at:s.time,kind:s.speed!.models.length===2?'model':'final'});}
   if(s.speed!.result)break;
   if((route==='base'||s.speed!.models.length>1)&&capacity===2&&s.workSlots===1&&s.speed!.activated.length>=3&&s.credits>=185)issue({type:'upgrade',upgrade:'capacity'});
   const findings=knownFindings(s).filter(f=>!s.campaign!.remediation.includes(serviceOf(f))&&!repairReason(s,f.id)).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity)||a.bornAt-b.bornAt);
   const hidden=openFindings(s).find(f=>!f.known&&!s.campaign!.automated.includes(serviceOf(f))&&!scanReason(s,serviceOf(f)));
   if(findings.length)issue({type:'repair-repository',serviceId:serviceOf(findings[0])});
   else if(hidden)issue({type:'scan',serviceId:serviceOf(hidden)});

  }
  s=advance(s,.5);
 }
 return {route,reaction,beforeModel,beforeFinal,result:s.speed!.result,medal:s.campaign!.autonomy.victory?.medal??null,modelAt:milestones.find(m=>m.kind==='model')?.at??null,finalAt:milestones.find(m=>m.kind==='final')?.at??null,actions,milestones,credits:s.credits,coverage:autonomyStatus(s).covered,health:health(s),owned:s.speed!.owned.length,backlog:openFindings(s).length,manualActions:actions.filter(a=>['scan','repair-repository'].includes(a.action.type)).length};
}
if(process.argv[1]?.endsWith('speed-benchmark.ts')){
 const rows=[];let best:ReturnType<typeof playSpeed>|null=null;
 for(const route of ['base','scanner','master','combined','all'] as const)for(const reaction of [1,3,5])for(const beforeModel of route==='base'?[12]:[3,4,6]){
  const run=playSpeed({route,reaction,beforeModel});const {actions,milestones,...row}=run;rows.push(row);if(run.result&&(!best||run.result.at<best.result!.at))best=run;
 }
 mkdirSync('test-results',{recursive:true});writeFileSync('test-results/speed-benchmark.json',JSON.stringify(rows,null,2));if(best)writeFileSync('test-results/speed-plan.json',JSON.stringify(best,null,2));console.table(rows.map(r=>({route:r.route,reaction:r.reaction,before:r.beforeModel,finish:r.result?.at,model:r.modelAt,final:r.finalAt,owned:r.owned,health:r.health,backlog:r.backlog})));console.log('Fastest tested:',best?.route,best?.result?.at);
}
