import { useEffect, useMemo, useRef, useState } from 'react';
import type { Action, GameState } from './game.ts';
import { scopeQuote, fullyAutomated } from './game.ts';
import { activeServices, serviceFindings, serviceHealth, type ServiceId } from './campaign.ts';
import { CORPORATE, scopeRepositories, type Scope } from './organization.ts';
import { ecosystemLayout, placeGroupLabels, fitCamera, mapBounds, zoomCamera, type Camera, type Point } from './ecosystemMap.ts';
import SystemNode from './SystemNode.tsx';

type Props = { focusRequest: {id:ServiceId} | null; state: GameState; dispatch: (a: Action) => void; registerNode: (id: ServiceId, node: HTMLElement | null) => void };
export default function CorporateOverview({ focusRequest, state: s, dispatch, registerNode }: Props) {
  const layout = useMemo(() => ecosystemLayout(s.organization), [s.organization.seed]);
  const [scope, setScope] = useState<Scope | null>(null);
  const [camera, setCamera] = useState<Camera>({x:0,y:0,zoom:1});
  const [size, setSize] = useState({width:600,height:360});
  const viewport = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(size); sizeRef.current = size;
  const latest = useRef(s); latest.current = s;
  const pointers = useRef(new Map<number, Point>());
  const dragged = useRef(false);
  const fitMode = useRef<Scope | 'all' | null>('all');
  const active = activeServices(s);
  const project = scope ? s.organization.projects.find(p => p.id === (scope.level === 'project' ? scope.id : s.organization.modules.find(m=>m.id===scope.id)?.projectId)) : undefined;
  const module = scope?.level === 'module' ? s.organization.modules.find(m=>m.id===scope.id) : undefined;
  const frame = (target: Scope | 'all', dimensions = sizeRef.current) => {
    const ids = target === 'all' ? activeServices(latest.current) : scopeRepositories(latest.current,target);
    setCamera(fitCamera(mapBounds(ids.map(id=>layout.repos[id])), dimensions));
  };
  useEffect(() => {
    const element = viewport.current!;
    const observer = new ResizeObserver(([entry]) => {
      const next = {width:entry.contentRect.width,height:entry.contentRect.height};
      if (!next.width || !next.height) return;
      const previous = sizeRef.current;
      sizeRef.current = next; setSize(next);
      if (fitMode.current) frame(fitMode.current,next);
      else setCamera(c=>({...c,x:c.x+(next.width-previous.width)/2,y:c.y+(next.height-previous.height)/2}));
    });
    observer.observe(element);
    // Trackpads pan with two fingers; browsers expose pinch as ctrl+wheel.
    const wheel = (e: WheelEvent) => {
      e.preventDefault(); fitMode.current = null;
      const rect = element.getBoundingClientRect();
      const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
      if (e.ctrlKey || e.metaKey) setCamera(c=>zoomCamera(c,{x:e.clientX-rect.left,y:e.clientY-rect.top},Math.exp(-e.deltaY*factor*.01)));
      else setCamera(c=>({...c,x:c.x-e.deltaX*factor,y:c.y-e.deltaY*factor}));
    };
    element.addEventListener('wheel',wheel,{passive:false});
    return () => { observer.disconnect(); element.removeEventListener('wheel',wheel); };
  }, [layout]);
  useEffect(() => {
    if (!focusRequest) return;
    const id=focusRequest.id, point=layout.repos[id];
    setScope({level:'module',id:latest.current.organization.repositories.find(r=>r.id===id)!.moduleId});
    fitMode.current=null;
    setCamera({zoom:1,x:sizeRef.current.width/2-point.x,y:sizeRef.current.height/2-point.y});
  }, [focusRequest, layout]);
  function navigate(target: Scope | null) { setScope(target); fitMode.current = target ?? 'all'; frame(target ?? 'all'); }
  function focusRepo(id: ServiceId) {
    const repo = s.organization.repositories.find(r=>r.id===id)!;
    setScope({level:'module',id:repo.moduleId}); fitMode.current = null;
    const point=layout.repos[id];setCamera({zoom:1,x:size.width/2-point.x,y:size.height/2-point.y});
  }
  const position = (p: Point) => ({left:camera.x+p.x*camera.zoom,top:camera.y+p.y*camera.zoom});
  const inView = (p: Point, margin=140) => {const x=camera.x+p.x*camera.zoom,y=camera.y+p.y*camera.zoom;return x>-margin&&x<size.width+margin&&y>-margin&&y<size.height+margin;};
  const zoom = (factor:number) => {fitMode.current=null;setCamera(c=>zoomCamera(c,{x:size.width/2,y:size.height/2},factor));};
  function movePointer(e: React.PointerEvent) {
    const old = pointers.current.get(e.pointerId); if (!old) return;
    const next = {x:e.clientX,y:e.clientY};
    const before = [...pointers.current.values()]; pointers.current.set(e.pointerId,next);
    const after = [...pointers.current.values()];
    if (Math.hypot(next.x-old.x,next.y-old.y)>2) dragged.current=true;
    fitMode.current=null;
    if (after.length===2) {
      const middle = (points:Point[])=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
      const distance = (points:Point[])=>Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
      const b=middle(before),a=middle(after),rect=viewport.current!.getBoundingClientRect();
      setCamera(c=>{const z=zoomCamera(c,{x:b.x-rect.left,y:b.y-rect.top},distance(after)/Math.max(1,distance(before)));return {...z,x:z.x+a.x-b.x,y:z.y+a.y-b.y};});
    } else setCamera(c=>({...c,x:c.x+next.x-old.x,y:c.y+next.y-old.y}));
  }
  const framingProject = fitMode.current && fitMode.current !== 'all' && fitMode.current.level === 'project';
  const framingModule = fitMode.current && fitMode.current !== 'all' && fitMode.current.level === 'module';
  const repoLabels = camera.zoom >= .18 || framingModule;
  const groupLevel = camera.zoom < .06 && !framingProject ? 'project' : 'module';
  const groups = [...s.organization.projects.map(p=>({...p,level:'project' as const})),...s.organization.modules.map(m=>({...m,level:'module' as const}))];
  const groupWidth=(level:'module'|'project')=>level==='project'?Math.min(142,Math.max(68,3400*camera.zoom-14)):Math.min(130,Math.max(64,1100*camera.zoom));
  const focusedLabels=framingProject&&project ? s.organization.modules.filter(m=>m.projectId===project.id&&scopeRepositories(s,{level:'module',id:m.id}).length).map(m=>({id:m.id,x:layout.modules[m.id].x*camera.zoom+camera.x,y:layout.modules[m.id].y*camera.zoom+camera.y,width:groupWidth('module'),height:camera.zoom<.065?48:64})) : [];
  const labelPositions=placeGroupLabels(focusedLabels,size);
  return <div className="ecosystem-canvas-shell">
    <div className="canvas-toolbar">
      <nav className="scope-path" aria-label="Ecosystem focus">
        <button onClick={()=>navigate(null)}>Ecosystem</button>
        {project&&<><span>›</span><button onClick={()=>navigate({level:'project',id:project.id})}>{project.name}</button></>}
        {module&&<><span>›</span><button onClick={()=>navigate({level:'module',id:module.id})}>{module.name}</button></>}
      </nav>
      <select aria-label="Find repository" value="" onChange={e=>focusRepo(e.target.value as ServiceId)}><option value="" disabled>Find repo…</option>{active.map(id=><option key={id} value={id}>{s.organization.repositories.find(r=>r.id===id)!.name}</option>)}</select>
    </div>
    {scope&&<div className="scope-actions" aria-label="Group actions">{(['scan','repair','automate','auto-repair'] as const).map(operation=>{
      const quote=scopeQuote(s,scope,operation),label=operation==='auto-repair'?'Auto-fixes':operation==='automate'?'Auto-scans':operation==='repair'?'Fix':'Scan';
      return <button key={operation} aria-label={`${label} ${scope.level} ${module?.name??project?.name}`} disabled={!!quote.reason} title={quote.reason??'Ordinary costs and shared slots. Manual overflow queues; automation uses spare slots.'} onClick={()=>dispatch({type:'scope',scope,operation})}><strong>{label} {quote.actions.length}</strong><span>{quote.cost} cr</span></button>;
    })}</div>}
    <div ref={viewport} className="ecosystem-canvas" tabIndex={0} role="region" aria-label="Zoomable ecosystem" aria-describedby="canvas-help" data-zoom={camera.zoom} data-camera-x={camera.x} data-camera-y={camera.y}
      onKeyDown={e=>{if(e.target!==e.currentTarget)return; if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key)){e.preventDefault();fitMode.current=null;if(e.key==='Home')navigate(null);else if(e.key==='+'||e.key==='=')zoom(1.3);else if(e.key==='-')zoom(1/1.3);else setCamera(c=>({...c,x:c.x+(e.key==='ArrowLeft'?70:e.key==='ArrowRight'?-70:0),y:c.y+(e.key==='ArrowUp'?70:e.key==='ArrowDown'?-70:0)}));}}}
      onPointerDown={e=>{if(e.button!==0)return;dragged.current=false;if((e.target as Element).closest('button,select'))return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.focus();}}
      onPointerMove={movePointer} onPointerUp={e=>{pointers.current.delete(e.pointerId);}} onPointerCancel={e=>{pointers.current.delete(e.pointerId);}} onLostPointerCapture={e=>pointers.current.delete(e.pointerId)}
      onClickCapture={e=>{if(dragged.current){e.preventDefault();e.stopPropagation();dragged.current=false;}}}>
      <svg className="ecosystem-wires" width="100%" height="100%" aria-hidden="true"><g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
        {groups.filter(g=>scopeRepositories(s,g).length).map(g=>{const p=g.level==='module'?layout.modules[g.id]:layout.projects[g.id];return <circle key={g.id} className={`map-orbit ${g.level}`} cx={p.x} cy={p.y} r={g.level==='module'?420:1490}/>;})}
        {s.organization.modules.filter(m=>scopeRepositories(s,{level:'module',id:m.id}).length).map(m=>{const a=layout.modules[m.id],b=layout.projects[m.projectId];return <path className="membership-wire" key={m.id} d={`M${a.x},${a.y}L${b.x},${b.y}`}/>;})}
        {active.map(id=>{const repo=s.organization.repositories.find(r=>r.id===id)!,a=layout.repos[id],m=layout.modules[repo.moduleId];return <g key={id}><path className="membership-wire" d={`M${m.x},${m.y}L${a.x},${a.y}`}/>{repo.dependencies.filter(dep=>active.includes(dep)).map(dep=>{const b=layout.repos[dep];return <path className="dependency-wire" key={dep} d={`M${b.x},${b.y}L${a.x},${a.y}`}/>;})}<circle className={serviceHealth(s,id)<100?'repo-dot degraded':'repo-dot'} cx={a.x} cy={a.y} r={Math.max(9,3/camera.zoom)}/></g>;})}
      </g>{focusedLabels.map(label=>{const p=labelPositions[label.id];return <line key={label.id} className="membership-wire" x1={label.x} y1={label.y} x2={p.x} y2={p.y}/>;})}</svg>
      {groups.filter(g=>g.level===groupLevel && (g.level==='project' || (!repoLabels && (!framingProject || !project || g.projectId===project.id)))).map(g=>{
        const ids=scopeRepositories(s,g),p=g.level==='module'?layout.modules[g.id]:layout.projects[g.id];if(!ids.length||!inView(p))return null;
        const automated=fullyAutomated(s,ids);
        const average=Math.round(ids.reduce((sum,id)=>sum+serviceHealth(s,id),0)/ids.length);
        return <button key={g.id} className={`map-group-label ${automated?'fully-automated':''} ${average<100?'degraded':''} ${g.level==='module'&&camera.zoom<.065?'compact-group':''}`} style={{...(labelPositions[g.id]?{left:labelPositions[g.id].x,top:labelPositions[g.id].y}:position(p)),width:groupWidth(g.level)}} title={`${g.name} · ${g.level} · ${ids.length} repos · ${average}% health${automated?' · Automated scans and fixes':''}`} aria-label={`Open ${g.name} ${g.level}`} onClick={()=>navigate(g)}>{automated?<small className="automation-badge">Automated</small>:!(g.level==='module'&&camera.zoom<.065)&&<small>{ids.length} repos</small>}<strong>{g.name}</strong><span>{average}%</span></button>;
      })}
      {active.map(id=>{const p=layout.repos[id];if(!inView(p)||!repoLabels)return null;
        const repo=s.organization.repositories.find(r=>r.id===id)!,h=serviceHealth(s,id),findings=serviceFindings(s,id),automated=fullyAutomated(s,[id]);
        // Full cards need the world spacing at 100%; keep compact nodes below it.
        return camera.zoom>=1 ? <div className="map-repo-detail" key={id} style={position(p)}><SystemNode state={s} serviceId={id} dispatch={dispatch} nodeRef={node=>registerNode(id,node)}/></div> : <button key={id} className={`map-repo-label ${h<100?'degraded':''} ${automated?'fully-automated':''}`} style={{...position(p),width:Math.min(112,Math.max(68,290*camera.zoom-4))}} title={`${repo.name} · ${h}% health · ${findings.length} open${automated?' · Automated scans and fixes':''}`} aria-label={`Focus ${repo.name}`} onClick={()=>focusRepo(id)}><strong>{repo.name}</strong>{automated?<span className="automation-badge">Automated</span>:<span>{h}% · {findings.length} open</span>}</button>;
      })}
    </div>
    <div className="canvas-bottom"><span id="canvas-help">Two fingers to pan · pinch to zoom</span><div className="canvas-zoom" aria-label="Map zoom controls"><button aria-label="Zoom out" onClick={()=>zoom(1/1.4)}>−</button><output>{Math.round(camera.zoom*100)}%</output><button aria-label="Zoom in" onClick={()=>zoom(1.4)}>+</button><button onClick={()=>navigate(null)}>Fit all</button></div>
    </div>
    <div className="canvas-caption"><span>{s.campaign!.repositoryCount<CORPORATE.maxRepositories?`Next repo in ${Math.max(0,Math.ceil(s.campaign!.nextRepositoryAt-s.time))}s`:'100 repos · live'}</span></div>
  </div>;
}
