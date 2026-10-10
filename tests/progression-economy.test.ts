import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,newGame,scanCost,efficiencyQuote,health,healthyEnough,income,levelProgress,scopeQuote,knownFindings,repairReason,scanReason,slots,type GameState} from '../src/game.ts';
import {serviceFindings} from '../src/campaign.ts';
import {timelineFixture} from './fixtures.ts';
const buy=(s:GameState)=>{const r=act(s,{type:'efficiency'});assert.ok(r.ok,r.message);return r.state;};

test('healthy seconds accumulate, hold without resetting, and resume after actual repair completion',()=>{
 let s=advance(newGame(),45);assert.equal(s.healthyTime,45);assert.equal(levelProgress(s).goal,120);
 s=advance(act(s,{type:'scan'}).state,3);assert.equal(s.healthyTime,45);
 s=act(s,{type:'repair',findingId:1}).state;s=advance(s,5);assert.equal(s.healthyTime,45);assert.equal(health(s),80);
 s=advance(s,1);assert.equal(s.healthyTime,46);assert.equal(s.time,54);
});
test('80 percent qualifies exactly; below it only live time and income advance',()=>{
 let s=timelineFixture(210);s.findings=[{id:1,serviceId:'auth',kind:'bug',title:'test',description:'',bornAt:s.time,known:true,repairedAt:null}];s.nextBugAt=null;
 assert.equal(health(s),80);assert.ok(healthyEnough(s));const before=s.healthyTime;s=advance(s,1);assert.equal(s.healthyTime,before+1);
 s.findings.push({id:2,serviceId:'backend',kind:'bug',title:'test',description:'',bornAt:s.time,known:true,repairedAt:null});assert.ok(!healthyEnough(s));const money=s.credits;s=advance(s,1);assert.equal(s.healthyTime,before+1);assert.ok(s.credits>money);
});
test('delayed healthy milestones anchor campaign events and corporate growth to their actual starts',()=>{
 let s=advance(newGame(),240);s.findings=[];s.nextBugAt=null;s.healthyTime=119.5;s=advance(s,.5);assert.equal(s.campaign!.startedAt,240.5);
 const first=structuredClone(s.results);s=advance(s,30);assert.equal(s.campaign!.connected,true);
 s=advance(s,600);assert.equal(s.campaign!.result,null);assert.equal(s.campaign!.repositoryCount,3);assert.deepEqual(s.results,first);
 s.findings=[];s.campaign!.healthyStartedAt=s.healthyTime-359.5;s=advance(s,.5);const at=s.time;assert.equal(s.campaign!.result!.at,at);assert.equal(s.campaign!.nextRepositoryAt,at+6);
 s=advance(s,5.5);assert.equal(s.campaign!.repositoryCount,3);s=advance(s,.5);assert.equal(s.campaign!.repositoryCount,4);
});
test('five efficiency tiers have rising prices, correct marginal payback and reject unaffordable/max purchases',()=>{
 let s=newGame();s.credits=20000;const costs=[20,100,500,2500,6000],prices=[4,3,2,1,.25];
 for(let i=0;i<5;i++){const quote=efficiencyQuote(s)!;assert.equal(quote.payback,Math.ceil(costs[i]/(scanCost(s)-prices[i])));const short=structuredClone(s);short.credits=costs[i]-.01;const rejected=act(short,{type:'efficiency'});assert.equal(rejected.ok,false);assert.equal(rejected.state,short);const before=s.credits;s=buy(s);assert.equal(s.credits,before-costs[i]);assert.equal(scanCost(s),prices[i]);}
 assert.equal(efficiencyQuote(s),null);assert.equal(act(s,{type:'efficiency'}).state,s);
 const poor=newGame();poor.credits=19;assert.equal(act(poor,{type:'efficiency'}).state,poor);
});
test('paid queue keeps its old price; new scans use the cheaper model once',()=>{
 let s=timelineFixture(210);s.credits=1000;s=act(s,{type:'scan',serviceId:'backend'}).state;s=act(s,{type:'scan',serviceId:'auth'}).state;
 assert.equal(s.stats.spent.scans,10);assert.equal(s.queue.length,1);s=buy(s);s=advance(s,6);assert.equal(s.stats.spent.scans,10);
 const before=s.credits;s=act(s,{type:'scan',serviceId:'frontend'}).state;assert.equal(s.credits,before-4);assert.equal(s.stats.spent.scans,14);
});
test('group quotes and automatic scan reserve use current discounted cost',()=>{
 let s=timelineFixture(1122);for(let i=0;i<5;i++)s=buy(s);
 const scope={level:'module' as const,id:s.organization.modules[0].id};const quote=scopeQuote(s,scope,'scan');assert.equal(quote.cost,quote.actions.length*.25);
 const before=s.credits;s=act(s,{type:'scope',scope,operation:'scan'}).state;assert.equal(s.credits,before-quote.cost);
 let auto=timelineFixture(240);auto=buy(auto);auto=act(auto,{type:'automate',serviceId:'auth'}).state;
 auto.credits=24-income(auto)*.5;auto=advance(auto,.5);assert.equal(auto.credits,20);assert.equal(auto.jobs[0].automated,true);assert.equal(auto.stats.spent.scans,4);
});
test('a neglected backend can recover after investing, without free credits or resetting progress',()=>{
 let s=advance(newGame(),180);s=act(s,{type:'upgrade',upgrade:'capacity'}).state;s=act(s,{type:'upgrade',upgrade:'remediation'}).state;while(s.credits<20)s=advance(s,.5);s=buy(s);
 const started=s.time;
 while(!s.campaign&&s.time<900){
  for(let n=0;n<slots(s)&&s.jobs.length<slots(s);n++){
   const f=knownFindings(s).find(f=>!repairReason(s,f.id));
   if(f)s=act(s,{type:'repair',findingId:f.id}).state;
   else if(serviceFindings(s,'backend').some(f=>!f.known)&&!scanReason(s))s=act(s,{type:'scan'}).state;else break;
  }
  s=advance(s,.5);assert.ok(s.credits>=0);
 }
 assert.ok(s.campaign,`Did not recover by ${s.time}`);assert.ok(s.time-started<600);assert.ok(s.results!.health>=80);
 assert.ok(Math.abs(s.credits-(40+s.stats.earned-Object.values(s.stats.spent).reduce((a,b)=>a+b,0)))<.001);
 console.log(`Recovery scenario: expansion at ${s.time}s after neglect/investment at 180s; ${s.credits.toFixed(1)} credits remain.`);
});


test('failure cuts income by 25 percent and recovery restores it at exactly 80 percent',()=>{
 let s=advance(newGame(),45);assert.equal(health(s),60);assert.equal(income(s),1.35);
 s.nextBugAt=null;const before=s.credits,earned=s.stats.earned;s=advance(s,1);
 const tickRoundedIncome=2*Math.round(1.35*.5*100)/100;assert.ok(Math.abs(s.credits-before-tickRoundedIncome)<.001);assert.ok(Math.abs(s.stats.earned-earned-tickRoundedIncome)<.001);
 s=advance(act(s,{type:'scan'}).state,3);s=advance(act(s,{type:'repair',findingId:1}).state,5);
 assert.equal(health(s),80);assert.equal(income(s),1.9);
 s=advance(act(s,{type:'repair',findingId:2}).state,5);assert.equal(income(s),2);
 const neglected=advance(newGame(),180);assert.equal(health(neglected),20);assert.equal(income(neglected),1.2);
 const ecosystem=timelineFixture(210);ecosystem.findings=[];assert.equal(income(ecosystem),4.8);
 ecosystem.findings=[{id:999,serviceId:'auth',kind:'security',title:'Overdue',description:'',bornAt:0,known:true,repairedAt:null,deadline:1,escalated:true}];
 assert.ok(!healthyEnough(ecosystem));assert.equal(income(ecosystem),3.36);
});


test('chapter one advances at exactly 120 healthy seconds and expansion still needs 360 more',()=>{
 let s=newGame();s.nextBugAt=null;
 s=advance(s,119.5);assert.equal(s.campaign,undefined);assert.equal(s.healthyTime,119.5);
 s=advance(s,.5);assert.equal(s.campaign!.startedAt,120);assert.equal(s.results!.healthyTime,120);
 assert.equal(levelProgress(s).goal,360);assert.equal(levelProgress(s).elapsed,0);
});
