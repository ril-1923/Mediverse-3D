import {useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';import {OrbitControls,Html} from '@react-three/drei';
import {Group,Vector3} from 'three';
import {DEPTS,Dept,bedsOf,useSim,useStore} from './store';
function Room({d}:{d:Dept}){const sel=useSim(s=>s.selected);const focus=useSim(s=>s.focus);const ps=useStore(s=>s.patients);
const on=sel===d.id;const taken=useMemo(()=>new Set(ps.filter(p=>p.status==='Admitted'&&p.bed).map(p=>p.bed)),[ps]);const beds=bedsOf(d);
const cols=Math.max(1,Math.floor(d.size[0]/1.1));const rows=Math.ceil(d.cap/cols);const n=beds.filter(b=>taken.has(b)).length;
return <group position={[d.pos[0],d.floor*3.2,0]} onClick={e=>{e.stopPropagation();focus(d.id)}}>
<mesh position={[0,1.4,0]}><boxGeometry args={[d.size[0]-.1,2.8,d.size[1]-.1]}/><meshStandardMaterial color={d.color} transparent opacity={on?.45:.16} emissive={d.color} emissiveIntensity={on?.7:0} depthWrite={false}/></mesh>
<mesh position={[0,.05,0]} receiveShadow><boxGeometry args={[d.size[0],.1,d.size[1]]}/><meshStandardMaterial color="#e2e8f0"/></mesh>
{beds.map((b,i)=><mesh key={b} castShadow position={[(i%cols-(cols-1)/2)*1.05,.3,(Math.floor(i/cols)-(rows-1)/2)*1.1]}><boxGeometry args={[.7,.3,.9]}/><meshStandardMaterial color={taken.has(b)?'#f87171':'#4ade80'}/></mesh>)}
<Html position={[0,3.1,0]} center distanceFactor={16}><div className="room-label">{d.name} {n}/{d.cap}</div></Html></group>}
function Walker({pts,color,y}:{pts:[number,number][];color:string;y:number}){const g=useRef<Group>(null);const s=useRef({i:0,t:0});
useFrame((st,dt)=>{const {playing,speed}=useSim.getState();if(!playing||!g.current)return;const a=pts[s.current.i],b=pts[(s.current.i+1)%pts.length];
const len=Math.hypot(b[0]-a[0],b[1]-a[1])||1;s.current.t+=dt*speed*1.2/len;if(s.current.t>=1){s.current.t=0;s.current.i=(s.current.i+1)%pts.length}
const t=s.current.t;g.current.position.set(a[0]+(b[0]-a[0])*t,y+Math.abs(Math.sin(st.clock.elapsedTime*8*speed))*.05,a[1]+(b[1]-a[1])*t);g.current.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1])});
return <group ref={g}><mesh position={[0,.55,0]} castShadow><cylinderGeometry args={[.2,.22,.8,10]}/><meshStandardMaterial color={color}/></mesh><mesh position={[0,1.15,0]} castShadow><sphereGeometry args={[.17,12,12]}/><meshStandardMaterial color="#f1c27d"/></mesh></group>}
const WALK:{pts:[number,number][];color:string;y:number;f:number}[]=[
{pts:[[-8,3.3],[8,3.3]],color:'#f8fafc',y:.1,f:0},{pts:[[-7,.5],[-5,-1],[-4,1]],color:'#14b8a6',y:.1,f:0},{pts:[[2,3.3],[9,3.3]],color:'#60a5fa',y:.1,f:0},
{pts:[[-8,3.3],[8,3.3]],color:'#60a5fa',y:3.3,f:1},{pts:[[-1,-1],[1,1],[2,-1]],color:'#14b8a6',y:3.3,f:1},{pts:[[5,.5],[7,-1]],color:'#f8fafc',y:3.3,f:1}];
function Ambulance(){const g=useRef<Group>(null);const amb=useSim(s=>s.amb);const r=useRef({ph:0,z:16,w:0});
useEffect(()=>{if(amb>0){r.current={ph:1,z:16,w:0}}},[amb]);
useFrame((_,dt)=>{const {playing,speed}=useSim.getState();const o=r.current;if(!g.current)return;g.current.visible=o.ph>0;if(!playing||!o.ph)return;const k=dt*speed;
if(o.ph===1){o.z-=k*6;if(o.z<=4.4){o.ph=2;o.w=0}}else if(o.ph===2){o.w+=k;if(o.w>1.5){useStore.getState().emergency();o.ph=3}}else{o.z+=k*6;if(o.z>=16)o.ph=0}
g.current.position.set(-6,0,o.z)});
return <group ref={g} visible={false} rotation={[0,Math.PI,0]}><mesh position={[0,.8,0]} castShadow><boxGeometry args={[1.3,1.1,2.6]}/><meshStandardMaterial color="#f8fafc"/></mesh>
<mesh position={[0,1.0,-1.31]}><boxGeometry args={[1.0,.4,.02]}/><meshStandardMaterial color="#1e293b"/></mesh>
<mesh position={[.66,.9,0]}><boxGeometry args={[.02,.6,.2]}/><meshStandardMaterial color="#dc2626"/></mesh><mesh position={[.66,.9,0]}><boxGeometry args={[.02,.2,.6]}/><meshStandardMaterial color="#dc2626"/></mesh>
<mesh position={[0,1.4,0]}><boxGeometry args={[.8,.12,.3]}/><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1}/></mesh>
{[-.5,.5].map(x=><mesh key={x} position={[x,.45,-1.31]}><sphereGeometry args={[.1]}/><meshStandardMaterial color="#fde047" emissive="#fde047"/></mesh>)}
{[[-.7,-.9],[.7,-.9],[-.7,.9],[.7,.9]].map(([x,z])=><mesh key={`${x}${z}`} position={[x,.25,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.25,.25,.15,12]}/><meshStandardMaterial color="#111"/></mesh>)}</group>}
function Rig(){const goal=useSim(s=>s.goal);const camera=useThree(s=>s.camera);const ctl=useThree(s=>s.controls) as unknown as {target:Vector3;update:()=>void}|null;const act=useRef(false);
const gp=useMemo(()=>goal?new Vector3(...goal.p):null,[goal]);const gt=useMemo(()=>goal?new Vector3(...goal.t):null,[goal]);
useEffect(()=>{act.current=!!goal},[goal]);
useFrame(()=>{if(!act.current||!gp||!gt||!ctl)return;camera.position.lerp(gp,.08);ctl.target.lerp(gt,.08);ctl.update();if(camera.position.distanceTo(gp)<.05)act.current=false});return null}
export default function Scene(){const {floor,chars,quality,focus}=useSim();
return <Canvas shadows={quality>=1.5} dpr={quality} camera={{position:[0,12,24],fov:45}} onPointerMissed={()=>focus(null)}>
<color attach="background" args={['#0b1730']}/><ambientLight intensity={.8}/><directionalLight position={[10,20,12]} intensity={1.1} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20}/>
<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.2,0]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color="#1f4d3a"/></mesh>
<mesh position={[-6,-.17,14]}><boxGeometry args={[3,.04,24]}/><meshStandardMaterial color="#334155"/></mesh>
<mesh position={[0,-.1,0]}><boxGeometry args={[20,.2,5.4]}/><meshStandardMaterial color="#cbd5e1"/></mesh><mesh position={[0,3.1,0]}><boxGeometry args={[20,.2,5.4]}/><meshStandardMaterial color="#cbd5e1"/></mesh>
<mesh position={[0,-.1,3.4]}><boxGeometry args={[20,.2,1.6]}/><meshStandardMaterial color="#e2e8f0"/></mesh><mesh position={[0,3.1,3.4]}><boxGeometry args={[20,.2,1.6]}/><meshStandardMaterial color="#e2e8f0"/></mesh>
<mesh position={[0,3,-2.7]}><boxGeometry args={[20,6.2,.15]}/><meshStandardMaterial color="#93c5fd" transparent opacity={.25}/></mesh>
<mesh position={[10.4,3,0]}><boxGeometry args={[.8,6.2,2]}/><meshStandardMaterial color="#64748b"/></mesh>
<Html position={[-6,4.3,4.4]} center distanceFactor={18}><div className="room-label">EMERGENCY ENTRANCE</div></Html><Html position={[2,-.1,6]} center distanceFactor={18}><div className="room-label">MAIN ENTRANCE</div></Html>
{[[-14,8],[14,8],[16,-6],[-16,-6],[12,12]].map(([x,z])=><group key={`${x}${z}`} position={[x,0,z]}><mesh position={[0,.6,0]}><cylinderGeometry args={[.12,.15,1.2]}/><meshStandardMaterial color="#78350f"/></mesh><mesh position={[0,1.8,0]}><coneGeometry args={[1,2.2,8]}/><meshStandardMaterial color="#15803d"/></mesh></group>)}
{DEPTS.filter(d=>floor==='all'||d.floor===floor).map(d=><Room key={d.id} d={d}/>)}
{chars&&WALK.filter(w=>floor==='all'||w.f===floor).map((w,i)=><Walker key={i} {...w}/>)}
<Ambulance/><Rig/><OrbitControls makeDefault minDistance={5} maxDistance={45} maxPolarAngle={Math.PI/2.05} target={[0,3,0]}/></Canvas>}
