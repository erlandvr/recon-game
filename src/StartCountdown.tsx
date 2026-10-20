import {useEffect,useRef,useState} from 'react';
import './start-countdown.css';

export default function StartCountdown({onGo,onDone,goLabel="MAKE IT AUTONOMOUS",focusSelector=".sg-system-detail button:not(:disabled)",reducedMotion=false,theme='arcade'}:{onGo:()=>void;onDone:()=>void;goLabel?:string;focusSelector?:string;reducedMotion?:boolean;theme?:'arcade'|'workshop'}){
 const [step,setStep]=useState(0),[hidden,setHidden]=useState(document.hidden),dialog=useRef<HTMLDialogElement>(null);
 const callbacks=useRef({onGo,onDone});callbacks.current={onGo,onDone};
 useEffect(()=>{
  const modal=dialog.current!;modal.showModal();let elapsed=0,previous=performance.now(),started=false;
  const timer=setInterval(()=>{
   const now=performance.now();if(!document.hidden)elapsed+=now-previous;previous=now;
   setStep(Math.min(3,Math.floor(elapsed/1000)));
   if(elapsed>=3000&&!started){started=true;modal.close();callbacks.current.onGo();requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>(focusSelector)?.focus());}
   if(elapsed>=3800){clearInterval(timer);callbacks.current.onDone();}
  },25);
  function visibility(){previous=performance.now();setHidden(document.hidden);}
  document.addEventListener('visibilitychange',visibility);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);modal.close();};
 },[]);
 function content(){return <div className="start-count-visual" data-hidden={hidden} data-reduced={reducedMotion} data-theme={theme}><span className="start-count-label">{step<3?(theme==='workshop'?'WORKSHOP POWERING UP':'GET READY'):goLabel}</span><strong key={step} className={step===3?'start-count-go':'start-count-number'}>{step===3?'GO!':3-step}</strong>{(step<3 || theme==='workshop')?<span className="start-count-beats" aria-hidden="true">{[0,1,2].map(i=><i key={i} className={i<=step?'lit':''}/>)}</span>:<div className="start-count-sparks" aria-hidden="true">{Array.from({length:52},(_,i)=><i key={i} style={{'--angle':`${i*360/52}deg`,'--reach':`${150+(i%7)*29}px`,'--delay':`${i%4*12}ms`} as React.CSSProperties}/>)}</div>}</div>;}
 return <><dialog ref={dialog} className={`start-count-dialog ${theme === 'workshop' ? 'v3-count-dialog' : ''}`} aria-label={theme === 'workshop' ? 'Experience starts in' : 'Game starts in'} onCancel={e=>e.preventDefault()}><div role="status" aria-live="assertive" aria-atomic="true">{step<3&&content()}</div></dialog>{step===3&&<div className="start-count-overlay" role="status" aria-live="assertive">{content()}</div>}</>;
}
