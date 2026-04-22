import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, currentModel = null;
let boneList = [];

const roleOptions = ['Head Bone', 'Neck Bone', 'Spine Bone', 'Left Arm Bone', 'Right Arm Bone', 'Jaw Bone'];
const roleKeys = ['head', 'neck', 'spine', 'leftArm', 'rightArm', 'jaw'];

function init() {
    const container = document.getElementById('viewer');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(2, 1.5, 3);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1,2,1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));
    
    document.getElementById('modelUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            if (currentModel) scene.remove(currentModel);
            currentModel = gltf.scene;
            scene.add(currentModel);
            extractBones(currentModel);
            URL.revokeObjectURL(url);
        }, undefined, (err) => console.error(err));
    });
    
    document.getElementById('saveConfig').addEventListener('click', saveConfiguration);
    animate();
}

function extractBones(model) {
    boneList = [];
    model.traverse(child => { if(child.isBone) boneList.push(child); });
    const container = document.getElementById('boneContainer');
    container.innerHTML = '<h4>Bones found:</h4>';
    const ul = document.createElement('ul');
    boneList.forEach(bone => {
        const li = document.createElement('li');
        li.textContent = bone.name;
        ul.appendChild(li);
    });
    container.appendChild(ul);
    buildRoleSelectors();
}

function buildRoleSelectors() {
    const div = document.getElementById('roleAssignments');
    div.innerHTML = '<h4>Assign each role to a bone:</h4>';
    roleOptions.forEach((role, idx) => {
        const row = document.createElement('div');
        row.style.margin = '8px 0';
        row.innerHTML = `<strong>${role}:</strong> <select id="sel_${roleKeys[idx]}">
            <option value="">-- none --</option>
            ${boneList.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
        </select>`;
        div.appendChild(row);
    });
}

function saveConfiguration() {
    const mapping = {};
    for (let i=0; i<roleKeys.length; i++) {
        const select = document.getElementById(`sel_${roleKeys[i]}`);
        if (select && select.value) mapping[roleKeys[i]] = select.value;
    }
    // also need model path from uploaded file? we store filename placeholder, but better store the blob? We'll store original file name.
    const fileInput = document.getElementById('modelUpload');
    let modelPath = null;
    if (fileInput.files.length > 0) {
        // In real scenario we would store the file in IndexedDB, but for simplicity we store the name and expect user to place it in /assets/
        modelPath = '/assets/' + fileInput.files[0].name;
    }
    const config = {
        modelPath: modelPath,
        boneMapping: mapping,
        timestamp: Date.now()
    };
    localStorage.setItem('character_bone_config', JSON.stringify(config));
    alert('Configuration saved to localStorage. You can now use index.html');
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();