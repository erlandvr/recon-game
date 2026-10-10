import {autonomyStatus,type GameState} from './game.ts';
export default function AutonomyProgress({state:s}:{state:GameState}){
 const a=autonomyStatus(s),trial=s.campaign!.autonomy;
 const reset=trial.lastReset&&s.time-trial.lastReset.at<12?trial.lastReset:null;
 const detail=reset?`Trial reset: ${reset.reason}`:a.covered<100?`${100-a.covered} still need automation`:a.reason??'Hands off · automatic work is proving itself';
 return <div className="chapter-goal autonomy-progress" aria-label="Autonomy progress">
  <div><strong>{a.covered}/100 fully automated</strong><span>{Math.min(60,a.elapsed)}/60s trial</span></div>
  <progress aria-label="Continuous autonomy trial" max={60} value={Math.min(60,a.elapsed)}/>
  <span className={reset?'trial-reset':''} role="status">{detail}</span>
 </div>;
}
