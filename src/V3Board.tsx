import {OrientationCaption, OrientationSpotlight} from './V3Orientation.tsx';
import {type Hint} from './v3Guidance.ts';
import {useId} from 'react';
import V3Features, {FeaturePiece} from './V3Features.tsx';
import V3Recon from './V3Recon.tsx';
import V3Coffee from './V3Coffee.tsx';
import {type Developer, type V3State, featuresAvailable, systemIncome, workerPosition} from './v3Game.ts';
import {benchPosition, RECON, SYSTEM_CLUSTERS, SYSTEM_LINKS, SYSTEM_NAMES, SYSTEM_SPOTS, workPosition, WORLD} from './v3World.ts';

const phaseLabels = {idle: 'Available', assembly: 'Assembling', delivery: 'Delivering', install: 'Installing', outward: 'To repair', repair: 'Repairing', return: 'Returning', resume: 'Resuming work', backlog: 'To backlog', pickup: 'Taking a feature', fetch: 'To workbench', 'to-build': 'Back to build', 'resume-feature': 'Resuming feature'};
export function Mechanic({worker, time, activated = false, recruited = false, featureCompleted = false, celebration = null, position}: {worker: Developer; time: number; activated?: boolean; recruited?: boolean; featureCompleted?: boolean; celebration?: number | null; position?: {x: number; y: number}}) {
  const p = position ?? workerPosition(worker), moving = ['delivery', 'outward', 'return', 'resume', 'backlog', 'fetch', 'to-build', 'resume-feature'].includes(worker.phase);
  const party = celebration !== null;
  const ponytail = worker.id % 2 === 1;
  const repairing = worker.phase === 'outward' || worker.phase === 'repair';
  const mood = party ? 'happy' : repairing ? 'concerned' : worker.feature || featureCompleted ? 'happy' : 'focused';
  const dancing = party && celebration >= .6 && celebration < 5.6;
  const feature = !!worker.feature, fetching = feature && ['fetch', 'pickup'].includes(worker.phase);
  const carrying = worker.phase === 'delivery';
  const installing = worker.phase === 'install';
  const placing = installing ? Math.min(1, worker.elapsed / worker.duration) : 0;
  const turning = worker.turnedAt !== null && time - worker.turnedAt < .8;
  const tossing = ['return', 'outward'].includes(worker.phase) && worker.elapsed < .5 && activated && !turning;
  const last = worker.route.at(-1)!;
  const facing = (moving && last.x < p.x) || worker.phase === 'repair' || worker.phase === 'install' ? -1 : 1;
  return <g data-worker={worker.id} data-hairstyle={ponytail ? 'ponytail' : 'short'} data-phase={worker.phase} data-feature={feature} transform={`translate(${p.x} ${p.y})`}>
    <ellipse cy="3" rx="17" ry="5" fill="#0007"/>
    <g transform={`scale(${facing} 1)`} className={moving && !party ? 'v3-walking' : ''} data-loaded={carrying || fetching}>
      {party && !feature && (carrying || installing) && <g className="v3-cargo v3-parked-cargo" transform={`translate(${-28 - 14 * Math.min(1, celebration / .6)} -40) rotate(${-8 * (1 - Math.min(1, celebration / .6))})`}><rect x="-24" y="-40" width="48" height="80" rx="5"/><path d="M-12 -15H12M-12 -5H12M-12 5H4"/></g>}
      {!party && !feature && (carrying || installing) && <g className="v3-cargo" transform={`translate(${installing ? -28 + 64 * placing : 12 - 40 * Math.min(1, worker.elapsed / .35)} ${installing ? -40 + 6 * placing : -15 - 25 * Math.min(1, worker.elapsed / .35)}) rotate(${installing ? -12 * (1 - placing) : -8})`}><rect x="-24" y="-40" width="48" height="80" rx="5"/><path d="M-12 -15H12M-12 -5H12M-12 5H4"/></g>}
      {feature && (carrying || installing || fetching) && <g className={party ? 'v3-parked-cargo' : undefined} transform={party ? 'translate(-32 -22)' : installing ? `translate(${-24 + 32 * placing} ${-27 + 7 * placing})` : 'translate(-22 -27)'}><FeaturePiece card={fetching}/></g>}
      <g data-celebrating={party} className={dancing ? 'v3-dancing' : undefined} transform={party ? 'translate(8 0)' : carrying ? feature ? 'rotate(5 0 -8)' : 'rotate(18 0 -8)' : worker.phase === 'outward' ? 'rotate(9 0 -8)' : turning ? 'rotate(-12 0 -8)' : undefined}>
        <g transform="translate(-3 -8)"><g className="v3-worker-leg v3-worker-leg-back">
          <path d="M0 0L-1 4L-2 8" fill="none" stroke="#aebca5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M-3 8H1" stroke="#64745c" strokeWidth="3.5" strokeLinecap="round"/>
        </g></g>
        <g transform="translate(3 -8)"><g className="v3-worker-leg v3-worker-leg-front">
          <path d="M0 0L1 4L2 8" fill="none" stroke="#d9dfcf" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 8H5" stroke="#859675" strokeWidth="3.5" strokeLinecap="round"/>
        </g></g>
        <g className="v3-worker-body">
        {ponytail && <><path d="M-5 -28Q-12 -28 -10 -21Q-9 -17 -11 -14Q-3 -15 -5 -23Z" fill="#755238"/><circle cx="-6" cy="-26" r="1.6" fill="#b4c89d"/></>}
        <path d="M0 -17V-7" stroke="#c59352" strokeWidth="11" strokeLinecap="round"/>
        <circle cy="-24" r="6" fill="#e2c7a3"/>
        <path className="v3-worker-hair" d={ponytail ? 'M-6 -25L-6 -28Q-4 -32 1 -31Q6 -31 6 -26L5 -23L4.5 -27Q0 -25 -2 -28L-4.5 -26L-5 -23Z' : 'M-5.8 -24.5L-6 -28Q-5 -32 -.8 -31Q3 -32 5.5 -29L6 -24.7L4.6 -26.7L4 -28.5Q.5 -26 -4.5 -27L-4.5 -24.5Z'} fill={ponytail ? '#755238' : '#66513c'}/>
        <path d={ponytail ? 'M3 -29Q0 -30 -3 -28.5' : 'M2.8 -29.8Q-.5 -28.1 -3.5 -28.5'} fill="none" stroke="#a18059" strokeWidth=".8" strokeLinecap="round"/>
        <g className="v3-worker-face" data-mood={mood} fill="#493e2c" stroke="#493e2c" strokeWidth=".8" strokeLinecap="round">
          <circle cx="-2" cy="-24.5" r=".65" stroke="none"/><circle cx="2" cy="-24.5" r=".65" stroke="none"/>
          <path d={mood === 'happy' ? 'M-2 -21.5Q0 -18.8 2 -21.5' : repairing ? 'M-1.8 -21Q0 -23 1.8 -21' : 'M-1.5 -21.5H1.5'} fill="none"/>
          {repairing && <path d="M-3 -26L-1.3 -26.7M1.3 -26.7L3 -26" fill="none"/>}
        </g>
        <path d={party ? 'M-3 -16L-13 -24L-16 -33M3 -16L13 -24L16 -33' : (turning || recruited) ? 'M3 -16L13 -22L17 -32' : tossing ? 'M3 -16L10 -26L18 -31' : worker.phase === 'idle' ? 'M3 -16L12 -9L4 -8' : 'M3 -16L12 -11'} stroke="#e2c7a3" strokeWidth="4" strokeLinecap="round"/>
        {!party && (worker.phase === 'repair' || worker.phase === 'assembly') && <path className="v3-tool" d="M12 -11V-24M7 -24H18" stroke="#c6d2d4" strokeWidth="4"/>}
        </g>
      </g>
    </g>
    {party && <g className="v3-ground-tool" transform="translate(29 7) rotate(15)">
      <path d="M0 0H12" stroke="#9c8054" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="10" y="-4" width="4" height="8" rx="1" fill="#a6b3a0"/>
    </g>}
    {!party && worker.turnedAt !== null && time - worker.turnedAt < 1.5 && <path d="M-16 -44Q0 -58 16 -44L9 -45M16 -44L13 -51" fill="none" stroke="#c8dfa8" strokeWidth="2"/>}
    {moving && !party && <text className="v3-worker-label" x="24" y="18" textAnchor="middle">Dev {worker.id + 1}</text>}
  </g>;
}
export default function V3Board({state, reduced, hint, celebration = null, orientation}: {orientation?: number; state: V3State; reduced: boolean; hint?: Hint; celebration?: number | null}) {
  const radarId = useId();
  const active = state.status === 'running', featuresReady = featuresAvailable(state);
  return <section className="v3-world" aria-label="Workshop" data-reduced={reduced} data-running={active} data-celebrating={state.status === 'won'}>
    <div className="v3-world-summary">{state.systems.filter(n => n.installed).length} installed · {state.systems.length}/12 positions reserved {featuresReady && <>· {state.metrics.features} features completed</>}</div>
    <svg viewBox={`0 0 ${WORLD.width} ${WORLD.height}`} role="img" aria-label={`Connected systems and developer workbenches. ${featuresReady ? `One shared feature backlog. ${state.metrics.features} features completed.` : ''} ${state.jobs.filter(j => j.priority === 'p1').map(j => `P1 emergency: ${SYSTEM_NAMES[j.system]}`).join('. ')}. ${state.recon ? `Recon: ${state.jobs.filter(j => j.owner === 'recon').length} of ${state.recon} automated repair bays working. ${state.jobs.filter(j => j.owner === 'recon').map(j => `${SYSTEM_NAMES[j.system]} ${Math.floor(j.progress * 100)} percent repaired`).join('. ')}.` : 'Recon offline. Developers handle repairs.'} Purchases and developer status are listed below.`}>
      <defs><radialGradient id={radarId}><stop stopColor="#c1e4a9" stopOpacity=".65"/><stop offset="1" stopColor="#80c8a3" stopOpacity=".08"/></radialGradient><pattern id={`${radarId}-grid`} width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#b4c9a417"/></pattern></defs>
      <rect width={WORLD.width} height={WORLD.height} fill={`url(#${radarId}-grid)`}/>
      <g>
        {SYSTEM_CLUSTERS.map((ids, i) => {
          const visible = ids.filter(id => state.systems[id]);
          if (!visible.length) return null;
          const points = visible.map(id => SYSTEM_SPOTS[id]);
          return <g key={i} className="v3-island" aria-hidden="true">{points.length === 1
            ? <circle cx={points[0].x} cy={points[0].y + 18} r="54"/>
            : <path d={`${points.map((p, k) => `${k ? 'L' : 'M'}${p.x} ${p.y + 18}`).join(' ')}Z`}/>}</g>;
        })}
        <ellipse className="v3-recon-clearing" cx={RECON.x} cy="260" rx="111" ry="174"/>
        <path d="M790 50V490" stroke="#b4c9a414" strokeWidth="3" strokeDasharray="5 9"/>
        <text x="15" y="25" className="v3-area-label">THE ECOSYSTEM</text><text x="867" y="25" className="v3-area-label">DEVELOPERS</text>
        {state.systems.map(n => SYSTEM_LINKS[n.id].filter(id => state.systems[id]?.installed).map(id => <path key={`${n.id}-${id}`} d={(() => {const a = SYSTEM_SPOTS[n.id], b = SYSTEM_SPOTS[id]; return (a.x < RECON.x) !== (b.x < RECON.x)
            ? `M${a.x} ${a.y} C${a.x} 40 ${a.x < RECON.x ? 330 : 540} 35 ${RECON.x} 35 S${b.x} 40 ${b.x} ${b.y}`
            : `M${a.x} ${a.y} Q${(a.x + b.x) / 2 + 24} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;})()} className="v3-link" data-live={n.installed && !n.broken && !state.systems[id].broken}/>))}
        {state.systems.map(n => {
          const p = SYSTEM_SPOTS[n.id], job = state.jobs.find(j => j.system === n.id && j.type !== 'feature');
          const label = !n.installed ? (job?.suspended ? 'Paused · P1 response' : job?.owner === null ? 'Queued' : 'Building') : n.broken ? job?.priority === 'p1' ? (job.owner === 'recon' ? 'P1 · Recon repairing' : job.owner === null ? 'P1 · awaiting response' : 'P1 · developer responding') : (job?.owner === 'recon' ? 'Recon repairing' : 'Broken · no income') : `+${systemIncome(n).toFixed((n.features ?? 0) % 4 ? 2 : 0)} credits/s`;
          return <g key={n.id} data-v3-system={n.id} data-feature-received={n.featureAt !== undefined && state.time - n.featureAt < 1.2} data-guided={n.id === hint?.system} data-p1={job?.priority === 'p1'} data-broken={n.broken} data-installed={n.installed} transform={`translate(${p.x} ${p.y})`}>
            <title>{SYSTEM_NAMES[n.id]}: {label}. {n.features ?? 0} features completed.</title>
            <ellipse cy="31" rx="34" ry="8" fill="#0005"/>
            <rect className="v3-machine" x="-26" y="-30" width="52" height="60" rx="6"/>
            {n.installed && <g className="v3-machine-detail"><path d="M-18 -17H18M-18 -7H6" stroke="currentColor" opacity=".55" strokeWidth="3"/>
            <circle cx="16" cy="-7" r="3" fill="currentColor"/>
            {n.broken ? <g><path d="M-19 7H19L25 28H-13Z" className="v3-open-panel"/><text y="22" textAnchor="middle" className="v3-fault">!</text></g> : <path d="M-18 7H18V21H-18Z" fill="currentColor" opacity=".15"/>}</g>}
            {job?.priority === 'p1' && <g className="v3-fire" aria-hidden="true">
              <ellipse cy="-16" rx="34" ry="35" fill="#ec693326"/>
              <g transform="scale(1 .7)"><path className="v3-flame" d="M-24 -15C-37 -34 -16 -41 -19 -57C-9 -52 -10 -41 -5 -38C3 -51 -4 -57 6 -70C6 -49 29 -42 23 -21C20 -4 -15 2 -24 -15Z" fill="#f16b36"/>
              <path className="v3-flame-core" d="M-12 -15C-20 -27 -7 -33 -8 -44C-1 -40 -2 -29 3 -25C8 -34 9 -39 8 -43C24 -27 15 -9 4 -8C-2 -4 -9 -8 -12 -15Z" fill="#ffce68"/></g>
              <rect x="-18" y="-3" width="36" height="23" rx="5" fill="#5a2218" stroke="#ffb07d"/>
              <text y="14" textAnchor="middle" className="v3-p1-label">P1</text>
            </g>}
            {!n.installed && <text y="6" textAnchor="middle" className="v3-reserved">{String(n.id + 1).padStart(2, '0')}</text>}
            {n.installed && !n.broken && <path className="v3-live-light" d="M-17 25H17" stroke="#e1e9b2" strokeWidth="3"/>}
            {!!n.features && <g className="v3-system-features" data-system-features={n.features} transform="translate(39 -13)"><rect x="-9" y="-12" width="27" height="23" rx="4"/><text x="4" y="4" textAnchor="middle">+{n.features}</text></g>}
            {job?.type === 'repair' && <><rect x="-25" y="35" width="50" height="3" fill="#383d35"/><rect x="-25" y="35" width={50 * job.progress} height="3" fill="#d7c28c"/></>}
            <text y="55" textAnchor="middle" className="v3-system-name">{SYSTEM_NAMES[n.id]}</text><text y="73" textAnchor="middle" className="v3-system-state">{label}</text>
          </g>;
        })}
        <g data-guidance-recon={hint?.focus === 'recon'}><V3Recon state={state} reduced={reduced} radarId={radarId}/></g>
        {featuresReady && <g data-guidance-backlog={hint?.focus === 'backlog'}><V3Features state={state}/></g>}
        {[0, 1, 2, 3].map(id => {
          const p = benchPosition(id), w = state.developers[id];
          const assembly = w?.phase === 'assembly' ? w : w?.suspended?.phase === 'assembly' ? w.suspended : null;
          const shipped = state.systems.find(n => n.featureBy === id && n.featureAt !== undefined && state.time - n.featureAt < 1.2);
          const assembling = !!assembly;
          const progress = assembly ? assembly.elapsed / assembly.duration : 0;
          const recruited = state.purchases.filter(p => p.action === 'developer')[id - 1];
          return <g key={id} transform={`translate(${p.x} ${p.y})`} className="v3-bench" data-guided={id === hint?.bench} data-occupied={!!w}>
            <path d="M-47 -38H47V-6H-47Z" fill="#222c20" stroke="#485a3d"/>
            <path d="M-38 -30H-20M22 -30H36M30 -30V-18" stroke="#899a76" strokeWidth="3"/>
            <rect x="-45" y="-6" width="90" height="12" rx="3"/><path d="M-37 6V26M37 6V26M-37 19H37" stroke="#61705a" strokeWidth="5"/>
            <path d="M-40 9H-12V21H-40Z" fill="#34412d" stroke="#71835f"/><path d="M-30 15H-22" stroke="#b1ba91"/>
            {assembling && <g className="v3-assembly" data-feature={assembly?.feature ?? false} data-assembly-progress={progress}>
              {[0, 1, 2, 3, 4, 5].map(i => {
                const placed = progress >= (i + 1) / 7;
                return <rect key={i} x={placed ? -29 + (i % 3) * 18 : 25 + (i % 2) * 10} y={placed ? -22 - Math.floor(i / 3) * 16 : -16 - Math.floor(i / 2) * 10} width={placed ? 18 : 9} height={placed ? 16 : 9} rx="2"/>;
              })}
            </g>}
            <text y="43" textAnchor="middle" className="v3-bench-job">{w ? `Dev ${id + 1} · ${shipped && w.phase === 'idle' ? `Feature → ${SYSTEM_NAMES[shipped.id]}` : assembling ? w.suspended ? 'Work paused' : assembly?.feature ? 'New feature' : 'Assembling' : w.phase === 'idle' ? 'Ready' : 'Away'}` : 'Hire to open'}</text>
            {shipped && <g className="v3-feature-finished" transform="translate(0 -26)"><FeaturePiece/></g>}
            {recruited && state.time - recruited.at < 1.5 && <path d="M-48 -42H48V29H-48Z" fill="none" stroke="#dcc68f" strokeWidth="2"/>}
          </g>;
        })}
        {state.developers.filter(w => w.parkedFeature && ['assembly', 'fetch', 'pickup'].includes(w.parkedFeature.phase)).map(w => {
          const saved = w.parkedFeature!, p = saved.position;
          return <g key={`feature-paused-${w.id}`} data-parked-feature={w.id} transform={`translate(${p.x - (saved.phase === 'assembly' ? 62 : 0)} ${p.y - 22})`}>
            <title>Feature paused · Dev {w.id + 1} will resume when builds and repairs are clear.</title>
            <g transform="scale(.65)"><FeaturePiece card={saved.phase !== 'assembly'}/></g>
            <path d="M16 -6V6M22 -6V6" stroke="#ecd59a" strokeWidth="3"/>
          </g>;
        })}
        {state.developers.filter(w => w.suspended && ['delivery', 'install', 'fetch'].includes(w.suspended.phase)).map(w => <g key={`paused-${w.id}`} className="v3-cargo v3-paused-cargo" data-paused-cargo={w.id} transform={`translate(${w.suspended!.position.x} ${w.suspended!.position.y})`}>
          {w.suspended!.feature ? <g transform="translate(0 -23)"><FeaturePiece card={w.suspended!.phase === 'fetch'}/></g> : <g><rect x="-24" y="-80" width="48" height="80" rx="5"/><path d="M-12 -55H12M-12 -45H12M-12 -35H4"/></g>}
          <title>{w.suspended!.feature ? 'Feature paused' : 'Build paused'} · Dev {w.id + 1} will return after the P1.</title>
          <g transform="translate(22 -10)" className="v3-paused-mark"><rect x="-9" y="-10" width="18" height="20" rx="4" fill="#293120" stroke="#ecd59a"/><path d="M-3 -5V5M3 -5V5" stroke="#ecd59a" strokeWidth="3"/></g>
        </g>)}
        {state.developers.map(w => <g key={w.id} data-guidance-worker={w.id === hint?.worker}><Mechanic worker={w} time={state.time} featureCompleted={state.systems.some(n => n.featureBy === w.id && n.featureAt !== undefined && state.time - n.featureAt < 2)} celebration={celebration} recruited={w.id > 0 && state.time - (state.purchases.filter(p => p.action === 'developer')[w.id - 1]?.at ?? -2) < 1.5} activated={state.systems.some(n => n.installedAt !== null && n.installedAt > 0 && state.time - n.installedAt < .5 && workPosition(n.id).x === w.route[0].x && workPosition(n.id).y === w.route[0].y)}/></g>)}
        <V3Coffee state={state} reduced={reduced}/>
        {orientation !== undefined && <OrientationSpotlight step={orientation}/>}
      </g>
    </svg>
    {orientation !== undefined && <OrientationCaption step={orientation}/>}
    <div className="v3-crew" aria-label="Developer status">{state.developers.map(w => <span key={w.id}><b>Dev {w.id + 1}</b> {state.status === 'won' ? 'Celebrating' : `${state.jobs.some(j => j.id === w.job && j.priority === 'p1') ? 'P1 · ' : ''}${w.feature && ['assembly', 'delivery', 'install'].includes(w.phase) ? `${phaseLabels[w.phase]} feature` : phaseLabels[w.phase]}`}{state.status !== 'won' && w.system !== null && ` · ${SYSTEM_NAMES[w.system]}`}</span>)}</div>
  </section>;
}
