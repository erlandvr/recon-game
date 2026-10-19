/** Calibrated against paid fresh-run playtests; see MEDAL_PLAYTEST.md. */
export const MEDALS = [
  {id:'gold',name:'Gold',through:25*60},
  {id:'silver',name:'Silver',through:30*60},
  {id:'bronze',name:'Bronze',through:Infinity},
] as const;
export type Medal = typeof MEDALS[number]['id'];
export function medalForTime(seconds:number):Medal {
  if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('A finish time must be finite and nonnegative.');
  return MEDALS.find(m=>seconds<=m.through)!.id;
}
/** Round up fractional ticks so a missed cutoff never displays as matching it. */
export function finishTime(seconds:number) {
  const total=Math.ceil(seconds);
  return `${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toString().padStart(2,'0')}`;
}
