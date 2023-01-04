import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import {rotateZ, rotateX, rotateY, getAngle} from './quat.js';

export class Gun {
    constructor() {
        this.make_gun();
    }

    async make_gun(){
        this.loader_gun = new GLTFLoader();
        await this.loader_gun.load('../Assets/gun/scar.gltf');
        this.gun_scene = await this.loader_gun.loadScene(this.loader_gun.defaultScene);
    }


    update(camera, yaw){
        //console.log(camera);
        //console.log(coordinates);
        //let out = this.gun_scene.nodes[2].rotation;
        //let in_m = [0,0,0,0];
        //let rad  = 0.1;
        let out = [0,0,0,0];
        let  angle = (yaw-4) * (180/Math.PI);

        rotateZ(out, camera.rotation, 1.57);
        rotateY(out, out, 3.14);
        let x = 0.2 * Math.sin(Math.PI * 2 * angle / 360) + camera.translation[0];
        let y = 0.2 * Math.cos(Math.PI * 2 * angle / 360) + camera.translation[2];
        let z = camera.translation[1]-0.15;
        //let coordinates = 

        //this.gun_scene.nodes[2].rotation = camera.rotation;
        this.gun_scene.nodes[2].rotation = out;
        this.gun_scene.nodes[2].translation = [x, z, y];
        this.gun_scene.nodes[2].scale = [0.1, 0.1, 0.1];
        console.log(this.gun_scene);
    }
}