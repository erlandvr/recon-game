import {createState, advance, buy, quote, counts, economy, summary, interval} from './engine.mjs';
import {POLICIES, decide} from './policies.mjs';
const $=id=>document.getElementById(id);
const environments={candidate:{},baseline:{cap:12,reconFixSeconds:3},pressure:{matureAge:45,oldInterval:12}};
const labels={system:'Build a system',hire:'Hire a developer',recon:'Install Recon',plus:'Upgrade to Recon Plus',speed:'Improve maintenance speed'};
const descriptions={system:'Paid construction · needs a developer',hire:'Construction and maintenance · adds wages',recon:'One maintenance job at a time',plus:'Three jobs at a time, total',speed:'40% faster repairs for developers and Recon'};
let state=createState(),playing=false,started=false,fraction=0,previous=performance.now(),lastDecision=-Infinity,lastRender=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const [key,p] of Object.entries(POLICIES))$('policy').add(new Option(p.label,key));
for(const key of Object.keys(labels)){
 const item=document.createElement('div');item.className='purchase';
 const button=document.createElement('button');button.id=`buy-${key}`;
 button.addEventListener('click',()=>{
  if(!playing||$('policy').value!=='manual')return;
  if(buy(state,key))$('notice').textContent=`${labels[key]} purchased.`;
  render();
 });
 const p=document.createElement('p');p.textContent=descriptions[key];item.append(button,p);$('purchases').append(item);
}
function reset(){
 state=createState(environments[$('scenario').value],Number($('seed').value)||1);
 playing=false;started=false;fraction=0;lastDecision=-Infinity;
 $('notice').textContent='Start, then choose an investment.';render();
}
$('play').onclick=()=>{if(state.result)return;playing=!playing;started=true;previous=performance.now();
 $('notice').textContent=$('policy').value==='manual'?'Choose where to invest your credits.':`${POLICIES[$('policy').value].label} policy is making the purchases.`;render();};
$('reset').onclick=reset;
$('policy').onchange=()=>{lastDecision=-Infinity;render();};
$('download').onclick=()=>{
 const blob=new Blob([JSON.stringify({kind:'experimental V3 run',config:state.config,summary:summary(state),actions:state.actions,events:state.events,samples:state.samples},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`v3-run-${state.seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
document.addEventListener('visibilitychange',()=>{previous=performance.now();});
const clock=t=>`${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
const position=id=>({x:70+(id%5)*139,y:100+Math.floor(id/5)*135});
const home=id=>({x:855,y:90+id*57});
function svg(){
 let out=`<text x="25" y="30" fill="#c8d0c1" font-size="15">Systems · growth needs developer time</text><text x="785" y="30" fill="#c8d0c1" font-size="15">Developers</text><line x1="757" y1="50" x2="757" y2="460" stroke="#45513e"/>`;
 for(let id=0;id<state.config.cap;id++){
  const p=position(id),sys=state.systems[id];
  if(!sys){out+=`<rect x="${p.x-49}" y="${p.y-32}" width="105" height="83" rx="5" fill="none" stroke="#364230" stroke-dasharray="3 5"/><text x="${p.x+3}" y="${p.y+12}" text-anchor="middle" fill="#788670" font-size="14">Build ${id+1}</text>`;continue;}
  const issue=sys.issue,construct=sys.build<1,color=construct?'#83b5d9':issue?.owner==='recon'?'#efcc77':issue?'#edaa67':'#a9d29b';
  const status=construct?`${Math.round(sys.build*100)}% built`:issue?.owner==='recon'?'Recon':issue?'Maintenance':'Operating';
  out+=`<rect x="${p.x-49}" y="${p.y-32}" width="105" height="83" rx="5" fill="#20281d" stroke="${color}" stroke-width="1.5"/><text x="${p.x+3}" y="${p.y-10}" text-anchor="middle" fill="#f0f3ec" font-size="16">System ${id+1}</text><text x="${p.x+3}" y="${p.y+12}" text-anchor="middle" fill="${color}" font-size="12">${status}</text>`;
  const progress=construct?sys.build:issue?issue.progress:1;
  out+=`<rect x="${p.x-36}" y="${p.y+24}" width="79" height="4" fill="#3d4637"/><rect x="${p.x-36}" y="${p.y+24}" width="${79*progress}" height="4" fill="${color}"/>`;
  if(!construct)out+=`<text x="${p.x+3}" y="${p.y+70}" text-anchor="middle" fill="#aebca4" font-size="12">Age ${Math.floor(state.time-sys.builtAt)}s</text>`;
 }
 for(const d of state.developers){
  const h=home(d.id),dest=d.target===null?h:position(d.target);
  const f=d.mode==='walk'?1-d.remaining/state.config.travelSeconds:d.mode==='fix'?1:d.mode==='return'?d.remaining/state.config.travelSeconds:0;
  const x=h.x+(dest.x-h.x)*f,y=h.y+(dest.y-h.y)*f;
  out+=`<rect x="${h.x-45}" y="${h.y-21}" width="93" height="37" rx="3" fill="#293322" stroke="#4a583f"/><text x="${h.x}" y="${h.y+34}" text-anchor="middle" fill="#b5c3aa" font-size="11">Dev ${d.id+1} · ${d.mode}</text>`;
  if(d.mode==='walk'||d.mode==='return')out+=`<line x1="${h.x}" y1="${h.y}" x2="${dest.x}" y2="${dest.y}" stroke="#78926a" stroke-dasharray="3 7" opacity=".5"/>`;
  const facing=d.mode==='return'?1:-1,turn=state.time-d.turnAt<.5&&!reduced.matches;
  const limb=reduced.matches?0:Math.sin(state.time*12+d.id)*3;
  const hammer=d.mode==='fix'?`<g transform="rotate(${reduced.matches?0:Math.sin(state.time*13)*35} 12 -2)"><path d="M12 0L12 -15" stroke="#dad2b8" stroke-width="3"/><rect x="7" y="-21" width="15" height="7" rx="1" fill="#edaa67"/></g>`:'';
  out+=`<g data-developer="${d.id}" data-mode="${d.mode}" transform="translate(${x} ${y-6}) scale(${facing} 1) rotate(${turn?-18:0})"><path d="M-5 10L${-7-limb} 20M5 10L${7+limb} 20" stroke="#c4dcb8" stroke-width="4"/><path d="M-8 -5Q0 -10 8 -5L9 10L-9 10Z" fill="#a9d29b"/><circle cx="0" cy="-14" r="7" fill="#ede8d5"/><path d="M-7 -17Q-2 -25 7 -16" fill="#5c7250"/><circle cx="3" cy="-14" r="1.2" fill="#182015"/>${hammer}</g>`;
  if(d.mode==='build')out+=`<path d="M${h.x-16} ${h.y+4}h32l-4 -13h-24Z" fill="#83b5d9" stroke="#d4e9ef"/>`;
 }
 return out;
}
function render(){
 const n=counts(state),e=economy(state),c=state.config;
 $('time').textContent=clock(state.time);$('credits').textContent=state.credits.toFixed(1);
 $('net').textContent=`${e.net>=0?'+':''}${e.net.toFixed(2)}`;$('net').title=`Revenue ${e.gross.toFixed(2)} − wages ${e.wages.toFixed(2)} − Recon ${e.upkeep.toFixed(2)}`;
 $('ledger').textContent=`Per second: revenue ${e.gross.toFixed(2)} − developer wages ${e.wages.toFixed(2)} − Recon upkeep ${e.upkeep.toFixed(2)} = net ${e.net.toFixed(2)} credits.`;
 $('built').textContent=`${n.built} / ${c.cap}`;$('slots').textContent=state.recon?`${n.reconBusy} / ${state.recon===2?3:1}`:'Not installed';
 $('state-label').textContent=state.result?'Autonomy demonstrated':!playing?(started?'Paused':'Ready to build'):`${n.failed} need maintenance · ${n.total-n.built} under construction`;
 $('board').innerHTML=svg();$('board').dataset.handoffs=state.handoffs.walk+state.handoffs.fix;
 $('play').textContent=playing?'Pause':started?'Resume':'Start';$('play').disabled=!!state.result;
 for(const key of Object.keys(labels)){const q=quote(state,key),b=$(`buy-${key}`);
  b.textContent=`${labels[key]} · ${q.cost} cr`;
  b.disabled=!playing||$('policy').value!=='manual'||!!q.reason||state.credits<q.cost||!!state.result;
  b.title=q.reason??(state.credits<q.cost?`Need ${(q.cost-state.credits).toFixed(1)} more credits`:'');
 }
 $('rules').textContent=`Candidate values: hiring ${c.hireCost} cr + ${c.wage} cr/s wages; construction ${c.constructionSeconds}s; operating income ${c.income} cr/s (20% during failure); travel ${c.travelSeconds}s; developer fix ${c.developerFixSeconds}s; Recon fix ${c.reconFixSeconds}s. Ageing levels off at ${c.matureAge}s. Win: all ${c.cap} built, Recon installed, ≥90% average uptime and ≤10% developer maintenance over ${c.stableSeconds}s, with positive net income.`;
 $('result').hidden=!state.result;
 if(state.result)$('result').innerHTML=`<strong>Capacity recovered · ${clock(state.result.at)}</strong>Experimental finish: ${(state.result.uptime*100).toFixed(1)}% uptime in the final window. Try another investment order, or download the evidence.`;
 $('accessible-status').innerHTML=`<p>Developers: ${state.developers.map(d=>`${d.id+1}: ${d.mode}${d.target!==null?` at system ${d.target+1}`:''}`).join('; ')}.</p><table><thead><tr><th>System</th><th>State</th><th>Age</th><th>Next repair interval</th></tr></thead><tbody>${state.systems.map(sys=>`<tr><td>${sys.id+1}</td><td>${sys.build<1?`Construction ${Math.round(sys.build*100)}%`:sys.issue?sys.issue.owner==='recon'?'Recon repairing':'Maintenance needed':'Operating'}</td><td>${sys.builtAt===null?'—':Math.floor(state.time-sys.builtAt)+'s'}</td><td>${sys.builtAt===null?'—':interval(state,sys).toFixed(1)+'s'}</td></tr>`).join('')}</tbody></table>`;
 $('events').innerHTML=state.events.slice(-8).reverse().map(ev=>`<li>${clock(ev.at)} · ${ev.kind}${ev.action?`: ${labels[ev.action]}`:''}${ev.system!==undefined?` · system ${ev.system+1}`:''}${ev.from?` · developer turns back from ${ev.from}`:''}</li>`).join('');
}
function frame(now){
 const elapsed=(now-previous)/1000;previous=now;let advanced=false;
 if(playing&&!document.hidden&&!state.result){
  fraction+=Math.min(.25,elapsed)*Number($('rate').value);
  while(fraction+1e-9>=state.config.tick&&!state.result){
   if($('policy').value!=='manual'&&state.time-lastDecision+1e-8>=Number($('reaction').value)){
    decide(state,$('policy').value);lastDecision=state.time;
   }
   advance(state,state.config.tick);fraction-=state.config.tick;advanced=true;
  }
  if(state.result)playing=false;
 }
 if(advanced&&(now-lastRender>80||state.result)){render();lastRender=now;}
 requestAnimationFrame(frame);
}
reduced.addEventListener('change',render);
render();requestAnimationFrame(frame);
