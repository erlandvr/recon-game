import {useLayoutEffect, useRef, type RefObject} from 'react';
import type {Action, GameState} from './game.ts';
/** Keep scroll position and keyboard focus at the next choice when a row moves down. */
export default function useRepairList(state:GameState, panel:RefObject<HTMLElement|null>, dispatch:(action:Action)=>void) {
  const pending=useRef<{index:number;scroll:number}|null>(null);
  useLayoutEffect(()=>{
    if(!pending.current||!panel.current)return;
    const {index,scroll}=pending.current;pending.current=null;
    const buttons=panel.current.querySelectorAll<HTMLButtonElement>('.context-findings button:not(:disabled)');
    const next=buttons[Math.min(index,buttons.length-1)]??panel.current.querySelector<HTMLButtonElement>('button');
    next?.focus({preventScroll:true});panel.current.scrollTop=scroll;
  },[state,panel]);
  return (findingId:number)=>{
    if(panel.current){
      const buttons=[...panel.current.querySelectorAll<HTMLButtonElement>('.context-findings button:not(:disabled)')];
      pending.current={index:Math.max(0,buttons.findIndex(b=>b.getAttribute('aria-label')===`Repair finding ${findingId}`)),scroll:panel.current.scrollTop};
    }
    dispatch({type:'repair',findingId});
  };
}
