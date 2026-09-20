import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const canvas=document.querySelector("#scene");
const hero=document.querySelector(".hero");
if(!canvas||!hero) throw new Error("3D scene elements are missing.");

const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,.01,100);
camera.position.set(0,0,5);

scene.add(new THREE.HemisphereLight(0xffffff,0x9bb4c1,2.2));
const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(3,5,5);scene.add(key);
const rim=new THREE.DirectionalLight(0x6ed1df,2.4);rim.position.set(-4,2,-4);scene.add(rim);

const group=new THREE.Group();scene.add(group);
const loader=new GLTFLoader();
loader.load("./scene-v1.glb",gltf=>{
  const model=gltf.scene;
  const box=new THREE.Box3().setFromObject(model);
  const size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const max=Math.max(size.x,size.y,size.z)||1;
  model.scale.setScalar(2.25/max);
  model.traverse(obj=>{
    if(!obj.isMesh) return;
    obj.castShadow=false;obj.receiveShadow=false;
    const materials=Array.isArray(obj.material)?obj.material:[obj.material];
    materials.forEach(m=>{
      if("roughness" in m)m.roughness=.25;
      if("metalness" in m)m.metalness=.08;
      if(m.color)m.color.lerp(new THREE.Color("#dceff3"),.22);
    });
  });
  group.add(model);
  group.userData.model=model;
  animate();
},undefined,err=>console.error("Could not load scene-v1.glb",err));

function progress(){
  const r=hero.getBoundingClientRect();
  return THREE.MathUtils.clamp(-r.top/(hero.offsetHeight-innerHeight),0,1);
}
function animate(){
  requestAnimationFrame(animate);
  const p=progress();
  if(group.userData.model){
    const model=group.userData.model;
    if(!reduced){
      group.rotation.y=THREE.MathUtils.lerp(-.25,Math.PI*1.45,p);
      group.rotation.x=THREE.MathUtils.lerp(.04,-.13,p);
      group.position.y=THREE.MathUtils.lerp(.05,-.42,p);
      const s=THREE.MathUtils.lerp(1,1.08,p);group.scale.setScalar(s);
    }
  }
  renderer.render(scene,camera);
}
function resize(){
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
}
addEventListener("resize",resize);
if(reduced) document.documentElement.style.scrollBehavior="auto";
