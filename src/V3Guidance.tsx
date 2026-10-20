import {useEffect, useState} from 'react';
import {type V3State} from './v3Game.ts';
import {selectGuidance} from './v3Guidance.ts';
export function useV3Guidance(state: V3State) {
  const [shown, setShown] = useState<Record<string, number>>({});
  const hint = selectGuidance(state, shown);
  useEffect(() => {
    if (state.status === 'ready') setShown({});
  }, [state.status === 'ready']);
  useEffect(() => {
    if (hint && shown[hint.id] === undefined) setShown(old => ({...old, [hint.id]: state.time}));
  }, [hint?.id]);
  return {hint, dismiss: () => {if (hint) setShown(old => ({...old, [hint.id]: -Infinity}));}};
}
