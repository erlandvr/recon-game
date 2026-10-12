import type {ServiceId} from './campaign.ts';
/** Independent Speed Game tuning. Times are active play, never planning time. */
export const SPEED = {target:480,automationAt:0,repositories:15,waveSizes:[2,4,8],waveInterval:20,trialSeconds:5,tickSeconds:.25,incidentRate:3.92,autoScanCooldown:2,slotPrice:150,incidentPeriod:60,starterGrace:32} as const;
export const SPEED_MODELS = {
 base:{name:'Recon Model 1',cost:0,parent:null,branch:null,scanCost:5,scanSeconds:3,fixSeconds:5,fixCost:15,autoScan:false,autoFix:false},
 scout:{name:'Scan Scout',cost:50,parent:'base',branch:'scanner',scanCost:5,scanSeconds:1,fixSeconds:5,fixCost:15,autoScan:false,autoFix:false},
 specialist:{name:'Repair Specialist',cost:90,parent:'base',branch:'master',scanCost:5,scanSeconds:3,fixSeconds:1,fixCost:5,autoScan:false,autoFix:false},
 scanner:{name:'Speedy Scanner',cost:225,parent:'scout',branch:'scanner',scanCost:2,scanSeconds:.25,fixSeconds:5,fixCost:15,autoScan:true,autoFix:false},
 master:{name:'Fixing Master',cost:300,parent:'specialist',branch:'master',scanCost:5,scanSeconds:3,fixSeconds:.25,fixCost:2,autoScan:false,autoFix:true},
} as const;
export type SpeedModel=keyof typeof SPEED_MODELS;
/** Expansion creates most of the pressure; time gradually adds the rest by four minutes. */
export function speedIncidentPeriod(active:number,time:number){return Math.max(40,60-Math.max(0,active-3)*1.5-Math.min(8,Math.max(0,time-90)*8/150))/SPEED.incidentRate;}
export const SPEED_EFFICIENCY:readonly {cost:number;scanCost:number;setupMultiplier:number}[]=[];
export const SPEED_MEDALS=[{id:'gold',name:'Gold',through:420},{id:'silver',name:'Silver',through:450},{id:'bronze',name:'Bronze',through:480}] as const;
export type SpeedResult={at:number;won:true;covered:number;modules:number;health:number};
export type SpeedState={expansion:null;owned:ServiceId[];activated:ServiceId[];models:SpeedModel[];wave:number;lastWaveAt:number|null;paused:boolean;nextIncident:Partial<Record<ServiceId,number>>;result:SpeedResult|null;continuing:boolean};

/** Owned benefits combine: retain the best speed/cost and every unlocked automation. */
export function speedModelBenefits(speed:SpeedState){
 const models=speed.models.map(id=>SPEED_MODELS[id]);
 return {scanSeconds:Math.min(...models.map(m=>m.scanSeconds)),fixSeconds:Math.min(...models.map(m=>m.fixSeconds)),scanCost:Math.min(...models.map(m=>m.scanCost)),fixCost:Math.min(...models.map(m=>m.fixCost)),autoScan:models.some(m=>m.autoScan),autoFix:models.some(m=>m.autoFix)};
}
