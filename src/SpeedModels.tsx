import {useState} from 'react';
import {modelReason,type GameState,type Action} from './game.ts';
import {SPEED_MODELS,type SpeedModel} from './speedRules.ts';
import {PauseIcon} from './SpeedIcons.tsx';
import Modal from './Modal.tsx';
export default function SpeedModels({state:s,dispatch,plan}:{state:GameState;dispatch:(a:Action)=>void;plan:(paused:boolean)=>void}){
 const [details,setDetails]=useState(false),owned=s.speed!.models;
 const branches=[['scout','scanner'],['specialist','master']] as const;
 function card(id:Exclude<SpeedModel,'base'>){
  const model=SPEED_MODELS[id],reason=modelReason(s,id),chosen=owned.includes(id);
  return <article key={id} data-model={id} className={`sg-model-card ${chosen?'installed':'unowned'}`}>
   <img className="sg-model-logo" src={`${import.meta.env.BASE_URL}model-logos/${id}.svg`} alt="" width="64" height="64"/><h3>{model.name}</h3><strong>{id==='scanner'?'12× faster scans':id==='master'?'20× faster fixes':id==='scout'?'3× faster scans':'5× faster fixes'}</strong>
   <small>{id==='scanner'?'Automatic scans · 2 cr':id==='master'?'Automatic fixes · 2 cr':id==='scout'?'Manual scans':'Manual fixes'}</small>
   <button className={!reason?'sg-model-next':undefined} title={reason??undefined} disabled={!!reason} onClick={()=>dispatch({type:'model',model:id})}>{chosen?'✓ Installed':`${model.parent==='base'?'Choose':'Upgrade'} · ${model.cost} cr`}</button>
  </article>;
 }
 return <aside className="sg-models" aria-label="AI model upgrades">
  <h2>AI models</h2><button id="speed-plan" className="sg-plan-button" onClick={()=>plan(!s.speed!.paused)}><PauseIcon/>{s.speed!.paused?'Resume game':'Pause & plan'}</button>
  <div className="sg-tree-root"><img className="sg-model-logo" src={`${import.meta.env.BASE_URL}model-logos/base.svg`} alt="" width="44" height="44"/><div><strong>Recon Model 1</strong><small>{owned.length===1?'Manual scans & fixes':'Starting model'}</small></div></div>
  <p className="sg-tree-hint">Buy both branches · benefits combine</p>
  <div className="sg-tree-branches">{branches.map(([middle,final])=><div className="sg-tree-branch" key={middle}>{card(middle)}{card(final)}</div>)}</div>
  <p className="sg-tree-hint">Covers current & future systems</p>
  <button className="sg-compare-models" onClick={()=>{plan(true);setDetails(true);}}>Compare models</button>
  {details&&<Modal title="Compare models" onDismiss={()=>setDetails(false)}><p>Game paused. Buy from both branches; all owned benefits combine. Each final model requires the model above it. Prices are paid at each step. Only Speedy Scanner automates scans; only Fixing Master automates fixes.</p><table className="sg-model-comparison"><thead><tr><th>Model</th><th>Price</th><th>Scan</th><th>Fix</th><th>Automatic</th></tr></thead><tbody>{Object.entries(SPEED_MODELS).map(([id,m])=><tr key={id}><th>{m.name}</th><td>{m.cost?`${m.cost} cr`:'Included'}</td><td>{m.scanSeconds}s · {m.scanCost} cr</td><td>{m.fixSeconds}s · {m.fixCost} cr</td><td>{m.autoScan&&m.autoFix?'Both':m.autoScan?'Scans':m.autoFix?'Fixes':'Neither'}</td></tr>)}</tbody></table><p>Speedy Scanner can automatically rescan a system every 2 seconds. Both final models complete their jobs in 0.25 seconds. Automation includes all connected systems and future arrivals. Jobs still cost credits and share workers. Running jobs keep their original duration; queued jobs keep their prepaid cost and use your combined upgrades when they start. Faster speeds and lower costs replace weaker ones; multipliers do not multiply together.</p><p>More active systems mean more issues. Pressure increases gradually until four minutes. A second worker helps your model keep up; healthy systems earn more.</p><button onClick={()=>setDetails(false)}>Back to planning</button></Modal>}
 </aside>;
}
