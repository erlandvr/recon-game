import {useEffect, useState} from 'react';
import Modal from './Modal.tsx';
import {Mechanic} from './V3Board.tsx';
import {SupplyProp} from './V3WorkshopProps.tsx';
import {V3, purchaseInfo, type V3State} from './v3Game.ts';

// Separate presentation clock: never advances the frozen simulation or score.
export function useV3Celebration(won: boolean, reduced: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!won) {setElapsed(0); return;}
    let time = 0, previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now(); if (!document.hidden) time += (now - previous) / 1000; previous = now;
      setElapsed(Math.min(6, time)); if (time >= 6) clearInterval(timer);
    }, 50);
    function visibility() {previous = performance.now();}
    document.addEventListener('visibilitychange', visibility);
    return () => {clearInterval(timer); document.removeEventListener('visibilitychange', visibility);};
  }, [won]);
  return won ? reduced ? 6 : elapsed : null;
}
export function VictoryCrew({state, celebration, reduced, hidden}: {state: V3State; celebration: number | null; reduced: boolean; hidden: boolean}) {
  return <svg className="v3-victory-crew" viewBox="0 0 370 160" role="img" aria-label={`${state.developers.length} developers celebrating. Tools and carried systems are set down; your result is frozen.`} data-reduced={reduced} data-hidden={hidden}>
    <ellipse cx="185" cy="143" rx="175" ry="12" fill="#6d714d33"/>
    <path d="M15 15Q185 54 355 15" stroke="#7d8d66" fill="none"/>
    {[40, 100, 160, 220, 280, 340].map((x, i) => <path key={x} d={`M${x - 7} ${i === 0 || i === 5 ? 20 : 29}l14 2l-7 13Z`} fill={i % 2 ? '#b4c89d' : '#d9bd7a'}/>)}
    {state.developers.map((w, i) => <g key={w.id} transform={`translate(${185 + (i - (state.developers.length - 1) / 2) * 82} 138) scale(1.35)`}>
      <Mechanic worker={w} time={state.time} celebration={celebration} position={{x: 0, y: 0}}/>
    </g>)}
  </svg>;
}
export function V3Help({state, onClose, onResume}: {state: V3State; onClose: () => void; onResume: () => void}) {
  const items = [
    {kind: 'system' as const, title: 'Build income', text: 'Pay 45 cr to queue a system. A developer builds, carries and installs it. It then earns 3 cr/s.'},
    {kind: 'developer' as const, title: 'Hire capacity', text: 'Pay 55 cr for another developer. Each costs 0.35 cr/s, including travel and repairs. When the queue is clear, developers build blue features from the shared backlog. Each feature finishes at the desk and adds 0.25 cr/s to a random installed system. Builds and repairs pause features with progress saved. A P1 fire interrupts work: one developer repairs it, then resumes with progress saved.'},
    {kind: 'recon' as const, title: 'Hand over repairs', text: `Broken systems earn nothing. Repairs are automatic. Recon costs ${V3.reconCost} cr and takes one repair at a time. Free bays take P1 first, freeing developers for building.`},
    {kind: 'plus' as const, title: 'Open three bays', text: `After Recon, pay ${V3.plusCost} cr for Plus. Three repairs can run at once. Existing developers still earn wages.`},
  ];
  return <Modal title="How the workshop works" className="v3-modal v3-help" onDismiss={onClose}>
    <p className="v3-help-goal">Reach 1,200 spendable credits as fast as you can.</p>
    <p>Spending moves the cash target backwards. You can invest, save, or win without Recon.</p>
    <div className="v3-help-items">{items.map(item => <div key={item.kind}><SupplyProp kind={item.kind}/><div><strong>{item.title}</strong><p>{item.text}</p></div></div>)}</div>
    <p className="v3-help-note">{state.status === 'paused' ? 'Time, wages and work are paused. Close help to shop while paused.' : 'Reading help does not consume run time.'} Below zero, work and wages continue; new purchases need enough cash.</p>
    {state.status === 'paused' && <button className="primary" onClick={onResume}>Resume experience</button>}<button onClick={onClose}>Close help</button>
  </Modal>;
}
export function RunRecap({state}: {state: V3State}) {
  const spent = state.purchases.reduce((sum, p) => sum + purchaseInfo(state, p.action).price, 0);
  return <div className="v3-run-recap"><span>Earned <b>{state.metrics.income.toFixed(0)} cr</b></span><span>Wages <b>{state.metrics.wages.toFixed(0)} cr</b></span><span>Invested <b>{spent} cr</b></span><span>Features completed <b>{state.metrics.features}</b></span><span>Repairs completed <b>{state.metrics.repairs}</b></span></div>;
}
