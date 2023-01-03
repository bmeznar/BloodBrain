import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Node } from '../../common/engine/Node.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

export class Zombie {
    constructor() {
        this.make_zombie();
    }

    async make_zombie(){
        this.loader_zombie = new GLTFLoader();
        await this.loader_zombie.load('../Assets/zombie/zombie_v2.gltf');
        this.zombie_scene = await this.loader_zombie.loadScene(this.loader_zombie.defaultScene);

        //this.zombies_array = new Array();
        //let test = this.zombie_scene;
        let x = (Math.random() * 80) - 40;
        let y = (Math.random() * 80) - 40;
        this.zombie_scene.nodes[0].translation = [x, 0, y];
        //console.log(x+" "+y);
        //this.zombies_array[i] = (test.nodes[0]);

        /*for(let i = 0; i < 20; i++){
            let test = this.zombie_scene;
            let x = (Math.random() * 80) - 40;
            let y = (Math.random() * 80) - 40;
            test.nodes[0].translation = [x, 0, y];
            //console.log(x+" "+y);
            this.zombies_array[i] = (test.nodes[0]);
        }*/

    }


    update(){
        //spreminjanje koordinat zombijev
        let x = this.zombie_scene.nodes[0].translation[0];
        let y = this.zombie_scene.nodes[0].translation[2]+0.05;
        this.zombie_scene.nodes[0].translation = [x, 0, y];
    }
}