import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';

export class Zombie {
    constructor(scene) {
    this.scene = scene;
    this.zombies = new Node();

        for(let i = 0; i < 20; i++){
            let zombie = new Node();
            let x = (Math.random() * 60) - 30;
            let y = (Math.random() * 60) - 30;
            zombie.translation = [x,1,y];
            zombie.projection = mat4.create();
            this.zombies.addChild(zombie);
        }
    }
}