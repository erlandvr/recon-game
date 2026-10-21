import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3, buyV3, featuresAvailable, newV3, pauseV3, startV3, V3, type V3State} from '../src/v3Game.ts';
import {advanceGuidance, dismissGuidance, guidanceCandidates, newGuidance, purchaseReceipt, selectGuidance} from '../src/v3Guidance.ts';
function until(s: V3State, condition: (s: V3State) => boolean) {
  for (let i = 0; i < 2000 && !condition(s); i++) s = advanceV3(s, .05);
  assert.ok(condition(s)); return s;
}
test('First build remains available after hiring first; receipts are independent of hidden guidance', () => {
  let s = startV3(newV3()); assert.equal(selectGuidance(s)?.id, 'first');
  s = buyV3(s, 'developer'); assert.equal(selectGuidance(s), null); // insufficient cash for a system
  assert.equal(purchaseReceipt(s, 'developer'), 'Hired · −55 cr');
  s = advanceV3(s, 5); assert.equal(selectGuidance(s)?.id, 'first');
  assert.equal(selectGuidance(s, dismissGuidance(s, newGuidance())), null);
  s = buyV3(s, 'system'); assert.equal(purchaseReceipt(s, 'system'), 'Ordered · −45 cr');
  assert.equal(selectGuidance(s, {...newGuidance(), hidden: true}), null);
  assert.equal(purchaseReceipt(s, 'system'), 'Ordered · −45 cr');
});
test('First build follows actual work through installation and earns four seconds before hiring advice', () => {
  let s = advanceV3(startV3(newV3()), 6); s = buyV3(s, 'system');
  assert.equal(selectGuidance(s)?.id, 'build'); assert.equal(selectGuidance(s)?.bench, 0);
  s = until(s, s => s.developers[0].phase === 'delivery'); assert.equal(selectGuidance(s)?.worker, 0);
  s = until(s, s => s.systems[1].installed); s.cash = 200;
  s = buyV3(s, 'system'); assert.equal(selectGuidance(s)?.id, 'installed');
  s.systems.forEach(n => n.threshold = 9999); // Isolate the installation lesson from the scheduled outage.
  let p = advanceGuidance(s, newGuidance());
  s = advanceV3(s, 2); p = advanceGuidance(s, p); assert.equal(selectGuidance(s, p)?.focus, 'income');
  // Isolate confirmation exposure from the unrelated scheduled first failure.
  s.systems.forEach(n => n.threshold = 9999);
  s = advanceV3(s, 2); p = advanceGuidance(s, p);
  assert.notEqual(selectGuidance(s, p)?.id, 'installed');
  s = buyV3(s, 'system'); assert.equal(selectGuidance(s, p)?.id, 'hire');
  s.cash = 54; assert.equal(guidanceCandidates(s, p).some(h => h.id === 'hire'), false);
});
test('First ordinary failure interrupts teaching, not construction; resumed hints describe current state', () => {
  let s = buyV3(startV3(newV3()), 'system'); let p = advanceGuidance(s, newGuidance());
  s = advanceV3(s, 2); s.systems[0].hazard = 1; s = advanceV3(s, .05); p = advanceGuidance(s, p);
  assert.equal(s.developers[0].phase, 'assembly'); assert.equal(selectGuidance(s,p)?.id, 'failure');
  assert.match(selectGuidance(s,p)!.text, /finish their current job/);
  s = until(s, s => s.systems[1].installed); p = advanceGuidance(s,p);
  assert.equal(selectGuidance(s,p)?.id, 'installed');
  assert.equal(p.viewed.installed, undefined);
});
test('Outcome exposure does not expire behind P1 or while paused; replay resets hiding and progress', () => {
  let s = until(buyV3(startV3(newV3()), 'system'), s => s.systems[1].installed);
  let p = advanceGuidance(s, newGuidance()); s = advanceV3(s, 1); p = advanceGuidance(s,p);
  const exposure = p.viewed.installed;
  s.jobs.push({id:s.nextJob++,type:'repair',system:0,owner:null,progress:0,at:s.time,priority:'p1'});
  p = advanceGuidance(s,p); assert.equal(p.active,'p1');
  s = advanceV3(s, 3); p = advanceGuidance(s,p); assert.equal(p.viewed.installed,exposure);
  s = pauseV3(s); p = advanceGuidance(s,p); const held = structuredClone(p.viewed);
  p = advanceGuidance(advanceV3(s,50),p); assert.deepEqual(p.viewed,held);
  p.hidden = true; assert.deepEqual(advanceGuidance(newV3(),p),newGuidance());
});
test('Feature release follows the first purchased installation, never hints, and no-purchase play stays valid', () => {
  let s = advanceV3(startV3(newV3()), 60);
  assert.equal(featuresAvailable(s),false); assert.equal(s.metrics.features,0); assert.equal(s.metrics.featuresTaken,0);
  s = buyV3(s,'system'); s = until(s,s=>s.systems[1].installed);
  assert.equal(s.featuresAvailableAt,s.systems[1].installedAt!+4);
  s = advanceV3(s,3.95); assert.equal(featuresAvailable(s),false); assert.equal(s.metrics.featuresTaken,0);
  const hidden = {...newGuidance(),hidden:true}; selectGuidance(s,hidden);
  const released = advanceV3(s,.05); assert.equal(featuresAvailable(released),true);
  assert.equal(featuresAvailable(advanceV3(pauseV3(s),50)),false);
  assert.equal(newV3().featuresAvailableAt,null);
});
test('Recon taught on the first real repair, including early purchase; a completed repair has truthful recap', () => {
  let s = startV3(newV3()); s.cash = V3.reconCost; s=buyV3(s,'recon');
  assert.equal(s.firstReconRepair,null); assert.equal(guidanceCandidates(s).some(h=>h.id==='recon-repair'),false);
  s=advanceV3(s,22); assert.equal(s.firstReconRepair?.system,0);
  const p = {...newGuidance(),dismissed:['failure','first']};
  assert.equal(selectGuidance(s,p)?.id,'recon-repair'); assert.match(selectGuidance(s,p)!.title,/is handling/);
  s=advanceV3(s,5); assert.match(selectGuidance(s,p)!.title,/has handled/);
  assert.equal(newV3().firstReconRepair,null);
});
test('Saving route can discover Recon after maintenance; Plus needs a real bottleneck; no lessons after win', () => {
  let s = advanceV3(startV3(newV3()),22); s.cash=600;
  const p = {...newGuidance(),dismissed:['failure']}; assert.equal(selectGuidance(s,p)?.id,'recon');
  s=buyV3(s,'recon'); assert.equal(guidanceCandidates(s).some(h=>h.id==='plus'),false);
  s.jobs.push({id:s.nextJob++,type:'repair',system:0,owner:null,progress:0,at:s.time});
  assert.equal(guidanceCandidates(s).some(h=>h.id==='plus'),true);
  s.cash=1201; s=advanceV3(s,.05); assert.equal(s.status,'won'); assert.equal(selectGuidance(s,p),null);
});
