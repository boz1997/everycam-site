import { useEffect, useState } from 'react';
import { isPlanId, type PlanId, type Tier } from './plans';

// Hash routing (plan §3.1): GitHub Pages serves static files only, and a hash
// never reaches the server, so every deep link resolves to /join/host/index.html
// without a rewrite. The site's buttons link here: #/new, #/new?plan=party,
// #/new?tier=pro&plan=pro1000 (WP-F).
//
//   #/                     events
//   #/signin?next=…        sign in (next = the hash to return to)
//   #/new?tier=&plan=      create (+ buy)
//   #/e/:id[/tab]          an event: overview · gallery · guests · settings · plan · downloads
//   #/e/:id/plan?plan=&new=1   package page, a plan pre-picked; new=1 = straight from create
//   #/e/:id?paid=<plan>[&new=1] the event after a payment: its own page, "{plan} is active"
//   #/e/:id?paid=<plan>&via=polar   …paid through Polar ("Polar sends the receipt"; no via = Paddle)
//   #/account              account

export const TABS = ['overview', 'gallery', 'guests', 'settings', 'plan', 'downloads'] as const;
export type Tab = (typeof TABS)[number];

export type Route =
  | { name: 'events' }
  | { name: 'signin'; next?: string }
  | { name: 'new'; tier: Tier; plan?: PlanId }
  | { name: 'event'; id: string; tab: Tab; plan?: PlanId; fresh?: boolean; paid?: PlanId; via?: 'polar' }
  | { name: 'account' };

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export function parseHash(hash: string): Route {
  const [path, qs = ''] = hash.replace(/^#/, '').replace(/^\/+/, '').split('?');
  const q = new URLSearchParams(qs);
  const parts = path.split('/').filter(Boolean);
  const planQ = q.get('plan');
  const plan = isPlanId(planQ) ? planQ : undefined;
  if (parts[0] === 'e' && parts[1] && ID_RE.test(parts[1])) {
    const tab = (TABS as readonly string[]).includes(parts[2] ?? '') ? (parts[2] as Tab) : 'overview';
    const paidQ = q.get('paid');
    const paid = tab === 'overview' && isPlanId(paidQ);
    return {
      name: 'event', id: parts[1], tab,
      ...(tab === 'plan' && plan ? { plan } : {}),
      ...(q.get('new') === '1' ? { fresh: true } : {}),
      ...(paid ? { paid: paidQ } : {}),
      ...(paid && q.get('via') === 'polar' ? { via: 'polar' as const } : {}),
    };
  }
  if (parts[0] === 'new') {
    const tier: Tier = q.get('tier') === 'pro' || (plan && plan.startsWith('pro')) ? 'pro' : 'consumer';
    return { name: 'new', tier, ...(plan ? { plan } : {}) };
  }
  if (parts[0] === 'signin') {
    const next = q.get('next') ?? undefined;
    return next && next.startsWith('#/') && !next.startsWith('#/signin') ? { name: 'signin', next } : { name: 'signin' };
  }
  if (parts[0] === 'account') return { name: 'account' };
  return { name: 'events' };
}

export function hrefFor(r: Route): string {
  switch (r.name) {
    case 'events':
      return '#/';
    case 'signin':
      return r.next ? `#/signin?next=${encodeURIComponent(r.next)}` : '#/signin';
    case 'new': {
      const q = new URLSearchParams();
      if (r.tier === 'pro') q.set('tier', 'pro');
      if (r.plan) q.set('plan', r.plan);
      const s = q.toString();
      return s ? `#/new?${s}` : '#/new';
    }
    case 'event': {
      const base = r.tab === 'overview' ? `#/e/${r.id}` : `#/e/${r.id}/${r.tab}`;
      const q = new URLSearchParams();
      if (r.tab === 'plan' && r.plan) q.set('plan', r.plan);
      if (r.fresh) q.set('new', '1');
      if (r.tab === 'overview' && r.paid) q.set('paid', r.paid);
      if (r.tab === 'overview' && r.paid && r.via === 'polar') q.set('via', 'polar');
      const s = q.toString();
      return s ? `${base}?${s}` : base;
    }
    case 'account':
      return '#/account';
  }
}

export function navigate(r: Route, replace = false): void {
  const href = hrefFor(r);
  if (replace) window.location.replace(href);
  else window.location.hash = href.slice(1);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
