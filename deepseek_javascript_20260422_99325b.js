export class AIController {
    constructor(motionSystem) {
        this.motion = motionSystem;
        this.lastBehavior = null;
    }
    
    handleBehavior(behavior) {
        if (!this.motion) return;
        const upper = behavior.toUpperCase();
        switch(upper) {
            case 'IDLE': this.motion.setAction('IDLE'); break;
            case 'LOOK_LEFT': this.motion.setAction('LOOK_LEFT'); break;
            case 'LOOK_RIGHT': this.motion.setAction('LOOK_RIGHT'); break;
            case 'MOVE_HEAD': this.motion.setAction('MOVE_HEAD'); break;
            case 'OPEN_MOUTH': this.motion.setAction('OPEN_MOUTH'); break;
            case 'RAISE_ARM': this.motion.setAction('RAISE_ARM'); break;
            case 'LISTEN': this.motion.setAction('LISTEN'); break;
            case 'THINK': this.motion.setAction('THINK'); break;
            default: this.motion.setAction('IDLE');
        }
        this.lastBehavior = upper;
    }
}