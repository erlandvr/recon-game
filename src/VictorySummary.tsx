import type { AutonomyVictory } from './campaign.ts';
import {MEDALS,finishTime} from './medals.ts';

export default function VictorySummary({victory:v}:{victory:AutonomyVictory}) {
 const medal=MEDALS.find(m=>m.id===v.medal)!;
 return <section className={`victory-summary medal-${v.medal}`} aria-label="Autonomy result">
  <div className="victory-award">
   <svg className="medal-seal" viewBox="0 0 96 116" aria-hidden="true"><path className="medal-ribbon" d="M20 64L13 110 35 99 48 113 50 69M46 69L48 113 62 99 83 110 76 64"/><circle cx="48" cy="43" r="36"/><circle className="medal-ring" cx="48" cy="43" r="28"/><path className="medal-symbol" d="m31 43 12 12 23-25"/></svg>
   <div><span className="victory-eyebrow">100 repositories · Fully autonomous</span><h3>{medal.name} medal{v.practice?' preview':''}</h3><p>{v.practice?'Practice run · includes the coached debug start.':'Your company runs itself. You earned this.'}</p></div>
  </div>
  <dl className="victory-time"><div><dt>Total time to autonomy</dt><dd><time>{finishTime(v.at)}</time><span>min : sec</span></dd></div></dl>
  <p className="victory-clock-note">Includes unhealthy time and the autonomy trial. Measured in game time at either speed.</p>
  <ul className="medal-thresholds" aria-label="Medal targets">{MEDALS.map(m=><li key={m.id} className={m.id===v.medal?'earned-medal':''} aria-current={m.id===v.medal?'true':undefined}><strong>{m.name}</strong><span>{Number.isFinite(m.through)?`≤ ${finishTime(m.through)}`:'Finish the game'}</span>{m.id===v.medal&&<small>{v.practice?'Preview':'Earned'}</small>}</li>)}</ul>
 </section>;
}
