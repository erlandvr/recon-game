import {type V3State} from './v3Game.ts';
import {benchPosition, pathLength, positionOnPath, type Point} from './v3World.ts';

const ENTRANCE: Point = {x: 1210, y: 490}, AISLE = 988, SPEED = 140, SERVE = 1.2;
export type CoffeeVisit = {
  desks: number[];
  delivered: number[];
  waiter: null | {position: Point; walking: boolean; facing: -1 | 1; remaining: number; serving?: {desk: number; progress: number}};
};

/** Decorative replay of an existing purchase. Never changes jobs, clocks or the economy. */
export function coffeeVisit(state: V3State): CoffeeVisit | null {
  const index = state.purchases.findIndex(p => p.action === 'recon');
  if (index < 0) return null;
  // Purchase order also handles hires made at the same simulation time as Recon.
  const count = 1 + state.purchases.slice(0, index).filter(p => p.action === 'developer').length;
  const initialDesks = Array.from({length: count}, (_, id) => id).reverse();
  const rounds = [{at: state.purchases[index].at, desks: initialDesks}];
  let nextDesk = count;
  for (const purchase of state.purchases.slice(index + 1)) {
    if (purchase.action === 'developer') rounds.push({at: purchase.at, desks: [nextDesk++]});
  }
  const desks = rounds.flatMap(round => round.desks);
  const visit: CoffeeVisit = {desks, delivered: [], waiter: null};
  if (state.status === 'won') return {...visit, delivered: [...desks]};
  let cursor = 0;
  for (const round of rounds) {
    cursor = Math.max(cursor, round.at);
    if (state.time < cursor) return visit;
    let from = ENTRANCE;
    for (const [served, desk] of round.desks.entries()) {
      const to = {x: AISLE, y: benchPosition(desk).y + 10};
      const path = [from, {x: AISLE, y: from.y}, to], duration = pathLength(path) / SPEED;
      const remaining = round.desks.length - served;
      if (state.time < cursor + duration) return {...visit, waiter: {position: positionOnPath(path, (state.time - cursor) / duration), walking: true, facing: -1, remaining}};
      cursor += duration;
      if (state.time < cursor + SERVE) return {...visit, waiter: {position: to, walking: false, facing: -1, remaining, serving: {desk, progress: (state.time - cursor) / SERVE}}};
      cursor += SERVE; visit.delivered.push(desk); from = to;
    }
    const exit = [from, {x: AISLE, y: ENTRANCE.y}, ENTRANCE], duration = pathLength(exit) / SPEED;
    if (state.time < cursor + duration) return {...visit, waiter: {position: positionOnPath(exit, (state.time - cursor) / duration), walking: true, facing: 1, remaining: 0}};
    cursor += duration;
  }
  return visit;
}

export const coffeePosition = (desk: number): Point => ({x: benchPosition(desk).x + 36, y: benchPosition(desk).y - 7});
