import {useId} from 'react';

/** Shares the victory presentation clock; never advances or changes the game. */
export default function V3Champagne({elapsed, reduced}: {elapsed: number; reduced: boolean}) {
  const clip = useId(), time = reduced ? 6 : elapsed;
  const entry = Math.min(1, time / 1.1), walking = entry < 1;
  const popAt = 1.6, flight = Math.max(0, Math.min(1, (time - popAt) / .8));
  const popped = time >= popAt, spray = Math.max(0, Math.min(1, (time - popAt) / 2));
  const stride = walking ? Math.sin(time * Math.PI * 3.1) * 26 : 0;
  const x = 385 + 70 * (1 - entry), bob = walking ? -Math.abs(Math.sin(time * Math.PI * 3.1)) : 0;
  return <g data-champagne data-popped={popped} aria-hidden="true" pointerEvents="none">
    <defs><clipPath id={clip}><rect x="340" y="0" width="90" height="158"/></clipPath></defs>
    <g clipPath={`url(#${clip})`}>
      <g className="v3-champagne-waiter" transform={`translate(${x} 138)`}>
        <ellipse cy="3" rx="12" ry="3.5" fill="#0006"/>
        <g transform="translate(-3 -8)"><g transform={`rotate(${stride})`}><path d="M0 0L-1 4L-2 8" fill="none" stroke="#6f7a72" strokeWidth="3.5" strokeLinecap="round"/><path d="M-4 8H0" stroke="#9aa38e" strokeWidth="3" strokeLinecap="round"/></g></g>
        <g transform="translate(3 -8)"><g transform={`rotate(${-stride})`}><path d="M0 0L1 4L2 8" fill="none" stroke="#89968b" strokeWidth="3.5" strokeLinecap="round"/><path d="M0 8H4" stroke="#c3c8af" strokeWidth="3" strokeLinecap="round"/></g></g>
        <g transform={`translate(0 ${bob})`}>
          <path d="M0 -19V-8" stroke="#efe6cf" strokeWidth="11" strokeLinecap="round"/>
          <path d="M-4 -22L0 -19L4 -22V-10H-4Z" fill="#384942"/>
          <path d="M-4 -12H4L5 -5H-5Z" fill="#e2ddc9"/>
          <circle cy="-28" r="5.8" fill="#cba17b"/>
          <path d="M-6 -29Q-5 -37 4 -34L6 -29Q1 -33 -6 -29" fill="#414233"/>
          <circle cx="-2" cy="-28.5" r=".65" fill="#493a2c"/><circle cx="2" cy="-28.5" r=".65" fill="#493a2c"/>
          <path d="M-2 -25.5Q0 -23 2 -25.5" fill="none" stroke="#493a2c" strokeWidth=".8" strokeLinecap="round"/>
          <path d="M-3 -22L0 -21L3 -22V-19L0 -20L-3 -19Z" fill="#b98369"/>
          <g transform="translate(11 -36) rotate(15)">
            <path d="M-3 -7H3V-2Q6 0 6 4V15Q0 18 -6 15V4Q-6 0 -3 -2Z" fill="#526d43" stroke="#a8b889" strokeWidth=".8"/>
            <path d="M-5 5H5V12H-5Z" fill="#e7d3a1"/>
            <path d="M-3 -7H3V-2H-3Z" fill="#cbb071"/>
            {!popped && <rect x="-2" y="-11" width="4" height="4" rx="1" fill="#a88251"/>}
          </g>
          <path d="M4 -18L10 -18L12 -26" fill="none" stroke="#cba17b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={popped ? 'M-4 -18L-11 -27L-10 -34' : 'M-4 -18L-8 -26L9 -43'} fill="none" stroke="#cba17b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </g>
      {!reduced && popped && flight < 1 && <rect data-champagne-cork x="-2" y="-2" width="4" height="4" rx="1" fill="#b99763" transform={`translate(${398 + flight * 29} ${93 - flight * 65 + flight * flight * 30}) rotate(${flight * 240})`}/>}
      {!reduced && popped && spray < 1 && <g data-champagne-spray opacity={1 - spray}>
        {[0, 1, 2, 3, 4, 5, 6].map(i => <circle key={i} cx={398 + (i - 3) * 10 * spray} cy={93 - (42 + (i % 3) * 12) * spray + 65 * spray * spray} r={i % 2 ? 1.5 : 2} fill={i % 2 ? '#f0e5bb' : '#d3bd77'}/>)}
      </g>}
    </g>
  </g>;
}
