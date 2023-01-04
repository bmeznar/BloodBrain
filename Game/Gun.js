import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

export class Gun {
    constructor() {
        this.make_gun();
    }

    async make_gun(){
        this.loader_gun = new GLTFLoader();
        await this.loader_gun.load('../Assets/gun/scar.gltf');
        this.gun_scene = await this.loader_gun.loadScene(this.loader_gun.defaultScene);
        //console.log(this.gun_scene);
    }


    update(coordinates){
        //console.log(coordinates);
        this.gun_scene.nodes[2].translation = coordinates;
        this.gun_scene.nodes[2].scale = [0.2, 0.2, 0.2];
    }
}