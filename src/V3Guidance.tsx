import {useState} from 'react';
import {type V3State} from './v3Game.ts';
import {advanceGuidance, dismissGuidance, newGuidance, selectGuidance} from './v3Guidance.ts';
export function useV3Guidance(state: V3State) {
  const [snapshot, setSnapshot] = useState(() => ({state, progress: advanceGuidance(state, newGuidance())}));
  let progress = snapshot.progress;
  // Derive progress synchronously with the same simulation snapshot as the scene.
  // This guarded state adjustment avoids one-frame stale guidance and counts each tick once.
  if (snapshot.state !== state) {
    progress = advanceGuidance(state, progress);
    setSnapshot({state, progress});
  }
  return {
    hint: selectGuidance(state, progress), hidden: progress.hidden,
    dismiss: () => setSnapshot({state, progress: dismissGuidance(state, progress)}),
    hide: () => setSnapshot({state, progress: {...progress, active: null, hidden: true}}),
  };
}
