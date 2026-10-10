import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advance, newGame, healthyEnough, averageHealth } from '../src/game.ts';
import { chapterIndex, chapterBeat, chapterGoal, nextMove } from '../src/story.ts';
import { timelineFixture } from './fixtures.ts';
import { debugGame } from '../src/debug.ts';

test('story waits for earned milestones, not elapsed time, and resets with a new run', () => {
  const neglected=advance(newGame(),1000);
  assert.equal(chapterIndex(neglected),0);
  assert.match(chapterGoal(neglected),/progress held; ecosystem live/);
  assert.match(chapterBeat(advance(newGame(),60)),/search and reports/);
  assert.equal(chapterIndex(timelineFixture(180)),1);
  assert.equal(chapterIndex(timelineFixture(540)),2);
  assert.equal(chapterIndex(timelineFixture(540+21*6)),2); // 24 repos
  assert.equal(chapterIndex(timelineFixture(540+22*6)),2); // 25 repos
  assert.equal(chapterIndex(timelineFixture(1122)),2);
  assert.equal(chapterIndex(newGame()),0);
});

test('guidance follows scan, discovery, repair and completion without duplicate orders', () => {
  let s=advance(newGame(),15);
  assert.equal(nextMove(s).target,'backend');assert.match(nextMove(s).title,/Scan Backend/);
  s=act(s,{type:'scan'}).state;
  assert.equal(nextMove(s).target,undefined);assert.match(nextMove(s).title,/underway/);
  s=advance(s,3);assert.match(nextMove(s).title,/Repair Backend/);
  s=act(s,{type:'repair',findingId:1}).state;assert.equal(nextMove(s).target,undefined);
  s=advance(s,5);assert.equal(nextMove(s).destination,'investments');assert.match(nextMove(s).detail,/Keep 20 cr/);
  s=act(s,{type:'efficiency'}).state;assert.match(nextMove(s).detail,/Keep 19 cr/);
});

test('guidance prioritizes known deadlines and explains insufficient repair funds', () => {
  const s=timelineFixture(210);s.findings.forEach(f=>f.known=true);
  s.findings.push({id:999,known:true,repairedAt:null,bornAt:s.time,deadline:s.time+5,serviceId:'auth',title:'Urgent',description:''});
  s.credits=0;const before=structuredClone(s),move=nextMove(s);
  assert.equal(move.target,'auth');assert.match(move.detail,/Income is still running/);
  assert.deepEqual(s,before); // Coaching is observational and cannot spend or start work.
});

test('all queued work is accounted for, while uncovered systems get their own next action', () => {
  let s=timelineFixture(210);s.credits=1000;
  for(const id of ['backend','auth','frontend'] as const)s=act(s,{type:'scan',serviceId:id}).state;
  assert.equal(nextMove(s).target,undefined);assert.match(nextMove(s).detail,/2 queued/);
  s.jobs=[];s.queue=[];s.findings=[];
  s.campaign!.automated=['backend'];s.campaign!.remediation=['backend'];
  const move=nextMove(s);assert.ok(move.target&&move.target!=='backend');assert.equal(move.coverage,true);
});

test('fully covered trial coaching never proposes manual work and victory stays a chapter', () => {
  let s=debugGame('autonomy',1);
  assert.equal(chapterIndex(s),4);assert.equal(nextMove(s).target,undefined);assert.equal(nextMove(s).destination,'autonomy');
  s=advance(s,180);assert.equal(chapterIndex(s),5);assert.match(nextMove(s).title,/Victory/);
  s=advance(s,30);assert.equal(chapterIndex(s),5);
});


test('growth continues below 80 percent but both chapter milestones wait for recovery',()=>{
 let s=timelineFixture(540+21*6);assert.equal(s.campaign!.repositoryCount,24);assert.equal(chapterIndex(s),2);
 s=advance(s,6);assert.equal(s.campaign!.repositoryCount,25);assert.ok(!healthyEnough(s));assert.equal(chapterIndex(s),2);
 assert.match(chapterGoal(s),/25 repos reached.*80% needed.*Chapter held/);
 const time=s.time;s.findings=[];s.nextBugAt=null;s=advance(s,.5);
 assert.equal(chapterIndex(s),3);assert.equal(s.campaign!.companyAt,time+.5);assert.match(chapterGoal(s),/25\/100 repos/);
 s=advance(s,500);assert.equal(s.campaign!.repositoryCount,100);assert.ok(!healthyEnough(s));assert.equal(chapterIndex(s),3);
 assert.match(chapterGoal(s),/100 repos reached.*Chapter held/);
 s.findings=[];s=advance(s,.5);assert.equal(chapterIndex(s),4);assert.ok(s.campaign!.handoverAt!=null);
 const milestones=[s.campaign!.companyAt,s.campaign!.handoverAt];
 s.findings=s.organization.repositories.map((r,i)=>({id:1000+i,serviceId:r.id,kind:'security',escalated:true,known:false,repairedAt:null,bornAt:s.time,title:'Fault',description:''}));
 s=advance(s,1);assert.ok(!healthyEnough(s));assert.equal(chapterIndex(s),4);assert.deepEqual([s.campaign!.companyAt,s.campaign!.handoverAt],milestones);
});

test('exactly 80 percent qualifies, while healthy smaller ecosystems cannot skip a count goal',()=>{
 let s=timelineFixture(540);s.findings=[];s.nextBugAt=null;s=advance(s,6);assert.equal(s.campaign!.repositoryCount,4);assert.ok(healthyEnough(s));assert.equal(chapterIndex(s),2);
 s=timelineFixture(1122);s.nextBugAt=null;
 s.findings=s.organization.repositories.map((r,i)=>({id:1000+i,serviceId:r.id,kind:'bug',known:true,repairedAt:null,bornAt:s.time,title:'Fault',description:''}));
 assert.ok(averageHealth(s)<80);s=advance(s,.5);assert.equal(chapterIndex(s),2);
 // Local defects in leaf repositories allow an exact aggregate boundary without rounding.
 s.findings=[];
 const leaves=s.organization.repositories.filter(r=>!s.organization.repositories.some(other=>other.dependencies.includes(r.id)));
 for(let i=0;i<25;i++)for(let j=0;j<4;j++)s.findings.push({id:2000+i*4+j,serviceId:leaves[i].id,kind:'bug',known:true,repairedAt:null,bornAt:s.time,title:'Fault',description:''});
 assert.equal(averageHealth(s),80);s=advance(s,.5);assert.equal(chapterIndex(s),4);
 assert.ok(s.campaign!.companyAt!=null&&s.campaign!.handoverAt!=null);
 assert.deepEqual(advance(advance(s,.5),.5),advance(s,1));
});
