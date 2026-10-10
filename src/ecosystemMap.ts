import type { Organization, Scope } from './organization.ts';

export type Point = { x: number; y: number };
export type Camera = Point & { zoom: number };
export type Bounds = Point & { width: number; height: number };
export const MIN_ZOOM = .012;
export const MAX_ZOOM = 1.6;

/** Positions depend on the full seeded organization, never the active repo count. */
export function ecosystemLayout(org: Organization) {
  const repos: Record<string, Point> = {}, modules: Record<string, Point> = {}, projects: Record<string, Point> = {};
  const columns = Math.ceil(org.projects.length / 2);
  org.projects.forEach((project, pi) => {
    const origin = { x: (pi % columns) * 3400, y: Math.floor(pi / columns) * 3400 };
    projects[project.id] = origin;
    project.moduleIds.forEach((id, mi) => {
      const angle = -Math.PI / 2 + mi * Math.PI * 2 / project.moduleIds.length;
      const center = { x: origin.x + Math.cos(angle) * 1000, y: origin.y + Math.sin(angle) * 1000 };
      modules[id] = center;
      const module = org.modules.find(m => m.id === id)!;
      module.repositoryIds.forEach((repoId, ri) => {
        const count = module.repositoryIds.length;
        const offsets = count === 3 ? [[-300,0],[0,0],[300,0]] : count === 4 ? [[-260,-120],[260,-120],[-260,120],[260,120]] : [[-300,-120],[0,-120],[300,-120],[-150,120],[150,120]];
        repos[repoId] = { x: center.x + offsets[ri][0], y: center.y + offsets[ri][1] };
      });
    });
  });
  return { repos, modules, projects };
}
export function mapBounds(points: Point[], padding = 90): Bounds {
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const x = Math.min(...xs, points.length ? Infinity : 0) - padding;
  const y = Math.min(...ys, points.length ? Infinity : 0) - padding;
  return { x, y, width: Math.max(...xs, points.length ? -Infinity : 0) - x + padding, height: Math.max(...ys, points.length ? -Infinity : 0) - y + padding };
}
export function fitCamera(bounds: Bounds, size: {width:number;height:number}): Camera {
  const zoom = Math.max(MIN_ZOOM, Math.min(1, (size.width - 80) / bounds.width, (size.height - 60) / bounds.height));
  return { zoom, x: size.width / 2 - (bounds.x + bounds.width / 2) * zoom, y: size.height / 2 - (bounds.y + bounds.height / 2) * zoom };
}
export function zoomCamera(camera: Camera, anchor: Point, factor: number): Camera {
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom * factor));
  return { zoom, x: anchor.x - (anchor.x-camera.x) * zoom/camera.zoom, y: anchor.y - (anchor.y-camera.y) * zoom/camera.zoom };
}
export function scopeRepoIds(org: Organization, scope: Scope): string[] {
  return org.modules.filter(m => scope.level === 'module' ? m.id === scope.id : m.projectId === scope.id).flatMap(m => m.repositoryIds);
}

/** Place focused group labels near their anchors without obscuring another control. */
export function placeGroupLabels(labels: (Point & {id:string;width:number;height:number})[], size:{width:number;height:number}) {
  const placed: (Point & {id:string;width:number;height:number})[]=[];
  for(const label of labels){
    const clamp=(p:Point)=>({x:Math.max(label.width/2+2,Math.min(size.width-label.width/2-2,p.x)),y:Math.max(label.height/2+2,Math.min(size.height-label.height/2-2,p.y))});
    const free=(p:Point)=>placed.every(other=>Math.abs(other.x-p.x)>=(other.width+label.width)/2+4||Math.abs(other.y-p.y)>=(other.height+label.height)/2+4);
    let best=clamp(label),distance=free(best)?(best.x-label.x)**2+(best.y-label.y)**2:Infinity;
    if(!free(best))for(let y=label.height/2+2;y<=size.height-label.height/2-2;y+=4)for(let x=label.width/2+2;x<=size.width-label.width/2-2;x+=4){
      const d=(x-label.x)**2+(y-label.y)**2;if(d<distance&&free({x,y})){best={x,y};distance=d;}
    }
    placed.push({...label,...best});
  }
  return Object.fromEntries(placed.map(p=>[p.id,p]));
}
