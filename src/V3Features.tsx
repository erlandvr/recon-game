import {V3, type V3State} from './v3Game.ts';
import {BACKLOG} from './v3World.ts';

export function FeaturePiece({card = false}: {card?: boolean}) {
  return <g className="v3-feature-piece" data-feature-piece={card ? 'card' : 'module'}>
    <rect x="-16" y={card ? -22 : -18} width="32" height={card ? 42 : 36} rx="3"/>
    {card ? <path d="M-9 -13H9M-9 -6H9M-9 1H3"/> : <><path d="M-8 0H8M0 -8V8"/><path d="M-10 -22V-18M0 -22V-18M10 -22V-18M-10 18V22M0 18V22M10 18V22"/></>}
  </g>;
}
export default function V3Features({state}: {state: V3State}) {
  const active = state.developers.filter(w => w.feature && w.job !== null).length;
  return <g className="v3-backlog" data-feature-backlog transform={`translate(${BACKLOG.x} ${BACKLOG.y})`}>
    <title>Shared feature backlog. All developers collect from the top. New items keep arriving. Features completed at a desk add {V3.featureIncome} credits per second to a random installed system. Builds and repairs pause feature work.</title>
    <text y="-43" textAnchor="middle" className="v3-backlog-heading">FEATURE BACKLOG</text>
    <text y="-24" textAnchor="middle" className="v3-backlog-caption">Collect from the top</text>
    <path d="M-68 -8H68V325H-68Z" fill="#202a2d" stroke="#485b62" strokeWidth="2"/>
    {Array.from({length: 6}, (_, i) => <g key={i} data-backlog-card={i} transform={`translate(0 ${i * 48})`}>
      <rect x="-59" width="118" height="41" rx="4" fill={i === 0 ? '#3d535d' : '#2c3b42'} stroke={i === 0 ? '#859ea8' : '#536b75'} strokeWidth={i === 0 ? 2 : 1}/>
      <path d="M-48 15H-38M-43 10V20" stroke="#aec1c8" strokeWidth="2"/>
      <text x="-30" y="18" className="v3-backlog-title">New feature</text>
      <text x="-30" y="32" className="v3-backlog-caption">#{state.metrics.featuresTaken + i + 1}</text>
    </g>)}
    <path d="M-76 326H76L68 338H-68Z" fill="#303e44" stroke="#5a727d"/>
    <text y="308" textAnchor="middle" className="v3-backlog-caption">Always more to build</text>
    <text y="359" textAnchor="middle" className="v3-backlog-caption">{active} in progress · {state.metrics.features} completed</text>
  </g>;
}
