import * as THREE from 'three';

export class MotionSystem {
    constructor(bones, boneMapping) {
        this.bones = bones;
        this.mapping = boneMapping; // { head, neck, spine, leftArm, rightArm, jaw }
        this.boneRefs = {};
        // find actual bone objects by name
        for (const [role, boneName] of Object.entries(this.mapping)) {
            const found = this.bones.find(b => b.name === boneName);
            if (found) this.boneRefs[role] = found;
        }
        
        // animation state
        this.currentAction = 'IDLE';
        this.timer = 0;
        this.transitionTime = 0.2;
        // target rotations (Euler)
        this.targetRotations = {};
        for (let role in this.boneRefs) {
            this.targetRotations[role] = new THREE.Euler(0,0,0);
        }
    }
    
    setAction(action) {
        if (this.currentAction === action) return;
        this.currentAction = action;
        this.timer = 0;
        this.resetTargets();
        switch(action) {
            case 'IDLE': this.idleMotion(); break;
            case 'LOOK_LEFT': this.lookMotion(-0.5); break;
            case 'LOOK_RIGHT': this.lookMotion(0.5); break;
            case 'MOVE_HEAD': this.headNod(); break;
            case 'OPEN_MOUTH': this.jawOpen(); break;
            case 'RAISE_ARM': this.armRaise(); break;
            case 'LISTEN': this.listenMotion(); break;
            case 'THINK': this.thinkMotion(); break;
            default: this.idleMotion();
        }
    }
    
    resetTargets() {
        for (let role in this.boneRefs) {
            this.targetRotations[role].set(0,0,0);
        }
    }
    
    idleMotion() {
        // subtle idle breathing
        this.targetRotations['spine'] = new THREE.Euler(0.05, 0, 0);
        this.targetRotations['head'] = new THREE.Euler(0, 0.05, 0);
    }
    
    lookMotion(yaw) {
        if (this.boneRefs['head']) this.targetRotations['head'].y = yaw;
    }
    
    headNod() {
        if (this.boneRefs['head']) this.targetRotations['head'].x = 0.3;
        setTimeout(() => { if(this.currentAction==='MOVE_HEAD') this.targetRotations['head'].x = 0; }, 500);
    }
    
    jawOpen() {
        if (this.boneRefs['jaw']) this.targetRotations['jaw'].x = 0.4;
        setTimeout(() => { if(this.currentAction==='OPEN_MOUTH') this.targetRotations['jaw'].x = 0; }, 600);
    }
    
    armRaise() {
        if (this.boneRefs['leftArm']) this.targetRotations['leftArm'].z = -1.2;
        if (this.boneRefs['rightArm']) this.targetRotations['rightArm'].z = 1.2;
        setTimeout(() => {
            if(this.currentAction==='RAISE_ARM') {
                if(this.boneRefs['leftArm']) this.targetRotations['leftArm'].z = 0;
                if(this.boneRefs['rightArm']) this.targetRotations['rightArm'].z = 0;
            }
        }, 800);
    }
    
    listenMotion() {
        if (this.boneRefs['head']) this.targetRotations['head'].z = 0.15;
        setTimeout(() => { if(this.currentAction==='LISTEN') this.targetRotations['head'].z = 0; }, 1000);
    }
    
    thinkMotion() {
        if (this.boneRefs['head']) this.targetRotations['head'].y = 0.2;
        if (this.boneRefs['spine']) this.targetRotations['spine'].x = 0.1;
    }
    
    update(deltaTime) {
        this.timer += deltaTime;
        // Smooth interpolation towards target rotations
        const lerpSpeed = 8.0;
        for (let role in this.boneRefs) {
            const bone = this.boneRefs[role];
            const target = this.targetRotations[role];
            if (!bone) continue;
            bone.rotation.x += (target.x - bone.rotation.x) * lerpSpeed * deltaTime;
            bone.rotation.y += (target.y - bone.rotation.y) * lerpSpeed * deltaTime;
            bone.rotation.z += (target.z - bone.rotation.z) * lerpSpeed * deltaTime;
        }
    }
}