import { quat, vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import {rotateZ, rotateX, rotateY} from './quat.js';

export class Bullet {
    constructor(position, yaw, pitch, rotation) {
        this.position = position;
        this.yaw = yaw;
        this.pitch = pitch;
        this.rotation = rotation;
        this.initTime = Math.floor(Date.now() / 1000);
        this.despawn = false;
        this.sceneIndex = -1;

        this.spawn_bullet();
    }

    async spawn_bullet(){
        this.bullet_loader = new GLTFLoader();
        await this.bullet_loader.load('../Assets/bullet/bullet.gltf');
        this.bullet_scene = await this.bullet_loader.loadScene(this.bullet_loader.defaultScene);
        //console.log(this.bullet_scene);

        this.bullet_scene.nodes[0].translation = [this.position[0], this.position[1], this.position[2]];
        //const rotation = quat.create();
        //rotateY(rotation, rotation, this.yaw);
        //rotateX(rotation, rotation, this.pitch);
        //this.bullet_scene.nodes[0].rotation = rotation;
        //const out = this.bullet_scene.nodes[0].rotation;
        //const in_m = this.bullet_scene.nodes[0].rotation;
        //console.log(this.pitch, this.yaw);
        rotateZ(this.rotation, this.rotation, Math.PI / 2);
        rotateX(this.rotation, this.rotation, 3 * (Math.PI / 2));
        this.bullet_scene.nodes[0].rotation = this.rotation;
    }

    update(){
        if (this.initTime + 5 <= Math.floor(Date.now() / 1000)) {
            this.despawn = true;
        }

        if (this.bullet_scene) {
            //const x = this.bullet_scene.nodes[0].translation[0] + 0.1;
            //const y = this.bullet_scene.nodes[0].translation[2];

            //this.bullet_scene.nodes[0].translation = [x, 1, y];
        }
    }
}