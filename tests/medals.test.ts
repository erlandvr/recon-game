import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MEDALS,medalForTime,finishTime} from '../src/medals.ts';
import {advance,newGame,act} from '../src/game.ts';
import {debugGame} from '../src/debug.ts';

test('medal cutoffs are inclusive and compare the full elapsed time',()=>{
 assert.equal(MEDALS[0].through,1500);assert.equal(MEDALS[1].through,1800);
 for(const [seconds,medal] of [[1313.5,'gold'],[1499.5,'gold'],[1500,'gold'],[1500.5,'silver'],[1800,'silver'],[1800.5,'bronze'],[7200,'bronze']] as const)assert.equal(medalForTime(seconds),medal);
 assert.equal(finishTime(1500),'25:00');assert.equal(finishTime(1500.5),'25:01');assert.equal(finishTime(3599.5),'60:00');
 for(const seconds of [-1,NaN,Infinity])assert.throws(()=>medalForTime(seconds),RangeError);
});
test('debug starts are practice; fresh runs are eligible; victory snapshots never change afterwards',()=>{
 assert.equal(newGame().practice,false);assert.equal(debugGame('backend',1).practice,false);
 let s=advance(debugGame('autonomy',1),180);const victory=structuredClone(s.campaign!.autonomy.victory!);
 assert.equal(victory.practice,true);assert.equal(victory.medal,medalForTime(victory.at));
 s=advance(act(s,{type:'scan'}).state,600);assert.deepEqual(s.campaign!.autonomy.victory,victory);assert.ok(s.time>victory.at);
 assert.equal(newGame(s.organization.seed).practice,false);assert.equal(newGame().campaign,undefined);
});
