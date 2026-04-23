import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { initAIEngine, getAIBehavior } from './aiEngine.js';
import { MotionSystem } from './motionSystem.js';
import { AIController } from './aiController.js';

let scene, camera, renderer, controls, mixer;
let characterRoot = null;
let motionSystem;
let aiController;
let currentModel = null;

// Load bone configuration from localStorage
function loadBoneConfig() {
    const saved = localStorage.getItem('character_bone_config');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) { console.warn(e); }
    }
    return null;
}

async function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    scene.fog = new THREE.FogExp2(0x111122, 0.008);
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 1, 0);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1, 0);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(2, 5, 3);
    mainLight.castShadow = true;
    scene.add(mainLight);
    const fillLight = new THREE.PointLight(0x4466cc, 0.3);
    fillLight.position.set(1, 2, 2);
    scene.add(fillLight);
    const backLight = new THREE.PointLight(0xffaa66, 0.2);
    backLight.position.set(0, 1, -2);
    scene.add(backLight);
    
    // Ground helper
    const gridHelper = new THREE.GridHelper(10, 20, 0x88aaff, 0x335588);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);
    
    // Load character
    const config = loadBoneConfig();
    if (!config || !config.modelPath) {
        console.warn("No bone config or model path found. Please run setup.html first.");
        document.getElementById('info').innerHTML += "<br>⚠️ No rig config! Go to setup.html";
        return;
    }
    
    const loader = new GLTFLoader();
    loader.load(config.modelPath, (gltf) => {
        characterRoot = gltf.scene;
        characterRoot.traverse(child => { if(child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        scene.add(characterRoot);
        
        // Setup skeleton and motion system
        const skeleton = findSkeleton(characterRoot);
        if (skeleton) {
            motionSystem = new MotionSystem(skeleton.bones, config.boneMapping);
            aiController = new AIController(motionSystem);
            startAILoop();
        } else {
            console.error("No skeleton found");
        }
    }, undefined, (error) => { console.error("Model load error", error); });
    
    // Start AI Engine
    await initAIEngine();
    
    // UI: send message
    document.getElementById('sendBtn').addEventListener('click', async () => {
        const input = document.getElementById('userInput').value;
        if (!input.trim()) return;
        document.getElementById('aiStatus').innerHTML = "🤔 AI thinking...";
        const behavior = await getAIBehavior(input);
        document.getElementById('aiStatus').innerHTML = `🤖 AI: ${behavior}`;
        if (aiController) aiController.handleBehavior(behavior);
    });
    
    animate();
}

function findSkeleton(node) {
    let bones = [];
    node.traverse(child => {
        if (child.isBone) bones.push(child);
    });
    if (bones.length === 0) return null;
    return { bones };
}

function startAILoop() {
    // Periodic idle AI suggestion every 15 seconds
    setInterval(async () => {
        if (aiController && motionSystem) {
            // Random idle prompt or simple behavior generation
            const behavior = await getAIBehavior("idle cycle");
            aiController.handleBehavior(behavior);
        }
    }, 15000);
}

function animate() {
    requestAnimationFrame(animate);
    if (motionSystem) motionSystem.update(1/60);
    controls.update(); // only if controls exist
    renderer.render(scene, camera);
}

init();
