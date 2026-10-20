import {useLayoutEffect, useState} from 'react';
import {type Purchase, type V3State} from './v3Game.ts';

export function SupplyProp({kind}: {kind: Purchase}) {
  return <svg className="v3-supply-prop" viewBox="0 0 100 76" aria-hidden="true">
    <ellipse cx="50" cy="68" rx="41" ry="5" fill="#0005"/>
    {kind === 'system' && <g>
      <path d="M16 35L31 27H83L76 36V65H16Z" fill="#4b4930" stroke="#b5a773" strokeWidth="2"/>
      <path d="M16 43H76M16 56H76M24 36V65M67 36V65" stroke="#9a895b" strokeWidth="3"/>
      {[{x: 24, y: 19}, {x: 47, y: 22}, {x: 40, y: 4}].map((p, i) => <g key={i} transform={`translate(${p.x} ${p.y})`}><path d="M0 6L7 0H25L18 6V25H0Z" fill="#bfd0a3" stroke="#3e563c" strokeWidth="2"/><path d="M18 6L25 0V19L18 25Z" fill="#708f62"/></g>)}
    </g>}
    {kind === 'developer' && <g>
      <path d="M41 47L35 65M55 47L61 65" stroke="#d0dac7" strokeWidth="7" strokeLinecap="round"/>
      <path d="M49 31V48" stroke="#bf9255" strokeWidth="23" strokeLinecap="round"/>
      <path d="M39 33L30 43M59 33L68 23" stroke="#e2c7a3" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="49" cy="18" r="10" fill="#e2c7a3"/><path d="M37 15Q47 -1 61 15H37Z" fill="#c1d3ab"/><path d="M59 15H66" stroke="#c1d3ab" strokeWidth="4"/>
      <path d="M73 52V65M67 58H79" stroke="#d7cc9b" strokeWidth="3"/>
    </g>}
    {kind === 'recon' && <g>
      <path d="M24 38H76L81 65H19Z" fill="#426653" stroke="#bed1a9" strokeWidth="2"/><path d="M42 38V24H58V38" fill="#7a9574"/>
      <circle cx="50" cy="23" r="21" fill="#193f32" stroke="#bdd7a8" strokeWidth="3"/><circle cx="50" cy="23" r="12" fill="none" stroke="#718d65"/><path d="M50 23V4L64 10Z" fill="#a5d49b"/><circle cx="50" cy="23" r="3" fill="#eddfac"/>
      <rect x="32" y="48" width="36" height="11" rx="2" fill="#142c23"/><path d="M38 53H61" stroke="#c7dda7"/>
    </g>}
    {kind === 'plus' && <g>
      <path d="M19 19L27 12H80V62L73 68H19Z" fill="#536c51" stroke="#b3c49b" strokeWidth="2"/>
      {[23, 37, 51].map(y => <g key={y}><rect x="26" y={y} width="40" height="10" rx="2" fill="#182d23"/><path d={`M31 ${y + 5}H53`} stroke="#c3dea2" strokeWidth="2"/><circle cx="60" cy={y + 5} r="2" fill="#ead09a"/></g>)}
      <path d="M75 12V68M36 7H59" stroke="#c5d4a8" strokeWidth="3"/>
    </g>}
  </svg>;
}

type Flight = {id: number; x: number; y: number; tx: number; ty: number};
export function IncomeCoins({state, reduced}: {state: V3State; reduced: boolean}) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const recent = state.systems.filter(n => n.installedAt !== null && n.installedAt > 0 && state.time - n.installedAt < 1.2);
  const key = recent.map(n => n.id).join(',');
  useLayoutEffect(() => {
    const target = document.querySelector('.v3-income')?.getBoundingClientRect();
    const points: Flight[] = [];
    if (target) for (const n of recent) {
      const el = document.querySelector<SVGGraphicsElement>(`[data-v3-system="${n.id}"]`);
      const matrix = el?.getScreenCTM();
      if (matrix) {const p = new DOMPoint(36, 8).matrixTransform(matrix); points.push({id: n.id, x: p.x, y: p.y, tx: target.x + target.width / 2, ty: target.y + 30});}
    }
    setFlights(points);
    // Capture the release position once. The flight stays in screen space when the board pans.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <svg className="v3-coin-layer" aria-hidden="true">{recent.map(n => {
    const f = flights.find(f => f.id === n.id); if (!f) return null;
    const t = Math.min(1, (state.time - n.installedAt!) / 1.2);
    return <g key={n.id} data-income-coin={n.id} transform={`translate(${reduced ? f.tx : f.x + (f.tx - f.x) * t} ${reduced ? f.ty : f.y + (f.ty - f.y) * t - Math.sin(Math.PI * t) * 65})`} opacity={t > .85 ? (1 - t) / .15 : 1}>
      <circle r="10" fill="#e6c46e" stroke="#6a5123" strokeWidth="2"/><path d="M0 -5V5M-3 -3H3M-3 3H3" stroke="#7a5b22" strokeWidth="2"/>
      {reduced && <text x="15" y="5">System earning</text>}
    </g>;
  })}</svg>;
}
