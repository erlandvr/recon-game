import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,income,automationStatus,autonomyStatus,scopeQuote,type GameState,newGame,autoRepairStatus} from '../src/game.ts';
import {activeServices,newAutonomy,serviceOf} from '../src/campaign.ts';
import {timelineFixture} from './fixtures.ts';
import {debugGame} from '../src/debug.ts';
const buy=(s:GameState,id:'backend'|'auth'|'frontend'='backend')=>{const r=act(s,{type:'auto-repair',serviceId:id});assert.ok(r.ok,r.message);return r.state;};
const three=()=>{const s=timelineFixture(240);s.credits=2000;s.nextBugAt=null;return s;};

test('automatic fix setup is paid per connected repository and has separate coverage',()=>{
 let s=three();const before=s.credits;s=buy(s);assert.equal(s.credits,before-480);assert.deepEqual(s.campaign!.remediation,['backend']);assert.deepEqual(s.campaign!.automated,[]);
 assert.equal(act(s,{type:'auto-repair',serviceId:'backend'}).state,s);const poor=three();poor.credits=479;assert.equal(act(poor,{type:'auto-repair',serviceId:'auth'}).state,poor);
 const fresh=newGame();assert.equal(act(fresh,{type:'auto-repair',serviceId:'backend'}).state,fresh);const early=timelineFixture(180);assert.equal(act(early,{type:'auto-repair',serviceId:'auth'}).state,early);
});
test('automatic fixes discover nothing and fix all known finding kinds at ordinary cost',()=>{
 let s=buy(three());s.findings=s.findings.filter(f=>serviceOf(f)==='backend');s.findings=s.findings.slice(0,3);
 s.findings.forEach((f,i)=>{f.known=false;f.kind=(['bug','security','compliance'] as const)[i];});
 s=advance(s,.5);assert.equal(s.jobs.length,0);assert.equal(autoRepairStatus(s,'backend'),'Needs scan');
 s.findings.forEach(f=>f.known=true);const count=s.findings.length;s=advance(s,20);assert.equal(s.campaign!.autoRepairs,count);assert.equal(s.stats.spent.repairs,count*15);assert.ok(s.findings.every(f=>f.repairedAt!==null));
});
test('manual FIFO work takes precedence and auto fixes neither duplicate nor queue jobs',()=>{
 let s=buy(three());s.findings.forEach(f=>f.known=true);const [a,b]=s.findings.filter(f=>serviceOf(f)==='backend');
 s=act(s,{type:'repair',findingId:a.id}).state;s=act(s,{type:'repair',findingId:b.id}).state;s=advance(s,5);
 assert.equal(s.jobs[0].findingId,b.id);assert.equal(s.jobs[0].automated,undefined);assert.equal(s.queue.length,0);
 s=advance(s,5);assert.ok(s.jobs.every(j=>j.automated));assert.equal(s.queue.length,0);assert.ok(!s.jobs.some(j=>j.findingId===a.id||j.findingId===b.id));
});
test('automatic fix reserve recovers and scheduler alternates scans with fixes',()=>{
 let s=buy(three());s.findings.forEach(f=>f.known=true);s.credits=35-income(s)*.5;s=advance(s,.5);assert.equal(s.credits,20);assert.equal(s.jobs[0].automated,true);assert.equal(s.jobs[0].type,'repair');
 let low=buy(three());low.findings.forEach(f=>f.known=true);low.credits=34-income(low)*.5;low=advance(low,.5);assert.equal(low.jobs.length,0);assert.equal(autoRepairStatus(low,'backend'),'Waiting for credits');low=advance(low,1);assert.equal(low.jobs[0].type,'repair');
 let fair=buy(three());fair=act(fair,{type:'automate',serviceId:'auth'}).state;fair.findings.filter(f=>serviceOf(f)==='backend').forEach(f=>f.known=true);fair=advance(fair,.5);assert.equal(fair.jobs[0].type,'repair');fair=advance(fair,5);assert.equal(fair.jobs[0].type,'scan');
});
test('overlapping group automatic-fix setup only charges uncovered members and rejects partial purchases',()=>{
 let s=timelineFixture(1122);s.credits=100000;const m=s.organization.modules[0],module={level:'module' as const,id:m.id},project={level:'project' as const,id:m.projectId};
 const q=scopeQuote(s,module,'auto-repair');s=act(s,{type:'scope',scope:module,operation:'auto-repair'}).state;assert.equal(s.credits,100000-q.cost);const p=scopeQuote(s,project,'auto-repair');assert.ok(p.actions.every(a=>a.type==='auto-repair'&&!m.repositoryIds.includes(a.serviceId)));
 s.credits=p.cost-1;assert.equal(act(s,{type:'scope',scope:project,operation:'auto-repair'}).state,s);
});
function ready(){const s=timelineFixture(1122);s.findings=[];s.nextBugAt=null;s.jobs=[];s.queue=[];s.credits=1000;s.campaign!.automated=activeServices(s);s.campaign!.remediation=activeServices(s);return s;}
test('victory demands full coverage, per-repo health, no overdue/manual work and a reserve',()=>{
 let s=ready();assert.equal(autonomyStatus(s).reason,null);
 s.campaign!.remediation.pop();assert.match(autonomyStatus(s).reason!,/Enable/);s.campaign!.remediation=activeServices(s);s.credits=34;assert.match(autonomyStatus(s).reason!,/reserve/);s.credits=1000;
 s.findings=[{id:100,title:'bad',description:'',bornAt:s.time,known:true,repairedAt:null,kind:'security',deadline:s.time-1,escalated:true},{id:101,title:'bug',description:'',bornAt:s.time,known:true,repairedAt:null}];assert.match(autonomyStatus(s).reason!,/every repository/);s.findings.pop();assert.match(autonomyStatus(s).reason!,/overdue/);
 s.findings=[];s=advance(s,10);assert.ok(s.campaign!.autonomy.elapsed>0);s=act(s,{type:'scan'}).state;assert.equal(s.campaign!.autonomy.elapsed,0);assert.match(autonomyStatus(s).reason!,/manual work/);
});
test('a trial cannot win without actual scans and completed fixes; conditions reset its uninterrupted timer',()=>{
 let s=advance(ready(),70);assert.equal(s.campaign!.autonomy.victory,null);s.campaign!.remediation.pop();s=advance(s,.5);assert.equal(s.campaign!.autonomy.elapsed,0);
 s=ready();s.campaign!.autonomy={...newAutonomy(),startedAt:s.time-60,elapsed:59.5,earnedStart:s.stats.earned+10000,scansStart:-1,repairsStart:-1};s=advance(s,.5);assert.equal(s.campaign!.autonomy.victory,null);assert.equal(s.campaign!.autonomy.elapsed,0);
});
test('paid coached setup reaches autonomous victory, continues afterwards and remains deterministic',()=>{
 const start=debugGame('autonomy',1);assert.equal(autonomyStatus(start).reason,null);assert.equal(start.campaign!.autonomy.victory,null);
 let s=advance(start,180);assert.ok(s.campaign!.autonomy.victory,JSON.stringify(autonomyStatus(s)));const victory=structuredClone(s.campaign!.autonomy.victory);assert.ok(victory!.duration>=60);assert.ok(victory!.autoScans>0&&victory!.autoRepairs>0);assert.ok(victory!.netIncome>=0);
 assert.deepEqual(advance(advance(start,90),90),s);s=advance(act(s,{type:'scan'}).state,20);assert.deepEqual(s.campaign!.autonomy.victory,victory);assert.ok(s.time>victory!.at);
 console.log(`Autonomy trial at ${start.time}s; victory at ${victory!.at}s; ${victory!.netIncome} credits net operating income.`);
});


test('scan status distinguishes automated fix work from scanning or manual work',()=>{
 let s=buy(three());s=act(s,{type:'automate',serviceId:'backend'}).state;s.findings.filter(f=>serviceOf(f)==='backend').forEach(f=>f.known=true);
 s=advance(s,.5);assert.equal(s.jobs[0].type,'repair');assert.equal(autoRepairStatus(s,'backend'),'Fixing');assert.equal(automationStatus(s,'backend'),'Awaiting fixes');
});
