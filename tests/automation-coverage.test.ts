import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fullyAutomated} from '../src/game.ts';
import {scopeRepositories} from '../src/organization.ts';
import {timelineFixture} from './fixtures.ts';

test('gold coverage requires scans and fixes for every member; empty and partial groups never qualify',()=>{
 const s=timelineFixture(240),ids=['backend','auth','frontend'];
 assert.equal(fullyAutomated(s,[]),false);
 s.campaign!.automated=[...ids];assert.equal(fullyAutomated(s,ids),false);
 s.campaign!.remediation=['backend'];assert.equal(fullyAutomated(s,['backend']),true);assert.equal(fullyAutomated(s,ids),false);
 s.campaign!.remediation=[...ids];assert.equal(fullyAutomated(s,ids),true);
 // Health is independent of installed automation coverage.
 assert.ok(s.findings.some(f=>f.repairedAt===null));assert.equal(fullyAutomated(s,ids),true);
});
test('a newly connected unautomated group member removes the group completion marker',()=>{
 const s=timelineFixture(180),scope={level:'module' as const,id:s.organization.repositories[0].moduleId};
 const ids=scopeRepositories(s,scope);s.campaign!.automated=[...ids];s.campaign!.remediation=[...ids];assert.equal(fullyAutomated(s,ids),true);
 s.campaign!.repositoryCount=5;s.campaign!.connected=true;
 assert.equal(fullyAutomated(s,scopeRepositories(s,scope)),false);
});
