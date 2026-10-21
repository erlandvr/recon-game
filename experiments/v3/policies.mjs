import {buy, counts, quote} from './engine.mjs';

export const POLICIES = {
  balanced: {label: 'Balanced', hires: 3, hireAt: 2, reconAt: 5, plusAt: 9},
  hire: {label: 'Hire first', hires: 4, hireAt: 1, reconAt: 5, plusAt: 9},
  expand: {label: 'Expand first', hires: 2, hireAt: 4, reconAt: 7, plusAt: 10},
  recon: {label: 'Save for Recon', hires: 2, hireAt: 3, reconAt: 3, plusAt: 7},
  speed: {label: 'Maintenance speed first', hires: 3, hireAt: 2, reconAt: 5, plusAt: 9, speed: true},
  noRecon: {label: 'Developers only', hires: 5, hireAt: 2, reconAt: Infinity, plusAt: Infinity},
  noPlus: {label: 'Recon only', hires: 3, hireAt: 2, reconAt: 4, plusAt: Infinity},
  overhire: {label: 'Over-hire', hires: 6, hireAt: 1, reconAt: 5, plusAt: 9},
};
// Each reaction permits at most one paid action. No credit injection or free work.
export function decide(s, name) {
  const p = POLICIES[name], n = counts(s);
  const can = action => !quote(s, action).reason && s.credits >= quote(s, action).cost;
  const doBuy = action => can(action) && buy(s, action);
  if (p.speed && !s.speed && n.built >= 3) return doBuy('speed');
  if (!s.recon && n.built >= p.reconAt) return doBuy('recon');
  if (s.recon === 1 && n.built >= p.plusAt) return doBuy('plus');
  if (s.developers.length < p.hires && n.built >= p.hireAt) {
    if (doBuy('hire')) return true;
  }
  // Limit prepaid queued construction: capacity is required to complete each one.
  if (n.total - n.built < Math.max(1, s.developers.length - n.building) && n.total < s.config.cap) return doBuy('system');
  return false;
}
