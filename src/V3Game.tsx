import {useEffect, useRef, useState} from 'react';
import Brand from './Brand.tsx';
import Modal from './Modal.tsx';
import StartCountdown from './StartCountdown.tsx';
import V3Board from './V3Board.tsx';
import {IncomeCoins, SupplyProp} from './V3WorkshopProps.tsx';
import {advanceV3, buyV3, earnings, newV3, pauseV3, purchaseInfo, startV3, V3, type Purchase, type V3State} from './v3Game.ts';
import {useV3Guidance} from './V3Guidance.tsx';
import {RunRecap, useV3Celebration, VictoryCrew} from './V3Presentation.tsx';
import './v3-game.css';

const purchases: {id: Purchase; title: string; detail: string}[] = [
  {id: 'system', title: 'Build system', detail: 'Earn 3/s after installation'},
  {id: 'developer', title: 'Hire developer', detail: 'Wage: 0.35/s each'},
  {id: 'recon', title: 'Buy Recon', detail: 'Repairs 1 system at a time'},
  {id: 'plus', title: 'Upgrade to Plus', detail: 'Repairs 3 systems at once'},
];
export const v3Time = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}.${Math.round(seconds * 100 % 100).toString().padStart(2, '0')}`;
export default function V3Game() {
  const [state, setState] = useState(() => newV3());
  const current = useRef(state), previous = useRef(performance.now()), pending = useRef(0);
  const [countdown, setCountdown] = useState(false), [restartOpen, setRestartOpen] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(preference.matches);
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);
  const visible = useRef(!document.hidden);
  const tickRef = useRef<() => void>(() => {});
  function update(next: V3State) {current.current = next; setState(next);}
  useEffect(() => {
    function tick() {
      const now = performance.now(), elapsed = now - previous.current; previous.current = now;
      if (!visible.current || current.current.status !== 'running') return;
      pending.current += Math.max(0, elapsed);
      const steps = Math.min(200, Math.floor((pending.current + 1e-6) / (V3.step * 1000)));
      if (steps) {pending.current -= steps * V3.step * 1000; update(advanceV3(current.current, steps * V3.step));}
    }
    tickRef.current = tick;
    function visibility() {tick(); visible.current = !document.hidden; previous.current = performance.now(); setHidden(document.hidden);}
    const interval = setInterval(tick, 50); document.addEventListener('visibilitychange', visibility);
    return () => {clearInterval(interval); document.removeEventListener('visibilitychange', visibility); tickRef.current = () => {};};
  }, []);
  function pause() {tickRef.current(); update(pauseV3(current.current));}
  function resume() {previous.current = performance.now(); update(startV3(current.current));}
  function closeRestart() {setRestartOpen(false); if (current.current.status === 'paused') resume();}
  function buy(action: Purchase) {
    tickRef.current();
    const next = buyV3(current.current, action);
    if (next !== current.current) {update(next);}
  }
  function reset() { pending.current = 0; previous.current = performance.now(); update(newV3()); setRestartOpen(false); setShowResult(true); setCountdown(false);}
  const {hint, dismiss} = useV3Guidance(state);
  const celebration = useV3Celebration(state.status === 'won', reduced);
  const income = earnings(state), available = state.developers.filter(w => w.phase === 'idle').length;
  const waiting = state.jobs.filter(j => j.owner === null).length;
  const automationReady = !purchaseInfo(state, 'recon').reason || !purchaseInfo(state, 'plus').reason;
  return <div className="v3-game" data-opening={state.status === 'ready' && !countdown} data-reduced={reduced} data-hidden={hidden} data-status={state.status} data-time={state.time} data-cash={state.cash}>
    <header className="v3-header"><Brand label="Active Animation" subtitle="Experience the Benefit of Recon" onClick={() => {if (!countdown) {pause(); setRestartOpen(true);}}}/><nav aria-label="Experience controls">
      <button disabled={countdown} onClick={() => {pause(); setRestartOpen(true);}}>Restart</button>
    </nav></header>
    <main id="v3-main" className="v3-main">
      <div className="v3-hud">
        <div className="v3-cash" data-negative={state.cash < 0}><span>Cash target</span><strong>{Math.floor(state.cash).toLocaleString('en-US')} <small>/ {V3.target.toLocaleString('en-US')} cr</small></strong><progress aria-label="Cash target progress" value={Math.max(0, state.cash)} max={V3.target}/></div>
        <div className="v3-income"><span>Net earnings</span><strong>{income.net >= 0 ? '+' : ''}{income.net.toFixed(2)}<small> /s</small></strong><small>{income.gross.toFixed(2)} income − {income.wages.toFixed(2)} wages</small></div>
        <div><span>Run time</span><strong className="v3-time">{v3Time(state.time)}</strong><small>{state.status === 'won' ? 'Result frozen' : state.status === 'paused' ? 'Paused · no time or costs' : hidden ? 'Tab hidden · clock held' : 'Reach the cash target'}</small></div>
        <div className="v3-capacity"><span>Developer capacity</span><strong>{available}<small> / {state.developers.length} free</small></strong><small>{state.developers.filter(w => w.feature && w.job !== null).length} on features · {waiting} queued · P1 first</small></div>
      </div>
      <V3Board key={state.status === 'ready' ? 'ready' : 'run'} state={state} reduced={reduced} hintSystem={hint?.system} celebration={celebration}/>
      <section className="v3-purchases" aria-label="Workshop purchases">{purchases.map(item => {
        const info = purchaseInfo(state, item.id);
        const count = item.id === 'system' ? {label: 'Systems', value: state.systems.length, max: V3.maxSystems, detail: 'Includes installed systems and queued builds'} : item.id === 'developer' ? {label: 'Developers', value: state.developers.length, max: V3.maxDevelopers, detail: 'Your total team, including busy developers'} : null;
        const spotlight = (item.id === 'recon' || item.id === 'plus') && !info.reason;
        return <button key={item.id} data-purchase={item.id} data-upgrade-ready={spotlight ? item.id : undefined} data-guided={!automationReady && hint?.target === item.id} disabled={!!info.reason} onClick={() => buy(item.id)} aria-label={`${item.title} · ${info.price} credits`} aria-describedby={count ? `v3-${item.id}-count` : undefined}>
          <SupplyProp kind={item.id}/>{spotlight && item.id === 'plus' && <svg className="v3-upgrade-sparks" viewBox="0 0 100 76" aria-hidden="true"><path d="M12 8L14 15L21 17L14 19L12 26L10 19L3 17L10 15Z"/><path d="M88 4L90 10L96 12L90 14L88 20L86 14L80 12L86 10Z"/><path d="M85 52L87 57L92 59L87 61L85 66L83 61L78 59L83 57Z"/></svg>}<span>{count && <span id={`v3-${item.id}-count`} className="v3-purchase-count" title={count.detail}><span>{count.label}</span><b>{count.value}/{count.max}</b></span>}<strong>{item.title} <b>{info.price} cr</b></strong><small>{item.detail}</small><small className="v3-affordability">{info.reason ?? (spotlight ? item.id === 'plus' ? 'Unlock all 3 bays ✦' : 'Ready to automate' : state.status === 'paused' ? 'Buy while paused' : 'Available')}</small></span>
        </button>;
      })}</section>
      <footer className="v3-footer" data-hint={hint?.id ?? ''}>
        <div role="status" aria-live="polite" aria-atomic="true">{state.cash < 0 ? <><strong>Balance below zero</strong><span>Work and wages continue. New purchases need enough cash.</span></> : hint ? <><strong>{hint.title}</strong><span>{hint.text}</span></> : <span>{state.status === 'won' ? 'Cash target reached. Your finish time is final.' : state.status === 'paused' ? 'Plan your purchases, then resume when ready.' : 'Reach 1,200 spendable credits. Build, hire, automate — or save.'}</span>}</div>
        {hint && state.cash >= 0 && <button className="v3-dismiss-hint" onClick={dismiss} aria-label="Dismiss hint">×</button>}
        {state.status === 'won' && <button onClick={() => setShowResult(true)}>View result</button>}
      </footer>
    </main>
    <IncomeCoins state={state} reduced={reduced}/>
    {state.status === 'ready' && !countdown && !restartOpen && <Modal title="Recon — Active Animation" onDismiss={() => {}} className="v3-modal v3-opening">
      <p className="v3-opening-slogan">Experience the Benefit of Recon</p>
      <p>Build your team, keep systems running, and discover what automation makes possible.</p>
      <p className="v3-goal">Reach <strong>1,200 credits</strong><br/>as fast as you can.</p>
      <div className="v3-opening-explanation">
        <p><strong>Build and earn.</strong> Buy systems to generate income. Hire developers to build faster, but remember their wages.</p>
        <p><strong>Keep things running.</strong> Failures stop a system’s income and pull developers away from building. P1 fires interrupt their current work.</p>
        <p><strong>Let Recon handle repairs.</strong> Free your developers to build new systems and blue features that increase system income.</p>
      </div>
      <button className="primary" autoFocus onClick={() => {previous.current = performance.now(); setCountdown(true);}}>Start experience</button>
    </Modal>}
    {countdown && <StartCountdown theme="workshop" goLabel="REACH THE CASH TARGET" focusSelector="[data-purchase='system']" reducedMotion={reduced} onGo={resume} onDone={() => setCountdown(false)}/>}
    {state.result && showResult && !restartOpen && <Modal title="Peak productivity reached!" className="v3-modal v3-results" onDismiss={() => setShowResult(false)}>
      <div className="v3-result-hero"><div><p className="v3-result-time">{v3Time(state.result.at)}</p><p>1,200 credits reached.<br/>Your finish time is frozen.</p></div><VictoryCrew state={state} celebration={celebration} reduced={reduced} hidden={hidden}/></div>
      <dl className="v3-recap"><div><dt>Systems installed</dt><dd>{state.result.installed}</dd></div><div><dt>Developers hired</dt><dd>{state.result.developers - 1}</dd></div><div><dt>Automation</dt><dd>{state.result.recon === 3 ? 'Recon Plus' : state.result.recon ? 'Recon' : 'None'}</dd></div></dl>
      <RunRecap state={state}/>
      <button className="primary" onClick={reset}>Play again</button><button onClick={() => setShowResult(false)}>Inspect workshop</button>
    </Modal>}
    {restartOpen && <Modal title="Start a fresh workshop?" className="v3-modal" onDismiss={closeRestart}><p>Your current workshop is held while you decide. A fresh run resets cash, systems and time.</p><button className="primary" onClick={reset}>Start fresh</button><button onClick={closeRestart}>Keep this workshop</button></Modal>}
  </div>;
}
