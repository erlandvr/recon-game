import {useEffect,useState} from 'react';
import Modal from './Modal.tsx';
import {SCORE_RULES,LEGACY_SCORE_RULES,scoreTime,getScorePage,saveScore,discardScore,useScores,resultSubmission,validName,type ScoreRow} from './scoreboard.ts';
import type {GameState} from './game.ts';
import {REPLAY_LIMITS,type ReplayEvent} from '../supabase/functions/_shared/replayContract.ts';
import './scoreboard.css';

function PendingResult({id}:{id:string}){
 const state=useScores(),pending=state.pending.find(p=>p.score.runId===id);if(!pending)return null;
 return <div className="sb-pending"><span><strong>{pending.score.name}</strong> · {scoreTime(pending.score.finishMs)}</span><div className="sb-actions"><button disabled={state.busy[id]} onClick={()=>void saveScore(pending.score)}>{state.busy[id]?'Saving…':'Retry save'}</button><button disabled={state.busy[id]} onClick={()=>discardScore(id)}>Discard</button></div>{state.errors[id]&&<p role="alert">{state.errors[id]}</p>}{!state.durable&&<p>Keep this page open to retry; browser storage is unavailable.</p>}</div>;
}
export function PendingScores({onScoreboard}:{onScoreboard:(id:string)=>void}){const {pending,saved}=useScores();return <>{pending.length>0&&<section className="sb-pending-list" aria-label="Scores waiting to save"><h2>Scores waiting to save</h2>{pending.map(p=><PendingResult key={p.score.runId} id={p.score.runId}/>)}</section>}{Object.values(saved).map(s=><div key={s.run_id} className="sb-pending"><span role="status">✓ Saved as <strong>{s.display_name}</strong> · {scoreTime(s.finish_ms)}</span><button onClick={()=>onScoreboard(s.run_id)}>View saved score</button></div>)}</>;}

export function SaveScore({state:s,runId,replay,onScoreboard}:{state:GameState;runId:string;replay:ReplayEvent[]|null;onScoreboard:()=>void}){
 const [name,setName]=useState(''),[skipped,setSkipped]=useState(false),[invalid,setInvalid]=useState('');
 const scores=useScores(),saved=scores.saved[runId],pending=scores.pending.find(p=>p.score.runId===runId);
 if(saved)return <section className="sb-save"><p role="status">✓ Saved as <strong>{saved.display_name}</strong></p><button onClick={onScoreboard}>View scoreboard</button></section>;
 if(pending)return <section className="sb-save"><h3>Save your score</h3><PendingResult id={runId}/></section>;
 if(skipped)return <section className="sb-save"><button onClick={()=>setSkipped(false)}>Add my score</button><button onClick={onScoreboard}>View scoreboard</button></section>;
 if(!replay||s.speed!.result!.at*1000>REPLAY_LIMITS.maxFinishMs)return <section className="sb-save"><p>This run exceeds the scoreboard limit of 30 active minutes or 2,000 actions. Your local result still counts.</p><button onClick={onScoreboard}>View scoreboard</button></section>;
 return <form className="sb-save" onSubmit={e=>{e.preventDefault();const score=resultSubmission(s,runId,name,replay);if(!score){setInvalid('Enter a name or nickname of 1–30 characters. Only completed, eligible runs can be saved.');return;}setInvalid('');void saveScore(score);}}>
  <h3>Add your score to the scoreboard</h3><label htmlFor={`score-name-${runId}`}>Name or nickname</label>
  <div className="sb-form-row"><input id={`score-name-${runId}`} autoComplete="off" value={name} onChange={e=>{setName(e.target.value);setInvalid('');}} aria-describedby={`score-help-${runId}`} aria-invalid={!!invalid}/><button type="submit" disabled={!validName(name.trim())}>Save score</button><button type="button" onClick={()=>setSkipped(true)}>Skip</button></div>
  <p id={`score-help-${runId}`}>Optional. Saving sends your run for verification. Your name and finish time will be visible to everyone.</p><button type="button" onClick={onScoreboard}>View scoreboard</button>{invalid&&<p role="alert">{invalid}</p>}
 </form>;
}

export default function Scoreboard({onClose,highlight=null}:{onClose:()=>void;highlight?:string|null}){
 const [legacy,setLegacy]=useState(false),rules=legacy?LEGACY_SCORE_RULES:SCORE_RULES;
 const [page,setPage]=useState(0),[refresh,setRefresh]=useState(0),[data,setData]=useState<Awaited<ReturnType<typeof getScorePage>>|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');setData(null);getScorePage(page,highlight,controller.signal,rules.id).then(value=>{if(!controller.signal.aborted)setData(value);}).catch(()=>{if(!controller.signal.aborted)setError('Could not load the scoreboard. Please try again.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[page,refresh,highlight,rules.id]);
 function row(entry:ScoreRow){return <tr key={entry.run_id} className={entry.run_id===highlight?'sb-highlight':''}><td>{entry.rank}</td><th scope="row">{entry.display_name}{entry.run_id===highlight&&<small> Your result</small>}</th><td>{scoreTime(entry.finish_ms)}</td><td className={entry.medal?`sb-${entry.medal}`:''}>{entry.medal??'—'}</td><td>{new Date(entry.submitted_at).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</td></tr>;}
 return <Modal title="Speed Game scoreboard" className="sb-modal" onDismiss={onClose}>
  <div className="sb-toolbar"><p>{rules.label} · Fastest finishes</p><button disabled={loading} onClick={()=>setRefresh(r=>r+1)}>Refresh</button></div>
  <button onClick={()=>{setLegacy(v=>!v);setPage(0);}}>{legacy?'View verified scores':'View previous scores'}</button>
  {legacy&&<p>These historical results were submitted without gameplay verification. This board is closed to new scores.</p>}
  <p className="sb-caption">One entry per submitted run. Matching names may belong to different players.</p>
  {loading?<p role="status">Loading scores…</p>:error?<div role="alert"><p>{error}</p><button onClick={()=>setRefresh(r=>r+1)}>Try again</button></div>:data&&<>
   {data.highlight&&!data.entries.some(e=>e.run_id===highlight)&&<p className="sb-own">Your result: #{data.highlight.rank} · {data.highlight.display_name} · {scoreTime(data.highlight.finish_ms)}</p>}
   {!data.total?<p>No scores yet. Finish a Speed Game to add yours.</p>:<><div className="sb-table-wrap"><table><caption className="visually-hidden">Submitted Speed Game results, ranked by exact finish time</caption><thead><tr><th>Rank</th><th>Name</th><th>Time</th><th>Medal</th><th>Date</th></tr></thead><tbody>{data.entries.map(row)}</tbody></table></div><div className="sb-pagination"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page+1} of {Math.max(1,Math.ceil(data.total/data.pageSize))} · {data.total} scores</span><button disabled={(page+1)*data.pageSize>=data.total} onClick={()=>setPage(p=>p+1)}>Next</button></div></>}
  </>}
  <div className="modal-actions"><button onClick={onClose}>Close scoreboard</button></div>
 </Modal>;
}
