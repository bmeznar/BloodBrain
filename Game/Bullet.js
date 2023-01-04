import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import {rotateZ, rotateX, rotateY} from './quat.js';

export class Bullet {
    constructor(position, yaw, pitch) {
        this.position = position;
        this.yaw = yaw;
        this.pitch = pitch;
        this.initTime = Math.floor(Date.now() / 1000);
        this.despawn = false;

        this.spawn_bullet();
    }

    async spawn_bullet(){
        this.bullet_loader = new GLTFLoader();
        await this.bullet_loader.load('../Assets/zombie/zombie_v2.gltf');
        this.bullet_scene = await this.bullet_loader.loadScene(this.bullet_loader.defaultScene);
    }

    update(){
        if (this.initTime + 5 <= Math.floor(Date.now() / 1000)) {
            this.despawn = true;
        }
    }
}