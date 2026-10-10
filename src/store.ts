import {create} from 'zustand';import {persist} from 'zustand/middleware';
export type Status='Normal'|'Busy'|'Critical';
export interface Dept{id:string;name:string;icon:string;floor:number;pos:[number,number];size:[number,number];cap:number;color:string}
export interface Patient{id:string;name:string;dept:string;status:'Registered'|'Admitted'|'Discharged';bed?:string;at:string}
export interface Staff{id:string;name:string;role:string;dept:string;available:boolean}
export interface ECase{id:string;pri:'High'|'Medium'|'Low';at:string;patient:string;bed?:string}
const D=(id:string,name:string,icon:string,floor:number,x:number,w:number,cap:number,color:string):Dept=>({id,name,icon,floor,pos:[x,0],size:[w,5],cap,color});
export const DEPTS:Dept[]=[D('er','Emergency','bi-heart-pulse',0,-6,6,8,'#ef4444'),D('rad','Radiology','bi-radioactive',0,-1,4,4,'#8b5cf6'),D('lab','Laboratory','bi-eyedropper',0,3,4,5,'#f59e0b'),D('ph','Pharmacy','bi-capsule',0,7,4,5,'#22c55e'),
D('icu','ICU','bi-activity',1,-6,6,6,'#06b6d4'),D('gw','General Ward','bi-hospital',1,0,6,16,'#3b82f6'),D('car','Cardiology','bi-heart',1,6,6,6,'#ec4899')];
export const bedsOf=(d:Dept)=>Array.from({length:d.cap},(_,i)=>`${d.id.toUpperCase()}-${i+1}`);
export const occ=(ps:Patient[],id:string)=>ps.filter(p=>p.dept===id&&p.status==='Admitted').length;
const freeBed=(ps:Patient[],d:Dept)=>bedsOf(d).find(b=>!ps.some(p=>p.status==='Admitted'&&p.bed===b));
const seed=()=>{const used:Record<string,number>={};const nm=['Aarav','Meera','Kavin','Divya','Ravi','Sana','Arjun','Priya'];
const patients:Patient[]=Array.from({length:40},(_,i)=>{const d=DEPTS[i%7];const adm=i%4!==0&&(used[d.id]||0)<d.cap;let bed:string|undefined;if(adm){used[d.id]=(used[d.id]||0)+1;bed=`${d.id.toUpperCase()}-${used[d.id]}`}
return{id:`DEMO-P${1000+i}`,name:`${nm[i%8]} Demo${i+1}`,dept:d.id,status:adm?'Admitted':i%2?'Registered':'Discharged',bed,at:new Date(Date.now()-i*36e5).toISOString()}});
const roles=['Doctor','Nurse','Lab Technician','Pharmacist','Receptionist','Emergency Personnel'];
const staff:Staff[]=Array.from({length:30},(_,i)=>({id:`DEMO-S${200+i}`,name:`${nm[(i+3)%8]} Staff${i+1}`,role:roles[i%6],dept:DEPTS[(i*3)%7].id,available:i%5!==0}));
const er=patients.filter(p=>p.dept==='er').slice(0,8);
const cases:ECase[]=er.map((p,i)=>({id:`CASE-${100+i}`,pri:(['High','Medium','Low'] as const)[i%3],at:p.at,patient:p.id,bed:p.bed}));
const status:Record<string,Status>={};DEPTS.forEach(d=>status[d.id]='Normal');status.er='Busy';
return{patients,staff,cases,status}};
interface S{patients:Patient[];staff:Staff[];cases:ECase[];status:Record<string,Status>;theme:'dark'|'light';toast:string;
notify:(m:string)=>void;register:(n:string,d:string)=>void;admit:(id:string)=>void;discharge:(id:string)=>void;emergency:()=>void;
toggleStaff:(id:string)=>void;assignStaff:(id:string,d:string)=>void;setStatus:(d:string,s:Status)=>void;setTheme:(t:'dark'|'light')=>void;reset:()=>void}
export const useStore=create<S>()(persist((set)=>({...seed(),theme:'light',toast:'',
notify:m=>set({toast:m}),
register:(name,dept)=>set(s=>({patients:[{id:`DEMO-P${Date.now().toString().slice(-6)}`,name,dept,status:'Registered',at:new Date().toISOString()},...s.patients],toast:`Registered demo patient ${name}`})),
admit:id=>set(s=>{const p=s.patients.find(x=>x.id===id);if(!p||p.status==='Admitted')return s;const d=DEPTS.find(x=>x.id===p.dept);if(!d)return s;const bed=freeBed(s.patients,d);
if(!bed)return{toast:`${d.name} is at capacity`};return{patients:s.patients.map(x=>x.id===id?{...x,status:'Admitted',bed,at:new Date().toISOString()}:x),toast:`Admitted to ${bed}`}}),
discharge:id=>set(s=>({patients:s.patients.map(x=>x.id===id?{...x,status:'Discharged',bed:undefined}:x),toast:'Patient discharged, bed released'})),
emergency:()=>set(s=>{const d=DEPTS[0];const bed=freeBed(s.patients,d);const n=Date.now().toString().slice(-5);
const p:Patient={id:`DEMO-E${n}`,name:`Emergency Demo ${n}`,dept:'er',status:bed?'Admitted':'Registered',bed,at:new Date().toISOString()};
return{patients:[p,...s.patients],cases:[{id:`CASE-${n}`,pri:(['High','Medium','Low'] as const)[Math.floor(Math.random()*3)],at:p.at,patient:p.id,bed},...s.cases],toast:bed?`Demo case ${n} assigned to ${bed}`:'Emergency full: case queued without bed'}}),
toggleStaff:id=>set(s=>({staff:s.staff.map(x=>x.id===id?{...x,available:!x.available}:x)})),
assignStaff:(id,dept)=>set(s=>({staff:s.staff.map(x=>x.id===id?{...x,dept}:x),toast:'Staff reassigned'})),
setStatus:(d,st)=>set(s=>({status:{...s.status,[d]:st}})),setTheme:theme=>set({theme}),
reset:()=>set({...seed(),toast:'Demo data reset'})}),
{name:'mediverse-v1',version:1,partialize:s=>({patients:s.patients,staff:s.staff,cases:s.cases,status:s.status,theme:s.theme}),
migrate:()=>seed() as never,
merge:(p,cur)=>{const x=p as Partial<S>|undefined;return x&&Array.isArray(x.patients)&&Array.isArray(x.staff)&&Array.isArray(x.cases)&&x.status&&typeof x.status==='object'?{...cur,...x}:cur}}));
type Goal={p:[number,number,number];t:[number,number,number]};
interface Sim{playing:boolean;speed:number;selected:string|null;goal:Goal|null;amb:number;floor:'all'|0|1;chars:boolean;quality:number;
set:(p:Partial<Sim>)=>void;focus:(id:string|null)=>void;preset:(n:'reset'|'front'|'top')=>void}
const PRE:Record<string,Goal>={reset:{p:[0,12,24],t:[0,3,0]},front:{p:[0,4,26],t:[0,3,0]},top:{p:[0,34,.1],t:[0,0,0]}};
export const useSim=create<Sim>(set=>({playing:!window.matchMedia('(prefers-reduced-motion: reduce)').matches,speed:1,selected:null,goal:null,amb:0,floor:'all',chars:true,quality:1.5,
set:p=>set(p),
focus:id=>set(()=>{const d=DEPTS.find(x=>x.id===id);if(!d)return{selected:null};const y=d.floor*3.2;return{selected:d.id,goal:{p:[d.pos[0],y+5,11],t:[d.pos[0],y+1,0]}}}),
preset:n=>set({selected:null,goal:PRE[n]})}));
