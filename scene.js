import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const canvas=document.querySelector("#scene"), hero=document.querySelector(".hero");
if(!canvas||!hero) throw new Error("3D scene elements are missing.");

const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,.01,100);
camera.position.set(.15,.05,5.4);
scene.add(new THREE.HemisphereLight(0xffffff,0x78909c,2.4));
const key=new THREE.DirectionalLight(0xffffff,3.5); key.position.set(4,5,5); scene.add(key);
const rim=new THREE.DirectionalLight(0x5bc5d7,2.8); rim.position.set(-4,2,-4); scene.add(rim);

const group=new THREE.Group(); scene.add(group);
const loader=new GLTFLoader();
loader.load("./scene-v1.glb",gltf=>{
 const model=gltf.scene, box=new THREE.Box3().setFromObject(gltf.scene);
 const size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3());
 model.position.sub(center); model.scale.setScalar(2.35/(Math.max(size.x,size.y,size.z)||1));
 model.traverse(o=>{if(!o.isMesh)return; o.frustumCulled=true; const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>{if("roughness"in m)m.roughness=.22;if("metalness"in m)m.metalness=.06;if(m.color)m.color.lerp(new THREE.Color("#dceff3"),.16);});});
 group.add(model); group.userData.model=model; if(reduced)group.rotation.y=.55; animate();
},undefined,e=>console.error("Could not load scene-v1.glb",e));

const clamp=THREE.MathUtils.clamp, ease=t=>t*t*(3-2*t);
function progress(){const r=hero.getBoundingClientRect();return clamp(-r.top/Math.max(1,hero.offsetHeight-innerHeight),0,1);}
function animate(){
 requestAnimationFrame(animate); const p=ease(progress()), m=group.userData.model;
 if(m&&!reduced){
  group.rotation.y=THREE.MathUtils.lerp(-.35,Math.PI*1.7,p);
  group.rotation.x=THREE.MathUtils.lerp(.08,-.18,p); group.rotation.z=THREE.MathUtils.lerp(.02,.08,p);
  group.position.x=THREE.MathUtils.lerp(.35,-.18,p); group.position.y=THREE.MathUtils.lerp(.05,-.42,p);
  group.scale.setScalar(THREE.MathUtils.lerp(1,1.12,p));
  camera.position.x=THREE.MathUtils.lerp(.18,-.28,p); camera.position.y=THREE.MathUtils.lerp(.05,.22,p);
  camera.position.z=THREE.MathUtils.lerp(5.4,4.75,p); camera.fov=THREE.MathUtils.lerp(30,34,p);
  camera.lookAt(0,0,0); camera.updateProjectionMatrix();
 }
 renderer.render(scene,camera);
}
function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
addEventListener("resize",resize,{passive:true}); if(reduced)document.documentElement.style.scrollBehavior="auto";
