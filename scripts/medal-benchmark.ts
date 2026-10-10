import {automationCost,act,advance,newGame,knownFindings,repairReason,scanReason,slots,scanCost,UPGRADES,EFFICIENCY,repositoryRepairQuote,health,type Action,type GameState} from '../src/game.ts';
import {activeServices,serviceFindings,serviceHealth,serviceOf,AUTO_REPAIR_COST} from '../src/campaign.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export type Strategy={name:string;efficiency:number;capacity:number;earlySlots:number;speed:boolean;autoAt:number;reaction:number;reserve:number;saveForEfficiency?:boolean};
export const strategies:Strategy[]=[
 {name:'manual-first',efficiency:1,capacity:5,earlySlots:2,speed:true,autoAt:100,reaction:1,reserve:60},
 {name:'automate-as-you-grow',efficiency:1,capacity:5,earlySlots:2,speed:true,autoAt:1,reaction:1,reserve:60},
 {name:'efficient-model',efficiency:2,capacity:5,earlySlots:2,speed:true,autoAt:1,reaction:1,reserve:60},
 {name:'advanced-model',efficiency:3,capacity:5,earlySlots:2,speed:true,autoAt:1,reaction:1,reserve:60},
 {name:'maximum-model',efficiency:5,capacity:5,earlySlots:2,speed:true,autoAt:1,reaction:1,reserve:60},
 {name:'lean-capacity',efficiency:1,capacity:3,earlySlots:1,speed:true,autoAt:1,reaction:1,reserve:60},
 {name:'no-speed-upgrades',efficiency:1,capacity:5,earlySlots:2,speed:false,autoAt:1,reaction:1,reserve:60},
 {name:'five-second-decisions',efficiency:1,capacity:5,earlySlots:2,speed:true,autoAt:1,reaction:5,reserve:60},
];
export const leanSearch:Strategy[]=[2,3].flatMap(capacity=>[0,1,2].flatMap(efficiency=>[1,100].map(autoAt=>({...strategies[0],name:`slots${capacity}-eff${efficiency}-auto${autoAt}`,capacity,efficiency,earlySlots:1,autoAt,reserve:35}))));
export function play(seed:number,strategy:Strategy,record=false){
 let s=newGame(seed);const plan:{at:number;action:Action}[]=[],purchases:{at:number;action:Action}[]=[];let actions=0;
 const run=(action:Action)=>{const result=act(s,action);if(!result.ok)throw Error(result.message);if(record)plan.push({at:s.time,action});if(['upgrade','efficiency','automate','auto-repair'].includes(action.type))purchases.push({at:s.time,action});actions++;s=result.state;};
 while(!s.campaign?.autonomy.victory&&s.time<3600){
  if(s.time%strategy.reaction===0){
   // Only use player-visible current symptoms, known findings and shared prices.
   if(s.efficiency<strategy.efficiency&&s.credits>=EFFICIENCY[s.efficiency].cost+strategy.reserve)run({type:'efficiency'});
   const targetSlots=s.campaign?.result?strategy.capacity:s.campaign?strategy.earlySlots:1;
   if(slots(s)<targetSlots&&s.credits>=150+strategy.reserve)run({type:'upgrade',upgrade:'capacity'});
   if(strategy.speed)for(const upgrade of ['scanning','remediation'] as const)if(!s.upgrades[upgrade]&&s.credits>=UPGRADES[upgrade].cost+strategy.reserve)run({type:'upgrade',upgrade});
   if(s.campaign&&(!strategy.saveForEfficiency||s.efficiency>=strategy.efficiency)&&(s.campaign.repositoryCount>=strategy.autoAt))for(const id of activeServices(s)){
    if(!s.campaign.automated.includes(id)&&s.credits>=automationCost(s)+strategy.reserve)run({type:'automate',serviceId:id});
    if(s.campaign.automated.includes(id)&&!s.campaign.remediation.includes(id)&&s.credits>=AUTO_REPAIR_COST+strategy.reserve)run({type:'auto-repair',serviceId:id});
   }
   for(let n=0;n<slots(s)&&s.jobs.length<slots(s)&&!s.queue.length;n++){
    const finding=knownFindings(s).filter(f=>!s.campaign?.remediation.includes(serviceOf(f))).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity)||a.bornAt-b.bornAt).find(f=>!repairReason(s,f.id));
    if(finding){const id=serviceOf(finding),quote=repositoryRepairQuote(s,id);run(!quote.reason?{type:'repair-repository',serviceId:id}:{type:'repair',findingId:finding.id});}
    else {const target=activeServices(s).filter(id=>!s.campaign?.automated.includes(id)&&serviceFindings(s,id).some(f=>!f.known)&&!scanReason(s,id)).sort((a,b)=>serviceHealth(s,a)-serviceHealth(s,b))[0];if(!target||s.credits<scanCost(s)+15)break;run({type:'scan',serviceId:target});}
   }
  }
  s=advance(s,.5);
 }
 const report={strategy:strategy.name,seed,finish:s.campaign?.autonomy.victory?.at??null,firstChapter:s.results?.at,release:s.campaign?.result?.at,allRepos:s.campaign?.result? s.campaign.result.at+582:null,health:health(s),credits:s.credits,actions,spent:s.stats.spent,scans:s.stats.scans,repairs:s.stats.repairs,purchases};
 return {state:s,report,plan};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const name=process.argv[2],seed=Number(process.argv[3]??1);const all=[...strategies,...leanSearch,...[3,4,5].map(efficiency=>({...strategies[4],name:`save-model-${efficiency}`,efficiency,saveForEfficiency:true}))];const selected=name?all.filter(s=>s.name===name):all;
 if(!selected.length)throw new Error(`Unknown strategy: ${name}`);
 mkdirSync('test-results',{recursive:true});
 for(const strategy of selected){const start=Date.now();const {report,plan}=play(seed,strategy,true);writeFileSync(`test-results/medal-${strategy.name}-${seed}.json`,JSON.stringify({strategy,report,plan},null,2));console.log(JSON.stringify({...report,purchases:report.purchases.length,wallSeconds:(Date.now()-start)/1000}));}
}
