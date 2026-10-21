import {type V3State} from './v3Game.ts';
import {coffeePosition, coffeeVisit} from './v3Coffee.ts';

function Cup({x = 0, y = 0}: {x?: number; y?: number}) {
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cy="1" rx="6" ry="1.5" fill="#c9bd93"/>
    <path d="M3 -6C9 -8 9 -1 3 -2" fill="none" stroke="#e9dfc5" strokeWidth="1.5"/>
    <path d="M-4 -8H4L3 0H-3Z" fill="#f4ead2" stroke="#b9ac87" strokeWidth=".6"/>
    <ellipse cy="-7.5" rx="3.5" ry="1" fill="#65442d"/>
  </g>;
}

export default function V3Coffee({state, reduced}: {state: V3State; reduced: boolean}) {
  const visit = coffeeVisit(state);
  if (!visit) return null;
  const w = visit.waiter, serving = w?.serving;
  // Ease the final cup off the tray onto the right corner of the desk.
  const progress = serving ? Math.max(0, Math.min(1, (serving.progress - .15) / .65)) : 0;
  const eased = progress * progress * (3 - 2 * progress);
  const cupStart = w ? {x: w.position.x - 33 + (w.remaining - 1) * 10, y: w.position.y - 23} : {x: 0, y: 0};
  const cupEnd = serving ? coffeePosition(serving.desk) : cupStart;
  const cupX = cupStart.x + (cupEnd.x - cupStart.x) * eased;
  const cupY = cupStart.y + (cupEnd.y - cupStart.y) * eased - Math.sin(Math.PI * eased) * 5;
  return <g className="v3-coffee-visit" aria-hidden="true" pointerEvents="none">
    {visit.delivered.map(desk => <g key={desk} data-coffee-desk={desk}><Cup {...coffeePosition(desk)}/></g>)}
    {reduced && serving && progress === 1 && <g data-coffee-desk={serving.desk}><Cup {...cupEnd}/></g>}
    {!reduced && w && <>
      <g data-coffee-waiter data-serving={serving?.desk} data-walking={w.walking} transform={`translate(${w.position.x} ${w.position.y})`}>
        <ellipse cy="3" rx="12" ry="3.5" fill="#0006"/>
        <g transform={`scale(${w.facing === -1 ? 1 : -1} 1)`} className={w.walking ? 'v3-walking' : undefined} data-loaded="true">
          <g transform="translate(-3 -8)"><g className="v3-worker-leg v3-worker-leg-back"><path d="M0 0L-1 4L-2 8" fill="none" stroke="#6f7a72" strokeWidth="3.5" strokeLinecap="round"/><path d="M-4 8H0" stroke="#9aa38e" strokeWidth="3" strokeLinecap="round"/></g></g>
          <g transform="translate(3 -8)"><g className="v3-worker-leg v3-worker-leg-front"><path d="M0 0L1 4L2 8" fill="none" stroke="#89968b" strokeWidth="3.5" strokeLinecap="round"/><path d="M0 8H4" stroke="#c3c8af" strokeWidth="3" strokeLinecap="round"/></g></g>
          <g className="v3-worker-body">
            <path d="M0 -19V-8" stroke="#efe6cf" strokeWidth="11" strokeLinecap="round"/>
            <path d="M-4 -22L0 -19L4 -22V-10H-4Z" fill="#384942"/>
            <path d="M-4 -12H4L5 -5H-5Z" fill="#e2ddc9"/>
            <circle cy="-28" r="5.8" fill="#cba17b"/>
            <path d="M-6 -29Q-5 -37 4 -34L6 -29Q1 -33 -6 -29" fill="#414233"/>
            <circle cx="-2" cy="-28.5" r=".65" fill="#493a2c"/><circle cx="2" cy="-28.5" r=".65" fill="#493a2c"/>
            <path d="M-2 -25.5Q0 -23 2 -25.5" fill="none" stroke="#493a2c" strokeWidth=".8" strokeLinecap="round"/>
            <path d="M-3 -22L0 -21L3 -22V-19L0 -20L-3 -19Z" fill="#b98369"/>
            <path d="M-4 -18L-11 -17L-20 -23" fill="none" stroke="#cba17b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={serving ? `M4 -18L-7 -15L${cupX - w.position.x + 4} ${cupY - w.position.y - 3}` : 'M4 -18L8 -12L4 -10'} fill="none" stroke="#cba17b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <path d="M-40 -22H1" stroke="#dcc28b" strokeWidth="2.5" strokeLinecap="round"/>
          {Array.from({length: w.remaining - (serving ? 1 : 0)}, (_, i) => <Cup key={i} x={-33 + i * 10} y={-23}/>)}
        </g>
      </g>
      {serving && <Cup x={cupX} y={cupY}/>}
    </>}
  </g>;
}
