/** Speed Game has independent tuning. Long Game constants remain unchanged. */
export const SPEED = { target:300, repositories:12, trialSeconds:20, scanSetup:80, fixSetup:140 } as const;
export const SPEED_EFFICIENCY = [
  {cost:60,scanCost:3,setupMultiplier:.8},
  {cost:140,scanCost:1,setupMultiplier:.5},
] as const;
export const SPEED_MEDALS = [
  {id:'gold',name:'Gold',through:240},
  {id:'silver',name:'Silver',through:270},
  {id:'bronze',name:'Bronze',through:300},
] as const;
export const SPEED_BEATS = [
  {title:'Your first assignment',story:'One backend. Find its problem and fix it.',goal:'Scan Backend, then Fix to bring your first team online.'},
  {title:'The demo landed',story:'Your first team is live. Let Recon share the work.',goal:'Enable automatic scans on two repositories and complete four fixes to unlock the next team.'},
  {title:'Teams are multiplying',story:'A new module brings a compliance deadline. Group actions save clicks.',goal:'Automate Core experience to connect your final team.'},
  {title:'Make the handover',story:'All 12 repositories are connected. Turn the whole ecosystem gold.',goal:'Automate all 12 repos. Then leave Recon working for 20s.'},
] as const;
export type SpeedResult = {at:number;won:true;covered:number;modules:number;health:number};
export type SpeedState = {phase:0|1|2|3;phaseAt:number;complianceAt:number|null;result:SpeedResult|null;continuing:boolean;expansion:null|{target:number;nextAt:number}};
