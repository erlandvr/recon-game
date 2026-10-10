import { RULES, health, healthyEnough, type GameState } from './game.ts';

export default function HealthMetric({state:s}:{state:GameState}) {
  const failed=!healthyEnough(s);
  return <div className={`health-metric ${failed?'health-failed':''}`}>
    <dt>Ecosystem health</dt>
    <dd className={failed?'failure-text':'sage-text'}>{health(s)}<small>%</small></dd>
    <div className="health-status" role="status" aria-live="polite" aria-atomic="true">{failed&&<><strong>System failure</strong><span className="health-reason">Goal time held · need {RULES.healthyThreshold}%</span><span className="health-reason-compact">Goal held · &lt;{RULES.healthyThreshold}%</span></>}</div>
  </div>;
}
