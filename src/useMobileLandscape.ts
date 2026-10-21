import {useEffect, useRef, useState} from 'react';

// Only touch phones need the rotation gate; resizing a desktop window stays usable.
export function needsLandscape() {
  return matchMedia('(any-pointer: coarse)').matches && innerWidth <= 600 && innerHeight > innerWidth;
}

export function useMobileLandscape(inProgress: boolean) {
  const [portrait, setPortrait] = useState(needsLandscape);
  const [resumeRequired, setResumeRequired] = useState(false);
  const active = useRef(inProgress); active.current = inProgress;
  useEffect(() => {
    const pointer = matchMedia('(any-pointer: coarse)');
    function sync() {
      const next = needsLandscape();
      if (next && active.current) setResumeRequired(true);
      setPortrait(next);
    }
    window.addEventListener('resize', sync);
    pointer.addEventListener('change', sync);
    sync();
    return () => {window.removeEventListener('resize', sync); pointer.removeEventListener('change', sync);};
  }, []);
  return {portrait, held: portrait || resumeRequired, continue: () => setResumeRequired(false)};
}
