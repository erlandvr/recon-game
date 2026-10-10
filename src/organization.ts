import type { GameState } from './game.ts';
import type { ServiceId } from './campaign.ts';

export const CORPORATE = { repositoryInterval: 6, maxRepositories: 100 } as const;
export type Repository = { id: ServiceId; name: string; role: string; baseIncome: number; moduleId: string; dependencies: ServiceId[] };
export type Module = { id: string; name: string; projectId: string; repositoryIds: ServiceId[] };
export type Project = { id: string; name: string; moduleIds: string[] };
export type Organization = { seed: number; repositories: Repository[]; modules: Module[]; projects: Project[] };
export type Scope = { level: 'module' | 'project'; id: string };
const MODULE_NAMES = ['Core experience','Orders','Billing','Customer accounts','Search','Catalog','Inventory','Fulfilment','Notifications','Payments','Analytics','Reporting','Data ingestion','Data warehouse','Access management','Audit','Compliance','Support','Partner integrations','Public APIs','Workflow','Scheduling','Documents','Media','Observability','Infrastructure','Feature delivery','Experimentation','Recommendations','Fraud detection','Subscriptions','Pricing','Localization','Developer tools'];
const PROJECT_NAMES = ['Customer platform','Commerce','Operations','Data & insights','Business services','Enterprise platform','Partner ecosystem','Internal tooling','Global delivery','Shared services','Corporate systems','New markets'];
const ROLES = ['API','Web','Worker','Events','Data'];

/** Seeded partitioning makes runs varied and each individual simulation reproducible. */
export function createOrganization(seed: number): Organization {
  let randomState = seed >>> 0;
  const random = () => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
  function partition(total: number) {
    const sizes: number[] = [];
    while (total) {
      const allowed = [3,4,5].filter(n => total - n === 0 || total - n >= 3);
      const size = allowed[Math.floor(random() * allowed.length)]; sizes.push(size); total -= size;
    }
    return sizes;
  }
  const repositories: Repository[] = [], modules: Module[] = [], projects: Project[] = [];
  for (const [index, size] of partition(100).entries()) {
    const module: Module = { id: `module-${index + 1}`, name: MODULE_NAMES[index] ?? `Business unit ${index + 1}`, projectId: '', repositoryIds: [] };
    for (let n = 0; n < size; n++) {
      const number = repositories.length;
      const id: ServiceId = number === 0 ? 'backend' : number === 1 ? 'frontend' : number === 2 ? 'auth' : `repo-${number + 1}`;
      const name = number === 0 ? 'Backend' : number === 1 ? 'Frontend' : number === 2 ? 'Identity' : `${module.name} ${ROLES[n]}`;
      repositories.push({ id, name, role: ROLES[n], baseIncome: number === 0 ? 2 : number === 1 ? 1.6 : number === 2 ? 1.2 : [2,1.6,1.2,1.2,1.6][n], moduleId: module.id, dependencies: [] });
      module.repositoryIds.push(id);
    }
    modules.push(module);
  }
  let offset = 0;
  for (const [index, size] of partition(modules.length).entries()) {
    const project: Project = { id: `project-${index + 1}`, name: PROJECT_NAMES[index] ?? `Enterprise division ${index + 1}`, moduleIds: [] };
    for (const module of modules.slice(offset, offset + size)) { module.projectId = project.id; project.moduleIds.push(module.id); }
    offset += size; projects.push(project);
  }
  for (const repo of repositories) {
    if (repo.id === 'backend' || repo.id === 'frontend') { repo.dependencies = ['auth']; continue; }
    if (repo.id === 'auth') continue;
    const module = modules.find(m => m.id === repo.moduleId)!;
    const project = projects.find(p => p.id === module.projectId)!;
    const shared = modules.find(m => m.id === project.moduleIds[0])!.repositoryIds[0];
    const dependency = repo.id === module.repositoryIds[0] ? shared : module.repositoryIds[0];
    if (dependency !== repo.id) repo.dependencies = [dependency];
  }
  return { seed: seed >>> 0, repositories, modules, projects };
}
export function repository(s: GameState, id: ServiceId): Repository {
  const found = s.organization.repositories.find(r => r.id === id);
  if (!found) throw new Error(`Unknown repository: ${id}`);
  return found;
}
export function scopeRepositories(s: GameState, scope: Scope): ServiceId[] {
  const modules = scope.level === 'module' ? s.organization.modules.filter(m => m.id === scope.id) : s.organization.modules.filter(m => m.projectId === scope.id);
  const ids = new Set(modules.flatMap(m => m.repositoryIds));
  const connected = new Set(s.organization.repositories.slice(0, s.campaign?.repositoryCount ?? 1).map(r => r.id));
  return [...ids].filter(id => connected.has(id));
}
