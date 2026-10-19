import type { Medal } from './medals.ts';
import { repository } from './organization.ts';
import type { GameState, Finding } from './game.ts';

export const SERVICES = {
  backend: { name: 'Backend', role: 'Requests & data', baseIncome: 2 },
  frontend: { name: 'Frontend', role: 'Customer experience', baseIncome: 1.6 },
  auth: { name: 'Identity', role: 'Shared sign-in', baseIncome: 1.2 },
} as const;
export type ServiceId = keyof typeof SERVICES | `repo-${number}`;
export type FindingKind = 'bug' | 'security' | 'compliance';
export const AUTOMATION_COST = 210;
export const AUTO_REPAIR_COST = 480;
export const AUTONOMY_SECONDS = 60;
export type AutonomyVictory = {at:number;duration:number;health:number;credits:number;autoScans:number;autoRepairs:number;netIncome:number;medal:Medal|null;practice:boolean};
export type Autonomy = { lastReset:null|{at:number;reason:string}; elapsed:number; startedAt:number|null; earnedStart:number; spentStart:number; scansStart:number; repairsStart:number; victory:null|AutonomyVictory };
export const newAutonomy = ():Autonomy => ({lastReset:null,elapsed:0,startedAt:null,earnedStart:0,spentStart:0,scansStart:0,repairsStart:0,victory:null});
export type Campaign = {
  startedAt: number; healthyStartedAt: number; connected: boolean; repositoryCount: number; nextRepositoryAt: number; extraEarned: number; companyAt: number | null; handoverAt: number | null;
  automated: ServiceId[]; nextScan: Partial<Record<ServiceId, number>>;
  autoScans: number; autoRepairs:number; remediation:ServiceId[]; nextAutomation:"scan"|"repair"; autonomy:Autonomy; missed: number;
  finalIds: number[]; result: null | { at: number; healthyTime: number; health: number; resolved: number; total: number; missed: number; autoScans: number };
};
export const serviceOf = (f: Finding) => f.serviceId ?? 'backend';
export const kindOf = (f: Finding) => f.kind ?? 'bug';
export const activeServices = (s: GameState): ServiceId[] => s.speed ? s.speed.owned : s.campaign?.connected ? (s.campaign.repositoryCount <= 3 ? ['backend', 'frontend', 'auth'] : s.organization.repositories.slice(0, s.campaign.repositoryCount).map(r => r.id)) : ['backend'];
export const serviceFindings = (s: GameState, id: ServiceId) => s.findings.filter(f => f.repairedAt === null && serviceOf(f) === id);
export function impact(f: Finding) {
  return kindOf(f) === 'bug' ? 20 : kindOf(f) === 'security' ? (f.escalated ? 40 : 10) : f.escalated ? 20 : 0;
}
export function serviceHealth(s: GameState, id: ServiceId): number {
  if(s.speed&&!s.speed.activated.includes(id))return 0;
  const local = serviceFindings(s, id).reduce((n, f) => n + impact(f), 0);
  const active = new Set(activeServices(s));
  const shared = Math.min(20, repository(s, id).dependencies.filter(dependency => active.has(dependency)).reduce((n, dependency) => n + serviceFindings(s, dependency).reduce((sum, f) => sum + impact(f), 0), 0));
  return Math.max(20, 100 - local - shared);
}
export function startCampaign(s: GameState) {
  if (s.campaign || !s.results) return;
  s.campaign = { startedAt: s.time, healthyStartedAt: s.healthyTime, connected: false, repositoryCount: 1, nextRepositoryAt: Infinity, extraEarned: 0, companyAt: null, handoverAt: null, automated: [], nextScan: { backend: s.time, frontend: s.time, auth: s.time }, autoScans: 0, autoRepairs:0, remediation:[], nextAutomation:"repair", autonomy:newAutonomy(), missed: 0, finalIds: [], result: null };
}
