import { healthyEnough, income, RULES, type GameState } from './game.ts';

export default function IncomeMetric({state:s}:{state:GameState}) {
  const failed=!healthyEnough(s), reduction=Math.round((1-RULES.failureIncomeMultiplier)*100);
  return <div className="income-metric">
    <dt>Income{failed&&<small className="income-penalty" title={`Income reduced by ${reduction}% below ${RULES.healthyThreshold}% health`} aria-label={`reduced by ${reduction}% during system failure`}> −{reduction}%</small>}</dt>
    <dd className={failed?'failure-text':undefined}>{income(s).toFixed(2)}<small> cr/s</small></dd>
  </div>;
}
