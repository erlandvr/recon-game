import {useEffect,useRef,useState} from 'react';
/** Session-only, opt-in sound. The audio context is opened by a user gesture. */
export default function useChapterSound(){
 const [enabled,setEnabled]=useState(false),context=useRef<AudioContext|null>(null);
 useEffect(()=>()=>{void context.current?.close();},[]);
 function play(){
  const audio=context.current;if(!audio||audio.state!=='running')return;
  const start=audio.currentTime;
  for(const [index,hz] of [523.25,659.25,783.99].entries()){
   const oscillator=audio.createOscillator(),gain=audio.createGain(),at=start+index*.09;
   oscillator.type='sine';oscillator.frequency.value=hz;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.28);
   oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.3);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
 }
 async function toggle(){
  if(enabled){setEnabled(false);await context.current?.suspend();return;}
  try{context.current??=new AudioContext();await context.current.resume();setEnabled(context.current.state==='running');}catch{setEnabled(false);}
 }
 return {enabled,toggle,play:()=>{if(enabled)play();}};
}
