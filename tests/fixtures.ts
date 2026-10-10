import {advance,newGame,RULES} from '../src/game.ts';
/** Prepared milestone fixtures for isolated campaign/queue tests, not a playable strategy. */
export function timelineFixture(at:number,seed=1){
 let s=newGame(seed);
 if(at<180)return advance(s,at);
 s=advance(s,179.5);s.healthyTime=RULES.resultAt;s=advance(s,.5);
 if(at<540)return advance(s,at-180);
 s=advance(s,359.5);s.healthyTime=RULES.resultAt+360;s=advance(s,.5);
 return advance(s,at-540);
}
