import {useEffect, useRef, useState} from 'react';

export const orientationSteps = [
  {id: 'systems', text: 'Your ecosystem', duration: 3000},
  {id: 'developers', text: 'This is where your developers work.', duration: 2000},
  {id: 'purchases', text: 'These are your game controls.', duration: 2000},
] as const;

export function useOrientation(ready: boolean, held: boolean, onComplete: () => void) {
  const [step, setStep] = useState(0), [restart, setRestart] = useState(0);
  const complete = useRef(onComplete); complete.current = onComplete;
  useEffect(() => {if (!ready) setStep(0);}, [ready]);
  useEffect(() => {
    if (!ready || held) return;
    const timer = window.setTimeout(() => {
      if (step === orientationSteps.length - 1) complete.current();
      else setStep(n => n + 1);
    }, orientationSteps[step].duration);
    return () => clearTimeout(timer);
  }, [ready, held, step, restart]);
  return {step, reset: () => {setStep(0); setRestart(n => n + 1);}};
}

export function OrientationSpotlight({step}: {step: number}) {
  if (step === 2) return null;
  const systems = step === 0;
  const cutout = systems ? 'M28 8H752Q774 8 774 30V488Q774 510 752 510H28Q6 510 6 488V30Q6 8 28 8Z' : 'M815 38H1000V430H815Z';
  const x = systems ? 275 : 355, y = systems ? 430 : 60;
  return <g className="v3-orientation-spotlight" aria-hidden="true">
    <path d={`M0 0H1180V535H0Z ${cutout}`} fillRule="evenodd" fill="#080c07" opacity=".72"/>
    <path d={cutout} fill="none" stroke="#b4d5ab" strokeWidth="4" vectorEffect="non-scaling-stroke"/>
    <path d={systems ? 'M390 492V510' : 'M790 91H814'} stroke="#b4d5ab" strokeWidth="3"/>
    <rect x={x} y={y} width={systems ? 230 : 435} height="62" rx="6" fill="#151b13" stroke="#b4d5ab" strokeWidth="2"/>
    <text x={x + 18} y={y + 39} className="v3-orientation-label">{orientationSteps[step].text}</text>
  </g>;
}

export function OrientationCaption({step}: {step: number}) {
  return <div className={step === 2 ? 'v3-controls-pointer' : 'v3-orientation-announcement'} role="status" aria-live="polite" aria-atomic="true" data-tour-caption={orientationSteps[step].id}>{orientationSteps[step].text}</div>;
}
