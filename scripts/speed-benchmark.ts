import {newSpeedGame,act,advance,knownFindings,openFindings,automationCost,autoRepairCost,efficiencyQuote,upgradeCost,fullyAutomated,type Action,type GameState} from '../src/game.ts';
import {activeServices,serviceOf} from '../src/campaign.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
export function playSpeed({reaction=3,efficiency=2,capacity=3,upgrades=true,seed=1,actionLimit=Infinity,groupWork=false,maxSeconds=1800,startDelay=0}={}){
 let s=advance(newSpeedGame(seed),startDelay),actionsLeft=actionLimit;const actions:{at:number;action:Action}[]=[],phases=[{at:0,phase:0}];
 function submit(action:Action){if(actionsLeft<=0)return false;const r=act(s,action);if(r.ok){actionsLeft--;actions.push({at:s.time,action});s=r.state;}return r.ok;}
 while(!s.speed!.result&&s.time<maxSeconds){
  if(s.time%reaction===0){
   actionsLeft=actionLimit;
   const busy=()=>[...s.jobs,...s.queue];
   if(groupWork&&s.campaign){submit({type:'scope',scope:{level:'project',id:'project-1'},operation:'repair'});submit({type:'scope',scope:{level:'project',id:'project-1'},operation:'scan'});}
   for(const f of knownFindings(s).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity)))if(!s.campaign?.remediation.includes(serviceOf(f))&&!busy().some(j=>j.findingId===f.id))submit({type:'repair-repository',serviceId:serviceOf(f)});
   for(const id of activeServices(s))if(!s.campaign?.automated.includes(id)&&openFindings(s).some(f=>!f.known&&serviceOf(f)===id)&&!busy().some(j=>j.type==='scan'&&j.serviceId===id))submit({type:'scan',serviceId:id});
   if(s.campaign){
    if(s.workSlots<capacity&&s.credits>=upgradeCost(s,'capacity')+40)submit({type:'upgrade',upgrade:'capacity'});
    const e=efficiencyQuote(s);if(s.efficiency<efficiency&&e&&s.credits>=e.cost+40)submit({type:'efficiency'});
    if(upgrades)for(const upgrade of ['scanning','remediation'] as const)if(!s.upgrades[upgrade]&&s.credits>=upgradeCost(s,upgrade)+40)submit({type:'upgrade',upgrade});
    // First module unlocks the final team. Then cover each remaining repo.
    for(const id of activeServices(s)){
     if(!s.campaign!.automated.includes(id)&&s.credits>=automationCost(s)+40)submit({type:'automate',serviceId:id});
     if(s.campaign!.automated.includes(id)&&!s.campaign!.remediation.includes(id)&&s.credits>=autoRepairCost(s)+40)submit({type:'auto-repair',serviceId:id});
    }
   }
  }
  const phase=s.speed!.phase;s=advance(s,.5);if(s.speed!.phase!==phase)phases.push({at:s.time,phase:s.speed!.phase});
 }
 return {result:s.speed!.result,medal:s.campaign?.autonomy.victory?.medal,phases,actions,credits:s.credits,coverage:s.campaign?.automated.length,slots:s.workSlots,efficiency:s.efficiency};
}
if(process.argv[1]?.endsWith('speed-benchmark.ts')){
 mkdirSync('test-results',{recursive:true});let best:ReturnType<typeof playSpeed>|null=null;const rows=[];
 for(const reaction of [1,3,5])for(const efficiency of [0,1,2])for(const capacity of [2,3,5]){
  const r=playSpeed({reaction,efficiency,capacity});rows.push({reaction,efficiency,capacity,...r.result,phases:r.phases});
  if(r.result?.won&&(!best||r.result!.at<best.result!.at))best=r;
 }
 writeFileSync('test-results/speed-benchmark.json',JSON.stringify(rows,null,2));if(best)writeFileSync('test-results/speed-plan.json',JSON.stringify(best,null,2));
 console.log(rows);console.log('Best',best&&{...best.result,actions:best.actions.length,phases:best.phases});
}
