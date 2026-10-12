"""Standalone design experiment. Does not import or change the game engine.
Half-second ticks, paid actions, known findings, finite work slots, queue,
per-system income/coverage, and one map decision per reaction interval.
No dependencies, compliance, UI navigation delay, or random incidents.
Planning purchases use zero active time; map purchases consume decisions.
"""
from dataclasses import dataclass, asdict, replace
import json

@dataclass(frozen=True)
class Tuning:
    system_base: float = 80
    system_step: float = 20
    system_cap: float = 280
    system_curve: float = 0
    income: float = 2
    scanner_price: float = 220
    master_price: float = 700
    scan_setup: float = 80
    fix_setup: float = 140
    master_fix_setup: float = 140
    master_fix_cost: float = 15
    scanner_scan_cost: float = 5
    incident_single: float = 32
    incident_small: float = 22
    incident_large: float = 10
    slot_price: float = 150
    purchase_reserve: float = 20
    model_reserve: float = 35
    per_system_incident_period: float = 0
    starter_grace: float = 32
    tiered_automation: bool = False
    income_base_share: float = .75
    failure_multiplier: float = .75
    max_time: int = 900

def simulate(c=Tuning(), route='scanner', reaction=2, before_model=4,
             capacity=2, style='growth', neglect_until=0, trace=False, group_work=False):
    now=0.; cash=40.; model=False; model_at=None; slots=1
    repos=[{'active':False,'scan':False,'fix':False,'next_scan':0.}]
    fs=[{'repo':0,'known':False,'done':False,'initial':True,'born':0.}]
    jobs=[]; queue=[]; next_bug=None; bug_i=0; earned=0.; spent=0.
    actions=0; auto_scans=0; auto_fixes=0; trial=None; trial_start_counts=None
    trial_resets=0; activations=[]; buys=[]; first_auto=None; last_coverage=None
    min_health=100.; busy_integral=0.; max_queue=0; logs=[]; last_map_action=None
    model_price=c.scanner_price if route=='scanner' else c.master_price
    def pay(cost,kind,repo=None):
        nonlocal cash,spent,actions,last_map_action
        assert cash+1e-8>=cost
        cash-=cost;spent+=cost
        if kind not in ('model','slot','auto-job'): actions+=1;last_map_action=now
        if trace: logs.append({'at':now,'kind':kind,'repo':repo,'cost':cost,'cash':round(cash,2)})
    def outstanding(i): return [f for f in fs if f['repo']==i and not f['done']]
    def health(i): return 0 if not repos[i]['active'] else max(20,100-20*len(outstanding(i)))
    def in_work(kind,i,fid=None):
        return any(j['kind']==kind and j['repo']==i and (kind=='scan' or j['fid']==fid) for j in jobs+queue)
    def job_cost(kind):
        if kind=='scan': return c.scanner_scan_cost if model and route=='scanner' else 5
        return c.master_fix_cost if model and route=='master' else 15
    def start_job(j):
        duration=(1 if model and route=='scanner' else 3) if j['kind']=='scan' else (1 if model and route=='master' else 5)
        j['end']=now+duration
        if j['kind']=='scan': j['captured']=[k for k,f in enumerate(fs) if f['repo']==j['repo'] and not f['done'] and not f['known']]
        jobs.append(j)
    def submit(kind,i,fid=None,automatic=False):
        cost=job_cost(kind)
        if cash+1e-8<cost+(20 if automatic else 0): return False
        pay(cost,'auto-job' if automatic else kind,i)
        j={'kind':kind,'repo':i,'fid':fid,'auto':automatic}
        if len(jobs)<slots: start_job(j)
        else: queue.append(j)
        return True
    def candidates(automatic=False):
        pending=[]
        for k,f in enumerate(fs):
            i=f['repo']
            if f['done'] or not f['known'] or in_work('fix',i,k): continue
            if automatic!=repos[i]['fix']: continue
            pending.append((0 if f['initial'] else 1,'fix',i,k))
        for i,r in enumerate(repos):
            hidden=any(not f['known'] for f in outstanding(i))
            if hidden and not in_work('scan',i) and automatic==r['scan'] and (not automatic or now>=r['next_scan']):
                pending.append((0 if not r['active'] else 2,'scan',i,None))
        return sorted(pending,key=lambda x:(x[0],x[2]))
    def buy_automation():
        nonlocal first_auto
        if not model: return False
        for i,r in enumerate(repos):
            if not r['active']: continue
            order=['scan','fix'] if route=='scanner' else ['fix','scan']
            for kind in order:
                if r[kind]: continue
                cost=c.scan_setup if kind=='scan' else c.master_fix_setup if route=='master' else c.fix_setup
                if c.tiered_automation:cost*=[.5,1,1.5][i//4]
                if cash>=cost+35:
                    pay(cost,'auto-'+kind,i);r[kind]=True
                    if first_auto is None:first_auto=now
                    return True
                # Fixing Master cannot bypass the prerequisite; Scanner may buy either.
                if route=='master' and kind=='fix': break
        return False
    def manual_work(candidate):
        nonlocal actions
        _,kind,i,k=candidate
        if not group_work:return submit(kind,i,k)
        # Optional module-wide manual command: same job costs and slots.
        batch=[v for v in candidates(False) if v[1]==kind and v[2]//4==i//4]
        if len(batch)<2 or cash<len(batch)*job_cost(kind):return submit(kind,i,k)
        before=actions
        for _,kind,i,k in batch:submit(kind,i,k)
        actions=before+1
        return True
    while now<=c.max_time:
        # Completion precedes decisions at this tick.
        for j in list(jobs):
            if j['end']>now: continue
            jobs.remove(j)
            if j['kind']=='scan':
                for k in j['captured']: fs[k]['known']=True
                if j['auto']:auto_scans+=1
            else:
                fs[j['fid']]['done']=True
                if fs[j['fid']]['initial']:
                    repos[j['repo']]['active']=True;activations.append(now)
                    if next_bug is None:next_bug=now+c.starter_grace
                if j['auto']:auto_fixes+=1
        while queue and len(jobs)<slots:start_job(queue.pop(0))
        if next_bug is not None and now>=next_bug:
            active=[i for i,r in enumerate(repos) if r['active']]
            i=active[bug_i%len(active)];bug_i+=1
            fs.append({'repo':i,'known':False,'done':False,'initial':False,'born':now})
            interval=c.per_system_incident_period/len(active) if c.per_system_incident_period else (c.incident_single if len(active)==1 else c.incident_small if len(active)<8 else c.incident_large)
            next_bug=now+interval
        if now%reaction==0 and now>=neglect_until:
            # Upgrade visits are paused; a purchase does not consume this map decision.
            if not model and len(repos)>=before_model and cash>=model_price+c.model_reserve:
                pay(model_price,'model');model=True;model_at=now
            if slots<capacity and len(repos)>=3 and cash>=c.slot_price+40:
                pay(c.slot_price,'slot');slots+=1
            cs=candidates(False)
            initial=[x for x in cs if x[0]==0]
            urgent=[x for x in cs if health(x[2])<=60]
            did=False
            if len(queue)<slots and (initial or urgent):
                did=manual_work((initial or urgent)[0])
            limit=12 if model else before_model
            if not did and style=='coverage' and model:
                did=buy_automation()
            cost=min(c.system_cap,c.system_base+c.system_step*(len(repos)-1)+c.system_curve*(len(repos)-1)**2)
            if not did and len(repos)<limit and all(r['active'] for r in repos) and cash>=cost+c.purchase_reserve:
                pay(cost,'system',len(repos));buys.append(now)
                repos.append({'active':False,'scan':False,'fix':False,'next_scan':now})
                fs.append({'repo':len(repos)-1,'known':False,'done':False,'initial':True,'born':now});did=True
            if not did and len(queue)<slots and cs:
                did=manual_work(cs[0])
            if not did and model and (style!='growth' or len(repos)==12):did=buy_automation()
        # Automatic work shares capacity, respects queued manual orders and reserve.
        while not queue and len(jobs)<slots:
            opts=candidates(True)
            if not opts: break
            # Prefer known fixes, then scans; no queue created by automation.
            opts.sort(key=lambda x:(x[1]!='fix',x[0],x[2]))
            placed=False
            for _,kind,i,k in opts:
                if submit(kind,i,k,True):
                    if kind=='scan':repos[i]['next_scan']=now+15
                    placed=True;break
            if not placed:break
        hs=[health(i) for i in range(len(repos))];avg=sum(hs)/len(hs)
        min_health=min(min_health,avg) if activations else min_health
        covered=sum(r['scan'] and r['fix'] for r in repos)
        if covered==12 and last_coverage is None:last_coverage=now
        eligible=(len(repos)==12 and all(r['active'] for r in repos) and covered==12 and avg>=90 and min(hs)>=60 and cash>=35 and not queue and not any(not j['auto'] for j in jobs))
        if eligible:
            if trial is None:trial=now;trial_start_counts=(auto_scans,auto_fixes,earned,spent)
            if now-trial>=20 and auto_scans>trial_start_counts[0] and auto_fixes>trial_start_counts[1] and earned-trial_start_counts[2]>=spent-trial_start_counts[3]:break
        elif trial is not None:trial=None;trial_resets+=1
        revenue=sum(c.income*(c.income_base_share+(1-c.income_base_share)*health(i)/100) for i,r in enumerate(repos) if r['active'])
        if avg<80: revenue*=c.failure_multiplier
        cash+=revenue*.5;earned+=revenue*.5
        busy_integral+=len(jobs)*.5;max_queue=max(max_queue,len(queue));now+=.5
    result={'route':route,'reaction':reaction,'before_model':before_model,'capacity':capacity,'style':style,'group_work':group_work,'finish':now if now<=c.max_time else None,'model_at':model_at,'first_auto':first_auto,'all_active':activations[-1] if len(activations)==12 else None,'all_covered':last_coverage,'owned':len(repos),'covered':sum(r['scan'] and r['fix'] for r in repos),'credits':round(cash,1),'earned':round(earned,1),'spent':round(spent,1),'manual_actions':actions,'incidents':bug_i,'auto_fixes':auto_fixes,'trial_resets':trial_resets,'max_queue':max_queue,'busy_slot_seconds':busy_integral,'activation_times':activations,'purchase_times':buys}
    assert abs(40+earned-spent-cash)<1e-6
    assert cash>=-1e-6
    if trace:result['trace']=logs
    return result

def grid(c):
    return [simulate(c,route,reaction,n,cap,style) for route in ['scanner','master'] for reaction in [1,3,5] for n in [3,4,6,8,12] for cap in [1,2,3] for style in ['growth','balanced','coverage']]
