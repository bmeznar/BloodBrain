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
        this.velocity = [0, 0, 0];
        this.acceleration = 300;
        this.maxSpeed = 1000;
        this.firstSpawn = true;

        //this.spawn_bullet();
    }

    async spawn_bullet(){
        this.bullet_loader = new GLTFLoader();
        await this.bullet_loader.load('../Assets/bullet/bullet.gltf');
        this.bullet_scene = await this.bullet_loader.loadScene(this.bullet_loader.defaultScene);
        //console.log(this.bullet_scene);

        this.bullet_scene.nodes[0].translation = [this.position[0], this.position[1] - 0.05, this.position[2]];
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

    update(dt){
        if (this.initTime + 1 <= Math.floor(Date.now() / 1000)) {
            this.despawn = true;
        }

        if (this.bullet_scene) {
            if (this.despawn) {
                this.bullet_scene.nodes[0].translation = [9999, -9999, 9999];
                return;
            }

            const forward = vec3.set(vec3.create(), -Math.sin(this.yaw), 0, -Math.cos(this.yaw));
            const acc = vec3.create();
            vec3.add(acc, acc, forward);

            vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

            const speed = vec3.length(this.velocity);
            if (speed > this.maxSpeed) {
                vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
            }
            let new_position = vec3.scaleAndAdd(vec3.create(),
            this.bullet_scene.nodes[0].translation, this.velocity, dt);
            //const x = this.bullet_scene.nodes[0].translation[0] + 0.1;
            //const y = this.bullet_scene.nodes[0].translation[2];
            
            let x1 = this.bullet_scene.nodes[0].translation[0];
            let y1 = this.bullet_scene.nodes[0].translation[2]; 
            let x2 = new_position[0];
            let y2 = new_position[2];
            let razdalja = Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2))
            let z = new_position[1] + Math.tan(this.pitch) * razdalja;
            new_position[1] = z;

            this.bullet_scene.nodes[0].translation = new_position;
        }
    }
}