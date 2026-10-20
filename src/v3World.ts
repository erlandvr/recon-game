/** Shared world coordinates: rendered travel and charged time use exactly the same path. */
export type Point = {x: number; y: number};
export const WORLD = {width: 1180, height: 535, walkSpeed: 150};
// Fixed, uneven islands: new systems grow into their reserved place without moving neighbours.
export const RECON = {x: 435, y: 180};
export const SYSTEM_SPOTS: Point[] = [
  {x: 92, y: 90}, {x: 242, y: 70}, {x: 245, y: 225}, {x: 90, y: 240},
  {x: 600, y: 75}, {x: 742, y: 105}, {x: 730, y: 260}, {x: 745, y: 395},
  {x: 590, y: 375}, {x: 240, y: 380}, {x: 90, y: 390}, {x: 585, y: 225},
];
export const SYSTEM_CLUSTERS = [[0, 1, 3], [2, 9, 10], [4, 5, 6], [7, 8, 11]];
export const SYSTEM_NAMES = ['Backend', 'Identity', 'Payments', 'Portal', 'Orders', 'Search', 'Analytics', 'Inventory', 'Messaging', 'Billing', 'Reports', 'Gateway'];
export const SYSTEM_LINKS = [[], [0], [1], [0, 1], [1], [4], [4, 1], [4], [7, 1], [1, 2], [9], [9, 1]];
export const benchPosition = (id: number): Point => ({x: 920, y: 90 + id * 90});
export const BACKLOG = {x: 1100, y: 72};
export const backlogPosition = (worker: number): Point => ({x: 1030, y: 85 + worker * 8});
export const backlogRoute = (worker: number): Point[] => {
  const start = benchPosition(worker), end = backlogPosition(worker), lane = 995 + worker * 7;
  return [start, {x: lane, y: start.y}, {x: lane, y: end.y}, end];
};
export const workPosition = (system: number): Point => ({x: SYSTEM_SPOTS[system].x + 36, y: SYSTEM_SPOTS[system].y + 34});
export const workRoute = (worker: number, system: number): Point[] => {
  const start = benchPosition(worker), end = workPosition(system);
  const aisle = 800 + worker * 10;
  // Carry below the radar housing before entering the western islands.
  // All segments remain orthogonal so interrupted workers can rejoin the same aisle graph.
  if (end.x < RECON.x) return [start, {x: aisle, y: start.y}, {x: aisle, y: 510},
    {x: 300, y: 510}, {x: 300, y: end.y + 58}, {x: end.x, y: end.y + 58}, end];
  return [start, {x: aisle, y: start.y}, {x: aisle, y: end.y + 58}, {x: end.x, y: end.y + 58}, end];
};
export function pathLength(path: Point[]): number {
  return path.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - path[i].x, p.y - path[i].y), 0);
}
export function pathPrefix(path: Point[], distance: number): Point[] {
  const result = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], length = Math.hypot(b.x - a.x, b.y - a.y);
    if (distance < length) {
      result.push({x: a.x + (b.x - a.x) * distance / length, y: a.y + (b.y - a.y) * distance / length});
      return result;
    }
    result.push(b); distance -= length;
  }
  return result;
}
export function positionOnPath(path: Point[], fraction: number): Point {
  return pathPrefix(path, pathLength(path) * Math.max(0, Math.min(1, fraction))).at(-1)!;
}

/** Shortest walk along existing workshop aisles, including mid-journey interruptions. */
export function routeBetween(worker: number, from: Point, to: Point): Point[] {
  const segments = SYSTEM_SPOTS.flatMap((_, id) => {
    const route = workRoute(worker, id);
    return route.slice(1).map((b, i) => [route[i], b] as const);
  });
  const pickup = backlogRoute(worker);
  segments.push(...pickup.slice(1).map((b, i) => [pickup[i], b] as const));
  const points: Point[] = [];
  const index = (p: Point) => {
    const found = points.findIndex(q => Math.hypot(p.x - q.x, p.y - q.y) < 1e-6);
    if (found >= 0) return found;
    return points.push({...p}) - 1;
  };
  const on = (p: Point, a: Point, b: Point) =>
    p.x >= Math.min(a.x, b.x) - 1e-6 && p.x <= Math.max(a.x, b.x) + 1e-6 &&
    p.y >= Math.min(a.y, b.y) - 1e-6 && p.y <= Math.max(a.y, b.y) + 1e-6;
  const start = index(from), end = index(to);
  for (const [a, b] of segments) {
    index(a); index(b);
    for (const [c, d] of segments) {
      if (a.x === b.x && c.y === d.y) {
        const p = {x: a.x, y: c.y};
        if (on(p, a, b) && on(p, c, d)) index(p);
      }
    }
  }
  const edges: {to: number; distance: number}[][] = points.map(() => []);
  for (const [a, b] of segments) {
    const ids = points.map((p, i) => ({p, i})).filter(({p}) => on(p, a, b))
      .sort((u, v) => u.p.x - v.p.x || u.p.y - v.p.y);
    for (let k = 1; k < ids.length; k++) {
      const u = ids[k - 1], v = ids[k], distance = Math.hypot(u.p.x - v.p.x, u.p.y - v.p.y);
      edges[u.i].push({to: v.i, distance}); edges[v.i].push({to: u.i, distance});
    }
  }
  const distance = points.map(() => Infinity), previous = points.map(() => -1), visited = new Set<number>();
  distance[start] = 0;
  while (!visited.has(end)) {
    let u = -1;
    for (let i = 0; i < points.length; i++) if (!visited.has(i) && (u < 0 || distance[i] < distance[u])) u = i;
    if (u < 0 || !Number.isFinite(distance[u])) throw new Error('Worker left the workshop paths');
    visited.add(u);
    for (const edge of edges[u]) if (distance[u] + edge.distance < distance[edge.to]) {
      distance[edge.to] = distance[u] + edge.distance; previous[edge.to] = u;
    }
  }
  const route = [points[end]];
  for (let i = end; i !== start;) {i = previous[i]; route.unshift(points[i]);}
  return route;
}
