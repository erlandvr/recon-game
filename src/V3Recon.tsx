import {useState} from 'react';
import {type Job, type V3State} from './v3Game.ts';
import {RECON, SYSTEM_NAMES, SYSTEM_SPOTS} from './v3World.ts';

const bayY = (i: number) => 240 + i * 48;
// Presentation owns stable bay positions; simulation alone owns dispatch and progress.
export default function V3Recon({state, reduced, radarId}: {state: V3State; reduced: boolean; radarId: string}) {
  const jobs = state.jobs.filter(j => j.owner === 'recon');
  const signature = jobs.map(j => j.id).join(',');
  const [display, setDisplay] = useState<{signature: string; slots: (Job | null)[]; exits: {system: number; at: number; slot: number}[]; time: number}>({signature: '', slots: [null, null, null], exits: [], time: 0});
  if (signature !== display.signature || state.time < display.time || (state.status === 'ready' && display.exits.length)) {
    const reset = state.time < display.time || state.status === 'ready';
    const slots = reset ? [null, null, null] : display.slots.map(j => jobs.find(n => n.id === j?.id) ?? null);
    const exits = reset ? [] : display.exits.filter(e => state.time - e.at < .8);
    if (!reset) display.slots.forEach((j, slot) => {if (j && !jobs.some(n => n.id === j.id) && !state.systems[j.system]?.broken) exits.push({system: j.system, at: state.time, slot});});
    for (const job of jobs) if (!slots.some(j => j?.id === job.id)) slots[slots.indexOf(null)] = job;
    setDisplay({signature, slots, exits, time: state.time});
  }
  const slots = display.slots.map(j => jobs.find(n => n.id === j?.id) ?? null);
  const installedAt = state.purchases.find(p => p.action === (state.recon === 3 ? 'plus' : 'recon'))?.at;
  const boot = installedAt !== undefined && state.time - installedAt < 1.2;
  return <g className="v3-recon" data-owned={!!state.recon} data-tier={state.recon}>
    {slots.map((job, i) => job && <g key={job.id} className="v3-recon-signal" data-recon-job={job.id}>
      <path d={`M${SYSTEM_SPOTS[job.system].x} ${SYSTEM_SPOTS[job.system].y}Q${RECON.x} ${SYSTEM_SPOTS[job.system].y} ${RECON.x} ${bayY(i)}`} />
      <circle cx={SYSTEM_SPOTS[job.system].x} cy={SYSTEM_SPOTS[job.system].y} r="34"/>
    </g>)}
    <g transform={`translate(${RECON.x} ${RECON.y})`}>
      <ellipse cy="207" rx="79" ry="11" fill="#0006"/>
      <path d="M-66 -15L-78 4V188L-65 201H65L78 188V4L66 -15Z" className="v3-recon-housing"/>
      <path d="M-78 4L-66 13V182L-78 188M78 4L66 13V182L78 188" fill="#182c29" stroke="#597e6b"/>
      <path d="M-25 -21V-42H25V-21" fill="#607d67" stroke="#abc6a4" strokeWidth="3"/>
      <circle cy="-63" r="50" fill="#182a25" stroke="#a1bea0" strokeWidth="5"/>
      <circle cy="-63" r="41" fill="#0c201d" stroke="#426b58"/>
      {[14, 28, 40].map(r => <circle key={r} cy="-63" r={r} fill="none" stroke="#54806a" opacity=".45"/>)}
      <path d="M-40 -63H40M0 -103V-23" stroke="#54806a" opacity=".5"/>
      {state.recon > 0 && <g transform="translate(0 -63)">
        <g transform={`rotate(${reduced ? 35 : (state.time * 65) % 360})`} data-radar-sweep>
          <path d="M0 0L0 -40A40 40 0 0 1 35 -19Z" fill={`url(#${radarId})`}/><path d="M0 0V-40" stroke="#c7e8b6" strokeWidth="2"/>
        </g>
        {state.systems.filter(n => n.broken).map(n => <circle key={n.id} cx={(SYSTEM_SPOTS[n.id].x - RECON.x) * .07} cy={(SYSTEM_SPOTS[n.id].y - 210) * .13} r="3" fill="#f1bf78"/>)}
        <circle r="4" fill="#d6eac6"/>
      </g>}
      <text y="10" textAnchor="middle" className="v3-recon-title">RECON{state.recon === 3 ? ' +' : ''}</text>
      <text y="27" textAnchor="middle" className="v3-recon-caption">AUTOMATED REPAIRS</text>
      {slots.map((job, i) => {
        const unlocked = i < state.recon;
        return <g key={i} transform={`translate(0 ${38 + i * 48})`} data-recon-bay={i + 1} data-p1={job?.priority === 'p1'} data-state={job ? 'repairing' : unlocked ? 'ready' : 'locked'} data-system={job?.system ?? ''}>
          <rect x="-65" width="130" height="43" rx="5" className="v3-bay-shell"/>
          <path d="M-60 37H60" stroke="#648170" opacity=".5"/>
          <text x="-56" y="13" className="v3-bay-number">{job?.priority === 'p1' ? 'P1' : String(i + 1).padStart(2, '0')}</text>
          {job ? <>
            <g className="v3-bay-token" transform={`translate(${reduced ? -43 : -53 + 20 * job.progress} 24)`}><rect x="-7" y="-8" width="14" height="17" rx="2"/><path d="M-3 -3H3M-3 1H3"/></g>
            <text x="-19" y="16" className="v3-bay-name">{SYSTEM_NAMES[job.system]}</text>
            <text x="-19" y="31" className="v3-bay-status">Repairing {Math.floor(job.progress * 100)}%</text>
            <path d={`M-19 36H${-19 + 77 * job.progress}`} stroke="#d9eeb6" strokeWidth="2"/>
          </> : <>
            <path d={unlocked ? 'M-48 24H-36M-42 18V30' : 'M-48 23V19A6 6 0 0 1 -36 19V23M-49 23H-35V33H-49Z'} fill="none" stroke="currentColor" strokeWidth="2"/>
            <text x="-19" y="20" className="v3-bay-name">{unlocked ? 'Ready' : i === 0 ? 'Offline' : 'Locked'}</text>
            <text x="-19" y="33" className="v3-bay-status">{unlocked ? 'Repair bay' : i === 0 ? 'Buy Recon' : 'Requires Plus'}</text>
          </>}
        </g>;
      })}
      <text y="195" textAnchor="middle" className="v3-recon-footer">{state.recon ? `${jobs.length} / ${state.recon} bays working` : 'Developers handle repairs'}</text>
      {boot && <path d="M-72 -10H72V190H-72Z" fill="none" stroke="#e6d295" strokeWidth="3" opacity={reduced ? .8 : 1 - (state.time - installedAt!) / 1.2}/>}
    </g>
    {display.exits.filter(e => state.time - e.at < .8).map(e => {
      const p = SYSTEM_SPOTS[e.system], t = reduced ? 1 : Math.min(1, (state.time - e.at) / .65);
      return <g key={`${e.system}-${e.at}`} data-recon-completion={e.system} transform={`translate(${RECON.x + (p.x - RECON.x) * t} ${bayY(e.slot) + (p.y - bayY(e.slot)) * t})`}>
        <circle r="10" fill="#d4e9b5"/><path d="M-5 0L-1 4L6 -4" stroke="#203226" fill="none" strokeWidth="2.5"/>
      </g>;
    })}
  </g>;
}
