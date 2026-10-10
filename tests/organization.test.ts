import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advance, newGame, scopeQuote, slots, health, type Action, type GameState } from '../src/game.ts';
import { activeServices, serviceFindings, serviceHealth } from '../src/campaign.ts';
import { createOrganization, scopeRepositories, CORPORATE } from '../src/organization.ts';
import {timelineFixture} from './fixtures.ts';
const action=(s:GameState,a:Action)=>{const r=act(s,a);assert.equal(r.ok,true,r.message);return r.state;};
const ledger=(s:GameState)=>assert.ok(Math.abs(s.credits-(40+s.stats.earned-Object.values(s.stats.spent).reduce((a,b)=>a+b,0)))<.001);
const full=timelineFixture(1122,123);

test('seeded corporate hierarchy owns exactly 100 repositories in random groups of 3–5 at both levels',()=>{
 const layouts=new Set<string>();
 for(let seed=0;seed<100;seed++){
  const o=createOrganization(seed);assert.equal(o.repositories.length,100);
  assert.equal(new Set(o.repositories.map(r=>r.id)).size,100);assert.equal(new Set(o.repositories.map(r=>r.name)).size,100);
  assert.ok(o.modules.every(m=>m.repositoryIds.length>=3&&m.repositoryIds.length<=5));
  assert.ok(o.projects.every(p=>p.moduleIds.length>=3&&p.moduleIds.length<=5));
  assert.equal(new Set(o.modules.flatMap(m=>m.repositoryIds)).size,100);
  assert.equal(o.projects.flatMap(p=>p.moduleIds).length,o.modules.length);
  for(const r of o.repositories)assert.ok(o.modules.find(m=>m.id===r.moduleId)!.repositoryIds.includes(r.id));
  for(const m of o.modules)assert.ok(o.projects.find(p=>p.id===m.projectId)!.moduleIds.includes(m.id));
  for(const r of o.repositories)for(const id of r.dependencies){assert.ok(o.repositories.some(v=>v.id===id));assert.notEqual(id,r.id);}
  assert.deepEqual(createOrganization(seed),o);layouts.add(JSON.stringify(o.modules.map(m=>m.repositoryIds.length)));
 }
 assert.ok(layouts.size>10);assert.notDeepEqual(createOrganization(1),createOrganization(2));
});
test('corporate growth starts after the release, adds one repository every six seconds and stops at 100',()=>{
 let s=timelineFixture(540,123);const release=structuredClone(s.campaign!.result);assert.equal(activeServices(s).length,3);
 s=advance(s,5.5);assert.equal(activeServices(s).length,3);s=advance(s,.5);assert.equal(activeServices(s).length,4);
 assert.equal(serviceFindings(s,'repo-4').length,1);assert.ok(serviceHealth(s,'repo-4')<100);
 assert.equal(act(s,{type:'scan',serviceId:'repo-100'}).state,s);
 s=advance(s,576);assert.equal(s.time,1122);assert.equal(activeServices(s).length,CORPORATE.maxRepositories);
 const count=s.findings.length;s=advance(s,60);assert.equal(activeServices(s).length,100);assert.ok(s.findings.length>count);assert.deepEqual(s.campaign!.result,release);ledger(s);
});
test('partial groups only target connected members, with stable ownership as new repositories join',()=>{
 let s=timelineFixture(540,123);const scope={level:'project' as const,id:s.organization.projects[0].id};
 const initial=scopeRepositories(s,scope);assert.equal(initial.length,3);
 s=advance(s,12);const expanded=scopeRepositories(s,scope);assert.equal(expanded.length,5);assert.ok(initial.every(id=>expanded.includes(id)));
 assert.deepEqual(scopeRepositories(s,{level:'project',id:'missing'}),[]);
 assert.equal(act(s,{type:'scope',scope:{level:'module',id:'missing'},operation:'scan'}).state,s);
});
test('group scans and repairs use ordinary prepaid jobs, same slots, exact costs and no duplicates',()=>{
 let s=structuredClone(full);const scope={level:'project' as const,id:s.organization.projects[0].id};
 const ids=scopeRepositories(s,scope);const quote=scopeQuote(s,scope,'scan');assert.equal(quote.actions.length,ids.length);
 const credits=s.credits;s=action(s,{type:'scope',scope,operation:'scan'});assert.equal(s.credits,credits-ids.length*5);
 assert.equal(s.jobs.length,1);assert.equal(s.queue.length,ids.length-1);assert.equal(act(s,{type:'scope',scope,operation:'scan'}).state,s);
 s=advance(s,ids.length*3);assert.ok(ids.every(id=>serviceFindings(s,id).some(f=>f.known)));
 const repair=scopeQuote(s,scope,'repair');const before=s.credits;
 s=action(s,{type:'scope',scope,operation:'repair'});assert.equal(s.credits,before-repair.actions.length*15);
 assert.equal(s.jobs.length,1);assert.ok(s.queue.length>0);const reserved=[...s.jobs,...s.queue].filter(j=>j.type==='repair').map(j=>j.findingId);
 assert.equal(new Set(reserved).size,reserved.length);assert.equal(act(s,{type:'scope',scope,operation:'repair'}).state,s);ledger(s);
 const poor=structuredClone(full);poor.credits=0;assert.equal(act(poor,{type:'scope',scope,operation:'scan'}).state,poor);
});
test('overlapping project/module automation only purchases uncovered repositories and remains scan-only',()=>{
 let s=structuredClone(full);const module=s.organization.modules[0];
 const moduleScope={level:'module' as const,id:module.id};const projectScope={level:'project' as const,id:module.projectId};
 const before=s.credits;s=action(s,{type:'scope',scope:moduleScope,operation:'automate'});
 assert.equal(s.credits,before-module.repositoryIds.length*210);
 const remaining=scopeQuote(s,projectScope,'automate');assert.equal(remaining.actions.length,scopeRepositories(s,projectScope).length-module.repositoryIds.length);
 s=action(s,{type:'scope',scope:projectScope,operation:'automate'});assert.equal(new Set(s.campaign!.automated).size,s.campaign!.automated.length);
 assert.equal(scopeQuote(s,moduleScope,'automate').cost,0);assert.equal(act(s,{type:'scope',scope:moduleScope,operation:'automate'}).state,s);
 for(let n=0;n<4;n++)s=action(s,{type:'upgrade',upgrade:'capacity'});
 s=advance(s,30);assert.ok(s.jobs.length<=slots(s));assert.equal(s.stats.repairs,0);assert.ok(s.jobs.every(j=>j.type==='scan'));ledger(s);
});
test('corporate simulation is repeatable across batches and every active repository contributes health',()=>{
 const a=advance(newGame(77),600);let b=newGame(77);for(let n=0;n<6;n++)b=advance(b,100);assert.deepEqual(a,b);
 const s=structuredClone(full);const last=s.organization.repositories[99];
 const h=health(s);const before=serviceHealth(s,last.id);for(const f of serviceFindings(s,last.id))f.repairedAt=s.time;
 assert.ok(serviceHealth(s,last.id)>=before);assert.ok(health(s)>=h);
 assert.ok(serviceFindings(full,last.id).length>0);
});
