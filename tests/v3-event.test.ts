import test from 'node:test';
import assert from 'node:assert/strict';
import {RECON, SYSTEM_SPOTS, workRoute, positionOnPath, pathLength, WORLD} from '../src/v3World.ts';

test('V3.4: fixed islands leave at least 45 units between every machine and Recon housing', () => {
  for (const p of SYSTEM_SPOTS) assert.ok(Math.abs(p.x - RECON.x) - 26 - 78 >= 45);
  for (const p of SYSTEM_SPOTS) {assert.ok(p.x > 60); assert.ok(p.y >= 60); assert.ok(p.y + 75 < WORLD.height);}
});
test('V3.4: loaded paths clear the radar and bays, including the western crossing', () => {
  for (let w = 0; w < 4; w++) for (let n = 0; n < 12; n++) {
    const path = workRoute(w,n);
    for (let i = 0; i <= pathLength(path); i += 2) {
      const p = positionOnPath(path, i / pathLength(path));
      // Conservative loaded silhouette: body + back-mounted machine, including lean.
      const overlaps = p.x + 54 > RECON.x - 78 && p.x - 54 < RECON.x + 78 && p.y + 5 > 65 && p.y - 120 < 381;
      assert.equal(overlaps,false,`route ${w}/${n} at ${JSON.stringify(p)}`);
    }
  }
});
