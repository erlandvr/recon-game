import { automationCost, autonomyStatus, act, advance, newGame, knownFindings, repairReason, scanReason, slots } from './game.ts';
import { AUTO_REPAIR_COST, activeServices, serviceFindings } from './campaign.ts';
export const DEBUG_STARTS = [
  {id:'backend',name:'Starting backend',hint:'Fresh run'},
  {id:'growing',name:'Growing backend',hint:'Development 2'},
  {id:'full-pace',name:'Full-pace backend',hint:'Development 3'},
  {id:'expansion',name:'Ecosystem expansion',hint:'Level 2'},
  {id:'connected',name:'Connected systems',hint:'3 repos'},
  {id:'release',name:'Release challenge',hint:'Release review'},
  {id:'corporate',name:'Corporate expansion',hint:'Level 3'},
  {id:'company',name:'100-repository company',hint:'100 repos'},
  {id:'autonomy',name:'Autonomy trial',hint:'Fully automated'},
] as const;
export type DebugStart=typeof DEBUG_STARTS[number]['id'];
/** A deterministic coached run reaches real healthy-time goals using paid actions. */
export function debugGame(id:DebugStart,seed:number) {
  let s=newGame(seed);
  const reached=()=>id==='backend'||(id==='growing'?s.stage>=2:id==='full-pace'?s.stage>=3:id==='expansion'?!!s.campaign:id==='connected'?!!s.campaign?.connected:id==='release'?!!s.campaign?.finalIds.length:id==='corporate'?!!s.campaign?.result:id==='company'?s.campaign?.handoverAt!=null:id==='autonomy'?autonomyStatus(s).reason===null:false);
  if(!DEBUG_STARTS.some(item=>item.id===id))throw new Error('Unknown debug starting point.');
  while(!reached()&&s.time<7200){
    if(s.efficiency<1&&s.credits>=40)s=act(s,{type:'efficiency'}).state;
    if(s.credits>=230&&slots(s)<5)s=act(s,{type:'upgrade',upgrade:'capacity'}).state;
    if(s.credits>=190&&!s.upgrades.scanning)s=act(s,{type:'upgrade',upgrade:'scanning'}).state;
    if(s.credits>=210&&!s.upgrades.remediation)s=act(s,{type:'upgrade',upgrade:'remediation'}).state;
    if(id==='autonomy'&&(s.campaign?.repositoryCount??0)===100){
      for(const repo of activeServices(s)){
        if(!s.campaign!.automated.includes(repo)&&s.credits>=automationCost(s)+100)s=act(s,{type:'automate',serviceId:repo}).state;
        if(!s.campaign!.remediation.includes(repo)&&s.credits>=AUTO_REPAIR_COST+100)s=act(s,{type:'auto-repair',serviceId:repo}).state;
      }
      s=advance(s,.5);continue;
    }
    for(let n=0;n<slots(s)&&s.jobs.length<slots(s);n++){
      const finding=knownFindings(s).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity)||a.bornAt-b.bornAt).find(f=>!repairReason(s,f.id));
      if(finding)s=act(s,{type:'repair',findingId:finding.id}).state;
      else {const target=activeServices(s).find(repo=>serviceFindings(s,repo).some(f=>!f.known)&&!scanReason(s,repo));if(!target)break;s=act(s,{type:'scan',serviceId:target}).state;}
    }
    s=advance(s,.5);
  }
  if(!reached())throw new Error('Debug strategy could not reach this stage.');
  s.practice=id!=='backend';
  s.events.push({id:++s.sequence,at:s.time,text:`Debug start: ${DEBUG_STARTS.find(item=>item.id===id)!.name}. Earlier progress uses a coached run with paid scans, repairs and upgrades.`,kind:'info'});
  s.events=s.events.slice(-80);return s;
}
